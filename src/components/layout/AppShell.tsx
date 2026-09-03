import { type ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Home,
  Plus,
  Printer,
  Settings,
  LayoutDashboard,
  Store,
  Zap,
} from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";
import ThemeSwitcher from "@/components/ThemeSwitcher";

interface AppShellProps {
  children: ReactNode;
  /** Show the sidebar — false for full-bleed pages like landing */
  showNav?: boolean;
}

/* ═══════════════════════════════════════════════════════
   MOBILE BOTTOM NAV (< 640px)
   ═══════════════════════════════════════════════════════ */
const bottomNavItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/new-print", icon: Plus, label: "Beam" },
  { path: "/printers", icon: Printer, label: "Printers" },
  { path: "/store-dashboard", icon: Store, label: "Store" },
  { path: "/account", icon: Settings, label: "Settings" },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-border bg-card/80 glass-subtle pb-safe">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname.startsWith("/print/"));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                active
                  ? "text-[var(--ring)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   MOBILE HEADER with MorphIcon hamburger (< 640px)
   ═══════════════════════════════════════════════════════ */
function MobileHeader({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate();

  return (
    <header className="flex sm:hidden sticky top-0 z-50 items-center justify-between border-b border-border bg-card/60 glass px-4 h-14">
      {/* Logo */}
      <button
        onClick={() => { navigate("/dashboard"); setOpen(false); }}
        className="flex items-center gap-2.5"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--ring)]/10 text-[var(--ring)] border border-[var(--ring)]/20">
          <Zap className="size-4" />
        </div>
        <span className="text-sm font-bold tracking-tight">
          PrintBeam
        </span>
      </button>

      {/* Right side: theme toggle + MorphIcon hamburger */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <MorphIcon icon={open ? X : Menu} size={20} />
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   MOBILE DRAWER NAV (toggled by MorphIcon hamburger)
   ═══════════════════════════════════════════════════════ */
function MobileDrawer({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      {/* Drawer */}
      <nav className="absolute top-14 right-0 w-64 border-l border-border bg-card/95 glass p-4 shadow-xl">
        <div className="flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname.startsWith("/print/"));
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setOpen(false); }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--ring)]/10 text-[var(--ring)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="size-4" strokeWidth={active ? 2.5 : 1.5} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DESKTOP TOP NAV (≥ 640px)
   ═══════════════════════════════════════════════════════ */
const topNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/new-print", icon: Plus, label: "New Print" },
  { path: "/store-dashboard", icon: Store, label: "Store" },
  { path: "/account", icon: Settings, label: "Settings" },
];

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="hidden sm:flex sticky top-0 z-50 items-center justify-between border-b border-border bg-card/60 glass px-4 lg:px-6 h-14">
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2.5"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--ring)]/10 text-[var(--ring)] border border-[var(--ring)]/20">
          <Zap className="size-4" />
        </div>
        <span className="text-sm font-bold tracking-tight hidden md:block">
          PrintBeam
        </span>
      </button>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {topNavItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname.startsWith("/print/"));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-[var(--ring)]/10 text-[var(--ring)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="size-3.5" />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════ */
export default function AppShell({ children, showNav = true }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader open={drawerOpen} setOpen={setDrawerOpen} />
      <MobileDrawer open={drawerOpen} setOpen={setDrawerOpen} />
      <TopNav />
      <main className="pb-20 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED LAYOUT PRIMITIVES
   ═══════════════════════════════════════════════════════ */

/** Page header with title and optional actions */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** Responsive container — constrained on ultrawide, padded on mobile */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
