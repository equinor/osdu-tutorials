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
import copy
import csv
import getopt
import json
import logging
import sys
import time
from datetime import datetime
from typing import Optional, List, Tuple, Dict

import requests

from utils import get_headers

# Set up base logger
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(logging.Formatter(
    "%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s"
))
logger = logging.getLogger("Enrichment")
logger.setLevel(logging.INFO)
logger.addHandler(stream_handler)

timestamp = datetime.now().isoformat()

# Do not set up error logger just yet to avoid creating log file before any error occurs
error_file_logger = None

# Set up file logger
file_handler = logging.FileHandler(f"enrichment_{timestamp}.log")
file_handler.setFormatter(logging.Formatter("%(message)s"))
file_logger = logging.getLogger("enrichment_file_logger")
file_logger.setLevel(logging.INFO)
file_logger.addHandler(file_handler)

config = configparser.RawConfigParser()
config.read("config/dataload.ini")

SEARCH_OK_RESPONSE_CODES = [200]
ENRICHMENT_OK_RESPONSE_CODES = [201]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]

RECORD_LOGGER_BATCH_SIZE = 25


class ResourceIDNotFound(Exception):
    """
    Custom exception for handling error when UWI/UWBI is missed

    """
    pass


def get_errors_logger() -> logging.Logger:
    """
    Initialize error file logger if it isn't yet, otherwise return the existing one.
    :return: errors logger
    :rtype: logging.Logger
    """
    global error_file_logger

    if not error_file_logger:
        # Set up file logger for ids that could not be enriched
        error_file_handler = logging.FileHandler(f"enrichment_errors_{timestamp}.log")
        error_file_handler.setFormatter(logging.Formatter("%(message)s"))
        error_file_logger = logging.getLogger("enrichment_error_file_logger")
        error_file_logger.setLevel(logging.INFO)
        error_file_logger.addHandler(error_file_handler)

    return error_file_logger


def main(argv):
    usage = ("usage: py enrichment.py "
             "--record_ids <record_ids> ")

    try:
        opts, args = getopt.getopt(argv, "h", ["record_ids="])
    except getopt.GetoptError as e:
        logger.error(f"Correct usage: {usage}")
        logger.error(str(e))
        sys.exit(2)

    record_ids = ""

    for opt, arg in opts:
        if opt == "-h":
            logger.info(f"Correct usage: {usage}")
            sys.exit()
        elif opt == "--record_ids":
            record_ids = arg.strip()
            logger.info(f"record_ids file: {record_ids}")

    if record_ids:
        enriched_records = []
        enriched_records_count = 0
        skipped_records_count = 0

        with open(record_ids, newline='') as file:
            reader = csv.reader(file)

            records_count = 0
            for row in reader:
                for _ in row:
                    records_count += 1

            logger.info(f"Total number of records to enrich: {records_count}.")

            file.seek(0)

            for row in reader:
                for record_id in row:
                    enriched_record = enrich(record_id)

                    if not enriched_record:
                        skipped_records_count += 1
                        continue

                    enriched_records.append(enriched_record)
                    enriched_records_count += 1

                    processed_records_count = enriched_records_count + skipped_records_count
                    if processed_records_count % RECORD_LOGGER_BATCH_SIZE == 0:
                        logger.info(f"Processed records number: "
                                    f"[{processed_records_count}/{records_count}].")

                    if len(enriched_records) >= config.getint("CONNECTION", "batch_size"):
                        send_batch(enriched_records)
                        logger.info(f"Last enriched record id is {record_id}")
                        enriched_records.clear()

        send_batch(enriched_records)
        logger.info(f"Total enriched records number: {enriched_records_count}, "
                    f"skipped records number: {skipped_records_count}.")


def get_record_by_id(record_id):
    # TODO move refresh logic to separated function, to utils module maybe
    request_retries = config.getint("CONNECTION", "retries")
    for retry in range(request_retries):
        response = requests.get(f"{config.get('CONNECTION', 'storage_url')}/{record_id}",
                                headers=get_headers(config))

        if response.status_code in SEARCH_OK_RESPONSE_CODES:
            return response.json()

        if retry + 1 < request_retries:
            logger.error(f"Response status: {response.status_code}"
                         f"Response content: {response.text[:250]}")

            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = config.getint("CONNECTION", "timeout")
                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    logger.error(f"Could not get data from storage for {record_id}")
    logger.error(f"Response status: {response.status_code}. "
                 f"Response content: {response.text[:250]}.")
    sys.exit(2)


def extractSpudDate(well):
    for event in well["data"]["Data"]["IndividualTypeProperties"]["FacilityEvent"]:
        if event["FacilityEventTypeID"] == "srn:reference-data/FacilityEventType:SPUD:":
            return datetime.strptime(event["EffectiveDateTime"], "%Y-%m-%dT%H:%M:%S")


def extract_id(facility_name_alias_resource: List[dict], id_type: str) -> Optional[str]:
    """
    Extract ID from complex structure FacilityNameAlias

    :param facility_name_alias_resource: FacilityNameAlias structure
    :param id_type: "UWI" or "UWBI"
    :return: alias name
    """
    for elem in facility_name_alias_resource:
        if id_type in elem["AliasNameTypeID"]:
            return elem["AliasName"]
    return None


def flatten_spatial_location(well):
    spatial_location = copy.deepcopy(well["data"]["Data"]["IndividualTypeProperties"]["SpatialLocation"])
    for location in spatial_location:
        location["Coordinates"] = flatten_object_array(location["Coordinates"])
    return flatten_object_array(spatial_location)


def _get_alias_name(full_alias_name: str) -> str:
    """
    Parse short alias name from full raw value
    Example: srn:reference-data/AliasNameType:UWI: -> UWI

    :param full_alias_name: full raw alias name value
    :return: short alias name value
    :rtype: str
    """
    return full_alias_name.split(":")[-2]


def flatten_facility_name_alias(master_data: dict) -> None:
    """
    flatten complex field FacilityNameAlias to root level

    :param master_data: data object of master files (Well or Wellbore)
    """
    for elem in master_data["data"]["Data"]["IndividualTypeProperties"]["FacilityNameAlias"]:
        # expected get alias name from AliasNameTypeID field:
        # for example: srn:reference-data/AliasNameType:UWI -> UWI
        master_data["data"][_get_alias_name(elem["AliasNameTypeID"])] = elem["AliasName"]


def enrich_well(well: dict) -> None:
    well["kind"] = config.get("KINDS_ENRICHED", "enriched_well_kind")
    flatten_facility_name_alias(well)
    well["data"]["WellName"] = well["data"]["Data"]["IndividualTypeProperties"]["FacilityName"]
    well["data"]["SpudDate"] = datetime.strftime(extractSpudDate(well), "%Y-%m-%dT%H:%M:%S")
    well["data"]["GeoLocation"] = extract_spatial_location_point(well)
    well["data"]["FacilityEvent"] = flatten_object_array(
        well["data"]["Data"]["IndividualTypeProperties"]["FacilityEvent"])
    well["data"]["SpatialLocation"] = flatten_spatial_location(well)


def enrich_wellbore(wellbore: dict) -> None:
    wellbore["kind"] = config.get("KINDS_ENRICHED", "enriched_wellbore_kind")
    flatten_facility_name_alias(wellbore)
    wellbore["data"]["UWI"] = find_well_uwi(wellbore["data"]["Data"]["IndividualTypeProperties"]['WellID'])
    wellbore["data"]["WellboreName"] = wellbore["data"]["Data"]["IndividualTypeProperties"]["FacilityName"]
    wellbore["data"]["GeoLocation"] = extract_spatial_location_point(wellbore)
    wellbore["data"]["SpatialLocation"] = flatten_spatial_location(wellbore)


def extract_curves_mnemonic(curves):
    curves_mnemonic = []
    for curve in curves:
        curves_mnemonic.append(curve["Mnemonic"])
    return curves_mnemonic


def enrich_log(log: dict) -> None:
    log["kind"] = config.get("KINDS_ENRICHED", "enriched_welllog_wpc_kind")
    populate_parent_data(log)
    log["data"]["Curves"] = {"Mnemonic": extract_curves_mnemonic(
        log["data"]["Data"]["IndividualTypeProperties"]["Curves"]
    )}
    log["data"]["Curves"]["Data"] = flatten_object_array(log["data"]["Data"]["IndividualTypeProperties"]["Curves"])


def enrich_trajectory(trajectory: dict) -> None:
    trajectory["kind"] = config.get("KINDS_ENRICHED", "enriched_wellboretrajectory_wpc_kind")
    populate_parent_data(trajectory)


def extract_marker_names(markers):
    marker_names = []
    for marker in markers:
        marker_names.append(marker["MarkerName"])
    return marker_names


def enrich_marker(marker: dict) -> None:
    marker["kind"] = config.get("KINDS_ENRICHED", "enriched_wellboremarker_wpc_kind")
    populate_parent_data(marker)
    marker["data"]["Markers"] = extract_marker_names(marker["data"]["Data"]["IndividualTypeProperties"]["Markers"])
    marker["data"]["MarkersData"] = flatten_object_array(marker["data"]["Data"]["IndividualTypeProperties"]["Markers"])


def populate_parent_data(wpc: dict) -> None:
    """
    Append parents depends fields to Work Product Component data object (UWI and UWBI)

    :param wpc: work product component data object
    """
    uwi, uwbi = find_parents_ids(wpc["data"]["Data"]["IndividualTypeProperties"]["WellboreID"])
    wpc["data"]["UWI"] = uwi
    wpc["data"]["UWBI"] = uwbi


def flatten_object_array(object_array):
    flattened_array = []
    for item in object_array:
        flattened_array.append(", ".join("{!s}={!r}".format(key, val) for (key, val) in item.items()))
    return flattened_array


def find_parents_ids(resource_id: str) -> Tuple[str, str]:
    """
    Get parent (Wellbore) and grandparent (Well) UWI and UWBI by parent ResourseID

    :param resource_id: wellbore resource id
    :return: tuple with 2 values - UWI and UWBI
    :rtype: tuple(str, str)
    """
    wellbore_query = f"data.ResourceID:\"{resource_id}\""
    request = {"kind": config.get("KINDS_INITIAL", "wellbore_kind"),
               "query": wellbore_query}
    results = search(request)["results"]

    if not results:
        logger.warning(f"No search results for {resource_id}.")
        raise ResourceIDNotFound()

    if not results[0].get("id"):
        logger.warning(f"No Record ID for {resource_id}.")
        raise ResourceIDNotFound()

    wellbore_record = get_record_by_id(results[0]["id"])
    well_resource_id = wellbore_record["data"]["Data"]["IndividualTypeProperties"]['WellID']
    uwbi = extract_id(wellbore_record["data"]["Data"]["IndividualTypeProperties"]["FacilityNameAlias"], "UWBI")

    if not uwbi:
        logger.warning(f"Could not get UWI from well {resource_id}")
        raise ResourceIDNotFound()

    uwi = find_well_uwi(well_resource_id)
    return uwi, uwbi


def find_well_uwi(resource_id: str) -> str:
    """
    Get grand-parent (Well) UWI by ResourceID

    :param resource_id: well resource id
    :return: well UWI
    :rtype: str
    """
    well_query = f"data.ResourceID:\"{resource_id}\""
    request = {"kind": config.get("KINDS_INITIAL", "well_kind"),
               "query": well_query}
    results = search(request)["results"]

    if not results:
        logger.warning(f"No search results for {resource_id}.")
        raise ResourceIDNotFound()

    if not results[0].get("id"):
        logger.warning(f"No Record ID for {resource_id}.")
        raise ResourceIDNotFound()

    well_record = get_record_by_id(results[0]["id"])
    uwi = extract_id(well_record["data"]["Data"]["IndividualTypeProperties"]["FacilityNameAlias"], "UWI")

    if not uwi:
        logger.warning(f"Could not get UWI from well {resource_id}")
        raise ResourceIDNotFound()

    return uwi


def search(body):
    response = requests.post(config.get("CONNECTION", "search_url"), json.dumps(body),
                             headers=get_headers(config))

    # TODO move refresh logic to separated function, to utils module maybe
    request_retries = config.getint("CONNECTION", "retries")
    for retry in range(request_retries):
        if response.status_code in SEARCH_OK_RESPONSE_CODES:
            return response.json()

        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")

        if retry + 1 < request_retries:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = config.getint("CONNECTION", "timeout")
                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    logger.error(f"Could not get data for {body}")
    logger.error(f"Response status: {response.status_code}. "
                 f"Response content: {response.text[:250]}.")
    sys.exit(2)


def enrich(record_id: str) -> Optional[Dict]:
    record_id = record_id.strip()
    record = get_record_by_id(record_id)
    del record["id"]
    try:
        if record["kind"] == config.get("KINDS_INITIAL", "well_kind"):
            enrich_well(record)
        elif record["kind"] == config.get("KINDS_INITIAL", "wellbore_kind"):
            enrich_wellbore(record)
        elif record["kind"] == config.get("KINDS_INITIAL", "welllog_wpc_kind"):
            enrich_log(record)
        elif record["kind"] == config.get("KINDS_INITIAL", "wellboretrajectory_wpc_kind"):
            enrich_trajectory(record)
        elif record["kind"] == config.get("KINDS_INITIAL", "wellboremarker_wpc_kind"):
            enrich_marker(record)
        elif record["kind"] == config.get("KINDS_INITIAL", "wellboremarker_wp_kind"):
            record["kind"] = config.get("KINDS_ENRICHED", "enriched_wellboremarker_wp_kind")
        elif record["kind"] == config.get("KINDS_INITIAL", "wellboretrajectory_wp_kind"):
            record["kind"] = config.get("KINDS_ENRICHED", "enriched_wellboretrajectory_wp_kind")
        elif record["kind"] == config.get("KINDS_INITIAL", "welllog_wp_kind"):
            record["kind"] = config.get("KINDS_ENRICHED", "enriched_welllog_wp_kind")
        elif record["kind"] == config.get("KINDS_INITIAL", "file_kind"):
            record["kind"] = config.get("KINDS_ENRICHED", "enriched_file_kind")
        return record
    except ResourceIDNotFound:
        # handle our custom error in case when UWI/UWBI is missed
        get_errors_logger().info(record_id)
        return None


def extract_spatial_location_point(well: dict) -> Dict:
    return {
        "latitude": well["data"]["Data"]["IndividualTypeProperties"]["SpatialLocation"][0]["Coordinates"][0]["y"],
        "longitude": well["data"]["Data"]["IndividualTypeProperties"]["SpatialLocation"][0]["Coordinates"][0]["x"]
    }


def send_batch(body):
    request_retries = config.getint("CONNECTION", "retries")

    for retry in range(request_retries):
        try:
            response = requests.put(config.get("CONNECTION", "storage_url"), json.dumps(body),
                                    headers=get_headers(config))

            # TODO move refresh logic to separated function, to utils module maybe
            if response.status_code in ENRICHMENT_OK_RESPONSE_CODES:
                file_logger.info(",".join(map(str, response.json()["recordIds"])))
                logger.info(f"Request successful. {len(body)} records enriched in storage.")
                break

            logger.error(f"Response status: {response.status_code}. "
                         f"Response content: {response.text[:250]}.")

            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")

        except Exception as ex:
            logger.info("Exception occurred")
            logger.info(ex)

        if retry + 1 < request_retries:
            time_to_sleep = config.getint("CONNECTION", "timeout")
            logger.info(f"Retrying in {time_to_sleep} seconds...")

            time.sleep(time_to_sleep)

    # End script if run out of retries and data has never been received.
    else:
        logger.error(f"Could not send a request to storage.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        sys.exit(2)


if __name__ == "__main__":
    main(sys.argv[1:])
