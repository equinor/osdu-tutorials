import { MsalAuthProvider, LoginType } from "react-aad-msal";
import 'regenerator-runtime/runtime'
// The auth provider should be a singleton. Best practice is to only have it ever instantiated once.
// Avoid creating an instance inside the component it will be recreated on each render.
// If two providers are created on the same page it will cause authentication errors.
export const authProvider = new MsalAuthProvider(
  {
    auth: {
      authority:
        "https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0",
      clientId: "fde3ffb1-a11f-4e92-900f-bc7181f98c0d",
      postLogoutRedirectUri: window.location.origin,
      redirectUri: window.location.origin,
      validateAuthority: true,

      // After being redirected to the "redirectUri" page, should user
      // be redirected back to the Url where their login originated from?
      navigateToLoginRequestUrl: false,
    },

    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  },
  {
    scopes: ["7daee810-3f78-40c4-84c2-7a199428de18/.default openid"],
  },
  {
    loginType: LoginType.Popup,
    // When a token is refreshed it will be done by loading a page in an iframe.
    // Rather than reloading the same page, we can point to an empty html file which will prevent
    // site resources from being loaded twice.
    tokenRefreshUri: window.location.origin,
  }
);
