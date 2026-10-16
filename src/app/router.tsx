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
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/use-auth";
import { AppShell } from "../components/shell/app-shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { ShieldBrandIcon, AssistantIcon } from "../components/icons";
import { AssistantPage } from "../features/assistant/assistant-page";
import { ServiceRequestForm } from "../features/service-requests/service-request-form";

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dniInputRef = useRef<HTMLInputElement>(null);
  const customerAuth = import.meta.env.VITE_AUTH_MODE === "synthetic-password";

  useEffect(() => {
    if (error && customerAuth) dniInputRef.current?.focus();
  }, [customerAuth, error]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <Card className="w-full max-w-md shadow-xl shadow-slate-200/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700">
              <ShieldBrandIcon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              AegisBank Portal
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-600">
            {import.meta.env.VITE_USE_MOCK_AUTH !== "false"
              ? "Synthetic banking laboratory demo. No real customer data or accounts are used."
              : "Sign in securely with your AegisBank customer account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customerAuth && (
            <div className="mb-5 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                DNI
                <Input
                  ref={dniInputRef}
                  value={dni}
                  onChange={(event) =>
                    setDni(event.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  inputMode="numeric"
                  autoComplete="username"
                  maxLength={8}
                  placeholder="12345678"
                  error={Boolean(error)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Contraseña
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  error={Boolean(error)}
                />
              </label>
              {error && (
                <p role="alert" className="text-sm font-medium text-rose-600">
                  {error}
                </p>
              )}
            </div>
          )}
          <Button
            type="button"
            className="w-full"
            size="lg"
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
          </Button>
          {loading && (
            <p
              className="mt-3 text-center text-xs font-medium text-slate-500"
              role="status"
            >
              Conectando con AegisBank de forma segura…
            </p>
          )}
        </CardContent>
      </Card>
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
        Your banking workspace
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      {children ?? (
        <Card className="mt-6 border-dashed border-slate-300 bg-white/70 p-8">
          <p className="font-semibold text-slate-900">Coming next</p>
          <p className="mt-2 max-w-xl text-sm text-slate-600 leading-relaxed">
            This module is being prepared for the next product slice. Your
            synthetic data stays local until the backend contract is connected.
          </p>
        </Card>
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
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Available balance
            </span>
            <Badge variant="success">Disponible</Badge>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
            $12,480.00
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Cuenta de cheques sintética · •••• 4021
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Open requests
            </span>
            <Badge variant="warning">En trámite</Badge>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
            2
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Solicitudes pendientes de atención
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Assistant
            </span>
            <Badge variant="ai">AI Banking</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            Consultas inmediatas de saldo, préstamos y estado de reclamos.
          </p>
          <Link
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
            to="/app/assistant"
          >
            <AssistantIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none" />
            <span className="group-hover:underline">Ask Aegis</span>
          </Link>
        </Card>
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
