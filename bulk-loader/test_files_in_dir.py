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
import glob
import json
import logging
import math
import os
import re
import sys
from typing import Optional

import requests

from utils import get_headers

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Test")

config = configparser.RawConfigParser()
config.read("config/dataload.ini")

AVAILABLE_DATA_TYPES = ("well", "wellbore", "wellboremarker", "welllog", "wellboretrajectory")

OK_RESPONSE_CODES = [200]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]


def main(argv: list):
    """
    Parse command line arguments and test if data is uploaded to storage.

    :param list argv: Command line arguments.
    """
    usage = "usage: py dataload.py " \
            "--well_dir <wells> " \
            "--wellbore_dir <wellbores> " \
            "--top_dir <tops> " \
            "--trajectory_dir <trajectories> " \
            "--log_dir <logs>"

    try:
        opts, _ = getopt.getopt(
            argv, "h",
            ["limit=", "well_dir=", "wellbore_dir=", "wellboremarker_dir=",
             "wellboretrajectory_dir=", "welllog_dir="]
        )
    except getopt.GetoptError as e:
        logger.error(f"Correct usage: {usage}")
        logger.error(str(e))
        sys.exit(2)

    opts = {opt: args for opt, args in opts}

    if "-h" in opts.keys():
        logger.info(f"Correct usage: {usage}")
        sys.exit()

    limit = 0
    if "--limit" in opts.keys():
        limit = int(opts["--limit"].strip())
        logger.info(f"Limit: {limit}")
        del opts["--limit"]

    for opt, arg in opts.items():
        test_directory(re.match(r"-+([a-z]*)", opt)[1], arg.strip(), limit)


def test_directory(data_type: str, directory: str, limit: int):
    """
    Test if data from files in the specified directory is uploaded.

    :param str data_type: Type of data contained in files.
    :param str directory: Specified directory to check data from.
    :param int limit: Number of files to test.
    """
    assert data_type in AVAILABLE_DATA_TYPES, f"FAIL: invalid data type {data_type}"

    logger.info(f"{data_type} directory: {directory}")

    files_list = glob.glob(os.path.join(directory, "*.json"))
    files = files_list[:limit] if limit else files_list

    # The first two data types ("well" and "wellbore") are master types,
    # other ones are their products
    if data_type in AVAILABLE_DATA_TYPES[:2]:
        test_master(files, data_type)
    else:
        test_work_products(files, data_type)


def search(data_type: str, query: Optional[str] = "*") -> dict:
    """
    Send a search request.

    Fills up request headers and body then sends a search request. If there are more then 100 items
    goes through all of the pages.

    :param str data_type:
    :param str query:
    :return: JSON representation of requested data.
    :rtype: dict
    """
    logger.info("Downloading data.")

    retries = config.getint("CONNECTION", "retries")
    for retry in range(retries):
        response = requests.post(config.get("CONNECTION", "search_url"),
                                 json.dumps(populate_body(data_type, query)),
                                 headers=get_headers(config))

        if response.status_code in OK_RESPONSE_CODES:
            response_json = response.json()
            total_count = response_json["totalCount"]
            assert total_count != 0, "FAIL: data not indexed"

            # At the time of writing storage did not return more than 100 results at once, so use
            # offset to get all of the suitable records.
            resources_per_page = 100
            pages_count = math.ceil(total_count / resources_per_page)
            for page in range(1, pages_count):
                if page % 10 == 0:
                    logger.info(f"Downloading data. Pages downloaded [{page}/{pages_count}].")

                response = requests.post(config.get("CONNECTION", "search_url"),
                                         json.dumps(
                                             populate_body(data_type, query,
                                                           offset=page * resources_per_page)
                                         ),
                                         headers=get_headers(config))
                if response.status_code in OK_RESPONSE_CODES:
                    response_json["results"] = [*response_json["results"],
                                                *response.json()["results"]]
                else:
                    logger.error("Data could not been retrieved.")
                    logger.error(f"Response status: {response.status_code}. "
                                 f"Response content: {response.text[:250]}.")
                    sys.exit(2)

            return response_json

        if retry + 1 < retries:
            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                logger.error("Data could not been retrieved.")
                logger.error(f"Response status: {response.status_code}. "
                             f"Response content: {response.text[:250]}.")
                sys.exit(2)
        else:
            logger.error("Data could not been retrieved.")
            logger.error(f"Response status: {response.status_code}. "
                         f"Response content: {response.text[:250]}.")
            sys.exit(2)


def populate_body(data_type: str, query: str,
                  limit: Optional[int] = 100, offset: Optional[int] = 0) -> dict:
    """
    Fill up the dictionary to use in the body of the request.

    :param str data_type:
    :param str query:
    :param int limit:
    :param int offset:
    :return: Dictionary to use in the body of the request.
    :rtype: dict
    """
    # TODO get kinds section name from args???
    return {"kind": config.get("KINDS_INITIAL", f"{data_type}_kind"), "query": query,
            "limit": limit, "offset": offset}


def test_master(master_files: list, data_type: str):
    """
    Test if well or wellbore data was uploaded and indexed.

    :param list master_files: List of files to test.
    :param str data_type: Type of data to test.
    """
    logger.info(f"Testing: {data_type}.")

    result = search(data_type)

    results_count = result["totalCount"]
    master_files_count = len(master_files)

    if results_count != master_files_count:
        logger.warning(
            f"Returned number of {data_type} ({results_count}) "
            f"is different from number of files ({master_files_count})"
        )

    tested_files_count = 0
    for master in master_files:
        if tested_files_count % 100 == 0:
            logger.info(f"Files tested [{tested_files_count}/{master_files_count}].")

        with open(master) as file:
            data_object = json.load(file)

        resources_number = 0

        for res in result["results"]:
            if data_object["Manifest"]["ResourceID"] == res["data"]["ResourceID"]:
                resources_number += 1

                assert (
                    data_object["Manifest"]["Data"]["IndividualTypeProperties"]["FacilityName"]
                    == res["data"]["Data.IndividualTypeProperties.FacilityName"]
                ), (f"FAIL: FacilityName for resource id {data_object['Manifest']['ResourceID']} "
                    f"doesn't match")

        assert resources_number == 1, (f"FAIL: number of {data_type}s for resource "
                                       f"{data_object['Manifest']['ResourceID']} "
                                       f"is {resources_number}")

        tested_files_count += 1

    logger.info(f"Files tested [{tested_files_count}/{master_files_count}].")
    logger.info("SUCCESS!")


def test_work_products(work_product_files: list, data_type: str):
    """
    Test if marker, well logs, or trajectory data was uploaded and indexed.

    :param list work_product_files: List of files to test.
    :param str data_type: Type of data to test.
    """
    data_types_mapping = {
        "wellboretrajectory": "trajectory_csvs",
        "wellboremarker": "markers_csv",
        "welllog": "well-logs"
    }

    logger.info(f"Testing: {data_type}.")

    work_products = search(data_type + "_wp")
    work_product_components = search(data_type + "_wpc")
    files = search(
        "file",
        f"data.Data.GroupTypeProperties.PreLoadFilePath:\"*{data_types_mapping[data_type]}*\""
    )

    tested_files_count = 0
    for product in work_product_files:
        if tested_files_count % 25 == 0:
            logger.info(f"Files tested [{tested_files_count}/{len(work_product_files)}].")

        with open(product) as file:
            data_object = json.load(file)

        test_product(data_object, data_type, work_products["results"],
                     work_product_components["results"], files["results"])

        tested_files_count += 1

    logger.info(f"Files tested [{tested_files_count}/{len(work_product_files)}].")
    logger.info("SUCCESS!")


# TODO split to smaller functions
def test_product(product: dict, data_type: str, work_products: list, work_product_components: list,
                 files: list):
    """
    Test each item from the product.

    Tests if all product data was uploaded and indexed correctly. Product includes 3 parts: work
    product, list of work product components and list of files. Name is used to find corresponding
    work product and work product components, preload file path to find files. Additionally
    wellbore id is checked for work product components.

    :param dict product:
    :param str data_type:
    :param list work_products: List of work product records of the specified data type.
    :param list work_product_components: List of work product component records of the specified
    data type.
    :param list files: List of file records of the specified data type.
    """
    # Testing work product.
    work_product = product["WorkProduct"]

    work_products_number = 0

    for wp in work_products:
        if (work_product["Data"]["IndividualTypeProperties"]["Name"]
                == wp["data"]["Data.IndividualTypeProperties.Name"]):
            work_products_number += 1

    assert work_products_number == 1, (
        f"FAIL: number of {data_type}s for resource "
        f"{work_product['Data']['IndividualTypeProperties']['Name']} "
        f"is {work_products_number}"
    )

    # Testing work product components.
    product_work_product_components = product["WorkProductComponents"]

    for component in product_work_product_components:
        wpc_results = [wpc for wpc in work_product_components if (
            component["Data"]["IndividualTypeProperties"]["Name"]
            == wpc["data"]["Data.IndividualTypeProperties.Name"]
        )]

        assert len(wpc_results) == len(product_work_product_components), (
            f"FAIL: number of {data_type}s for resource "
            f"{component['Data']['IndividualTypeProperties']['Name']} locally is "
            f"{len(product_work_product_components)}, while server returned {len(wpc_results)} "
            f"items"
        )

        for wpc_result in wpc_results:
            assert (
                component["Data"]["IndividualTypeProperties"]["WellboreID"]
                == wpc_result["data"]["Data.IndividualTypeProperties.WellboreID"]
            ), (
                f"FAIL: WellboreID doesn't match for "
                f"{component['Data']['IndividualTypeProperties']['WellboreID']}"
            )

    # Testing files.
    product_files = product["Files"]
    product_file_paths = [file["Data"]["GroupTypeProperties"]["PreLoadFilePath"]
                          for file in product_files]

    files_numbers = {product_file_path: 0 for product_file_path in product_file_paths}

    for file in files:
        file_path = file["data"]["Data.GroupTypeProperties.PreLoadFilePath"]
        if file_path in product_file_paths:
            files_numbers[file_path] += 1

    for file_path in files_numbers.keys():
        assert files_numbers[file_path] == len(product_files), (
            f"FAIL: number of {data_type}s for resource {file_path} locally is "
            f"{len(product_files)}, while server returned {files_numbers[file_path]} items"
        )


if __name__ == "__main__":
    main(sys.argv[1:])
