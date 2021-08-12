# // Copyright 2017-2020,
# //
# // Licensed under the Apache License, Version 2.0 (the "License");
# // you may not use this file except in compliance with the License.
# // You may obtain a copy of the License at
# //
# //      http://www.apache.org/licenses/LICENSE-2.0
# //
# // Unless required by applicable law or agreed to in writing, software
# // distributed under the License is distributed on an "AS IS" BASIS,
# // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# // See the License for the specific language governing permissions and
# // limitations under the License.

import configparser
from datetime import datetime
import getopt
import json
import logging
import os
import sys
import time
import uuid
import re
from urllib.error import HTTPError
from collections import Counter
import requests

from utils import get_headers

# Read config file dataload.ini
config = configparser.RawConfigParser()
config.read("config/dataload.ini")


# Set up base logger
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s"))
logger = logging.getLogger("Dataload")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

timestamp = datetime.now().isoformat()

# Set up file logger
handler = logging.FileHandler(f"execution_{timestamp}.log")
handler.setFormatter(logging.Formatter("%(message)s"))
file_logger = logging.getLogger("Execution")
file_logger.setLevel(logging.INFO)
file_logger.addHandler(handler)


# Some constants, used by script
SCHEMAS_URL = config.get("CONNECTION", "schemas_url")
STORAGE_URL = config.get("CONNECTION", "storage_url")
SEARCH_OK_RESPONSE_CODES = [200]
DATA_LOAD_OK_RESPONSE_CODES = [201]
NOT_FOUND_RESPONSE_CODES = [404]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]


def main(argv):
    """
    Load manifests to storage.

    1) Load different types of data from one folder and it reads folder recursively;
    2) Determine data type automatically according to ResourceTypeID in manifest file;
    3) Populate data with parameters from config ini file;
    4) Send data to storage API.
    """

    usage = ("usage: py dataload.py "
             "--dir <root_dir>")
    try:
        opts, _ = getopt.getopt(argv, "h", ["dir="])
    except getopt.GetoptError as e:
        logger.error(f"Correct usage: {usage}")
        logger.error(str(e))
        sys.exit(2)

    data = []
    root_dir = os.curdir

    # Parse input params
    for opt, arg in opts:
        if opt == "-h":
            logger.error(f"Correct usage: {usage}")
            sys.exit()
        elif opt == "--dir":
            root_dir = arg
            logger.info(f"Root dir for scanning files: {root_dir}")

    # Check schemas for their presence on the storage server
    check_schemas_exist(root_dir)

    # Initialize counter for manifests types
    finale_counter = Counter()

    # Recursive traversal of files and subdirectories of the root directory and files processing
    for root, _, files in os.walk(root_dir):
        for file in files:
            filepath = os.path.join(root, file)
            data += load_file(filepath)
            if len(data) >= config.getint("CONNECTION", "batch_size"):
                types, request_data = separate_type_data(data)
                send_request(request_data)
                data.clear()
                request_data.clear()
                result_str = "\n".join([": ".join([name, str(count)])
                                        for name, count in types.items()])
                logger.info(f"Batch request was sent. Batch size:\n{result_str}\n")
                finale_counter += types
    if len(data) > 0:
        types, request_data = separate_type_data(data)
        send_request(request_data)
        result_str = "\n".join([": ".join([name, str(count)])
                                for name, count in types.items()])
        logger.info(f"Batch request was sent. Batch size:\n{result_str}\n")
        finale_counter += types
    # Log info message about total data load count
    result_str = "\n".join([": ".join([name, str(count)])
                            for name, count in finale_counter.items()])
    logger.info(f"All data was loaded. Total counts are:\n{result_str}")


def get_request(url, headers):
    """
    Wrapper for requests.get call to use refresh token
    :param url: request URL
    :param headers: request headers
    :return: Response
    """
    response = requests.get(url, headers=headers)
    if response.status_code in BAD_TOKEN_RESPONSE_CODES:
        logger.error("Invalid or expired token.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        response = requests.get(url, headers=get_headers(config))
    return response


def is_schema_found(schema_id):
    """
    Check if given schema ID is presented in storage

    :param schema_id: full schema ID to check for presence in storage
    :return: Optional[bool]. On error None is returned.
    """
    url = f"{SCHEMAS_URL}/{schema_id}"
    response = get_request(url, get_headers(config))

    if response.status_code in SEARCH_OK_RESPONSE_CODES:
        return True

    if response.status_code in NOT_FOUND_RESPONSE_CODES:
        return False

    logger.error(f"Unexpected response status for schema presence checking.")
    logger.error(f"Response status: {response.status_code}. "
                 f"Response content: {response.text[:250]}.")
    sys.exit(2)


# TODO: remove code duplicate and make it more flexible
def read_schemas_from_dir(root_dir):
    """
    Read schemas kinds from files from specified root directory

    :param root_dir: specified root directory
    :return: read schema and missing schema
    :rtype: (set, set)
    """
    schemas = set()
    missing_schemas = set()
    is_wpc = False
    for root, _, files in os.walk(root_dir):
        for file in files:
            file_type = ""
            schema_kind = ""
            filepath = os.path.join(root, file)

            if not filepath.endswith(".json"):
                # Skipped file if it's not JSON file.
                continue
            try:
                with open(filepath) as manifest_file:
                    data_object = json.load(manifest_file)
            except (OSError, IOError, ValueError) as exc:
                logger.error(f"Error with file: {filepath}. {exc}.")
                continue

            # Process manifest file according general file type
            # (Master data or Work Product data) and check file resource type ID
            try:
                if not data_object:
                    logger.error(f"Error with file {filepath}. File is empty.")
                elif "Manifest" in data_object \
                        and "ResourceTypeID" in data_object.get("Manifest"):
                    file_type = determine_data_type(data_object["Manifest"].get("ResourceTypeID"))
                    schema_kind = f"{file_type.lower()}_kind"
                    schemas.add(config.get("KINDS_INITIAL", schema_kind))
                elif "WorkProduct" in data_object and \
                                "ResourceTypeID" in data_object.get("WorkProduct"):
                    file_type = determine_data_type(
                        data_object["WorkProduct"].get("ResourceTypeID"))
                    # Check other section if common resource type specified in WorkProduct section
                    if file_type.lower() == "workproduct" and \
                            data_object.get("WorkProductComponents") and \
                            len(data_object["WorkProductComponents"]) >= 1:
                        file_type = determine_data_type(
                            data_object["WorkProductComponents"][0].get("ResourceTypeID"))
                    # Work Product Components manifests contains more than one different sections.
                    # Add all schema kinds present in every file
                    schema_kind = f"{file_type.lower()}_wp_kind"
                    schemas.add(config.get("KINDS_INITIAL", schema_kind))
                    schema_kind = f"{file_type.lower()}_wpc_kind"
                    schemas.add(config.get("KINDS_INITIAL", schema_kind))
                    if not is_wpc:
                        is_wpc = True
                if not file_type:
                    logger.error(f"Error with file {filepath}. Type could not be specified.")
            except configparser.NoOptionError as exc:
                missing_schemas.add(schema_kind)
    # File schema are common for all files. Add it just once.
    if is_wpc:
        schemas.add(config.get("KINDS_INITIAL", "file_kind"))
    return schemas, missing_schemas


# TODO: change get all schemas mechanism
def check_schemas_exist(root_dir):
    """
    Check schemas for their presence.

    Read schemas kinds from config file and comparing them with already exist schemas on the server.
    """
    empty_schemas = []
    loaded_schemas = []
    config_schemas, missing_schemas = read_schemas_from_dir(root_dir)
    logger.info("Checking schemas kinds presence...")
    for schema in config_schemas:
        if not is_schema_found(schema):
            empty_schemas.append(schema)
        else:
            loaded_schemas.append(schema)
    if not (empty_schemas or missing_schemas):
        logger.info("All schemas in KINDS_INITIAL section are created.")
        loaded_schemas_str = "\n".join(loaded_schemas)
        logger.info(f"Existing schemas are:\n{loaded_schemas_str}")
        logger.info("Data loading process is continued...")

    if missing_schemas:
        logger.error("Error: not all schemas from manifest files are specified on config file.")
        missing_schemas_str = "\n".join(missing_schemas)
        logger.error(f"Non specified schemas are:\n{missing_schemas_str}")
    if empty_schemas:
        logger.error("Error: not all schemas from KINDS_INITIAL section exist in storage.")
        empty_schemas_str = "\n".join(empty_schemas)
        logger.error(f"Non-existing schemas are:\n{empty_schemas_str}")
    if missing_schemas or empty_schemas:
        logger.error("Data loading process is stopped.")
        sys.exit(2)


def generate_id(type_id):
    """
    Generate resource ID

    :param type_id: resource type ID
    :return: resource ID
    """
    return "{0}{1}:".format(type_id.replace("type:", ""), re.sub(r"\D", "", str(uuid.uuid4())))


def determine_data_type(raw_resource_type_id):
    """
    Determine resource type ID

    :param raw_resource_type_id: raw resource type ID from manifest file
    :return: short resource type ID
    """
    return raw_resource_type_id.split("/")[-1].replace(":", "") \
        if raw_resource_type_id is not None else None


def split_product(product, product_type):
    """
    Split work product manifest files into items

    Work product manifest file contains some sections
    (work product, work product components, files) with different count of items inside.
    According data load flow all items should be saved in OSDU platform as single records.
    :param product: work product manifest file data
    :param product_type: resource type ID
    :return: splitted work product data and product type
    :rtype: list[tuple]
    """
    file_ids = []
    work_product_data = []
    # Split Files section to single items
    for file in product["Files"]:
        file["ResourceID"] = generate_id(file["ResourceTypeID"])
        file_ids.append(file["ResourceID"])
        work_product_data.append((populate_request_body(file, "file"), "File"))
    wpc_ids = []
    # Split WorkProductComponents section to single items
    for wpc in product["WorkProductComponents"]:
        wpc["ResourceID"] = generate_id(wpc["ResourceTypeID"])
        wpc_ids.append(wpc["ResourceID"])
        wpc["Data"]["GroupTypeProperties"]["Files"] = file_ids
        work_product_data.append((populate_request_body(wpc, product_type + "_wpc"),
                                  product_type + "_wpc"))
    work_product = product["WorkProduct"]
    work_product["ResourceID"] = generate_id(work_product["ResourceTypeID"])
    work_product["Data"]["GroupTypeProperties"]["Components"] = wpc_ids
    work_product_data.append((populate_request_body(work_product, product_type + "_wp"),
                              product_type + "_wp"))
    return work_product_data


def load_file(filepath):
    """
    Extract data items from file with specified path

    :param filepath: file path
    :return: list of items extracted from file and their types
    :rtype: list[tuple]
    """
    file_type = None
    data_objects = []
    # Processing just json files
    if filepath.endswith(".json"):
        try:
            with open(filepath) as file:
                data_object = json.load(file)
        except (OSError, IOError, ValueError) as exc:
            logger.error(f"Error with file: {filepath}. Error occurred: {exc}.")
            return []
        # Process manifest file according general file type
        # (Master data or Work Product data) and check file resource type ID
        if not data_object:
            logger.error(f"Error with file {filepath}. File is empty.")
        elif "Manifest" in data_object and "ResourceTypeID" in data_object.get("Manifest"):
            file_type = determine_data_type(data_object["Manifest"].get("ResourceTypeID"))
            data_objects = [(populate_request_body(data_object["Manifest"], file_type), file_type)]
        elif "WorkProduct" in data_object and "ResourceTypeID" in data_object.get("WorkProduct"):
            file_type = determine_data_type(data_object["WorkProduct"].get("ResourceTypeID"))
            if file_type.lower() == "workproduct" and \
                    data_object.get("WorkProductComponents") and \
                    len(data_object["WorkProductComponents"]) >= 1:
                file_type = determine_data_type(
                    data_object["WorkProductComponents"][0].get("ResourceTypeID"))
            data_objects = split_product(data_object, file_type)
        if not file_type:
            logger.error(f"Error with file {filepath}. Type could not be specified.")
            return []

    return data_objects


def populate_request_body(data, data_type):
    """
    Populate request body according API specification

    :param data: item data from manifest files
    :param data_type: resource type ID
    :return: populated request
    :rtype: dict
    """
    request = {"kind": config.get("KINDS_INITIAL", f"{data_type.lower()}_kind"),
               "legal": {
                   "legaltags": [],
                   "otherRelevantDataCountries": ["US"],
                   "status": "compliant"
               },
               "acl": {
                   "viewers": [],
                   "owners": []
               },
               "data": data}
    request["legal"]["legaltags"].append(config.get("REQUEST", "legal_tag"))
    request["acl"]["viewers"].append(config.get("REQUEST", "acl_viewer"))
    request["acl"]["owners"].append(config.get("REQUEST", "acl_owner"))
    return request


def separate_type_data(request_data):
    """
    Separate the list of tuples into Data Type Counter and data list

    :param request_data: tuple of data and types
    :type request_data: tuple(list, str)
    :return: counter with data types and data list
    :rtype: tuple(counter, list)
    """
    data = []
    types = Counter()

    for elem in request_data:
        data.append(elem[0])
        types[elem[1]] += 1

    return types, data


def send_request(request_data):
    """
    Send request to records storage API

    :param request_data: request data
    """
    reason = None

    # loop for implementing retries send process
    retries = config.getint("CONNECTION", "retries")
    for retry in range(retries):
        try:
            # send batch request for creating records
            response = requests.put(STORAGE_URL, json.dumps(request_data),
                                    headers=get_headers(config))

            if response.status_code in DATA_LOAD_OK_RESPONSE_CODES:
                file_logger.info(",".join(map(str, response.json()["recordIds"])))
                break

            reason = response.text[:250]
            logger.error(f"Request error.")
            logger.error(f"Response status: {response.status_code}. "
                         f"Response content: {reason}.")

            if retry + 1 < retries:
                if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                    logger.error("Invalid or expired token.")
                else:
                    time_to_sleep = config.getint("CONNECTION", "timeout")

                    logger.info(f"Retrying in {time_to_sleep} seconds...")
                    time.sleep(time_to_sleep)

        except (requests.RequestException, HTTPError) as exc:
            logger.error(f"Unexpected request error. Reason: {exc}")
            sys.exit(2)

    # End script if ran out of retries and data could not be uploaded.
    else:
        logger.error(f"Request could not be completed.\n"
                     f"Reason: {reason}")
        sys.exit(2)


if __name__ == "__main__":
    main(sys.argv[1:])
