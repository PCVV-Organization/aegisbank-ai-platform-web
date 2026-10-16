import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  Navigate,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/use-auth";
import { AppShell } from "../components/shell/app-shell";
import { AssistantPage } from "../features/assistant/assistant-page";
import { ServiceRequestForm } from "../features/service-requests/service-request-form";

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const customerAuth = import.meta.env.VITE_AUTH_MODE === "synthetic-password";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          AegisBank
        </p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mb-7 text-slate-600">
          {import.meta.env.VITE_USE_MOCK_AUTH !== "false"
            ? "Synthetic banking laboratory demo. No real customer data or accounts are used."
            : "Sign in securely with your AegisBank customer account."}
        </p>
        {customerAuth && (
          <div className="mb-5 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              DNI
              <input
                value={dni}
                onChange={(event) =>
                  setDni(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputMode="numeric"
                autoComplete="username"
                maxLength={8}
                className="min-h-11 rounded-lg border border-slate-300 px-3"
                placeholder="12345678"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Contraseña
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="min-h-11 rounded-lg border border-slate-300 px-3"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          className="min-h-12 w-full rounded-lg bg-[#0f2747] px-4 py-3 font-medium text-white transition hover:bg-[#173b6c] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          disabled={loading}
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              await signIn(
                customerAuth ? dni : undefined,
                customerAuth ? password : undefined,
              );
              await navigate({ to: "/app/overview" });
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "No se pudo iniciar sesión",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span>Validando tu identidad…</span>
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="m10 17 5-5-5-5M15 12H3" />
              </svg>
              <span>
                {customerAuth
                  ? "Iniciar sesión"
                  : import.meta.env.VITE_USE_MOCK_AUTH !== "false"
                    ? "Start synthetic demo"
                    : "Sign in"}
              </span>
            </span>
          )}
        </button>
        {loading && (
          <p className="mt-3 text-center text-sm text-slate-500" role="status">
            Conectando con AegisBank de forma segura…
          </p>
        )}
      </section>
    </main>
  );
}

function Page({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="mb-2 text-sm font-medium text-blue-700">
        Your banking workspace
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      {children ?? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <p className="font-medium text-slate-900">Coming next</p>
          <p className="mt-2 max-w-xl text-slate-600">
            This module is being prepared for the next product slice. Your
            synthetic data stays local until the backend contract is connected.
          </p>
        </div>
      )}
    </section>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/app/overview" />,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: () => {
    if (!useAuth.getState().user) throw redirect({ to: "/login" });
  },
  component: AppShell,
});
const overviewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/overview",
  component: () => (
    <Page title="Overview">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm text-slate-500">Available balance</p>
          <p className="mt-2 text-2xl font-semibold">$12,480.00</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm text-slate-500">Open requests</p>
          <p className="mt-2 text-2xl font-semibold">2</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm text-slate-500">Assistant</p>
          <Link
            className="mt-3 inline-block font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500"
            to="/app/assistant"
          >
            Ask Aegis
          </Link>
        </article>
      </div>
    </Page>
  ),
});
const assistantRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/assistant",
  component: AssistantPage,
});
const placeholderRoutes = ["accounts", "cards", "loans", "payments"].map(
  (path) =>
    createRoute({
      getParentRoute: () => appRoute,
      path: `/${path}`,
      component: () => (
        <Page
          title={path.replace("-", " ").replace(/^./, (c) => c.toUpperCase())}
        />
      ),
    }),
);
const serviceRequestsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/service-requests",
  component: () => (
    <Page title="Service requests">
      <ServiceRequestForm />
    </Page>
  ),
});
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    overviewRoute,
    assistantRoute,
    serviceRequestsRoute,
    ...placeholderRoutes,
  ]),
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
