"""OSDU drilling type resources"""
import logging

from flask import request
from flask_restful import Resource

from app_config import OSDU_DATA_PARTITION
from utils import call_search_api

logger = logging.getLogger(__name__)


class DrillingResource(Resource):
    def __init__(self):
        super().__init__()

    def get(self, drilling_type_name: str):
        logger.info(f"search for drilling type {drilling_type_name}")

        search_query = {
            "cursor": "",
            "kind": f"{OSDU_DATA_PARTITION}:wks:reference-data--DrillingReasonType:1.0.0",
            "query": f"data.ID: {drilling_type_name}"
        }

        logger.debug(f"Search request payload: {search_query}")

        # response json
        search_response_json = call_search_api(request, search_query)

        result_json = search_response_json.get("results", [])

        return result_json
