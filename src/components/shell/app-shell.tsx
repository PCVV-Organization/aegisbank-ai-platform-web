import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../auth/use-auth";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  ShieldBrandIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  OverviewIcon,
  AccountsIcon,
  CardsIcon,
  LoansIcon,
  PaymentsIcon,
  ServiceRequestsIcon,
  AssistantIcon,
  LockIcon,
  MenuIcon,
  CloseIcon,
} from "../icons";
import { initTheme } from "../../design-system/theme";
import { SessionTimeoutModal } from "../auth/session-timeout-modal";

export const NAV_ITEMS = [
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

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  const handleSignOut = () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    void signOut()
      .catch(() => undefined)
      .finally(() => navigate({ to: "/login" }));
  };

  return (
    <TooltipProvider delayDuration={150}>
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

      {/* Fixed Full-Height Viewport Container */}
      <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-slate-50">
        {/* Fixed Left Sidebar Dock */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-[var(--sidebar-bg)] text-white transition-all duration-300 ease-in-out md:static md:h-screen md:h-[100dvh] md:shrink-0 ${
            mobileNavOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          } ${collapsed ? "w-64 md:w-20 p-3" : "w-64 md:w-72 p-4 md:p-5"}`}
        >
          {/* Sidebar Header: Brand & Collapse Toggle */}
          <div
            className={`shrink-0 mb-4 flex items-center border-b border-white/10 pb-4 ${
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

            {/* Desktop Collapse / Expand Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="sidebar"
                  size="icon"
                  aria-label={
                    collapsed
                      ? "Expandir barra lateral"
                      : "Colapsar barra lateral"
                  }
                  className="hidden md:flex"
                  onClick={() => setCollapsed((prev) => !prev)}
                >
                  {collapsed ? (
                    <ChevronRightIcon className="h-5 w-5" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
              </TooltipContent>
            </Tooltip>

            {/* Mobile Close Button */}
            <Button
              type="button"
              variant="sidebar"
              size="icon"
              aria-label="Cerrar menú lateral"
              className="flex md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              <CloseIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links: Independently Scrollable Flex Area */}
          <nav
            aria-label="Primary navigation"
            className="flex-1 min-h-0 space-y-1.5 overflow-y-auto overflow-x-hidden py-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const linkContent = (
                <Link
                  key={item.id}
                  to={`/app/${item.id}` as never}
                  onClick={() => setMobileNavOpen(false)}
                  aria-label={item.label}
                  activeProps={{
                    className:
                      "bg-[var(--sidebar-active)] text-white font-medium border-l-2 border-[var(--sidebar-active-border)] shadow-xs",
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
                    <Badge variant="ai" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );

              if (collapsed && !mobileNavOpen) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          {/* User Profile & Sign Out Footer: Pinned at bottom of viewport */}
          <div className="shrink-0 mt-auto border-t border-white/10 pt-3">
            {collapsed && !mobileNavOpen ? (
              // Collapsed View: Centered Avatar + Centered Sign-out Icon
              <div className="flex flex-col items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Avatar name={user?.name ?? "Customer CUST-0001"} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {user?.name ?? "Customer CUST-0001"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="sidebarDestructive"
                      size="icon"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      aria-busy={isSigningOut}
                      aria-label="Cerrar sesión"
                    >
                      {isSigningOut ? (
                        <span
                          className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          aria-hidden="true"
                        />
                      ) : (
                        <LogoutIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Cerrar sesión</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              // Expanded View: User Card + Info + Sign-out Button
              <div className="flex items-center justify-between gap-2.5 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={user?.name ?? "Synthetic customer"} />
                  <div className="min-w-0">
                    <p
                      className="truncate text-xs font-semibold text-white"
                      title={user?.name ?? "Synthetic customer"}
                    >
                      {user?.name ?? "Synthetic customer"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[11px] font-medium text-emerald-300">
                        Sesión activa
                      </span>
                    </div>
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="sidebarDestructive"
                      size="icon"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      aria-busy={isSigningOut}
                      aria-label="Cerrar sesión"
                    >
                      {isSigningOut ? (
                        <span
                          className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          aria-hidden="true"
                        />
                      ) : (
                        <LogoutIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Cerrar sesión</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area: Independently Scrollable */}
        <main
          id="main-content"
          className="flex min-w-0 flex-1 flex-col h-screen h-[100dvh] overflow-y-auto"
        >
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-10 shrink-0 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-sm md:px-8">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Abrir navegación móvil"
                aria-expanded={mobileNavOpen}
                className="md:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </Button>

              <div className="flex items-center gap-2 text-xs font-medium md:text-sm">
                <span className="text-slate-600">Portal AegisBank</span>
                <span aria-hidden="true" className="select-none text-slate-400">
                  /
                </span>
                <span className="font-semibold text-slate-900">
                  Banca Digital Inteligente
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Security Pill */}
              <Badge variant="success" className="hidden py-1 lg:inline-flex">
                <LockIcon className="h-3.5 w-3.5 text-emerald-700" />
                <span>Sesión segura · Cloud Staging</span>
              </Badge>

              {/* Customer Chip */}
              <Badge variant="secondary" className="py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>{user?.name ?? "Guest"}</span>
              </Badge>
            </div>
          </header>

          {isSigningOut ? (
            <div
              className="pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center px-4 pt-3"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg">
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700"
                  aria-hidden="true"
                />
                Cerrando sesión de forma segura…
              </div>
            </div>
          ) : null}

          <div className="flex-1 p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>

      <SessionTimeoutModal />
    </TooltipProvider>
  );
}
