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
import os
import sys
import time
from string import Formatter
from urllib.parse import quote
from typing import Optional, Iterator, Tuple

import requests

from utils import get_headers

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Create schema")

# configs reading
dataload_config = configparser.RawConfigParser()
dataload_config.read("config/dataload.ini")
createschema_config = configparser.RawConfigParser()
createschema_config.read("config/create_schema.ini")

# Some constants, used by script
SCHEMAS_URL = dataload_config.get("CONNECTION", "schemas_url")
SLEEP_TIME = float(createschema_config.get("KINDS_BASE", "sleep_time"))
OK_RESPONSE_CODES = [200]
NOT_FOUND_RESPONSE_CODES = [404]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]


def update_dataload_config(uploaded_initial_kinds: dict, uploaded_enriched_kinds: dict) -> None:
    """
    Add uploaded schemas IDs to [KINDS_INITIAL] and [KINDS_ENRICHED] sections of dataload.ini file
    """
    for section_name in ["KINDS_INITIAL", "KINDS_ENRICHED"]:
        if not dataload_config.has_section(section_name):
            dataload_config.add_section(section_name)

    dataload_config["KINDS_INITIAL"].update(**uploaded_initial_kinds)
    dataload_config["KINDS_ENRICHED"].update(**uploaded_enriched_kinds)

    with open("config/dataload.ini", "w") as file_handler:
        dataload_config.write(file_handler)

    logger.info("Updated [KINDS_INITIAL] and [KINDS_ENRICHED] sections for dataload.ini file")


def generate_schemas_ids() -> Tuple[dict, dict]:
    """
    Generate schemas ids for all kinds using options
    from [KINDS_BASE] section of create_schema.ini file.
    Initial schema id for each kind will be composed like
     `{source}:{partition}:{kind_code}:{initial_version}`
    and added in kinds_initial dict.
    Enriched schema id for each kind will be composed like
     `{source}:{partition}:{kind_code}:{enriched_version}`
    and added in kinds_enriched dict.
    :return: kinds_initial dict, kinds_enriched dict
    """
    # Getting necessary constants from create_schema.ini
    partition = createschema_config.get("KINDS_BASE", "partition")
    source = createschema_config.get("KINDS_BASE", "source")
    initial_version = createschema_config.get("KINDS_BASE", "initial_version")
    enriched_version = createschema_config.get(
        "KINDS_BASE", "enriched_version")

    kinds_mapping = configparser.RawConfigParser()
    kinds_mapping.read("config/kinds_mapping.ini")

    kinds_initial = {}
    kinds_enriched = {}

    # Calculation of initial and enriched schema ID for every kind from kinds_mapping.ini file
    for entity_name, entity_code in kinds_mapping["DEFAULT"].items():
        base_schema_id = f"{partition}:{source}:{entity_code}"
        full_schema_id = f"{base_schema_id}:{initial_version}"
        enriched_schema_id = f"{base_schema_id}:{enriched_version}"
        config_key = f"{entity_name}_kind"
        kinds_initial[config_key] = full_schema_id
        kinds_enriched[f"enriched_{config_key}"] = enriched_schema_id
    return kinds_initial, kinds_enriched


def get_request(url: str, headers: dict) -> requests.Response:
    """
    Wrapper for requests.get call to use refresh token
    :param url: request URL
    :param headers: request headers
    :return: requests.Response
    """
    response = requests.get(url, headers=headers)
    if response.status_code in BAD_TOKEN_RESPONSE_CODES:
        logger.error("Invalid or expired token.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        response = requests.get(url, headers=get_headers(dataload_config))
    return response


def is_schema_found(schema_id: str) -> Optional[bool]:
    """
    Check if given schema ID is presented in storage
    :param schema_id: full schema ID to check for presence in storage
    :return: Optional[bool]. On error None is returned.
    """
    schema_id = quote(schema_id)
    url = f"{SCHEMAS_URL}/{schema_id}"
    response = get_request(url, get_headers(dataload_config))
    if response.status_code in NOT_FOUND_RESPONSE_CODES:
        return False
    if response.status_code in OK_RESPONSE_CODES:
        return True
    logger.error(
        f"Unexpected response status for schema presence checking: {response.status_code}")
    return None


def post_request(url: str, json_data: dict, headers: dict) -> requests.Response:
    """
        Wrapper for requests.post call to use refresh token
        :param url: request URL
        :param json_data: request body dict
        :param headers: request headers
        :return: requests.Response
    """
    response = requests.post(url, json=json_data, headers=headers)
    if response.status_code in BAD_TOKEN_RESPONSE_CODES:
        logger.error("Invalid or expired token.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        response = requests.post(url, json=json_data, headers=get_headers(dataload_config))
    return response


def post_schema(data: dict) -> bool:
    """
    Add schema to storage
    :param data: parsed schema JSON
    :return: True if response status is ok
    """
    response = post_request(SCHEMAS_URL, data, headers=get_headers(dataload_config))
    if not response.ok:
        logger.error(
            f"""Posting schema {data["kind"]} returned {response.status_code}""")
    return response.ok


def get_field_name_from_template(kind_template) -> Optional[str]:
    """
    Get name of first variable in template
    :param kind_template: template string
    :return: field name or None
    """
    formatter = Formatter()
    field_name: str = next(formatter.parse(kind_template))[1]
    return field_name


def add_uploaded_schema_id(field_name: str, context: dict, uploaded_initial_kinds: dict,
                           uploaded_enriched_kinds: dict) -> None:
    """
    Add new key-value to dicts with ids of uploaded schemas
    :param field_name:
    :param context:
    :param uploaded_initial_kinds:
    :param uploaded_enriched_kinds:
    """
    if field_name.startswith("enriched_"):
        dest_dict = uploaded_enriched_kinds
    else:
        dest_dict = uploaded_initial_kinds
    dest_dict[field_name] = context[field_name]


class SchemaLoader:
    """
    Helper class to load schemas from directory to storage.
    """
    current_schema_id: str = ""
    current_kind_name: str = ""
    context: dict
    uploaded_initial_kinds: dict
    uploaded_enriched_kinds: dict

    def __init__(self):
        # Prepare dict with key-values for initial and enriched schemas ids
        kinds_initial, kinds_enriched = generate_schemas_ids()
        self.context = {**kinds_initial, **kinds_enriched}
        self.uploaded_initial_kinds = {}
        self.uploaded_enriched_kinds = {}

    def _post_not_presented_schema(self, data: dict) -> None:
        """
        Posting schema with id that is not presented in storage
        :param data: schema declaration
        """
        is_schema_posted = post_schema(data)
        if not is_schema_posted:
            logger.error(f"Error on posting {self.current_schema_id} to storage")
            return
        logger.info(f"Posted schema {self.current_schema_id} to storage")
        logger.info("Sleeping...")
        time.sleep(SLEEP_TIME)
        is_found_after_posting = is_schema_found(self.current_schema_id)
        if is_found_after_posting:
            logger.info(
                f"Schema {self.current_schema_id} is presented in storage now")
            add_uploaded_schema_id(self.current_kind_name, self.context,
                                   self.uploaded_initial_kinds, self.uploaded_enriched_kinds)
        else:
            logger.error(
                f"Schema {self.current_schema_id} is NOT found in storage after posting")

    def _load_schema(self, data: dict) -> None:
        """
        Method for logic of uploading new schema with formatted "kind" value to storage
        :param data: schema declaration
        :return:
        """
        logger.info(f"Processing {self.current_schema_id} schema")
        try:
            found = is_schema_found(self.current_schema_id)
            if found is None:
                logger.error("Error on checking schema presence")
                return
            if not found:
                self._post_not_presented_schema(data)
            else:
                logger.info(
                    f"The schema {self.current_schema_id} is already presented in storage.")
                logger.info("Try different version of the schema.")
                add_uploaded_schema_id(self.current_kind_name, self.context,
                                       self.uploaded_initial_kinds, self.uploaded_enriched_kinds)
                return
        except requests.RequestException as exc:
            # Catch here any connection errors on checking schema presence
            # or posting schema to storage
            logger.error(
                f"Exception on sending requests for schema {self.current_schema_id}: {exc}")
            return

    def _get_kind_name(self, kind_template: str) -> Optional[str]:
        """
        Get kind name from given template. Expected template format is '{kind_name}'
        :param kind_template:
        :return: kind name if it was found and template format is correct
        """
        kind_name = get_field_name_from_template(kind_template)
        if kind_name is None:
            logger.error(
                f"Template '{kind_template}' does not contain any variable names")
            return None
        if kind_name not in self.context:
            logger.error(f"Invalid kind value: {kind_name}")
            return None
        return kind_name

    def load_schema_from_file(self, filepath: str) -> None:
        """
        Reads schema from file, checks its presence in storage.
        If schema is not presented, than code adds it to storage.
        :param filepath: path to schema JSON
        """
        logger.info(f"Reading file {filepath}")
        with open(filepath, "r") as file_handler:
            data = json.load(file_handler)

        kind_template = data["kind"]
        kind_name = self._get_kind_name(kind_template)

        # break if kind_template uses wrong format
        if kind_name is None:
            logger.error(f"Invalid kind value in file {filepath}")
            return

        schema_id = self.context[kind_name]

        data["kind"] = schema_id
        self.current_schema_id = schema_id
        self.current_kind_name = kind_name
        self._load_schema(data)

    def load_schemas_from_directory(self, schemas_directory: str) -> Tuple[dict, dict]:
        """
        Recursive traversal of files and subdirectories of the root directory and files processing
        :param schemas_directory: path to directory with schemas
        :return: (dict of uploaded initial kinds, dict of uploaded_enriched_kinds)
        """
        for dirpath, _, files in os.walk(schemas_directory):
            for filename in files:
                if filename.endswith(".json"):
                    filepath = os.path.join(dirpath, filename)
                    self.load_schema_from_file(filepath)
        return self.uploaded_initial_kinds, self.uploaded_enriched_kinds


def get_schemas_directory(argv: Iterator[str]) -> str:
    """
    Parse command line arguments to get path to directory with schemas
    :param argv: Iterator[str]
    :return:
    """
    usage = "usage: py create_schema.py " \
            "--dir <schemas_directory>"
    schemas_directory = os.path.dirname(os.path.abspath(__file__))

    # Parse input params
    try:
        opts = getopt.getopt(argv, "h", ["dir="])[0]
    except getopt.GetoptError as exc:
        logger.info(usage)
        logger.info(str(exc))
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-h":
            logger.info(usage)
            sys.exit()
        elif opt == "--dir":
            schemas_directory = arg
    return schemas_directory


def main(argv: Iterator[str]) -> None:
    """
    Main function of script.
    Parses command line arguments and adds schemas from provided directory to storage,
     if they are not presented.
    :param argv: command line arguments
    """
    schemas_directory = get_schemas_directory(argv)
    logger.info(f"Directory with schemas: {schemas_directory}")

    loader = SchemaLoader()
    uploaded_initial_kinds, uploaded_enriched_kinds =\
        loader.load_schemas_from_directory(schemas_directory)

    if uploaded_enriched_kinds or uploaded_initial_kinds:
        update_dataload_config(uploaded_initial_kinds, uploaded_enriched_kinds)


if __name__ == "__main__":
    # main(sys.argv[1:])
    schema_id = "opendes:wks:AbstractWellboreDrillingReason:1.0.0"
    url = f"{SCHEMAS_URL}/{schema_id}"
    print(url)
    response = get_request(url, get_headers(dataload_config))
    if response.status_code in NOT_FOUND_RESPONSE_CODES:
        print('Schema not found')
    if response.status_code in OK_RESPONSE_CODES:
        print('Schema found')