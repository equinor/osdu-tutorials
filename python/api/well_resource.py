"""OSDU well resource"""
import logging
import requests
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

        """
        access_token = session.get("access_token")
        #access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiI0MDZjYmRiMC1hZTlhLTQyMGItOTg2MS0yYzc0NWU4NDU5NDkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zYWE0YTIzNS1iNmUyLTQ4ZDUtOTE5NS03ZmNmMDViNDU5YjAvIiwiaWF0IjoxNjIzMDYwMDI2LCJuYmYiOjE2MjMwNjAwMjYsImV4cCI6MTYyMzA2MzkyNiwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhUQUFBQVRsMzQwVWp3OENQNkdHZDJwSVc5MFRMdHZXcHFjN2dlbDFGQmVxaTI2Tks0ZjNHL2JrTUd3WVc1WmVoOGhjRGIiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiNDA2Y2JkYjAtYWU5YS00MjBiLTk4NjEtMmM3NDVlODQ1OTQ5IiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJGdSIsImdpdmVuX25hbWUiOiJRaWFuZyIsImlwYWRkciI6IjE0My45Ny4yLjEyOSIsIm5hbWUiOiJRaWFuZyBGdSIsIm9pZCI6ImU5NWIwYzg1LTQ0MGEtNDJiMy1hMzQzLWI4ZTE5ZWVlNzQwMSIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0yMjA1MjMzODgtMTA4NTAzMTIxNC03MjUzNDU1NDMtMjQwNDI5MyIsInJoIjoiMC5BUUlBTmFLa091SzIxVWlSbFhfUEJiUlpzTEM5YkVDYXJndENtR0VzZEY2RVdVa0NBUHMuIiwic2NwIjoiVXNlci5SZWFkIiwic3ViIjoiTWZYdE9NWWNpODg0X0JrclVIX09yeGNCcnJqV05TR3BuN3pqdlFUMGZlWSIsInRpZCI6IjNhYTRhMjM1LWI2ZTItNDhkNS05MTk1LTdmY2YwNWI0NTliMCIsInVuaXF1ZV9uYW1lIjoiUUlGQGVxdWlub3IuY29tIiwidXBuIjoiUUlGQGVxdWlub3IuY29tIiwidXRpIjoiektrUU5ORXVsME9LYUVCNjlrMWtBZyIsInZlciI6IjEuMCJ9.RNrhC_FtOz2sIfq4t9SD6VtRlKy9a9nDDla0rvxe93eSkCdWeTyEAFuB4iB7hiDcKZ8_m-6CjelHLv8pcvK5sNBEIMvsYJlnBD2QyihvBYAM8meFySCt1YJdf-_uxutZCe8mgw1GPFQUnlD-kiG3oO4zNvLWesBfW5zitFLGRkkwTM7Tq3kpZk9MXy54FWpLDF-47WaG21Hs4vFj_dBZLAhzEHgYm0pLyhpR2eD0vEV1nrtROWXGLG-TqGae1QQG_0FCe2GZjD2JdLG9ujspeONkIHQzMcxwYOICTUoYS1b_FwsaaIHyCMPQ_bQiIP65k0xO1PONFMmCpqwKPRgCQg"
        authorization = f"Bearer {access_token}"
        headers = {"data-partition-id": "opendes", "Authorization": authorization}
        res = requests.get("https://dev-api-osdu-equinor.westeurope.cloudapp.azure.com/api/legal/v1/legaltags", headers=headers)
        result_json = res.json()
        """

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