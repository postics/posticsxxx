import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  LogOut,
  UserRound,
  Settings2,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditMeter, StatusChip } from "@/features/shared/primitives";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";
import { useScope, type Project } from "./scope";
import { comingSoon } from "@/features/shared/coming-soon";

export type ScopeMode = "workspace" | "project";

/** Breadcrumb item: a plain label or a clickable destination. */
export type Crumb = string | { label: string; to: string };

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

  // In project mode, siblings = other clients (agency only).
  const siblings = isWorkspace ? projects : projects.filter((p) => p.id !== currentProject.id);

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
            {(isWorkspace ? projects : siblings.length ? siblings : projects).map((p) => (
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

          {/* Project-scope: quick-jump to this project's pages */}
          {!isWorkspace ? (
            <div className="mt-1 grid grid-cols-2 gap-0.5 border-t border-line pt-2">
              {[
                { to: "/dashboard", label: "Overview" },
                { to: "/plan", label: "Content Plan" },
                { to: "/editor", label: "Editor" },
                { to: "/analytics", label: "Analytics" },
                { to: "/settings", label: "Settings" },
                ...(currentProject.reviewEnabled ? [{ to: "/review", label: "Review" }] : []),
              ].map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2.5 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          ) : null}

          {/* Agency-only: new client → onboarding on behalf */}
          {role === "agency" ? (
            <Link
              to="/onboarding"
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

/** Crumb separator + items. Items may be plain strings or clickable {label, to}. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
      {items.map((b, i) => {
        const isLast = i === items.length - 1;
        const label = typeof b === "string" ? b : b.label;
        const to = typeof b === "string" ? undefined : b.to;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" strokeWidth={1.5} />}
            {to && !isLast ? (
              <Link to={to} className="rounded px-0.5 transition-colors hover:text-ink-900">
                {label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink-900" : ""}>{label}</span>
            )}
          </span>
        );
      })}
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
  breadcrumb: Crumb[];
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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted-foreground hover:border-ink-700/30 lg:flex"
      >
        <Search className="size-3.5" strokeWidth={1.5} />
        <span>Search…</span>
        <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>
      {open ? <CommandPalette onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function NotificationsButton() {
  return (
    <Link
      to="/review"
      aria-label="Notifications & review queue"
      title="Review queue"
      className="relative grid size-9 place-items-center rounded-lg border border-line bg-surface hover:border-ink-700/30"
    >
      <Bell className="size-4 text-ink-700" strokeWidth={1.5} />
      <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand-700 text-[9px] font-medium text-[color:var(--primary-foreground)] ring-2 ring-paper">
        3
      </span>
    </Link>
  );
}

function ProfileChip() {
  const { role, setRole } = useScope();
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
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1 hover:border-ink-700/30"
      >
        <span className="grid size-7 place-items-center rounded-full bg-brand-100 font-display text-xs text-brand-700">
          EM
        </span>
        <span className="hidden text-xs leading-tight lg:block">
          <span className="block font-medium text-ink-900">Eliza M.</span>
          <span className="block text-muted-foreground">
            {role === "agency" ? "Agency owner" : "Owner"}
          </span>
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-elev-pop">
          <div className="px-2.5 py-2">
            <div className="text-sm font-medium text-ink-900">Eliza Marshall</div>
            <div className="text-xs text-muted-foreground">eliza@acmestudio.co</div>
          </div>
          <div className="border-t border-line py-1">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
            >
              <UserRound className="size-3.5" strokeWidth={1.75} /> Account &amp; profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
            >
              <Settings2 className="size-3.5" strokeWidth={1.75} /> Workspace settings
            </Link>
          </div>
          <div className="border-t border-line py-1">
            <button
              onClick={() => {
                setRole(role === "agency" ? "business" : "agency");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-surface-sunken"
            >
              <span>Demo role</span>
              <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-medium text-ink-900">
                {role}
              </span>
            </button>
            <button
              onClick={() => {
                comingSoon("Sign out");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
            >
              <LogOut className="size-3.5" strokeWidth={1.75} /> Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ──────────── ⌘K Command Palette ──────────── */

type PaletteItem = { label: string; hint?: string; to: string; group: string };

function CommandPalette({ onClose }: { onClose: () => void }) {
  const { projects, role, setCurrentProjectId } = useScope();
  const router = useRouter();
  const [q, setQ] = useState("");

  const items = useMemo<PaletteItem[]>(() => {
    const base: PaletteItem[] = [
      { label: "Overview", to: "/dashboard", group: "Project" },
      { label: "Content Plan", to: "/plan", group: "Project" },
      { label: "Product Studio", to: "/studio", group: "Project" },
      { label: "Editor", to: "/editor", group: "Project" },
      { label: "Review queue", to: "/review", group: "Project" },
      { label: "Analytics", to: "/analytics", group: "Project" },
      { label: "Project settings", to: "/settings", group: "Project" },
    ];
    if (role === "agency") {
      base.push(
        { label: "Client console", to: "/clients", group: "Workspace" },
        { label: "Team & roles", to: "/team", group: "Workspace" },
        { label: "Brand kit / White-label", to: "/brand-kit", group: "Workspace" },
        { label: "Marketplace", to: "/marketplace", group: "Workspace" },
        { label: "Billing & shared credits", to: "/billing", group: "Workspace" },
        { label: "Partner program", to: "/partner", group: "Workspace" },
        { label: "New client (onboarding)", to: "/onboarding", group: "Workspace" },
      );
    } else {
      base.push({ label: "Billing & credits", to: "/settings", group: "Workspace" });
    }
    return base;
  }, [role]);

  const filter = q.trim().toLowerCase();
  const filteredItems = filter
    ? items.filter((i) => i.label.toLowerCase().includes(filter))
    : items;
  const filteredClients = filter
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(filter) || p.domain.toLowerCase().includes(filter),
      )
    : projects;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink-900/40 px-4 pt-24 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a page or client…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredClients.length ? (
            <Group label="Clients">
              {filteredClients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentProjectId(p.id);
                    onClose();
                    router.navigate({ to: "/dashboard" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-700 hover:bg-surface-sunken"
                >
                  <span className="grid size-6 place-items-center rounded bg-brand-100 font-display text-[11px] text-brand-700">
                    {p.initials}
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="font-mono-num truncate text-[10px] text-muted-foreground">
                    {p.domain}
                  </span>
                  <CornerDownLeft className="size-3 text-muted-foreground" strokeWidth={1.75} />
                </button>
              ))}
            </Group>
          ) : null}

          {(["Project", "Workspace"] as const).map((g) => {
            const rows = filteredItems.filter((i) => i.group === g);
            if (!rows.length) return null;
            return (
              <Group key={g} label={g}>
                {rows.map((r) => (
                  <Link
                    key={r.to + r.label}
                    to={r.to}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-700 hover:bg-surface-sunken"
                  >
                    <Sparkles
                      className="size-3.5 text-[color:var(--accent-gold)]"
                      strokeWidth={1.75}
                    />
                    <span className="flex-1 truncate">{r.label}</span>
                    <span className="font-mono-num text-[10px] text-muted-foreground">
                      {r.to}
                    </span>
                  </Link>
                ))}
              </Group>
            );
          })}

          {filter && !filteredItems.length && !filteredClients.length ? (
            <div className="px-5 py-6 text-center text-xs text-muted-foreground">
              No matches for "{q}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-2 py-1.5">
      <div className="px-2 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/** Derive the active sidebar id from the current pathname. */
export function useActiveFromRoute<T extends string>(
  map: Record<string, T>,
  fallback: T,
): T {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hit = Object.entries(map).find(([prefix]) => pathname.startsWith(prefix));
  return (hit?.[1] ?? fallback) as T;
}

/**
 * Credits meter pill — clickable popover. Only project shell uses this in the top-right cluster
 * (workspace shell shows shared credits inside its Billing screen instead, but we still render
 * a compact meter so the chrome reads as one product).
 */
export function CreditsPill({
  showStatus = true,
  mode = "project",
}: {
  showStatus?: boolean;
  /** Where the "manage" link goes — project Settings · Plan & credits, or Workspace Billing. */
  mode?: ScopeMode;
}) {
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
            <Link
              to={mode === "workspace" ? "/billing" : "/settings"}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg bg-ink-900 px-3 py-2 text-xs text-paper hover:bg-ink-700"
            >
              <span>
                {mode === "workspace" ? "Manage shared pool" : "Open Plan & credits"}
              </span>
              <ChevronRight className="size-3.5" strokeWidth={1.75} />
            </Link>
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
      activeOptions={{ exact: false }}
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