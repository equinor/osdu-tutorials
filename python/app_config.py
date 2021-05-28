import os

CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
OSDU_API_SEARCH_URL = os.environ.get("OSDU_API_SEARCH_URL")
AUTHORITY = "https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0"  # For multi-tenant app
REDIRECT_PATH = "/getAToken"
GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/users'  # This resource requires no admin consent
SCOPE = ["User.ReadBasic.All"]
SESSION_TYPE = "filesystem"  # Specifies the token cache should be stored in server-side session
