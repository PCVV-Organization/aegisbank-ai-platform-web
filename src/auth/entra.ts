import {
  BrowserCacheLocation,
  PublicClientApplication,
  type AccountInfo,
  type SilentRequest,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID ?? "";
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID ?? "";
const apiClientId = import.meta.env.VITE_AEGISBANK_API_CLIENT_ID ?? "";
export const isMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== "false";
export const entraConfigured = Boolean(clientId && tenantId && apiClientId);
export const apiScopes = apiClientId ? [`api://${apiClientId}/agent.run`] : [];
export const msalInstance =
  !isMockAuth && entraConfigured
    ? new PublicClientApplication({
        auth: {
          clientId,
          authority: `https://login.microsoftonline.com/${tenantId}`,
          redirectUri: window.location.origin,
          postLogoutRedirectUri: window.location.origin,
        },
        cache: {
          cacheLocation: BrowserCacheLocation.SessionStorage,
          storeAuthStateInCookie: false,
        },
      })
    : null;
export async function initializeEntra(): Promise<void> {
  if (!msalInstance) return;
  await msalInstance.initialize();
  const result = await msalInstance.handleRedirectPromise();
  if (result?.account) msalInstance.setActiveAccount(result.account);
  if (!msalInstance.getActiveAccount())
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0] ?? null);
}
export function getActiveAccount(): AccountInfo | null {
  return msalInstance?.getActiveAccount() ?? null;
}
export async function signInWithEntra(): Promise<AccountInfo> {
  if (!msalInstance || !apiScopes.length)
    throw new Error(
      "Entra authentication is not configured for this deployment.",
    );
  const result = await msalInstance.loginPopup({ scopes: apiScopes });
  msalInstance.setActiveAccount(result.account);
  return result.account;
}
export async function signOutWithEntra(): Promise<void> {
  const account = getActiveAccount();
  if (msalInstance && account) await msalInstance.logoutPopup({ account });
}
export async function getAccessToken(): Promise<string | null> {
  if (!msalInstance || !apiScopes.length) return null;
  const account = getActiveAccount();
  if (!account) return null;
  const request: SilentRequest = { account, scopes: apiScopes };
  try {
    return (await msalInstance.acquireTokenSilent(request)).accessToken;
  } catch {
    return (await msalInstance.acquireTokenPopup(request)).accessToken;
  }
}
