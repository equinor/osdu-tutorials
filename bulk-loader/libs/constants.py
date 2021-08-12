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

"""Constants module."""

RETRIES = 3
TIMEOUT = 1
WAIT = 10

FIRST_STORED_RECORD_INDEX = 0

# Paths to extend schema fields with surrogate keys
DATA_TYPES_WITH_SURROGATE_KEYS = ("dataset", "work-product", "work-product-component")
SURROGATE_KEYS_PATHS = [
    ("definitions", "{{data-partition-id}}:wks:AbstractWPCGroupType:1.0.0", "properties", "Datasets",
     "items"),
    ("definitions", "osdu:wks:AbstractWPCGroupType:1.0.0", "properties", "Artefacts",
     "items", "properties", "ResourceID"),
    ("properties", "data", "allOf", 1, "properties", "Components", "items"),
]

DATA_SECTION = "Data"
DATASETS_SECTION = "Datasets"
MASTER_DATA_SECTION ="MasterData"
REFERENCE_DATA_SECTION ="ReferenceData"
WORK_PRODUCT_SECTION = "WorkProduct"
WORK_PRODUCT_COMPONENTS_SECTION = "WorkProductComponents"
