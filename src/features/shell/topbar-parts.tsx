import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Activity,
  CreditCard,
  Plus,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditMeter, StatusChip } from "@/features/shared/primitives";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";
import { useScope, type Project } from "./scope";

export type ScopeMode = "workspace" | "project";

/**
 * The one switcher that lives in the top-left of BOTH shells.
 * - WORKSPACE scope → reads "Acme Studio ▾" + lists recent client projects.
 * - PROJECT scope   → reads brand name ▾ + (agency only) "← All clients", then siblings.
 * Solo business users see only their brand; no agency menu items appear.
 */
export function ScopeSwitcher({ mode }: { mode: ScopeMode }) {
  const { role, workspace, projects, currentProject, setCurrentProjectId } = useScope();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const isWorkspace = mode === "workspace";
  const label = isWorkspace ? workspace.name : currentProject.name;
  const initials = isWorkspace ? workspace.initials : currentProject.initials;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm hover:border-ink-700/30"
      >
        <span
          className={cn(
            "grid size-6 place-items-center rounded font-display text-[11px]",
            isWorkspace ? "bg-ink-900 text-paper" : "bg-brand-100 text-brand-700",
          )}
        >
          {initials}
        </span>
        <span className="font-medium text-ink-900">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[300px] rounded-xl border border-line bg-surface p-2 shadow-elev-pop">
          {/* Agency-only: jump back to workspace from a project */}
          {!isWorkspace && role === "agency" ? (
            <Link
              to="/clients"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              <span>All clients (console)</span>
            </Link>
          ) : null}

          <div className="px-2.5 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {isWorkspace ? "Recent client projects" : role === "agency" ? "Sibling clients" : "Your brand"}
          </div>

          <ul className="space-y-0.5">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectRow
                  project={p}
                  active={p.id === currentProject.id}
                  onPick={() => {
                    setCurrentProjectId(p.id);
                    setOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>

          {/* Agency-only: new client */}
          {role === "agency" ? (
            <Link
              to="/clients"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg border-t border-line px-2.5 py-2 text-sm text-brand-700 hover:bg-surface-sunken"
            >
              <Plus className="size-3.5" strokeWidth={1.75} />
              <span>New client</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProjectRow({
  project,
  active,
  onPick,
}: {
  project: Project;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <Link
      to="/dashboard"
      onClick={onPick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm",
        active ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
      )}
    >
      <span className="grid size-6 place-items-center rounded bg-surface-sunken font-display text-[11px] text-ink-700">
        {project.initials}
      </span>
      <span className="min-w-0 flex-1 truncate">{project.name}</span>
      <span className="font-mono-num truncate text-[10px] text-muted-foreground">{project.domain}</span>
      {active ? <Check className="size-3.5 text-brand-700" strokeWidth={2} /> : null}
    </Link>
  );
}

/** Crumb separator + items. Scope-aware prefix is applied by each shell. */
export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
      {items.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5" strokeWidth={1.5} />}
          <span className={i === items.length - 1 ? "text-ink-900" : ""}>{b}</span>
        </span>
      ))}
    </nav>
  );
}

/** Shared top-bar shell — both ProjectShell and WorkspaceShell use this. */
export function TopBar({
  left,
  breadcrumb,
  right,
}: {
  left: ReactNode;
  breadcrumb: string[];
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-line bg-paper/85 px-6 backdrop-blur md:px-8">
      {left}
      <Breadcrumbs items={breadcrumb} />
      <div className="ml-auto flex items-center gap-2.5">
        {right}
        <SearchButton />
        <LanguageButton />
        <ThemeToggle />
        <NotificationsButton />
        <ProfileChip />
      </div>
    </header>
  );
}

function SearchButton() {
  return (
    <button className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted-foreground hover:border-ink-700/30 lg:flex">
      <Search className="size-3.5" strokeWidth={1.5} />
      <span>Search…</span>
      <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
    </button>
  );
}

function NotificationsButton() {
  return (
    <button
      aria-label="Notifications"
      className="grid size-9 place-items-center rounded-lg border border-line bg-surface hover:border-ink-700/30"
    >
      <Bell className="size-4 text-ink-700" strokeWidth={1.5} />
    </button>
  );
}

function ProfileChip() {
  const { role, setRole } = useScope();
  return (
    <button
      onClick={() => setRole(role === "agency" ? "business" : "agency")}
      title={`Role: ${role} — click to toggle (demo)`}
      className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1 hover:border-ink-700/30"
    >
      <span className="grid size-7 place-items-center rounded-full bg-brand-100 font-display text-xs text-brand-700">
        EM
      </span>
      <span className="hidden text-xs leading-tight lg:block">
        <span className="block font-medium text-ink-900">Eliza M.</span>
        <span className="block text-muted-foreground">{role === "agency" ? "Agency owner" : "Owner"}</span>
      </span>
    </button>
  );
}

/**
 * Credits meter pill — clickable popover. Only project shell uses this in the top-right cluster
 * (workspace shell shows shared credits inside its Billing screen instead, but we still render
 * a compact meter so the chrome reads as one product).
 */
export function CreditsPill({ showStatus = true }: { showStatus?: boolean }) {
  const { credits } = useScope();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30"
      >
        {showStatus ? (
          <span className="relative grid size-4 place-items-center">
            <Activity className="size-3.5 text-[color:var(--info)]" strokeWidth={1.75} />
            <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[color:var(--info)] ring-2 ring-paper" />
          </span>
        ) : null}
        <CreditMeter used={credits.used} total={credits.total} compact />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 rounded-xl border border-line bg-surface p-4 shadow-elev-pop">
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Credits</div>
              <div className="mt-1 flex items-center justify-between">
                <CreditCard className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <CreditMeter used={credits.used} total={credits.total} />
              </div>
            </div>
            <div className="border-t border-line pt-3">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Activity</div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <StatusChip tone="info">2 generating</StatusChip>
                <Link to="/review" className="text-brand-700 hover:underline">Open queue</Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Sidebar shell used by both ProjectShell and WorkspaceShell. */
export function SideBarShell({
  brand,
  groups,
  active,
  collapsed,
  setCollapsed,
}: {
  brand: ReactNode;
  groups: { label?: string; items: SideItem[] }[];
  active: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width]",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">{brand}</div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.label && !collapsed ? (
              <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {g.label}
              </div>
            ) : null}
            <div className="space-y-0.5">
              {g.items.map((n) => (
                <SideLink key={n.id} item={n} active={n.id === active} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-sunken"
        >
          <ChevronRight
            className={cn("size-4 transition-transform", collapsed ? "" : "rotate-180")}
            strokeWidth={1.5}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export type SideItem = {
  id: string;
  label: string;
  icon: any;
  to: string;
  badge?: number;
};

function SideLink({ item, active, collapsed }: { item: SideItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
      )}
    >
      {active && (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-700" />
      )}
      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="font-mono-num rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-ink-700 ring-1 ring-line">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}