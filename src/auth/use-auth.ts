import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { useSyncExternalStore } from "react";

type User = { id: string; name: string };
type AuthState = { user: User | null; signIn: () => void; signOut: () => void };
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== "false";
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID ?? "";
const authority = import.meta.env.VITE_ENTRA_AUTHORITY ?? "";
const apiScope = import.meta.env.VITE_AEGISBANK_API_SCOPE ?? "";
const msal =
  !useMockAuth && clientId && authority
    ? new PublicClientApplication({
        auth: {
          clientId,
          authority,
          redirectUri: window.location.origin,
          postLogoutRedirectUri: `${window.location.origin}/login`,
        },
        cache: { cacheLocation: "sessionStorage" },
      })
    : null;
let activeAccount: AccountInfo | null = null;
let state: AuthState = {
  user: null,
  signIn: () => undefined,
  signOut: () => undefined,
};
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
function setAccount(account: AccountInfo | null) {
  activeAccount = account;
  state = {
    ...state,
    user: account
      ? { id: account.localAccountId, name: account.name ?? account.username }
      : null,
  };
  notify();
}
state.signIn = () => {
  if (useMockAuth) {
    state = { ...state, user: { id: "CUST-0001", name: "Synthetic customer" } };
    notify();
    return;
  }
  if (!msal || !apiScope)
    throw new Error("External ID authentication is not configured");
  void msal.loginRedirect({ scopes: ["openid", "profile", apiScope] });
};
state.signOut = () => {
  if (useMockAuth || !msal) {
    setAccount(null);
    return;
  }
  void msal.logoutRedirect();
};
export const authConfigured = useMockAuth || Boolean(msal && apiScope);
export const getCustomerId = () => state.user?.id ?? "CUST-0001";
export const getAccessToken = async (): Promise<string | null> => {
  if (useMockAuth || !msal || !activeAccount || !apiScope) return null;
  const response = await msal.acquireTokenSilent({
    account: activeAccount,
    scopes: [apiScope],
  });
  return response.accessToken;
};
export async function initializeAuth() {
  if (useMockAuth || !msal) return;
  await msal.initialize();
  const redirect = await msal.handleRedirectPromise();
  setAccount(redirect?.account ?? msal.getAllAccounts()[0] ?? null);
}
export const useAuth = Object.assign(
  function useAuthHook() {
    return useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      () => state,
      () => state,
    );
  },
  { getState: () => state },
);
