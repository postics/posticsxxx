import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  DollarSign,
  ShieldAlert,
  ListTree,
  HeartPulse,
  Building2,
  Layers,
  Cog,
  Search,
  ChevronRight,
  CornerDownLeft,
  LogOut,
  Lock,
  AlertTriangle,
  Bug,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";
import { useAdmin, useAdminRole, formatRemaining, PLATFORM_ONLY_PATHS } from "./AdminContext";
import { ADMIN_ORGS } from "./mock-data";

type NavId =
  | "cockpit"
  | "cost"
  | "margin"
  | "pipeline"
  | "health"
  | "orgs"
  | "segments"
  | "build";

type NavItem = {
  id: NavId;
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  platformOnly?: boolean;
};

type NavGroup = { id: string; label: string; items: NavItem[]; platformOnly?: boolean };

const GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ id: "cockpit", label: "Cockpit", to: "/admin", icon: LayoutDashboard }],
  },
  {
    id: "money",
    label: "Money",
    platformOnly: true,
    items: [
      { id: "cost", label: "Unit-economics & cost", to: "/admin/cost", icon: DollarSign, platformOnly: true },
      { id: "margin", label: "Video & margin guards", to: "/admin/margin-guards", icon: ShieldAlert, platformOnly: true },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "pipeline", label: "Pipeline & quality", to: "/admin/pipeline", icon: ListTree },
      { id: "health", label: "Healthcheck", to: "/admin/health", icon: HeartPulse },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { id: "orgs", label: "Orgs & activation", to: "/admin/orgs", icon: Building2 },
      { id: "segments", label: "Segmentation", to: "/admin/segments", icon: Layers },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    platformOnly: true,
    items: [{ id: "build", label: "Project build-status", to: "/admin/build", icon: Cog, platformOnly: true }],
  },
];

function activeIdFor(pathname: string): NavId {
  if (pathname.startsWith("/admin/cost")) return "cost";
  if (pathname.startsWith("/admin/margin-guards")) return "margin";
  if (pathname.startsWith("/admin/pipeline")) return "pipeline";
  if (pathname.startsWith("/admin/health")) return "health";
  if (pathname.startsWith("/admin/orgs")) return "orgs";
  if (pathname.startsWith("/admin/segments")) return "segments";
  if (pathname.startsWith("/admin/build")) return "build";
  return "cockpit";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { impersonation, stopImpersonation, stubMode, session } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = activeIdFor(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const readOnly = !!impersonation;
  const role = useAdminRole();
  const isPlatform = role === "platform";

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink-700" data-admin-readonly={readOnly}>
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width]",
          collapsed ? "w-[64px]" : "w-[232px]",
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-3">
          <Link to="/admin" className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-md bg-ink-900 text-paper">
              <span className="font-display text-[13px] leading-none">P</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate font-display text-sm text-ink-900">Postics.io</div>
                <div className="font-mono-num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Admin
                </div>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
          {GROUPS.map((g) => (
            <div key={g.id}>
              {!collapsed ? (
                <div className="font-mono-num px-2.5 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {g.label}
                </div>
              ) : null}
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === active;
                  const locked = !!item.platformOnly && !isPlatform;
                  if (locked) {
                    return (
                      <div
                        key={item.id}
                        title="Platform-only — visible to Postics staff."
                        aria-disabled="true"
                        className="group relative flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground/70"
                      >
                        <Icon className="size-4 shrink-0 opacity-60" strokeWidth={1.5} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            <span className="font-mono-num inline-flex items-center gap-1 rounded border border-line bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.12em]">
                              <Lock className="size-2.5" strokeWidth={1.75} /> P-only
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                        isActive
                          ? "bg-brand-100 text-brand-700"
                          : "text-ink-700 hover:bg-surface-sunken",
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-700" />
                      )}
                      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-sunken"
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform", collapsed ? "" : "rotate-180")}
              strokeWidth={1.5}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />

        {/* Banners stack */}
        {stubMode && isPlatform ? <StubBanner /> : null}
        {impersonation ? (
          <ImpersonationBanner
            orgName={impersonation.orgName}
            staff={session?.email ?? "staff"}
            expiresAt={impersonation.expiresAt}
            onExit={stopImpersonation}
          />
        ) : null}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Page header + body wrapper used inside each /admin/* route. */
export function AdminPage({
  title,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  breadcrumb?: string[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="border-b border-line bg-paper px-6 py-4 md:px-8">
        <div className="font-mono-num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {(breadcrumb ?? ["Admin"]).join(" / ")}
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-display text-2xl text-ink-900">{title}</h1>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
      <div className="px-6 py-6 md:px-8">{children}</div>
    </>
  );
}

// Backwards-compat: PLATFORM_ONLY_PATHS re-export for callers importing from the shell.
export { PLATFORM_ONLY_PATHS };

/* ---------- top bar ---------- */
function AdminTopBar() {
  const { session, signOut } = useAdmin();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur md:px-6">
      {/* Omnibox trigger */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-left text-sm text-muted-foreground transition-colors hover:border-ink-700/30 md:max-w-[520px]"
      >
        <Search className="size-3.5" strokeWidth={1.5} />
        <span className="truncate">
          Search org · email · domain · job id · asset_uid
        </span>
        <kbd className="font-mono-num ml-auto rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <RoleBadge />
        <LanguageButton />
        <ThemeToggle />
        <StaffIdentityChip email={session?.email ?? "staff@postics.io"} onSignOut={signOut} />
      </div>

      {paletteOpen ? <Omnibox onClose={() => setPaletteOpen(false)} /> : null}
    </header>
  );
}

function RoleBadge() {
  const { session } = useAdmin();
  if (!session) return null;
  const isPlatform = session.role === "platform";
  return (
    <span
      className={cn(
        "font-mono-num inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] uppercase tracking-[0.14em]",
        isPlatform
          ? "border-brand-700/30 bg-brand-100 text-brand-700"
          : "border-line bg-surface-sunken text-muted-foreground",
      )}
      title={isPlatform ? "Cross-tenant operator" : `Scoped to ${session.agencyName ?? "your agency"}`}
    >
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {isPlatform ? "Platform-admin" : `Agency-admin · ${session.agencyName ?? "—"}`}
    </span>
  );
}

function StaffIdentityChip({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = email
    .split("@")[0]
    .split(/[._-]/)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1 hover:border-ink-700/30"
      >
        <span className="grid size-7 place-items-center rounded-md bg-brand-100 font-display text-[11px] text-brand-700">
          {initials || "ST"}
        </span>
        <span className="hidden text-left text-xs leading-tight md:block">
          <span className="block max-w-[160px] truncate font-medium text-ink-900">{email}</span>
          <span className="font-mono-num flex items-center gap-1 text-[10px] text-[color:var(--success,#3C7D5C)]">
            <CheckCircle2 className="size-3" strokeWidth={2} /> MFA ✓
          </span>
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-60 overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-elev-pop">
          <div className="px-2.5 py-2 text-xs">
            <div className="font-medium text-ink-900">{email}</div>
            <div className="font-mono-num mt-0.5 text-[10px] text-muted-foreground">MFA verified · session 24h</div>
          </div>
          <button
            onClick={() => {
              onSignOut();
              navigate({ to: "/admin/login" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- banners ---------- */
function StubBanner() {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-[color:var(--accent-gold-soft,#F5EBD8)]/70 px-6 py-2 text-[12px] text-ink-700 md:px-8">
      <span
        aria-hidden
        className="inline-block size-2 rounded-full"
        style={{ backgroundColor: "var(--warning, #B07B2C)" }}
      />
      <AlertTriangle className="size-3.5 text-[color:var(--warning,#B07B2C)]" strokeWidth={1.75} />
      <span>
        <strong className="font-medium text-ink-900">AI Gateway: STUB</strong> — no Anthropic key,
        generations cost ~$0, content is placeholder. Margin thesis unverifiable until the key is live.
      </span>
      <Link
        to="/admin/build"
        className="font-mono-num ml-auto rounded-md border border-line bg-surface px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-ink-700 hover:bg-surface-sunken"
      >
        Flip stub → real
      </Link>
    </div>
  );
}

function ImpersonationBanner({
  orgName,
  staff,
  expiresAt,
  onExit,
}: {
  orgName: string;
  staff: string;
  expiresAt: number;
  onExit: () => void;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      className="flex items-center gap-2.5 border-b border-line px-6 py-2 text-[12px] text-paper md:px-8"
      style={{ backgroundColor: "var(--danger, #A6453C)" }}
    >
      <Lock className="size-3.5" strokeWidth={1.75} />
      <span>
        VIEWING AS <strong className="font-medium">{orgName}</strong> — READ-ONLY ·{" "}
        <span className="font-mono-num">{formatRemaining(expiresAt)}</span> left · you are{" "}
        <span className="font-medium">{staff}</span>
      </span>
      <button
        onClick={onExit}
        className="font-mono-num ml-auto rounded-md border border-paper/40 bg-paper/10 px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-paper/20"
      >
        End session
      </button>
    </div>
  );
}

/* ---------- omnibox ---------- */
function Omnibox({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filter = q.trim().toLowerCase();
  const orgs = useMemo(
    () =>
      ADMIN_ORGS.filter((o) =>
        !filter
          ? true
          : [o.name, o.domain, o.ownerEmail, o.stripeCustomerId, o.id]
              .join(" ")
              .toLowerCase()
              .includes(filter),
      ).slice(0, 6),
    [filter],
  );

  const pages: { label: string; to: string }[] = [
    { label: "Cockpit", to: "/admin" },
    { label: "Unit-economics & cost", to: "/admin/cost" },
    { label: "Video & margin guards", to: "/admin/margin-guards" },
    { label: "Pipeline & quality", to: "/admin/pipeline" },
    { label: "Healthcheck", to: "/admin/health" },
    { label: "Orgs & activation", to: "/admin/orgs" },
    { label: "Segmentation", to: "/admin/segments" },
    { label: "Project build-status", to: "/admin/build" },
  ].filter((p) => (!filter ? true : p.label.toLowerCase().includes(filter)));

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
            placeholder="Search org · email · domain · job id · asset_uid"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] text-muted-foreground">esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {orgs.length ? (
            <PaletteGroup label="Orgs">
              {orgs.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    onClose();
                    navigate({ to: "/admin/orgs" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-700 hover:bg-surface-sunken"
                >
                  <span className="grid size-6 place-items-center rounded bg-brand-100 font-display text-[11px] text-brand-700">
                    {o.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate">{o.name}</span>
                  <span className="font-mono-num truncate text-[10px] text-muted-foreground">{o.domain}</span>
                  <CornerDownLeft className="size-3 text-muted-foreground" strokeWidth={1.75} />
                </button>
              ))}
            </PaletteGroup>
          ) : null}

          {pages.length ? (
            <PaletteGroup label="Pages">
              {pages.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-700 hover:bg-surface-sunken"
                >
                  <Bug className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <span className="flex-1 truncate">{p.label}</span>
                  <span className="font-mono-num text-[10px] text-muted-foreground">{p.to}</span>
                </Link>
              ))}
            </PaletteGroup>
          ) : null}

          {!orgs.length && !pages.length ? (
            <div className="px-5 py-6 text-center text-xs text-muted-foreground">No matches for "{q}"</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PaletteGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-2 py-1.5">
      <div className="font-mono-num px-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}