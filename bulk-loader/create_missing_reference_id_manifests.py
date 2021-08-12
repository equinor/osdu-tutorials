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
import argparse
import json
import logging
import os
import sys
import urllib.parse
from libs.validate_referential_integrity import ManifestIntegrity
from libs.exceptions import ValidationIntegrityError
from libs.constants import DATA_SECTION, DATASETS_SECTION, MASTER_DATA_SECTION, \
    REFERENCE_DATA_SECTION, WORK_PRODUCT_SECTION, WORK_PRODUCT_COMPONENTS_SECTION
from utils import get_headers
from typing import List, Tuple

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


def generate_id():
    """
    Generate a random ID

    :return: a random ID
    """
    # return "{0}{1}:".format(type_id.replace("type:", ""), re.sub(r"\D", "", str(uuid.uuid4())))
    return "{0}{1}".format("create_missing_ids_", random.randint(1, 1000000))


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


def populate_workflow_request_body(data):
    """
    Populate request body according to the API specification

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
    request["executionContext"]["manifest"] = data
    return request


def create_reference_data_manifest_json(data_partition: str, kind: str, code: str):
    """
    Create a manifest json representation

    """
    data = {
        "kind": f"{data_partition}:wks:Manifest:1.0.0",
        "ReferenceData": [
            {
                "id": f"{data_partition}:{kind}:{code}",
                "kind": f"{data_partition}:wks:{kind}:1.0.0",
                "acl": {
                    "owners": [
                        "data.default.owners@opendes.contoso.com"
                    ],
                    "viewers": [
                        "data.default.viewers@opendes.contoso.com"
                    ]
                },
                "legal": {
                    "legaltags": [
                        "opendes-public-usa-dataset-7643990"
                    ],
                    "otherRelevantDataCountries": [
                        "US"
                    ]
                },
                "data": {
                    "Name": f"{code}",
                    "Description": "",
                    "ID": f"{code}",
                    "Code": f"{code}",
                    "InactiveIndicator": False,
                    "AttributionAuthority": "Equinor",
                    "AttributionPublication": "Equinor Automatic Reference Data Dictionary V1.0",
                    "AttributionRevision": "1.0",
                    "Source": "Automatically generated by create_missing_id_manuifest.py",
                }
            }
        ]
    }

    # Add schema specific fields
    if kind == "reference-data--UnitOfMeasure":
        data["ReferenceData"][0]["data"].update(
            {
                "BaseForConversion": "e.g. cd/m2",
                "MemberUnits": [
                    "e.g. cd/m2"
                ],
                "ParentUnitQuantity": "e.g. J/L2",
                "PersistableReference": "{\"ancestry\":\"e.g. J/L2.luminance\",\"type\":\"e.g. UM\"}",
                "UnitDimension": "e.g. J/L2"
            })

    return data


def create_master_data_manifest_json(data_partition: str, kind: str, code: str):
    """
    Create a manifest json representation

    """
    data = {
        "kind": f"{data_partition}:wks:Manifest:1.0.0",
        "MasterData": [
            {
                "id": f"{data_partition}:{kind}:{code}",
                "kind": f"{data_partition}:wks:{kind}:1.0.0",
                "acl": {
                    "owners": [
                        "data.default.owners@opendes.contoso.com"
                    ],
                    "viewers": [
                        "data.default.viewers@opendes.contoso.com"
                    ]
                },
                "legal": {
                    "legaltags": [
                        "opendes-public-usa-dataset-7643990"
                    ],
                    "otherRelevantDataCountries": [
                        "US"
                    ]
                },
                "data": {
                }
            }
        ]
    }

    # Add schema specific fields
    if kind == "master-data--Organisation":
        data["MasterData"][0]["data"].update(
            {
                "OrganisationName": f"{urllib.parse.unquote(code)}"
            })
    elif kind == "master-data--GeoPoliticalEntity":
        data["MasterData"][0]["data"].update(
            {
                "GeoPoliticalEntityName": f"{urllib.parse.unquote(code)}"
            })
    elif kind == "master-data--Field":
        data["MasterData"][0]["data"].update(
            {
                "FieldName": f"{urllib.parse.unquote(code)}"
            })
    elif kind == "master-data--Seismic3DInterpretationSet":
        data["MasterData"][0]["data"].update(
            {
                "ProjectName": f"{urllib.parse.unquote(code)}"
            })
    else:
        logger.warning(f"{kind} not handled and will likely fail upload with empty data element exception.")

    return data


def write_manifest(kind, name, output_dir, manifest):
    folder = os.path.join(output_dir, kind)
    if not os.path.exists(folder):
        os.makedirs(folder)
    with open(os.path.join(folder, f'{name}.json'), 'w') as outfile:
        json.dump(manifest, outfile, indent=2)


def create_reference_data_manifest(data_partition: str, kind: str, name: str, output_dir: str):
    manifest = create_reference_data_manifest_json(data_partition, kind, name)
    write_manifest(kind, name, output_dir, manifest)


def create_master_data_manifest(data_partition: str, kind: str, name: str, output_dir: str):
    manifest = create_master_data_manifest_json(data_partition, kind, name)
    write_manifest(kind, name, output_dir, manifest)


def get_missing_ids(manifest_integrity: ManifestIntegrity, entity: dict) -> set():
    """
    Check if a manifest's entity passes referential integrity.

    :param entity: Manifest's entity.
    """
    missing_ids = set()
    references = manifest_integrity._extract_references(entity)
    external_references = manifest_integrity._extract_external_references(entity, references)
    if external_references:
        missing_external_ids = manifest_integrity._find_missing_external_ids(external_references)
        if missing_external_ids:
            missing_ids.update(missing_external_ids)
    return missing_ids

    # """
    # missing_ids = set()
    # references = manifest_integrity._extract_references(entity)
    # external_references = manifest_integrity._extract_external_references(entity, references)

    # # scan for new ids not in cache
    # external_references_to_check = [e for e in external_references if e.id not in cache_checked_ids]
    # if external_references_to_check:
    #     missing_external_ids = manifest_integrity._find_missing_external_ids(external_references_to_check)
    #     if missing_external_ids:
    #         missing_ids.update(missing_external_ids)
    #         cache_missing_ids.update(missing_external_ids)

    # # add missing ids already found from cache
    # missing_ids.update([e.id for e in external_references if e.id in cache_missing_ids])

    # cache_checked_ids.update([e.id for e in external_references])   # cache id's that we have checked.
    # return missing_ids


def get_manifest_entity_missing_ids(
    manifest_integrity,
    manifest_section: List[dict]
) -> Tuple[List[dict], List[dict], List[str]]:
    """
    Ensure integrity of entities in given manifest parts. If records don't pass this validation
    they are deleted from the manifest.

    :param manifest_section: A part of the manifest, where data types can be accessed.
    :return: List of valid entities and list of invalid entities.
    """
    valid_entities = []
    invalid_entities = []
    missing_ids = set()
    for entity in manifest_section:
        temp_missing_ids = get_missing_ids(manifest_integrity, entity)
        if temp_missing_ids:
            invalid_entities.append(entity)
            missing_ids.update(temp_missing_ids)
        else:
            valid_entities.append(entity)
    return valid_entities, invalid_entities, missing_ids


def get_work_product_missing_ids(manifest_integrity, work_product: dict) -> Tuple[dict, List[dict], List[str]]:
    """
    Ensure integrity of entities in given manifest parts. If records don't pass this validation
    they are deleted from the manifest.

    :param work_product: A part of the manifest, where data types can be accessed.
    :return: The work product if it is valid, otherwise, empty dict.
    """
    missing_ids = get_missing_ids(manifest_integrity, work_product)
    if missing_ids:
        return work_product, [], missing_ids
    else:
        return {}, work_product, missing_ids


def create_wpc_artefacts_missing_ids(manifest_integrity, wpc: dict):
    artefacts = wpc["data"].get("Artefacts")
    if not artefacts:
        logger.debug(
            f"WPC: {wpc.get('id')} doesn't have Artefacts field. Mark it as valid.")
        return
    artefacts_resource_ids = set(artefact["ResourceID"] for artefact in artefacts)
    datasets = set(wpc["data"].get(DATASETS_SECTION, []))
    duplicated_ids = artefacts_resource_ids.intersection(datasets)
    if duplicated_ids:
        logger.warning(
            f"Resource kind '{wpc.get('kind')}' and id '{wpc.get('id', '')}' was rejected. "
            f"The WPC's Artefacts field contains the same ids as in "
            f"the WPC's 'Datasets': {duplicated_ids}."
        )
        raise ValidationIntegrityError(wpc,
                                       reason=f"It has duplicated Datasets and Artefacts: {duplicated_ids}.")


def get_artefacts_missing_ids(manifest_integrity, work_product_components: list) -> Tuple[
                              List[dict], List[dict], List[str]]:
    """
    Delete a WPC entity if it didn't passed artefacts integrity check.

    :param work_product_components:
    :return: List of valid wpcs.
    """
    valid_work_product_components = []
    skipped_ids = []
    for wpc in work_product_components:
        try:
            create_wpc_artefacts_missing_ids(manifest_integrity, wpc)
        except ValidationIntegrityError:
            skipped_ids.append(wpc)
        else:
            valid_work_product_components.append(wpc)
    return valid_work_product_components, skipped_ids, []


def get_missing_ids_from_manifest(manifest_integrity, manifest: dict = None) -> Tuple[dict, List[dict], set[str]]:
    """
    Get missing reference ids in traversal manifest file

    :return: only valid entities in the same structure
    """
    invalid_entities = []
    missing_ids = set()

    if not manifest:
        raise manifest_integrity.EmptyManifestError()

    manifest_integrity._collect_manifest_entities_ids(manifest)

    for data_type in (REFERENCE_DATA_SECTION, MASTER_DATA_SECTION):
        if manifest.get(data_type):
            valid_entities, not_valid_entities, tmp_missing_ids = \
                get_manifest_entity_missing_ids(manifest_integrity, manifest[data_type])
            manifest[data_type] = valid_entities
            invalid_entities.extend(not_valid_entities)
            missing_ids.update(tmp_missing_ids)

    if manifest.get(DATA_SECTION):
        if manifest[DATA_SECTION].get(DATASETS_SECTION):
            datasets = manifest[DATA_SECTION].get(DATASETS_SECTION)
            valid_entities, not_valid_entities, tmp_missing_ids = get_manifest_entity_missing_ids(
                manifest_integrity,
                datasets
            )
            manifest[DATA_SECTION][DATASETS_SECTION] = valid_entities
            invalid_entities.extend(not_valid_entities)
            missing_ids.update(tmp_missing_ids)

        if manifest[DATA_SECTION].get(WORK_PRODUCT_COMPONENTS_SECTION):
            work_product_components = manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION]
            valid_entities, not_valid_entities, tmp_missing_ids = get_manifest_entity_missing_ids(
                manifest_integrity,
                work_product_components
            )
            invalid_entities.extend(not_valid_entities)
            missing_ids.update(tmp_missing_ids)
            valid_entities, not_valid_entities, tmp_missing_ids = \
                get_artefacts_missing_ids(
                    manifest_integrity,
                    valid_entities
                )
            manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION] = valid_entities
            invalid_entities.extend(not_valid_entities)
            missing_ids.update(tmp_missing_ids)

        if manifest[DATA_SECTION].get(WORK_PRODUCT_SECTION):
            work_product_data = manifest[DATA_SECTION][WORK_PRODUCT_SECTION]
            valid_entities, not_valid_entities, tmp_missing_ids = get_work_product_missing_ids(
                manifest_integrity,
                work_product_data
            )
            manifest[DATA_SECTION][WORK_PRODUCT_SECTION] = valid_entities
            invalid_entities.extend(not_valid_entities)
            missing_ids.update(tmp_missing_ids)

    return manifest, invalid_entities, missing_ids


def main(argv):
    """

    """

    parser = argparse.ArgumentParser(description='Create manifest files for missing refereence data entries.')
    parser.add_argument('--path', default='.', help='Path to manifest files.')
    parser.add_argument('--output', help='Optional directory to generated manifest files for missing references to.')
    parser.add_argument('--verbose', action='store_true', help='More detailed logging.')
    args = parser.parse_args()
    manifest_dir = args.path
    output_dir = args.output
    verbose = args.verbose

    if not output_dir:
        logger.info("No output directory specified. Running in simulate mode")

    if verbose:
        logger.setLevel(logging.DEBUG)
        file_logger.setLevel(logging.DEBUG)

    missing_ids = set()

    # Recursive traversal of files and subdirectories of the root directory and files processing
    for root, _, files in os.walk(manifest_dir):
        for file in files:
            filepath = os.path.join(root, file)
            logger.info(f"Processing : {filepath}")
            manifest_data = load_file(filepath)
            request_data = populate_workflow_request_body(manifest_data)

            # "payload_context = Context.populate(context["dag_run"].conf["execution_context"])"
            # token_refresher = "AirflowTokenRefresher()"

            manifest_integrity = ManifestIntegrity(
                SEARCH_URL,
                get_headers(config),
                request_data,
            )

            # execution_context = context["dag_run"].conf["execution_context"]
            # manifest_data = self._get_manifest_data(context, execution_context)
            logger.debug(f"Manifest data: {manifest_data}")

            _, _, tmp_missing_ids = get_missing_ids_from_manifest(manifest_integrity, manifest_data)
            logger.info(f"{len(tmp_missing_ids)} missing id's {tmp_missing_ids}")
            missing_ids.update(tmp_missing_ids)

            request_data.clear()

    # display missing ids
    if len(missing_ids) > 0:
        logger.info(f"Total {len(missing_ids)} missing id's found")
        for id in missing_ids:
            # Create missing entries
            if not output_dir:
                logger.info(f"Missing {id}")
            else:
                logger.info(f"Creating {id}")
                parts = id.split(":")
                assert len(parts) == 4
                data_partition = parts[0]
                kind = parts[1]
                code = parts[2]
                # version = parts[3]

                if kind.startswith("reference-data"):
                    create_reference_data_manifest(data_partition, kind, code, output_dir)
                elif kind.startswith("master-data"):
                    create_master_data_manifest(data_partition, kind, code, output_dir)
                else:
                    logger.warning(f"Unknown type {id}. Not created!")
        if output_dir:
            logger.info("Manifest files created. You should manually edit these"
                        " before uploading including any additional fields.")
            logger.info("Check also that missing references aren't already included as part of the"
                        " scanned data (this check is currently not implemented)!")
    else:
        logger.info("No missing id's found")


if __name__ == "__main__":
    main(sys.argv[1:])
