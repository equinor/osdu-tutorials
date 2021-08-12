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
import getopt
import json
import logging
import re
import sys
import time
from typing import Dict, List

import requests

from utils import get_headers

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Test")

test_config = configparser.RawConfigParser()
test_config.read("config/test.ini")

dataload_config = configparser.RawConfigParser()
dataload_config.read("config/dataload.ini")

REQUEST_BODY = {"kind": "opendes:osdu:*:*", "query": "*", "aggregateBy": "kind"}
OK_RESPONSE_CODES = [200]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]


def main(argv: list) -> None:
    """
    Parse command line arguments and compare number of resources in storage to numbers in
    config files.

    :param list argv: Command line arguments.
    """
    usage = ("usage: python test_uploaded_data_count.py\n"
             "-h or --help - get script usage information\n"
             "-i or --initial - test initial kinds\n"
             "-e or --enriched - test enriched kinds")

    try:
        opts, _ = getopt.getopt(argv, "hie", ["help", "initial", "enriched"])
    except getopt.GetoptError as e:
        logger.error(e)
        logger.error(f"Correct usage: {usage}")
        sys.exit(2)

    test_initial_data = False
    test_enriched_data = False

    for opt, _ in opts:
        if opt in ("-h", "--help"):
            logger.info(f"Correct usage: {usage}")
            sys.exit()

        if opt in ("-i", "--initial"):
            test_initial_data = True

        if opt in ("-e", "--enriched"):
            test_enriched_data = True

    if not (test_initial_data or test_enriched_data):
        test_initial_data = True

    logger.info("Testing if all data is uploaded and indexed.")

    kinds_to_test = get_kinds_to_test(test_initial_data, test_enriched_data)

    kinds_count = get_kinds_count()

    if test_kinds_count(kinds_to_test, kinds_count):
        logger.info("Test is completed successfully.")


def get_kinds_to_test(test_initial_data: bool, test_enriched_data: bool) -> List[str]:
    """
    Get kinds that are going to be checked from dataload config file.

    :param bool test_initial_data: If initial data is going to be tested.
    :param bool test_enriched_data: If enriched data is going to be tested.
    :return: List of kinds to test.
    :rtype: list
    """
    kinds_to_test = []

    try:
        if test_initial_data:
            kinds_to_test = [*kinds_to_test,
                             *[kind for _, kind in dataload_config.items("KINDS_INITIAL")]]

        if test_enriched_data:
            kinds_to_test = [*kinds_to_test,
                             *[kind for _, kind in dataload_config.items("KINDS_ENRICHED")]]
    except configparser.NoSectionError as e:
        logger.error(f"{e}. Update config and run the test once more.")
        sys.exit(2)

    return kinds_to_test


def get_kinds_count() -> Dict[str, int]:
    """
    Send a search request with aggregation by kind and build a dict of kinds and their numbers.

    :return: Dictionary with kinds and numbers of resources in storage.
    :rtype: dict
    """
    try:
        request_retries = test_config.getint("CONNECTION", "retries")
        connection_timeout = test_config.getint("CONNECTION", "timeout")
        search_url = dataload_config.get("CONNECTION", "search_url")
    except (configparser.NoSectionError, configparser.NoOptionError) as e:
        logger.error(f"{e}. Update config and run the test once more.")
        sys.exit(2)

    for retry in range(request_retries):
        logger.info("Downloading data from storage.")

        response = requests.post(search_url, json.dumps(REQUEST_BODY),
                                 headers=get_headers(dataload_config))

        if response.status_code in OK_RESPONSE_CODES:
            aggregations = response.json().get("aggregations", [])
            logger.info("Aggregation data is downloaded.")
            break

        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")

        if retry + 1 < request_retries:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = connection_timeout * 2 ** retry

                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    # End script if ran out of retries and data has never been received.
    else:
        logger.error("Data could not be retrieved.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        sys.exit(2)

    return {kind["key"]: kind["count"] for kind in aggregations}


def test_kinds_count(kinds_to_test: List[str], kinds_count: Dict[str, int]) -> bool:
    """
    Check if all kinds from dataload config are present in the storage, then compare their number to
    a number written in test config.

    :param bool kinds_to_test: List of kinds that are needed to be tested.
    :param bool kinds_count: Number of all kinds in storage.
    :return: True if all kinds are present and are in expected quantity in storage, False otherwise.
    :rtype: bool
    """
    data_is_correct = True

    for kind in kinds_to_test:
        received_kind_count = kinds_count.get(kind, 0)

        if received_kind_count:
            kind_name = re.match(r"[\w:]+:+([a-z\-]*)(:[\d]|-)", kind).group(1)

            try:
                expected_kind_count = test_config.getint(
                    "COUNTS", test_config.get("KINDS_TO_COUNTS_MAPPING", kind_name)
                )
            except (configparser.NoSectionError, configparser.NoOptionError) as e:
                logger.error(f"{e}. Update config and run the test once more.")
                data_is_correct = False
                continue

            if expected_kind_count != received_kind_count:
                data_is_correct = False
                logger.error(f"Expected number of {kind} is {expected_kind_count}, "
                             f"received number is {received_kind_count}.")
            else:
                logger.info(f"{kind} is uploaded and indexed successfully.")
        else:
            data_is_correct = False
            logger.error(f"No data for {kind}.")

    return data_is_correct


if __name__ == "__main__":
    main(sys.argv[1:])
