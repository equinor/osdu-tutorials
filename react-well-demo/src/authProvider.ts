import { MsalAuthProvider, LoginType } from "react-aad-msal";

// The auth provider should be a singleton. Best practice is to only have it ever instantiated once.
// Avoid creating an instance inside the component it will be recreated on each render.
// If two providers are created on the same page it will cause authentication errors.
export const authProvider = new MsalAuthProvider(
  {
    auth: {
      authority: "https://login.microsoftonline.com/",
      clientId: "d91a40ba-e6ee-47ab-8836-cdd3c68b87d4",
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
    scopes: ["openid", "d91a40ba-e6ee-47ab-8836-cdd3c68b87d4/.default"],
  },
  {
    loginType: LoginType.Popup,
    // When a token is refreshed it will be done by loading a page in an iframe.
    // Rather than reloading the same page, we can point to an empty html file which will prevent
    // site resources from being loaded twice.
    tokenRefreshUri: "http://localhost:3000",
  }
);
