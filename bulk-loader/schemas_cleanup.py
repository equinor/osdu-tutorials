import configparser
import logging
from typing import Optional
from urllib.parse import quote

import requests

from utils import get_headers

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Schemas cleanup")

dataload_config = configparser.RawConfigParser()
dataload_config.read("config/dataload.ini")

SCHEMAS_URL = dataload_config.get("CONNECTION", "schemas_url")
OK_RESPONSE_CODES = [204]
NOT_FOUND_RESPONSE_CODES = [404]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]

KINDS_TO_DELETE = [
    "opendes:osdu:facility_type:0.2.0",
    "opendes:osdu:material_type:0.2.0",
    "opendes:osdu:agreement_type:0.2.0",
    "opendes:osdu:alias_name_type_class:0.2.0",
    "opendes:osdu:alias_name_type:0.2.0",
    "opendes:osdu:artefact_role:0.2.0",
    "opendes:osdu:azimuth_reference_type:0.2.0",
    "opendes:osdu:basin_type:0.2.0",
    "opendes:osdu:calculation_method_type:0.2.0",
    "opendes:osdu:contractor_type:0.2.0",
    "opendes:osdu:currency:0.2.0",
    "opendes:osdu:document_type:0.2.0",
    "opendes:osdu:drilling_reason_type:0.2.0",
    "opendes:osdu:encoding_format_type:0.2.0",
    "opendes:osdu:facility_event_type:0.2.0",
    "opendes:osdu:facility_state_type:0.2.0",
    "opendes:osdu:facility_vertical_measurement_path:0.2.0",
    "opendes:osdu:facility_vertical_measurement_source:0.2.0",
    "opendes:osdu:facility_vertical_measurement_type:0.2.0",
    "opendes:osdu:feature_type:0.2.0",
    "opendes:osdu:geological_formation:0.2.0",
    "opendes:osdu:geopolitical_entity_type:0.2.0",
    "opendes:osdu:horizontal_crs:0.2.0",
    "opendes:osdu:log_curve_business_value:0.2.0",
    "opendes:osdu:log_curve_family:0.2.0",
    "opendes:osdu:log_curve_type:0.2.0",
    "opendes:osdu:log_type:0.2.0",
    "opendes:osdu:marker_type:0.2.0",
    "opendes:osdu:obligation_type:0.2.0",
    "opendes:osdu:organisation_type:0.2.0",
    "opendes:osdu:osdu_region:0.2.0",
    "opendes:osdu:parameter_type:0.2.0",
    "opendes:osdu:project_role:0.2.0",
    "opendes:osdu:project_state_type:0.2.0",
    "opendes:osdu:project_type:0.2.0",
    "opendes:osdu:qualitative_spatial_accuracy_type:0.2.0",
    "opendes:osdu:quantitative_accuracy_band:0.2.0",
    "opendes:osdu:resource_curation_status:0.2.0",
    "opendes:osdu:resource_lifecycle_status:0.2.0",
    "opendes:osdu:resource_security_classification:0.2.0",
    "opendes:osdu:schema_format_type:0.2.0",
    "opendes:osdu:seismic_geometry_type:0.2.0",
    "opendes:osdu:spatial_geometry_type:0.2.0",
    "opendes:osdu:spatial_parameter_type:0.2.0",
    "opendes:osdu:unit_of_measure:0.2.0",
    "opendes:osdu:vertical_crs:0.2.0",
    "opendes:osdu:wellbore_trajectory_type:0.2.0",
    "opendes:osdu:well_datum_type:0.2.0",
    "opendes:osdu:well_interest_type:0.2.0",
    "opendes:osdu:well_operating_environment:0.2.0"
]


def delete_request(url: str, headers: dict) -> requests.Response:
    """
    Wrapper for requests.delete call to use refresh token
    :param url: request URL
    :param headers: request headers
    :return: requests.Response
    """
    response = requests.delete(url, headers=headers)
    if response.status_code in BAD_TOKEN_RESPONSE_CODES:
        logger.error("Invalid or expired token.")
        logger.error(f"Response status: {response.status_code}. "
                     f"Response content: {response.text[:250]}.")
        response = requests.get(url, headers=get_headers(dataload_config))
    return response


def delete_schema(schema_id: str) -> Optional[bool]:
    """
    Delete if given schema ID is presented in storage
    :param schema_id: full schema ID to check for presence in storage
    :return: Optional[bool]. On error None is returned.
    """
    quote_schema_id = quote(schema_id)
    url = f"{SCHEMAS_URL}/{quote_schema_id}"
    response = delete_request(url, get_headers(dataload_config))

    if response.status_code in NOT_FOUND_RESPONSE_CODES:
        logger.error(f"{schema_id} was not found.")
        return False
    if response.status_code in OK_RESPONSE_CODES:
        return True

    logger.error(
        f"Unexpected response status for schema presence checking: {response.status_code}."
    )
    return None


def main():
    for kind in KINDS_TO_DELETE:
        if delete_schema(kind):
            logger.info(f"{kind} was deleted.")
        else:
            logger.error(f"{kind} could not be deleted.")


if __name__ == "__main__":
    main()
