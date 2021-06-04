"""OSDU well resource"""
import logging
import json

from flask import request, session
from flask_restful import Resource

from utils import call_search_api

logger = logging.getLogger(__name__)


class WellResource(Resource):
    def __init__(self):
        super().__init__()

    def get(self, well_name: str):
        logger.info(f"search for {well_name}")

        # create Search API request payload:
        search_query = {
            "kind": "opendes:osdu:well-master:0.2.1",
            "query": f"data.Data.IndividualTypeProperties.FacilityName: \"{well_name}*\"",
            "returnedFields": [
                "data.Data.IndividualTypeProperties.FacilityName",
                "data.ResourceID",
                "data.GeoLocation",
            ],
        }
        logger.debug(f"Search request payload: {search_query}")

        # response json
        search_response_json = call_search_api(request, search_query)

        # parse results and return back to frontend
        result_json = search_response_json.get("results", [])
        #response.body = json.dumps(asdict(
        #    self.get_wells_from_search_response(result_json)))

        return result_json