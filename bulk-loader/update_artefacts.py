import configparser
import csv
import getopt
import json
import logging
import re
import sys
import uuid
import time
from datetime import datetime
from typing import Optional, List, Dict
import requests
from utils import get_headers


# Read config file dataload.ini
config = configparser.RawConfigParser()
config.read("config/dataload.ini")


timestamp = datetime.now().isoformat()


# Set up base logger
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s"))
logger = logging.getLogger("Artefacts Update")
logger.setLevel(logging.INFO)
logger.addHandler(handler)


# Set up file logger
handler = logging.FileHandler(f"update_artefacts_{timestamp}.log")
handler.setFormatter(logging.Formatter("%(message)s"))
file_logger = logging.getLogger("Result")
file_logger.setLevel(logging.INFO)
file_logger.addHandler(handler)


# Some constants, used by script
STORAGE_URL = config.get("CONNECTION", "storage_url")
SEARCH_URL = config.get("CONNECTION", "search_url")
REQUEST_RETRIES = config.getint("CONNECTION", "retries")
CONNECTION_TIMEOUT = config.getint("CONNECTION", "timeout")
SEARCH_OK_RESPONSE_CODES = [200]
DATA_UPDATE_OK_RESPONSE_CODES = [201]
NOT_FOUND_RESPONSE_CODES = [404]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]
QUERY_SEARCH_LIMIT = 10


# Artefact file record template
FILE_RECORD_TEMPLATE = {
    "ResourceTypeID": "srn:type:file/ovds:",
    "ResourceSecurityClassification": "srn:reference-data/ResourceSecurityClassification:RESTRICTED:",
    "Data": {
        "IndividualTypeProperties": {},
        "GroupTypeProperties": {
            "PreLoadFilePath": "",
            "FileSource": ""
        },
        "ExtensionProperties": {}
    },
    "AssociativeID": "f-1",
    "ResourceID": ""
}

# Artefact object template
ARTEFACT_TEMPLATE = {
    "ResourceID": "",
    "RoleID": "srn:reference-data/ArtefactRole:SEGYImportResult:",
    "ResourceTypeID": "srn:type:file/ovds:"
}


def main(argv):
    usage = ("usage: python update_artefacts.py  "
             "--artefact-path <preload_file_path> "
             "--artefact-kind <artefact_file_kind> "
             "--record-ids <record_ids> "
             "--kind-to-update <kind>")

    try:
        opts, args = getopt.getopt(argv, "h",
                                   ["artefact-path=",
                                    "artefact-kind=",
                                    "record-ids=",
                                    "kind-to-update="])
    except getopt.GetoptError as e:
        logger.error(f"Correct usage: {usage}")
        logger.error(str(e))
        sys.exit(2)

    artefact_path = None
    artefact_kind = "opendes:osdu:file:0.2.0"
    record_ids_file = None
    updated_kind = None

    # parameters parsing
    for opt, arg in opts:
        if opt == "-h":
            logger.info(f"Correct usage: {usage}")
            sys.exit()
        elif opt == "--artefact-path":
            artefact_path = arg.strip()
            logger.info(f"Head node of the preloaded artefact: {artefact_path}")
        elif opt == "--artefact-kind":
            artefact_kind = arg.strip()
            logger.info(f"Artefact file kind: {artefact_kind}")
        elif opt == "--record-ids":
            record_ids_file = arg.strip()
            logger.info(f"Record_ids file: {record_ids_file}")
        elif opt == "--kind-to-update":
            updated_kind = arg.strip()
            logger.info(f"Work Product Component kind to be updated: {updated_kind}")

    # check that all required parameters are present
    if not (artefact_path and updated_kind and record_ids_file):
        logger.error("Missed required params.")
        logger.error(f"Correct usage: {usage}")
        sys.exit(2)

    logger.info("Start artefact update process...")

    # TODO: need to be tested
    # artefact_file_srn = check_artefact_file(artefact_path, artefact_kind)
    # if not artefact_file_srn:

    # create artefact file record
    artefact_file_srn = create_artefact_file(artefact_path, artefact_kind)

    # read record ids file
    logger.info("Start update process...")
    with open(record_ids_file, newline='') as file:
        reader = csv.reader(file)

        for row in reader:
            for record_id in row:
                # get record by id
                record = get_record_by_id(record_id)
                record_kind = record["kind"]
                # check record kind with kind specified in parameters
                if updated_kind in record_kind:
                    # if kinds match - update record on Storage API
                    logger.info(f"Update: {record_id} ...")
                    add_artefact_to_record(record, artefact_file_srn)
                else:
                    # otherwise - skip record
                    logger.info(f"Skip: {record_id}")
                    file_logger.info(f"skipped: {record_id}")

    logger.info("Update process has finished.")


def generate_id(type_id: str) -> str:
    """
    Generate resource ID

    :param type_id: resource type ID
    :return: resource ID
    """
    return "{0}{1}:".format(type_id.replace("type:", ""), re.sub(r"\D", "", str(uuid.uuid4())))


def _get_request(url: str, success_response_code: List[int]) -> requests.Response:
    """
    Low level GET request with refresh token updating and retries mechanism

    :param url: request url
    :param success_response_code: list of success codes
    :return: response object
    """

    for retry in range(REQUEST_RETRIES):

        response = requests.get(url, headers=get_headers(config))

        if response.status_code in success_response_code:
            return response

        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")

        if retry + 1 < REQUEST_RETRIES:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = CONNECTION_TIMEOUT * 2 ** retry

                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    # End script if ran out of retries and data has never been received.
    else:
        logger.error("Data could not be retrieved.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        sys.exit(2)


def _put_request(url: str, request_body: Dict, success_response_code: List[int]) -> requests.Response:
    """
    Low level PUT request with refresh token updating and retries mechanism

    :param url: request url
    :param success_response_code: list of success codes
    :return: response object
    """

    for retry in range(REQUEST_RETRIES):

        response = requests.put(url,
                                request_body,
                                headers=get_headers(config))

        if response.status_code in success_response_code:
            return response

        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")

        if retry + 1 < REQUEST_RETRIES:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = CONNECTION_TIMEOUT * 2 ** retry

                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    # End script if ran out of retries and data has never been received.
    else:
        logger.error("Data could not be retrieved.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        sys.exit(2)


def _post_request(url: str, request_body: Dict, success_response_code: List[int]) -> requests.Response:
    """
    Low level POST request with refresh token updating and retries mechanism

    :param url: request url
    :param success_response_code: list of success codes
    :return: response object
    """

    for retry in range(REQUEST_RETRIES):

        response = requests.post(url,
                                 request_body,
                                 headers=get_headers(config))

        if response.status_code in success_response_code:
            return response

        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")

        if retry + 1 < REQUEST_RETRIES:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = CONNECTION_TIMEOUT * 2 ** retry

                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    # End script if ran out of retries and data has never been received.
    else:
        logger.error("Data could not be retrieved.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        sys.exit(2)


def create_artefact_file(artefact_path: str, artefact_kind: str) -> str:
    """
    Create artefat file with specified PreLoadFilePath and kind

    :param artefact_path: artefact file PreLoadFilePath
    :param artefact_kind: artefact file kind
    :return: artefact file srn (ResourceID)
    """
    logger.info("Create new artefact file record...")
    # copy file record template
    request_body = FILE_RECORD_TEMPLATE.copy()
    # generate new ResourceID
    artefact_srn = generate_id(request_body["ResourceTypeID"])
    # update not-static fields
    request_body["ResourceID"] = artefact_srn
    request_body["Data"]["GroupTypeProperties"]["PreLoadFilePath"] = artefact_path
    request = {"kind": artefact_kind,
               "legal": {
                   "legaltags": [],
                   "otherRelevantDataCountries": ["US"],
                   "status": "compliant"
               },
               "acl": {
                   "viewers": [],
                   "owners": []
               },
               "data": request_body}
    request["legal"]["legaltags"].append(config.get("REQUEST", "legal_tag"))
    request["acl"]["viewers"].append(config.get("REQUEST", "acl_viewer"))
    request["acl"]["owners"].append(config.get("REQUEST", "acl_owner"))
    # create record on Storage API
    response = _put_request(STORAGE_URL, json.dumps([request]), DATA_UPDATE_OK_RESPONSE_CODES)
    record_id = ",".join(map(str, response.json()["recordIds"]))
    logger.info(f"Artefact file record was successfully created.\n"
                f"Generated ResourceID: {artefact_srn}\n"
                f"Record ID: {record_id}")
    file_logger.info(f"created: {artefact_srn}")
    return artefact_srn


def check_artefact_file(artefact_path: str, artefact_kind: str) -> Optional[str]:
    """
    Check if file with such combination artefact file PreLoadFilePath and artefact file kind exist.

    :param artefact_path: artefact file PreLoadFilePath
    :param artefact_kind: artefact file kind
    :return:
    """
    logger.info(f"Find Artefact File record with specified PreLoadFilePath: {artefact_path}...")
    artefact_srn = None
    # update seqrch query
    search_query = {
        "kind": f"{artefact_kind}",
        "query": f"data.Data.GroupTypeProperties.PreLoadFilePath:\"{artefact_path}\"",
        "limit": QUERY_SEARCH_LIMIT
    }
    # make request to Search API
    response = _post_request(SEARCH_URL, json.dumps(search_query), SEARCH_OK_RESPONSE_CODES)
    results = response.json()["results"]
    # if file record is found - get ResourceID
    if results:
        artefact_srn = results[0]["data"]["ResourceID"]
        logger.info(f"Artefact File with specified PreLoadFilePath was found.")
        logger.info(f"SRN: {artefact_srn}")
        file_logger.info(f"found: {artefact_srn}")
    else:
        logger.info("Artefact File with specified PreLoadFilePath wasn't found.")
    return artefact_srn


def get_record_by_id(record_id: str) -> Optional[Dict]:
    """
    Retrieve record from Storage API by Record ID

    :param record_id: record id
    :return: record data
    """
    response = _get_request(f"{STORAGE_URL}/{record_id}", SEARCH_OK_RESPONSE_CODES + NOT_FOUND_RESPONSE_CODES)
    if response.status_code in NOT_FOUND_RESPONSE_CODES:
        logger.error(f"Could not find record with ID: {record_id}")
        sys.exit(2)
    return response.json()


def add_artefact_to_record(record: Dict, artefact_file_srn: str) -> None:
    """
    Add artefact file object to record fields "Artefacts" and "ArtefactFiles" and update record

    :param record: record data
    :param artefact_file_srn: artefact file srn
    """
    artefact_object = ARTEFACT_TEMPLATE.copy()
    artefact_object["ResourceID"] = artefact_file_srn
    # add artefact object to Artefacts field
    record["data"]["Data"]["GroupTypeProperties"]["Artefacts"].append(artefact_object)
    # add artefact ResourceID to ArtefactFiles field or create this field with initial value
    if record["data"]["Data"]["ExtensionProperties"].get("ArtefactFiles"):
        record["data"]["Data"]["ExtensionProperties"]["ArtefactFiles"].append(artefact_file_srn)
    else:
        record["data"]["Data"]["ExtensionProperties"]["ArtefactFiles"] = [artefact_file_srn]
    # make request to Storage API
    response = _put_request(STORAGE_URL, json.dumps([record]), DATA_UPDATE_OK_RESPONSE_CODES)
    updated_record_id = ",".join(map(str, response.json()["recordIds"]))
    logger.info("Record was updated.")
    file_logger.info(f"updated: {updated_record_id}")


if __name__ == "__main__":
    main(sys.argv[1:])
