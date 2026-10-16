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

function ShieldBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function LogoutIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function OverviewIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function AccountsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 10v11" />
      <path d="M19 10v11" />
      <path d="M10 10v11" />
      <path d="M14 10v11" />
      <path d="m12 2 10 5H2z" />
    </svg>
  );
}

function CardsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function LoansIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function PaymentsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 6h18" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 18H3" />
    </svg>
  );
}

function ServiceRequestsIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function AssistantIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function getInitials(name?: string): string {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];
  if (first && second) {
    return `${first}${second}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "CU";
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: OverviewIcon },
  { id: "accounts", label: "Accounts", icon: AccountsIcon },
  { id: "cards", label: "Cards", icon: CardsIcon },
  { id: "loans", label: "Loans", icon: LoansIcon },
  { id: "payments", label: "Payments", icon: PaymentsIcon },
  {
    id: "service-requests",
    label: "Service requests",
    icon: ServiceRequestsIcon,
  },
  { id: "assistant", label: "Assistant", icon: AssistantIcon, badge: "AI" },
] as const;

function AppShell() {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const initials = getInitials(user?.name);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="min-h-screen bg-slate-50 md:flex">
        {/* Sidebar Dock */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2747] text-white transition-all duration-300 ease-in-out md:static md:min-h-screen md:shrink-0 ${
            mobileNavOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          } ${collapsed ? "w-64 md:w-20 p-3 md:p-3" : "w-64 p-4 md:p-5"}`}
        >
          {/* Sidebar Header: Brand & Collapse Toggle */}
          <div
            className={`mb-6 flex items-center border-b border-white/10 pb-4 ${
              collapsed
                ? "md:flex-col md:items-center md:gap-3"
                : "justify-between"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "md:flex-col md:text-center" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30 shadow-inner">
                <ShieldBrandIcon className="h-6 w-6" />
              </div>
              {(!collapsed || mobileNavOpen) && (
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                    Digital Banking
                  </div>
                  <div className="text-lg font-bold tracking-tight text-white">
                    AegisBank
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Toggle Button inside the Sidebar */}
            <button
              type="button"
              aria-label={
                collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
              }
              title={
                collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
              }
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 md:flex"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              aria-label="Cerrar menú lateral"
              title="Cerrar menú"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="flex-1 space-y-1.5 overflow-y-auto"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={`/app/${item.id}` as never}
                  onClick={() => setMobileNavOpen(false)}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  activeProps={{
                    className:
                      "bg-blue-600/30 text-white font-medium border-l-2 border-blue-400 shadow-sm",
                  }}
                  className={`group flex min-h-11 items-center rounded-lg text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300 ${
                    collapsed
                      ? "px-3 py-2.5 md:justify-center md:px-0"
                      : "px-3 py-2.5"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      collapsed ? "mr-3 md:mr-0" : "mr-3"
                    }`}
                  />
                  {(!collapsed || mobileNavOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {(!collapsed || mobileNavOpen) && "badge" in item && (
                    <span className="ml-auto rounded bg-gradient-to-r from-blue-500 to-indigo-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="mt-auto border-t border-white/10 pt-4">
            {collapsed && !mobileNavOpen ? (
              // Collapsed View: Centered Avatar + Centered Sign-out Icon
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white shadow-inner ring-2 ring-white/10"
                  title={user?.name ?? "Customer CUST-0001"}
                >
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <LogoutIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              // Expanded View: User Card + Info + Sign-out Button
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white shadow-inner ring-2 ring-white/10">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {user?.name ?? "Synthetic customer"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        Sesión activa
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <LogoutIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-sm md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir navegación móvil"
                aria-expanded={mobileNavOpen}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 md:text-sm">
                <span className="text-slate-400">Portal AegisBank</span>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-slate-900">
                  Banca Digital Inteligente
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Security Pill */}
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-2xs sm:inline-flex">
                <LockIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sesión segura · Cloud Staging</span>
              </div>

              {/* Customer Chip */}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{user?.name ?? "Guest"}</span>
              </div>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-8 lg:p-10">
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
