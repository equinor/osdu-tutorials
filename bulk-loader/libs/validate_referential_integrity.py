#  Copyright 2021 Google LLC
#  Copyright 2021 EPAM Systems
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

import json
import re
import logging
from typing import List, Set, Tuple
from typing import re as regex

from libs.context import Context
from libs.constants import DATA_SECTION, DATASETS_SECTION, MASTER_DATA_SECTION, \
    REFERENCE_DATA_SECTION, WORK_PRODUCT_SECTION, WORK_PRODUCT_COMPONENTS_SECTION
from libs.exceptions import EmptyManifestError, ValidationIntegrityError
from libs.search_record_ids import ExtendedSearchId
from libs.utils import split_id, EntityId

logger = logging.getLogger()


class ManifestIntegrity:
    """Class to validate if parents reference and master data are exists and
    remove non-valid entities to provide integrity
    """
    REFERENCE_DATA_ID_PATTERN = re.compile(
        r"(?<=\")[\w\-\.]+:reference-data\-\-[\w\-\.]+:.[^,;\"]+(?=\")",
        re.I + re.M)
    MASTER_DATA_ID_PATTERN = re.compile(
        r"(?<=\")[\w\-\.]+:master-data\-\-[\w\-\.]+:.[^,;\"]+(?=\")",
        re.I + re.M)
    WORK_PRODUCT_ID_PATTERN = re.compile(
        r"(?<=\")[\w\-\.]+:work-product\-\-[\w\-\.]+:.[^,;\"]+(?=\")",
        re.I + re.M)
    WORK_PRODUCT_COMPONENT_ID_PATTERN = re.compile(
        r"(?<=\")[\w\-\.]+:work-product-component\-\-[\w\-\.]+:.[^,;\"]+(?=\")", re.I + re.M)
    DATASET_ID_PATTERN = re.compile(r"(?<=\")[\w\-\.]+:dataset\-\-[\w\-\.]+:.[^,;\"]+(?=\")",
                                    re.I + re.M)
    SURROGATE_KEY_PATTERN = re.compile(r"(?<=\")surrogate-key:[\w\-\.\d]+(?=\")", re.I + re.M)

    def __init__(
        self,
        search_url: str,
        request_headers: str,
        context: Context,
    ):
        self.search_url = search_url
        self.request_headers = request_headers
        self.context = context
        self.ids_for_validation = []
        self.entities_ids = set()
        self.rejected_entities_ids = set()
        self.ref_patterns = [
            self.REFERENCE_DATA_ID_PATTERN,
            self.MASTER_DATA_ID_PATTERN,
            self.WORK_PRODUCT_ID_PATTERN,
            self.WORK_PRODUCT_COMPONENT_ID_PATTERN,
            self.DATASET_ID_PATTERN,
            self.SURROGATE_KEY_PATTERN
        ]

        super().__init__()

    def _match_id_with_pattern(self, pattern: regex.Pattern, source: str) -> List[str]:
        return pattern.findall(source)

    def _collect_ids_by_data_types(self, manifest_section: dict, data_type: str):
        """
        Collect manifest entities ids by their data types.

        :param manifest_section: A part of the manifest, where data types can be accessed.
        :param data_type: ReferenceData, MasterData etc.
        """
        entities_ids = []
        if manifest_section.get(data_type):
            for elem in manifest_section[data_type]:
                if elem.get("id"):
                    entities_ids.append(elem["id"])
        return entities_ids

    def _collect_manifest_entities_ids(self, manifest: dict):
        """
        Collect manifest's entities ids to exclude them while checking integrity.

        :manifest: Manifest.
        """
        entities_ids = []
        for data_type in (REFERENCE_DATA_SECTION, MASTER_DATA_SECTION):
            entities_ids.extend(
                self._collect_ids_by_data_types(manifest, data_type)
            )

        if manifest.get(DATA_SECTION):
            if manifest[DATA_SECTION].get(WORK_PRODUCT_SECTION, {}).get("id"):
                entities_ids.append(manifest[DATA_SECTION][WORK_PRODUCT_SECTION]["id"])

            for data_type in (WORK_PRODUCT_COMPONENTS_SECTION, DATASETS_SECTION):
                entities_ids.extend(
                    self._collect_ids_by_data_types(manifest[DATA_SECTION], data_type)
                )

        self.entities_ids = set(entities_ids)

    def _extract_references(self, entity: dict) -> Set:
        """
        Extract references (everything looking like an ID to another entity) from the entity.

        :param entity: Manifest's entity
        :return: Set of ids to other entities or records.
        """
        manifest_str = json.dumps(entity)
        references = set()
        for pattern in self.ref_patterns:
            references.update(
                set(self._match_id_with_pattern(pattern, manifest_str))
            )
        references.discard(entity.get("id"))
        return references

    def _extract_external_references(self, entity: dict, entity_references: set) -> List[EntityId]:
        """

        Extract external reference ids from an entity. These references are supposed
        to be searchable via Search service.

        :param entity: Manifest's entity.
        :param entity_references: All entity's references.
        :return: Set of external references.
        """
        entity_references = [split_id(ref) for ref in entity_references]
        external_references = [e for e in entity_references if e.id not in self.entities_ids]
        logger.debug(f"Entity id: {entity.get('id')}, kind {entity.get('kind')}. "
                     f"External reference ids: {external_references}")

        return external_references

    def _find_missing_external_ids(self, external_references: List[EntityId]) -> Set[str]:
        """
        Find absent external references in the system and searchable

        :param external_references: Records IDs are supposed to be found in Search.
        :return: Set of not found references via Search.
        """
        missing_ids = set()
        external_references_without_version = [e.id for e in external_references]

        # Search can't work with ids with versions. So get only ids without versions.
        # TODO: Move ExtendedSearchId() to the class attribute.
        #  Refactor ExtendedSearchId().search_records() to take records to search
        search_handler = ExtendedSearchId(self.search_url, external_references_without_version,
                                          self.request_headers, self.context)
        found_ids = search_handler.search_records()

        for entity_id in external_references:
            # As found_ids contains ids with versions and bare ids, and if entity_id is an id
            # with no version (refers to the last version), we use just the bare id.
            entity_srn = entity_id.srn if entity_id.version else entity_id.id
            if entity_srn not in found_ids:
                missing_ids.add(entity_id.srn)

        return missing_ids

    def _validate_referential_integrity(self, entity: dict):
        """
        Check if a manifest's entity passes referential integrity.

        :param entity: Manifest's entity.
        """
        missing_ids = set()
        references = self._extract_references(entity)
        external_references = self._extract_external_references(entity, references)
        if external_references:
            missing_external_ids = self._find_missing_external_ids(external_references)
            if missing_external_ids:
                missing_ids.update(missing_external_ids)

        if missing_ids:
            logger.warning(
                f"Resource with kind {entity.get('kind')} "
                f"and id: '{entity.get('id')}' was rejected. "
                f"Missing ids '{missing_ids}'"
            )
            raise ValidationIntegrityError(entity, reason=f"Missing referential id: {missing_ids}")

    def _ensure_manifest_entity_integrity(
        self,
        manifest_section: List[dict]
    ) -> Tuple[List[dict], List[dict]]:
        """
        Ensure integrity of entities in given manifest parts. If records don't pass this validation
        they are deleted from the manifest.

        :param manifest_section: A part of the manifest, where data types can be accessed.
        :return: List of valid entities and list of invalid entities.
        """
        valid_entities = []
        skipped_entities = []
        for entity in manifest_section:
            try:
                self._validate_referential_integrity(entity)
            except ValidationIntegrityError as error:
                skipped_entities.append(error.skipped_entity)
            else:
                valid_entities.append(entity)
        return valid_entities, skipped_entities

    def _ensure_work_product_entity_integrity(self, work_product: dict) -> Tuple[dict, List[dict]]:
        """
        Ensure integrity of entities in given manifest parts. If records don't pass this validation
        they are deleted from the manifest.

        :param work_product: A part of the manifest, where data types can be accessed.
        :return: The work product if it is valid, otherwise, empty dict.
        """
        try:
            self._validate_referential_integrity(work_product)
            return work_product, []
        except ValidationIntegrityError as error:
            return {}, [error.skipped_entity]

    def _ensure_wpc_artefacts_integrity(self, wpc: dict):
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
                                           reason=f"It has duplicated "
                                                  f"Datasets and Artefacts: {duplicated_ids}.")

    def _ensure_artefacts_integrity(self, work_product_components: list) -> Tuple[
        List[dict], List[dict]]:
        """
        Delete a WPC entity if it didn't passed artefacts integrity check.

        :param work_product_components:
        :return: List of valid wpcs.
        """
        valid_work_product_components = []
        skipped_ids = []
        for wpc in work_product_components:
            try:
                self._ensure_wpc_artefacts_integrity(wpc)
            except ValidationIntegrityError as error:
                skipped_ids.append(error.skipped_entity)
            else:
                valid_work_product_components.append(wpc)
        return valid_work_product_components, skipped_ids

    def ensure_integrity(self, manifest: dict = None) -> Tuple[dict, List[dict]]:
        """
        Validate reference ids in traversal manifest file

        :return: only valid entities in the same structure
        """
        skipped_entities = []

        if not manifest:
            raise EmptyManifestError()

        self._collect_manifest_entities_ids(manifest)

        for data_type in (REFERENCE_DATA_SECTION, MASTER_DATA_SECTION):
            if manifest.get(data_type):
                valid_entities, not_valid_entities = \
                    self._ensure_manifest_entity_integrity(manifest[data_type])
                manifest[data_type] = valid_entities
                skipped_entities.extend(not_valid_entities)

        if manifest.get(DATA_SECTION):
            if manifest[DATA_SECTION].get(DATASETS_SECTION):
                datasets = manifest[DATA_SECTION].get(DATASETS_SECTION)
                valid_entities, not_valid_entities = self._ensure_manifest_entity_integrity(
                    datasets
                )
                manifest[DATA_SECTION][DATASETS_SECTION] = valid_entities
                skipped_entities.extend(not_valid_entities)

            if manifest[DATA_SECTION].get(WORK_PRODUCT_COMPONENTS_SECTION):
                work_product_components = manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION]
                valid_entities, not_valid_entities = self._ensure_manifest_entity_integrity(
                    work_product_components
                )
                skipped_entities.extend(not_valid_entities)
                valid_entities, not_valid_entities = \
                    self._ensure_artefacts_integrity(
                        valid_entities
                    )
                manifest[DATA_SECTION][WORK_PRODUCT_COMPONENTS_SECTION] = valid_entities
                skipped_entities.extend(not_valid_entities)

            if manifest[DATA_SECTION].get(WORK_PRODUCT_SECTION):
                work_product_data = manifest[DATA_SECTION][WORK_PRODUCT_SECTION]
                valid_entities, not_valid_entities = self._ensure_work_product_entity_integrity(
                    work_product_data
                )
                manifest[DATA_SECTION][WORK_PRODUCT_SECTION] = valid_entities
                skipped_entities.extend(not_valid_entities)

        return manifest, skipped_entities
