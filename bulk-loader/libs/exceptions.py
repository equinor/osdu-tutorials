#  Copyright 2020 Google LLC
#  Copyright 2020 EPAM Systems
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

from typing import Union

from libs.utils import create_skipped_entity_info


"""Exceptions module."""


class RecordsNotSearchableError(Exception):
    """Raise when expected totalCount of records differs from actual one."""
    pass


class PipelineFailedError(Exception):
    """Raise when pipeline failed."""
    pass


class EmptyManifestError(Exception):
    """Raise when manifest field is empty."""
    pass


class GetSchemaError(Exception):
    """Raise when can't find schema."""
    pass


class SRNNotFound(Exception):
    """Raise when can't find SRN."""
    pass


class NotOSDUSchemaFormatError(Exception):
    """Raise when schema doesn't correspond OSDU format."""
    pass


class FileSourceError(Exception):
    """Raise when file doesn't exist under given URI path."""
    pass


class UploadFileError(Exception):
    """Raise when there is an error while uploading a file into OSDU."""


class TokenRefresherNotPresentError(Exception):
    """Raise when token refresher is not present in "refresh_token' decorator."""
    pass


class NoParentEntitySystemSRNError(Exception):
    """Raise when parent entity doesn't have system-generated SRN."""
    pass


class NoParentEntitySystemSRNError(Exception):
    """
    Raise when parent entity doesn't have system-generated SRN.
    """
    pass


class InvalidFileRecordData(Exception):
    """Raise when file data does not contain mandatory fields."""


class GenericManifestSchemaError(Exception):
    """Raise when a generic manifest schema is invalid."""


class BaseEntityValidationError(Exception):
    """
    Base Error for failed validations.
    """

    def __init__(self, entity: dict, reason: str):
        self.skipped_entity = create_skipped_entity_info(entity, reason)


class EntitySchemaValidationError(BaseEntityValidationError):

    """
    Raise when the validation against schemas failed.
    """


class ValidationIntegrityError(BaseEntityValidationError):

    """
    Raise when an entity does not pass validation integrity.
    """


class DatasetValidationError(BaseEntityValidationError):
    """
    Raise when a dataset is not valid.
    """


class ProcessRecordError(BaseEntityValidationError):
    """
    Raise when a record is unprocessed
    """
