import { getAccessToken, getCsrfToken } from "../auth/use-auth";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const token = await getAccessToken();
  const csrf = getCsrfToken();
  const response = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: new Headers({
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    }),
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
