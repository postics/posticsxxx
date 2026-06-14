import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  Globe2,
  BarChart3,
  CreditCard,
  Bell,
  ChevronDown,
  Search,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditMeter, StatusChip } from "@/features/shared/primitives";

type NavId =
  | "overview"
  | "plan"
  | "editor"
  | "review"
  | "site"
  | "analytics"
  | "billing"
  | "agency";

const NAV: { id: NavId; label: string; icon: any; to: string; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { id: "plan", label: "Content Plan", icon: CalendarDays, to: "/plan", badge: 4 },
  { id: "editor", label: "Editor", icon: PenLine, to: "/editor" },
  { id: "review", label: "Human Review", icon: Bell, to: "/review", badge: 7 },
  { id: "site", label: "Site", icon: Globe2, to: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: BarChart3, to: "/analytics" },
  { id: "billing", label: "Billing & Credits", icon: CreditCard, to: "/billing" },
  { id: "agency", label: "Agency Console", icon: Settings2, to: "/agency" },
];

export function AppShell({
  active,
  breadcrumb,
  children,
  topRight,
}: {
  active: NavId;
  breadcrumb: string[];
  children: ReactNode;
  topRight?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-paper">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar breadcrumb={breadcrumb} topRight={topRight} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  setCollapsed,
  active,
}: {
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
  active: NavId;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width]",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <Link
        to="/"
        className="flex h-16 items-center gap-2.5 border-b border-line px-4 hover:opacity-80 transition-opacity"
      >
        <div className="grid size-8 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
          <span className="font-display text-base leading-none">P</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-base text-ink-900">Postics</div>
            <div className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
              tenant · acme-studio
            </div>
          </div>
        )}
      </Link>

      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV.map((n) => {
          const isActive = n.id === active;
          return (
            <Link
              key={n.id}
              to={n.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
              )}
            >
              {isActive && (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-700" />
              )}
              <n.icon className="size-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="flex-1 truncate">{n.label}</span>}
              {!collapsed && n.badge ? (
                <span className="font-mono-num rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-ink-700 ring-1 ring-line">
                  {n.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-sunken"
        >
          <Settings2 className="size-4" strokeWidth={1.5} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ breadcrumb, topRight }: { breadcrumb: string[]; topRight?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-line bg-paper/85 px-8 backdrop-blur">
      <button className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
        <span className="grid size-5 place-items-center rounded bg-brand-100 font-display text-[11px] text-brand-700">
          V
        </span>
        <span className="text-ink-900">Vellum & Bean</span>
        <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </button>

      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" strokeWidth={1.5} />}
            <span className={i === breadcrumb.length - 1 ? "text-ink-900" : ""}>{b}</span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {topRight}
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="size-3.5" strokeWidth={1.5} />
          <span>Search…</span>
          <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 hover:border-ink-700/30">
          <CreditCard className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          <CreditMeter used={3240} total={10000} compact />
        </button>
        <StatusChip tone="info">2 generating</StatusChip>
        <button className="grid size-9 place-items-center rounded-lg border border-line bg-surface hover:border-ink-700/30">
          <Bell className="size-4 text-ink-700" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1">
          <div className="grid size-7 place-items-center rounded-full bg-brand-100 font-display text-xs text-brand-700">
            EM
          </div>
          <div className="hidden text-xs leading-tight lg:block">
            <div className="font-medium text-ink-900">Eliza M.</div>
            <div className="text-muted-foreground">Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}