import {
  Configuration,
  InteractionRequiredAuthError,
  PublicClientApplication,
  RedirectRequest,
  SilentRequest
} from "@azure/msal-browser";
import { AuthenticationResult } from "@azure/msal-common";

const tenantId = "3aa4a235-b6e2-48d5-9195-7fcf05b459b0";
const clientId = "406cbdb0-ae9a-420b-9861-2c745e845949";

export const authRequest: RedirectRequest = {
  scopes: ["openid", "406cbdb0-ae9a-420b-9861-2c745e845949/.default"]
};

export const scopes: string[] = [
  "406cbdb0-ae9a-420b-9861-2c745e845949/.default"
];

const msalConfig: Configuration = {
  auth: {
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientId: clientId,
    redirectUri: "http://localhost:3000"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const msalInstance: PublicClientApplication =
  new PublicClientApplication(msalConfig);

export async function getAccessToken(scopes: string[]): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  let accessToken = null;

  if (accounts.length > 0) {
    const request: SilentRequest & RedirectRequest = {
      scopes: scopes,
      account: accounts[0]
    };

    await msalInstance
      .acquireTokenSilent(request)
      .then((response: AuthenticationResult) => {
        accessToken = response.accessToken;
      })
      .catch((error) => {
        // acquireTokenSilent can fail for a number of reasons, fallback to interaction
        if (error instanceof InteractionRequiredAuthError) {
          msalInstance.acquireTokenRedirect(request);
        }
      });
  }
  return accessToken;
}
