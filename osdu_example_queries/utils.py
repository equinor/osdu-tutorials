from msal import ConfidentialClientApplication
from osdu.client import OsduClient
from osdu.identity import OsduMsalInteractiveCredential
import requests
import json
import logging
import time
from config import Config

class OsduService:
    def __init__(self, config) -> None:
        
        self._config: Config = config
        self._search_url: str = f"{config.osdu_dns}/{config.base_url}/query"
        self._search_url_cursor: str = f"{config.osdu_dns}/{config.base_url}/query_with_cursor"
        self._data_partition: str = config.data_partition
        self._client: OsduClient = OsduClient(self._config.osdu_dns, self._config.data_partition, self._get_credentials)


    @property
    def _get_credentials(self):
        return OsduMsalInteractiveCredential(
                client_id=self._config.client_id,
                authority=f"https://login.microsoftonline.com/{self._config.tenant_id}",
                scopes=self._config.scopes,
                token_cache=".token_cache",
            )
    
    def _query(self, payload: str, cursor: bool = False, max_iterations: int = 0):
        if not cursor:
            return self._client.post_returning_json(self._search_url, payload, ok_status_codes=[200])["results"]
        else:
            aggregated_response: list = []
            cursor: str = ""
            count: int = 0
            if not payload.get("limit"):
                payload["limit"] = 10

            while True:
                payload["cursor"] = cursor
                response = self._client.post_returning_json(self._search_url_cursor, payload, ok_status_codes=[200])

                if response:
                    aggregated_response.extend(response["results"])
                if payload["limit"] <= len(aggregated_response):
                    return aggregated_response[0:payload["limit"]]
                if max_iterations <= count:
                    return aggregated_response
                cursor = response.get("cursor")
                count+=1
    
    def get_payload(self, payload: dict, cursor: bool = False, max_iterations: int = None):
        logging.info("Start search ...")
        start = time.time()
        response = self._query(payload, cursor, max_iterations)
        end = time.time()
        if response:
            logging.info("Time elapsed: %s minutes, Number of records: , %s", (end - start) / 60, len(response))
        logging.info("Search finished...")
        return response


if __name__ == "__main__":
    config = Config()
    
    osdu_search = OsduService(config)
    payload = {
        # "kind": "osdu:wks:master-data--Field:*", # * is a wildcard
        "kind": "osdu:wks:master-data--Field:*",
        "limit": 10000
    }

    response = osdu_search.get_payload(payload=payload, cursor=True, max_iterations=5)
    print(len(response))
