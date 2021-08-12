# Check manifest files for missing id's
import argparse
import configparser
import json
import logging
import os
import sys
from libs.search_record_ids import ExtendedSearchId
from libs.constants import MASTER_DATA_SECTION, REFERENCE_DATA_SECTION  # , \
#    DATA_SECTION, DATASETS_SECTION, WORK_PRODUCT_SECTION, WORK_PRODUCT_COMPONENTS_SECTION
from utils import get_headers
from typing import List, Set, Tuple

# Read config file dataload.ini
config = configparser.RawConfigParser()
config.read("./config/dataload.ini")

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
SEARCH_URL = config.get("CONNECTION", "search_url")


def load_file(filepath):
    """
    Extract data items from file with specified path

    :param filepath: file path
    :return: list of reference items extracted from file
    :rtype: list[tuple]
    """
    data_object = None
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


def get_manifest_entity_missing_ids(
    manifest_section: List[dict]
) -> Tuple[Set[str], Set[str]]:
    """Checks the id in each entity within the manifest section and print whether they exist or not.

    Args:
        manifest_section (List[dict]): A part of the manifest, where data types can be accessed.

    Returns:
        Tuple[Set[str], Set[str]]: Set of valid entity id's and list of missing entity id's.
    """
    found_ids = set()
    missing_ids = set()
    for entity in manifest_section:
        id = entity["id"]
        logger.debug(f"Checking {id}")

        # Search can't work with ids with versions. So get only ids without versions.
        search_handler = ExtendedSearchId(
            SEARCH_URL,
            [id],
            get_headers(config),
            None)
        tmp_found_ids = search_handler.search_records()
        if tmp_found_ids:
            found_ids.add(id)
            logger.debug(f"Found {id}")
        else:
            missing_ids.add(id)
            logger.debug(f"Missing {id}")

    return found_ids, missing_ids

# def get_work_product_missing_ids(manifest_integrity, work_product: dict) -> Tuple[dict, List[dict], List[str]]:
#     """
#     Ensure integrity of entities in given manifest parts. If records don't pass this validation
#     they are deleted from the manifest.

#     :param work_product: A part of the manifest, where data types can be accessed.
#     :return: The work product if it is valid, otherwise, empty dict.
#     """
#     missing_ids = get_missing_ids(manifest_integrity, work_product)
#     if missing_ids:
#         return work_product, [], missing_ids
#     else:
#         return {}, work_product, missing_ids

# def create_wpc_artefacts_missing_ids(manifest_integrity, wpc: dict):
#     artefacts = wpc["data"].get("Artefacts")
#     if not artefacts:
#         logger.debug(
#             f"WPC: {wpc.get('id')} doesn't have Artefacts field. Mark it as valid.")
#         return
#     artefacts_resource_ids = set(artefact["ResourceID"] for artefact in artefacts)
#     datasets = set(wpc["data"].get(DATASETS_SECTION, []))
#     duplicated_ids = artefacts_resource_ids.intersection(datasets)
#     if duplicated_ids:
#         logger.warning(
#             f"Resource kind '{wpc.get('kind')}' and id '{wpc.get('id', '')}' was rejected. "
#             f"The WPC's Artefacts field contains the same ids as in "
#             f"the WPC's 'Datasets': {duplicated_ids}."
#         )
#         raise ValidationIntegrityError(wpc,
#                                         reason=f"It has duplicated "
#                                                 f"Datasets and Artefacts: {duplicated_ids}.")

# def get_artefacts_missing_ids(manifest_integrity, work_product_components: list) -> Tuple[
#     List[dict], List[dict], List[str]]:
#     """
#     Delete a WPC entity if it didn't passed artefacts integrity check.

#     :param work_product_components:
#     :return: List of valid wpcs.
#     """
#     valid_work_product_components = []
#     skipped_ids = []
#     for wpc in work_product_components:
#         try:
#             create_wpc_artefacts_missing_ids(manifest_integrity, wpc)
#         except ValidationIntegrityError as error:
#             skipped_ids.append(wpc)
#         else:
#             valid_work_product_components.append(wpc)
#     return valid_work_product_components, skipped_ids, []


def check_missing_ids_in_file(filepath: str) -> Tuple[Set[str], Set[str]]:
    """Get all missing id's from within the specified manifest file

    Args:
        filepath (str): path to manifest file

    Returns:
        Tuple[Set[str], Set[str]]: List of valid entity id's and list of missing entity id's.
    """
    logger.info(f"Processing : {filepath}")
    manifest_data = load_file(filepath)
    logger.debug(f"Manifest data: {manifest_data}")

    found_ids = set()
    missing_ids = set()

    # Check ReferenceData and MasterData sections
    for data_type in (REFERENCE_DATA_SECTION, MASTER_DATA_SECTION):
        if manifest_data.get(data_type):
            tmp_found_ids, tmp_missing_ids = get_manifest_entity_missing_ids(manifest_data[data_type])
            found_ids.update(tmp_found_ids)
            missing_ids.update(tmp_missing_ids)

    # # Handle DataSets, WorkProductComponents and WorkProducts
    # if manifest_data.get(DATA_SECTION):
    #     if manifest[DATA_SECTION].get(DATASETS_SECTION):
    #         datasets = manifest[DATA_SECTION].get(DATASETS_SECTION)
    #         valid_entities, not_valid_entities, tmp_missing_ids = get_manifest_entity_missing_ids(
    #             manifest_integrity,
    #             datasets
    #         )
    #         manifest[DATA_SECTION][DATASETS_SECTION] = valid_entities
    #         invalid_entities.extend(not_valid_entities)
    #         missing_ids.update(tmp_missing_ids)

    #     if manifest[DATA_SECTION].get(WORK_PRODUCT_COMPONENTS_SECTION):
    #         work_product_components = manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION]
    #         valid_entities, not_valid_entities, tmp_missing_ids = get_manifest_entity_missing_ids(
    #             manifest_integrity,
    #             work_product_components
    #         )
    #         invalid_entities.extend(not_valid_entities)
    #         missing_ids.update(tmp_missing_ids)
    #         valid_entities, not_valid_entities, tmp_missing_ids = \
    #             get_artefacts_missing_ids(
    #                 manifest_integrity,
    #                 valid_entities
    #             )
    #         manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION] = valid_entities
    #         invalid_entities.extend(not_valid_entities)
    #         missing_ids.update(tmp_missing_ids)

    #     if manifest[DATA_SECTION].get(WORK_PRODUCT_SECTION):
    #         work_product_data = manifest[DATA_SECTION][WORK_PRODUCT_SECTION]
    #         valid_entities, not_valid_entities, tmp_missing_ids = get_work_product_missing_ids(
    #             manifest_integrity,
    #             work_product_data
    #         )
    #         manifest[DATA_SECTION][WORK_PRODUCT_SECTION] = valid_entities
    #         invalid_entities.extend(not_valid_entities)
    #         missing_ids.update(tmp_missing_ids)
    return found_ids, missing_ids


def main(argv):
    """Main entry point

    Args:
        argv (arguments): command line arguments
    """
    parser = argparse.ArgumentParser(description='Check for missing id\'s within manifest files.')
    parser.add_argument('--path', default='.', help='Path to manifest file(s).')
    parser.add_argument('--verbose', action='store_true', help='More detailed logging.')
    args = parser.parse_args()
    path = args.path
    verbose = args.verbose

    if verbose:
        logger.setLevel(logging.DEBUG)
        file_logger.setLevel(logging.DEBUG)

    found_ids = set()
    missing_ids = set()

    if os.path.isfile(path):
        found_ids, missing_ids = check_missing_ids_in_file(path)

    else:
        # Recursive traversal of files and subdirectories of the root directory and files processing
        logger.info(f"Root dir for scanning files: {path}")
        for root, _, files in os.walk(path):
            for file in files:
                filepath = os.path.join(root, file)
                tmp_found_ids, tmp_missing_ids = check_missing_ids_in_file(filepath)
                found_ids.update(tmp_found_ids)
                missing_ids.update(tmp_missing_ids)

    # display missing ids
    if len(missing_ids) > 0:
        logger.info(f"Total {len(missing_ids)} missing id's found of {(len(missing_ids) + len(found_ids))} records")
        for id in missing_ids:
            logger.info(f"Missing {id}")

    else:
        logger.info("No missing id's found")


if __name__ == "__main__":
    main(sys.argv[1:])
