import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { useSyncExternalStore } from "react";

type User = { id: string; name: string };
type AuthState = {
  user: User | null;
  signIn: (dni?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const authMode =
  import.meta.env.VITE_AUTH_MODE ??
  (import.meta.env.VITE_USE_MOCK_AUTH !== "false" ? "mock" : "entra-jwt");
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
  signIn: async () => undefined,
  signOut: async () => undefined,
};
let syntheticToken: string | null = null;
const CSRF_STORAGE_KEY = "aegisbank_csrf_token";
let syntheticCsrfToken: string | null = (() => {
  try {
    return sessionStorage.getItem(CSRF_STORAGE_KEY);
  } catch {
    return null;
  }
})();

function setCsrfToken(token: string | null) {
  syntheticCsrfToken = token;
  try {
    if (token) {
      sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}
const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
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
state.signIn = async (dni?: string, password?: string) => {
  if (authMode === "synthetic-password") {
    if (!dni || !password) throw new Error("DNI y contraseña son obligatorios");
    const response = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, password }),
    });
    if (!response.ok) throw new Error("DNI o contraseña no válidos");
    const result = (await response.json()) as {
      customer_id: string;
      csrf_token?: string;
    };
    syntheticToken = null;
    setCsrfToken(result.csrf_token ?? null);
    state = {
      ...state,
      user: { id: result.customer_id, name: `Customer ${result.customer_id}` },
    };
    notify();
    return;
  }
  if (useMockAuth || authMode === "mock") {
    state = { ...state, user: { id: "CUST-0001", name: "Synthetic customer" } };
    notify();
    return;
  }
  if (!msal || !apiScope)
    throw new Error("External ID authentication is not configured");
  await msal.loginRedirect({ scopes: ["openid", "profile", apiScope] });
};
state.signOut = async () => {
  if (authMode === "synthetic-password" && state.user) {
    await fetch(`${apiBase}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": syntheticCsrfToken ?? csrfToken() ?? "" },
    });
    syntheticToken = null;
    setCsrfToken(null);
    state = { ...state, user: null };
    notify();
    return;
  }
  if (useMockAuth || !msal) {
    setAccount(null);
    return;
  }
  await msal.logoutRedirect();
};
export const authConfigured =
  authMode === "synthetic-password"
    ? Boolean(apiBase)
    : useMockAuth || Boolean(msal && apiScope);
export const getCustomerId = () => state.user?.id ?? "CUST-0001";
export const getAccessToken = async (): Promise<string | null> => {
  if (authMode === "synthetic-password") return syntheticToken;
  if (useMockAuth || !msal || !activeAccount || !apiScope) return null;
  const response = await msal.acquireTokenSilent({
    account: activeAccount,
    scopes: [apiScope],
  });
  return response.accessToken;
};
export async function initializeAuth() {
  if (authMode === "synthetic-password" && apiBase) {
    try {
      const response = await fetch(`${apiBase}/api/v1/auth/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = (await response.json()) as {
          customer_id: string;
          csrf_token?: string;
        };
        if (result.csrf_token) {
          setCsrfToken(result.csrf_token);
        }
        state = {
          ...state,
          user: {
            id: result.customer_id,
            name: `Customer ${result.customer_id}`,
          },
        };
        notify();
      }
    } catch {
      // A missing session is expected before the first login.
    }
    return;
  }
  if (useMockAuth || !msal) return;
  await msal.initialize();
  const redirect = await msal.handleRedirectPromise();
  setAccount(redirect?.account ?? msal.getAllAccounts()[0] ?? null);
}

function csrfToken(): string | null {
  const match = document.cookie.match(/(?:^|; )aegisbank_csrf=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
export const getCsrfToken = () => syntheticCsrfToken ?? csrfToken();
export async function ensureCsrfToken(): Promise<string | null> {
  if (syntheticCsrfToken) return syntheticCsrfToken;
  const cookieCsrf = csrfToken();
  if (cookieCsrf) {
    setCsrfToken(cookieCsrf);
    return cookieCsrf;
  }
  if (authMode === "synthetic-password" && apiBase) {
    try {
      const response = await fetch(`${apiBase}/api/v1/auth/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = (await response.json()) as {
          customer_id: string;
          csrf_token?: string;
        };
        if (result.csrf_token) {
          setCsrfToken(result.csrf_token);
          return result.csrf_token;
        }
      }
    } catch {
      // Ignore
    }
  }
  return null;
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
