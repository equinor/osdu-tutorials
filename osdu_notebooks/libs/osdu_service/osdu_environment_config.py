import os
# from dotenv import load_dotenv
# load_dotenv()

class ConfigOsduEnvironment:
    
    """
    Gets the configuration values according to the environment to target
    and the kind of authentication/authorization to be used.
    
    osdu_environment: "npequinor-test", "npequinor-dev", or "equinor-data",
    client_type: "public-client", "private-client", or "token-client".
    The osdu_cli_client (public-client) set as default.
    """
    
    def __init__(self, osdu_environment, client_type = "public-client") -> dict:

        self.osdu_environment = osdu_environment
        self.client_type = client_type
        self.env_variables = self._get_variables
        
    @property
    def _get_variables(self):
        
        self.client_secret = None
        self.refresh_token_key = None
        self.tenant_id = os.environ['tenant_id']
        
        if self.osdu_environment == 'npequinor-dev' or self.osdu_environment == 'npequinor-test':
            
            # osdu
            self.url = os.environ['osdu_np_server']
            self.resource_id = os.environ['np_resource_id']
            if self.osdu_environment == 'npequinor-dev':
                self.data_partition_id = os.environ['osdu_npdev_data_partition_id']
            elif self.osdu_environment == 'npequinor-test':
                self.data_partition_id = os.environ['osdu_nptest_data_partition']
            
            # client data (DEV-TEST)
            if self.client_type=="public-client":
                self.client_id = os.environ['osdu_cli_client_id']
            elif self.client_type=="private-client":
                self.client_id = os.environ['osdu_np_client_id']
                self.client_secret = os.environ['osdu_np_client_secret']
            elif self.client_type=="token-client":
                self.client_id = os.environ['token_client_id']
                self.client_secret = os.environ['token_client_secret']
                self.refresh_token_key = 'token_client_refresh_token_non_prod'

        elif self.osdu_environment == 'equinor-data':
            # osdu
            self.url = os.environ['osdu_prod_server']
            self.resource_id = os.environ['prod_resource_id']
            self.data_partition_id = os.environ['osdu_prod_data_partition_id']
            
            # client data (PROD)
            if self.client_type=="public-client":
                self.client_id = os.environ['osdu_cli_client_id']
            elif self.client_type=="private-client":
                self.client_id = os.environ['osdu_prod_client_id']
                self.client_secret = os.environ['osdu_prod_client_secret']
            elif self.client_type=="token-client":
                self.client_id = os.environ['token_client_id']
                self.client_secret = os.environ['token_client_secret']
                self.refresh_token_key = 'token_client_refresh_token_prod'

        return {
            'osdu_environment': self.osdu_environment,
            'url':self.url,
            'resource_id' : self.resource_id,
            'client_id': self.client_id,
            'client_secret' : self.client_secret,
            'data_partition_id': self.data_partition_id,
            'tenant_id': self.tenant_id,
            'refresh_token_key': self.refresh_token_key            
        }