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

import random
import configparser
from datetime import datetime
import getopt
import json
import logging
import os
import sys
import time
from typing import Dict
from urllib.error import HTTPError
import requests

from utils import get_headers

from libs.constants import DATA_SECTION, DATASETS_SECTION

# Read config file dataload.ini
config = configparser.RawConfigParser()
config.read("config/dataload.ini")

# Set up base logger
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s"))
logger = logging.getLogger("Dataload")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

# Set up file logger
handler = logging.FileHandler("execution.log")
handler.setFormatter(logging.Formatter("%(message)s"))
file_logger = logging.getLogger("Execution")
file_logger.setLevel(logging.INFO)
file_logger.addHandler(handler)

# Some constants, used by script
WORKFLOW_URL = config.get("CONNECTION", "workflow_url")
FILE_URL = config.get("CONNECTION", "file_url")
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]


def generate_id():
    """
    Generate a random ID

    :return: a random ID
    """
    # return "{0}{1}:".format(type_id.replace("type:", ""), re.sub(r"\D", "", str(uuid.uuid4())))
    time_str = datetime.now().strftime("%y%m%d%H%M%S")
    return f"bulk_load_manifests_{time_str}_{random.randint(1, 1000000)}"


def load_file(filepath):
    """
    Extract data items from file with specified path

    :param filepath: file path
    :return: list of reference items extracted from file
    :rtype: list[tuple]
    """
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
    return data_object


def upload_file(filename):
    response = send_get_request(FILE_URL)
    data = response.json()
    location = data.get("Location")
    if location:
        SignedURL = location.get("SignedURL")
        FileSource = location.get("FileSource")
        response = send_put_files(
            filename,
            SignedURL,
            ok_response_codes=[200, 201])
        return FileSource

    logger.error("Upload failed!!!")


def add_dataset_file_sources(manifest_data):
    if manifest_data.get(DATA_SECTION):
        datasets = manifest_data[DATA_SECTION].get(DATASETS_SECTION)
        for dataset in datasets:
            filesourceInfo = dataset.get("data", {}).get("DatasetProperties", {}).get("FileSourceInfo")
            # only process if FileSource isn't already specified
            if filesourceInfo and not filesourceInfo.get("FileSource"):
                logger.warning("Note: This code currently assumes referenced files for upload are in the"
                               f"current directory and named {filesourceInfo['Name']}")
                filesourceInfo["FileSource"] = upload_file(filesourceInfo["Name"])
    return manifest_data


def populate_workflow_request_body(manifest_data: Dict):
    """
    Populate workflow request body with the passed data according API specification

    :param data: item data from manifest files
    :return: populated request
    :rtype: dict
    """
    request = {
                "runId": "",
                "executionContext": {
                    "acl": {
                        "owners": [],
                        "viewers": []
                    },
                    "legal": {
                        "legaltags": [],
                        "otherRelevantDataCountries": [],
                        "compliant": "compliant"
                    },
                    "Payload": {
                        "AppKey": "test-app",
                        "data-partition-id": "opendes"
                    },
                    "manifest": ""
                }
            }
    request["runId"] = generate_id()
    request["executionContext"]["acl"]["owners"].append(config.get("REQUEST", "acl_owner"))
    request["executionContext"]["acl"]["viewers"].append(config.get("REQUEST", "acl_viewer"))
    request["executionContext"]["legal"]["legaltags"].append(config.get("REQUEST", "legal_tag"))
    request["executionContext"]["legal"]["otherRelevantDataCountries"].append(
        config.get("REQUEST", "other_relevant_data_countries"))
    request["executionContext"]["manifest"] = manifest_data
    return request


def send_get_request(url, ok_response_codes=[200]):
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
            response = requests.get(url, headers=get_headers(config))

            if response.status_code in ok_response_codes:
                logger.info(f"Response status: {response.status_code}. "
                            f"Response content: {response.text}.")
                return response

            reason = response.text[:250]
            logger.error("Request error.")
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


def send_post_request(request_data, url, ok_response_codes=[200]):
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
            response = requests.post(url, request_data,
                                     headers=get_headers(config))

            if response.status_code in ok_response_codes:
                file_logger.info(response.json()["runId"])
                logger.info(f"Response status: {response.status_code}. "
                            f"Response content: {response.text}.")
                break

            reason = response.text[:250]
            logger.error("Request error.")
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


def send_put_files(path, url, ok_response_codes=[200]):
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
            headers = {
                "Content-Type": "application/octet-stream",
                "x-ms-blob-type": "BlockBlob"
            }
            response = requests.put(url, data=open(path, 'rb'), headers=headers)

            if response.status_code in ok_response_codes:
                logger.info(f"Response status: {response.status_code}. "
                            f"Response content: {response.text}.")
                break

            reason = response.text[:250]
            logger.error("Request error.")
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


def upload_manifest(filepath):
    logger.info(f"Loading: {filepath}")
    json_data = populate_workflow_request_body(add_dataset_file_sources(load_file(filepath)))
    request_data = json.dumps(json_data)
    json_data.clear()
    send_post_request(request_data, WORKFLOW_URL)


def main(argv):
    """
    Load manifests to storage.

    1) Load reference data from one folder and it reads folder recursively;
    2) Populate data with parameters from config ini file;
    3) Send data to storage API.
    """

    usage = ("usage: py dataload.py "
             "--path <path>")
    try:
        opts, _ = getopt.getopt(argv, "h", ["path="])
    except getopt.GetoptError as e:
        logger.error(f"Correct usage: {usage}")
        logger.error(str(e))
        sys.exit(2)

    path = os.curdir

    # Parse input params
    for opt, arg in opts:
        if opt == "-h":
            logger.error(f"Correct usage: {usage}")
            sys.exit()
        elif opt == "--path":
            path = arg

    if os.path.isfile(path):
        upload_manifest(path)

    else:
        # Recursive traversal of files and subdirectories of the root directory and files processing
        logger.info(f"Root dir for scanning files: {path}")
        for root, _, files in os.walk(path):
            for file in files:
                filepath = os.path.join(root, file)
                upload_manifest(filepath)


if __name__ == "__main__":
    main(sys.argv[1:])
