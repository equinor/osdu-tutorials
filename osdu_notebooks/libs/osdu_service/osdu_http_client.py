from libs.osdu_service.osdu_environment_config import ConfigOsduEnvironment

from msal import ConfidentialClientApplication
from osdu.identity import OsduMsalNonInteractiveCredential, OsduMsalInteractiveCredential, OsduTokenCredential
from osdu.client import OsduClient
import os

from typing import Union

class OsduHttpClient(ConfigOsduEnvironment):
    
    """
    Gets the configuration values according to the environment to target
    and the kind of authentication/authorization to be used and createS
    an OsduClient client that can be used to make requests to OSDU.
    
    osdu_environment: "npequinor-test", "npequinor-dev", or "equinor-data",
    client_type: "public-client", "private-client", or "token-client".
    The osdu_cli_client (public-client) set as default.
    """
    
    def __init__(self, osdu_environment:str, client_type="public-client"):
        ConfigOsduEnvironment.__init__(self, osdu_environment, client_type)
        if client_type == "public-client":
            self.osdu_client: OsduClient = self._get_osdu_public_client
        elif client_type == "private-client":
            self.osdu_client: OsduClient = self._get_osdu_private_client
        elif client_type == "token-client":
            self.osdu_client: OsduClient = self._get_osdu_token_client
    
    @property
    def _get_osdu_private_client(self):
        resource_id = self.env_variables['resource_id']
        scopes = f'{resource_id}/.default openid profile offline_access'
        authority = f"https://login.microsoftonline.com/{self.env_variables['tenant_id']}"

        private_app = ConfidentialClientApplication(
            client_id = self.env_variables['client_id'],
            client_credential = self.env_variables['client_secret'],
            authority = authority
            )

        credentials = OsduMsalNonInteractiveCredential(
            client_id = self.env_variables['client_id'],
            client_secret = self.env_variables['client_secret'],
            authority = authority,
            scopes = scopes,
            client = private_app
        )

        return OsduClient(
            server_url = self.env_variables['url'],
            data_partition = self.env_variables['data_partition_id'],
            credentials = credentials,
            retries = 5
        )
    
    @property
    def _get_osdu_public_client(self):
        resource_id = self.env_variables['resource_id']
        scopes = f'{resource_id}/.default openid'
        authority = f"https://login.microsoftonline.com/{self.env_variables['tenant_id']}"
        
        credentials = OsduMsalInteractiveCredential(
            client_id = self.env_variables['client_id'],
            authority = authority,
            scopes=scopes,
            token_cache="token_cache.txt"
        )
        
        return OsduClient(
            server_url = self.env_variables['url'],
            data_partition = self.env_variables['data_partition_id'],
            credentials=credentials
        )
        
    @property
    def _get_osdu_token_client(self):
        tenant_id = self.env_variables['tenant_id']
        token_endpoint = f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'
        
        credentials = OsduTokenCredential(
            client_id=self.env_variables['client_id'],
            token_endpoint=token_endpoint,
            refresh_token=os.environ[self.env_variables['refresh_token_key']],
            client_secret=self.env_variables['client_secret']
        )
        
        return OsduClient(
            server_url = self.env_variables['url'],
            data_partition = self.env_variables['data_partition_id'],
            credentials=credentials
        )
        
        
    def app_get_returning_json(self, service_relative_uri: str) -> dict:
        
        service_uri = f"{self.env_variables['url']}/{service_relative_uri}"
        response = self.osdu_client.get_returning_json(service_uri)
        
        return response
    
    def app_post_returning_json(self, service_relative_uri: str, payload:dict) -> dict:
        
        service_uri = f"{self.env_variables['url']}/{service_relative_uri}"
        response = self.osdu_client.post_returning_json(
            service_uri,
            payload
        )
        
        return response
    
    def app_put_returning_json(self, service_relative_uri: str, data: Union[str, dict], ok_status_codes: list = None):
        
        service_uri = f"{self.env_variables['url']}/{service_relative_uri}"
        if ok_status_codes is None:
                ok_status_codes = [201]
        response = self.osdu_client.put_returning_json(
            service_uri,
            data,
            ok_status_codes
        )
        return response
    
    def app_query_with_cursor(self, service_relative_uri:str, payload):
            
        cursor = ""
        results = []
        service_uri = f"{self.env_variables['url']}/{service_relative_uri}"
        while True:
            payload["cursor"] = cursor
            response = self.osdu_client.post_returning_json(
                service_uri,
                payload
            )
            if response["results"]:
                results.extend(response["results"])
            cursor = response.get["cursor"]
            if cursor is None:
                break
            
        return results    