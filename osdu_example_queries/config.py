import os
from dotenv import load_dotenv


class Config:
    def __init__(self):
        load_dotenv()
        self.osdu_dns = os.environ.get("TUTORIAL_DNS") # example "https://npequinor.energy.azure.com/api"
        self.base_url = os.environ.get("TUTORIAL_BASE_URL") # example "search/v2"
        self.data_partition = os.environ.get("TUTORIAL_DATA_PARTITION") # example npequinor-dev
        self.client_id = os.environ.get("TUTORIAL_CLIENT_ID") # example "some relevant client id" look up in azure portal
        self.tenant_id = os.environ.get("TUTORIAL_TENANT_ID") # example "some relevant tentant id" look up in azure portal
        self.scopes = os.environ.get("TUTORIAL_SCOPES") # example "some relevant scope" look up in azure portal
        