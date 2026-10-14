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
import { AssistantPage } from "../features/assistant/assistant-page";
import { ServiceRequestForm } from "../features/service-requests/service-request-form";

function AppShell() {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="min-h-screen bg-slate-50 md:flex">
        <aside
          className={`${mobileNavOpen ? "block" : "hidden"} ${collapsed ? "md:w-20" : "md:w-64"} bg-[#0f2747] p-4 text-white md:block md:min-h-screen md:shrink-0 md:p-5`}
        >
          <div className="mb-6 flex items-center justify-between md:mb-10">
            {!collapsed && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Digital banking
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight">
                  AegisBank
                </div>
              </div>
            )}
            <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-medium text-emerald-200">
              Online
            </span>
          </div>
          <nav
            aria-label="Primary navigation"
            className="grid grid-cols-2 gap-2 md:grid-cols-1"
          >
            {[
              "overview",
              "accounts",
              "cards",
              "loans",
              "payments",
              "service-requests",
              "assistant",
            ].map((item) => (
              <Link
                key={item}
                to={`/app/${item}` as never}
                activeProps={{ className: "bg-white/15 text-white" }}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <span aria-hidden="true" className="mr-2">
                  {
                    ["◈", "▣", "▤", "◇", "↗", "✦", "✧"][
                      [
                        "overview",
                        "accounts",
                        "cards",
                        "loans",
                        "payments",
                        "service-requests",
                        "assistant",
                      ].indexOf(item)
                    ]
                  }
                </span>
                {!collapsed &&
                  item.replace("-", " ").replace(/^./, (c) => c.toUpperCase())}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-white/20 pt-4 text-sm md:mt-10">
            {!collapsed && (
              <p className="mb-3 truncate text-slate-300">
                {user?.name ?? "Synthetic customer"}
              </p>
            )}
            <button
              className="min-h-11 rounded-lg border border-white/30 px-3 py-2 text-slate-200 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-300"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:px-8">
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              ☰
            </button>
            <span className="text-sm font-medium text-slate-600">
              {user?.name ?? "Guest"}
            </span>
            <button
              type="button"
              aria-label="Collapse navigation"
              aria-expanded={!collapsed}
              className="hidden min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 md:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </header>
          <div className="p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
          Synthetic banking laboratory demo. No real customer data or accounts
          are used.
        </p>
        <button
          className="min-h-12 w-full rounded-lg bg-[#0f2747] px-4 py-3 font-medium text-white transition hover:bg-[#173b6c] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => {
            signIn();
            void navigate({ to: "/app/overview" });
          }}
        >
          Start synthetic demo
        </button>
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
