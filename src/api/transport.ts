import {
  ensureCsrfToken,
  getAccessToken,
  getCsrfToken,
} from "../auth/use-auth";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const token = await getAccessToken();
  let csrf = getCsrfToken();
  const method = (init.method ?? "GET").toUpperCase();
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (!csrf && isStateChanging) {
    csrf = await ensureCsrfToken();
  }

  const doFetch = (csrfValue: string | null) =>
    fetch(`${base}${path}`, {
      ...init,
      credentials: "include",
      headers: new Headers({
        "Content-Type": "application/json",
        ...(csrfValue ? { "X-CSRF-Token": csrfValue } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      }),
    });

  let response = await doFetch(csrf);

  // Self-healing CSRF recovery: if rejected with 403 on a state-changing request, refresh CSRF and retry once
  if (response.status === 403 && isStateChanging) {
    const refreshedCsrf = await ensureCsrfToken();
    if (refreshedCsrf && refreshedCsrf !== csrf) {
      response = await doFetch(refreshedCsrf);
    }
  }

  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
