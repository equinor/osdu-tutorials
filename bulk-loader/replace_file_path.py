"""
Utility script for updating `PreLoadFilePath` field value work-product in manifests.
"""
import configparser
import getopt
import json
import logging
import os
import re
import sys
from typing import Any, Iterator, List, Optional, Tuple

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Replace file path")

# config reading
dataload_config = configparser.RawConfigParser()
dataload_config.read("config/dataload.ini")

BLOB_BASE_URL = dataload_config.get("FILE_PATH_REPLACER", "blobs_base_url")
BLOB_PATH_REGEXP = r"\S+\/(\S+\/\S+)"


def get_new_blob_path(match_obj: re.Match) -> str:
    """
    Function called by re.sub module for matched file URL value
    :param match_obj: result of matching URL value and BLOB_PATH_REGEXP
    :return: updated URL value
    """
    return f"{BLOB_BASE_URL}/{match_obj.group(1)}"


def get_field_by_path(data: dict, path: List[str]) -> Optional[Tuple[Any, dict]]:
    """
    Get value for nested field with complex path.
    :param data: Dict-like object to get value from
    :param path: Path (list of fields names) to necessary field in nested objects
    :return: None if field not found. Otherwise - (field value, dict with the field)
    """
    current_dict = None
    current_field = data
    for key in path:
        if not isinstance(current_field, dict) or key not in current_field:
            logger.error(f"Cannot get '{key}' field value.")
            return None
        current_dict = current_field
        current_field = current_dict[key]
    return current_field, current_dict


def update_manifest(filepath: str) -> bool:
    """
    Update PreLoadFilePath field value for given manifest
    :param filepath: path to file with manifest
    :return: True if manifest was updated successfully, False on errors
    """
    logger.info(f"Processing file {filepath}")
    with open(filepath) as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            logger.error(f"{filepath} is not JSON document")
            return False

    manifest_format_error = f"Invalid work-product manifest format in {filepath}"
    url_field_path = ["Data", "GroupTypeProperties", "PreLoadFilePath"]

    if "Files" not in data or not isinstance(data["Files"], list):
        logger.error(manifest_format_error)
        return False

    for file_data in data["Files"]:
        url_field_env = get_field_by_path(file_data, url_field_path)
        if url_field_env is None:
            logger.error(manifest_format_error)
            return False
        blob_url, env_dict = url_field_env
        updated_url = re.sub(BLOB_PATH_REGEXP, get_new_blob_path, blob_url)
        env_dict[url_field_path[-1]] = updated_url

    with open(filepath, "w") as file:
        json.dump(data, file, indent=4)
    return True


def update_manifests_from_directory(manifests_dir: str):
    """
    Recursive traversal of files and subdirectories of the root directory and files processing
    :param manifests_dir: path to directory with manifests
    :return: (dict of uploaded initial kinds, dict of uploaded_enriched_kinds)
    """
    processed_files_count = 0
    unprocessed_files = []
    for dirpath, _, files in os.walk(manifests_dir):
        for filename in files:
            if filename.endswith(".json"):
                filepath = os.path.join(dirpath, filename)
                is_manifest_updated = update_manifest(filepath)
                if is_manifest_updated:
                    processed_files_count += 1
                    logger.info(f"File {filepath} was updated without any issues")
                else:
                    logger.error(f"Errors on processing file {filepath}")
                    unprocessed_files.append(filepath)
    logger.info(f"Processed files count: {processed_files_count}")

    # unprocessed files handler
    if unprocessed_files:
        logger.info("Unprocessed files:")
        for file in unprocessed_files:
            logger.info(file)


def get_directory_path_from_cli_args(
        argv: Iterator[str],
        argument_name: str,
        usage_description: str
    ) -> str:
    """
    Parse command line arguments to get path to directory.
    Call sys.exit(2) on invalid cli arguments format.
    :param argument_name: Name of CLI argument for directory path
    :param usage_description: Message that is displayed to user on invalid arguments format or '-h'.
    :param argv: CLI arguments without first one - sys.argv[1:]
    :return: Provided path to directory
    """
    directory_path = os.getcwd()

    # Parse input params
    try:
        opts = getopt.getopt(argv, "h", [f"{argument_name}="])[0]
    except getopt.GetoptError as exc:
        logger.info(usage_description)
        logger.info(str(exc))
        sys.exit(2)

    for opt, arg in opts:
        if opt == "-h":
            logger.info(usage_description)
            sys.exit()
        elif opt == f"--{argument_name}":
            directory_path = arg
            if not os.path.isdir(directory_path):
                logger.error(f"Invalid directory path: {directory_path}")
                sys.exit()
    return directory_path


def main(argv: Iterator[str]) -> None:
    """
    Main function of script.
    Parses command line arguments
     and updates `PreLoadFilePath` value in  manifests from provided directory.
    :param argv: command line arguments
    """
    argument_name = "manifests_dir"
    usage = f"usage: py replace_file_path.py " \
            f"--{argument_name} <manifests_directory>"
    manifests_dir = get_directory_path_from_cli_args(argv, argument_name, usage)
    logger.info(f"Directory with manifests: {manifests_dir}")
    update_manifests_from_directory(manifests_dir)


if __name__ == "__main__":
    main(sys.argv[1:])
