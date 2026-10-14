import { useSyncExternalStore } from "react";
import {
  entraConfigured,
  getActiveAccount,
  isMockAuth,
  signInWithEntra,
  signOutWithEntra,
} from "./entra";

type User = { id: string; name: string };
type AuthState = { user: User | null; signIn: () => void; signOut: () => void };
const accountUser = (): User | null => {
  const account = getActiveAccount();
  if (!account) return null;
  const claims = account.idTokenClaims as { customer_id?: string } | undefined;
  return {
    id: claims?.customer_id ?? account.localAccountId,
    name: account.name ?? account.username,
  };
};
let state: AuthState = {
  user: isMockAuth
    ? { id: "CUST-0001", name: "Synthetic customer" }
    : accountUser(),
  signIn: () => undefined,
  signOut: () => undefined,
};
const listeners = new Set<() => void>();
export const refreshAuthState = () => {
  state = {
    ...state,
    user: isMockAuth
      ? { id: "CUST-0001", name: "Synthetic customer" }
      : accountUser(),
  };
  listeners.forEach((listener) => listener());
};
state.signIn = () => {
  if (isMockAuth) {
    state = { ...state, user: { id: "CUST-0001", name: "Synthetic customer" } };
    listeners.forEach((listener) => listener());
    return;
  }
  void signInWithEntra().catch(() => undefined);
};
state.signOut = () => {
  if (!isMockAuth) void signOutWithEntra();
  state = { ...state, user: null };
  listeners.forEach((listener) => listener());
};
export const getCustomerId = () => state.user?.id ?? "CUST-0001";
export const authConfigured = isMockAuth || entraConfigured;

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
