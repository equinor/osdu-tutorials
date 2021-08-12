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

"""Util functions to work with OSDU Manifests."""

from typing import Any

import dataclasses


@dataclasses.dataclass
class EntityId:
    id: str
    version: str = ""

    @property
    def srn(self):
        return f"{self.id}:{self.version}"


def remove_trailing_colon(id_value: str) -> str:
    """
    Remove a trailing colon of id. It is need, for example, to search the last version of record.

    :param id_value: Id value.
    :return: Id value with no trailing colon.
    """
    return id_value[:-1] if id_value.endswith(":") else id_value


def split_id(id_value: str) -> EntityId:
    """
    Get id without a version for searching later.

    :id_value: ID of some entity with or without versions.
    """
    version = ""
    if id_value.endswith(":"):
        _id = id_value[:-1]
    elif id_value.split(":")[-1].isdigit():
        version = str(id_value.split(":")[-1])
        _id = id_value[:-len(version) - 1]
    else:
        _id = id_value

    return EntityId(_id, version)


def create_skipped_entity_info(entity: Any, reason: str) -> dict:
    if isinstance(entity, dict):
        skipped_entity_info = {
            "id": entity.get("id", ""),
            "kind": entity.get("kind", ""),
            "reason": reason
        }
    else:
        skipped_entity_info = {
            "id": str(entity)[:128],
            "reason": reason[:128]
        }
    return skipped_entity_info
