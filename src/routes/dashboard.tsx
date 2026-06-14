import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  Globe2,
  BarChart3,
  CreditCard,
  Bell,
  ChevronDown,
  Plus,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Settings2,
  ChevronRight,
  Sparkle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrowserFrame, Card, CreditMeter, StatusChip, SectionTitle } from "@/features/shared/primitives";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Vellum & Bean — Postics" },
      { name: "description", content: "Project dashboard." },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, active: true },
  { id: "plan", label: "Content Plan", icon: CalendarDays, badge: 4 },
  { id: "editor", label: "Editor", icon: PenLine },
  { id: "site", label: "Site", icon: Globe2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "billing", label: "Billing & Credits", icon: CreditCard },
];

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-paper">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-8 py-8">
          <DashboardBody />
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width]",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
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
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV.map((n) => (
          <a
            key={n.id}
            href="#"
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              n.active
                ? "bg-brand-100 text-brand-700"
                : "text-ink-700 hover:bg-surface-sunken",
            )}
          >
            {n.active && (
              <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-700" />
            )}
            <n.icon className="size-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="flex-1 truncate">{n.label}</span>}
            {!collapsed && n.badge ? (
              <span className="font-mono-num rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-ink-700 ring-1 ring-line">
                {n.badge}
              </span>
            ) : null}
          </a>
        ))}
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

function TopBar() {
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
        <Link to="/dashboard" className="hover:text-ink-900">Projects</Link>
        <ChevronRight className="size-3.5" strokeWidth={1.5} />
        <span className="text-ink-900">Vellum & Bean</span>
        <ChevronRight className="size-3.5" strokeWidth={1.5} />
        <span>Overview</span>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="size-3.5" strokeWidth={1.5} />
          <span>Search articles, topics…</span>
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

function DashboardBody() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-8 animate-rise">
      {/* Project header */}
      <section className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusChip tone="live">Live</StatusChip>
            <StatusChip tone="preview">Preview · noindex</StatusChip>
            <StatusChip tone="gold">Pro plan</StatusChip>
          </div>
          <h1 className="font-display text-4xl leading-tight text-ink-900">Vellum & Bean</h1>
          <a
            href="https://vellumandbean.postics.site"
            className="font-mono-num inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink-900"
          >
            vellumandbean.postics.site <ExternalLink className="size-3.5" strokeWidth={1.5} />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/" className="postics-btn-ghost">
            <Sparkle className="size-4" strokeWidth={1.5} /> Re-run onboarding
          </Link>
          <button className="postics-btn-secondary">
            <Globe2 className="size-4" strokeWidth={1.5} /> Open site
          </button>
          <button className="postics-btn-primary">
            <Plus className="size-4" strokeWidth={1.75} /> New article
          </button>
        </div>
      </section>

      {/* Status strip */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Site health"
          value="All systems normal"
          tone="success"
          icon={<CheckCircle2 className="size-4" strokeWidth={1.5} />}
          foot="Last check 4 min ago"
        />
        <Card className="p-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Credits
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-num text-2xl text-ink-900">3,240</span>
            <span className="font-mono-num text-sm text-muted-foreground">/ 10,000</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full w-[32%] rounded-full bg-brand-700" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Resets in 12 days</div>
        </Card>
        <StatCard
          label="Plan"
          value="Pro · Monthly"
          icon={<CreditCard className="size-4" strokeWidth={1.5} />}
          foot="Renews Jul 14"
        />
        <StatCard
          label="Next scheduled post"
          value="Tue, 10:00 — Decaf, reconsidered"
          icon={<Clock className="size-4" strokeWidth={1.5} />}
          foot="Queued · auto-publish"
        />
      </section>

      {/* Attention */}
      <section className="space-y-3">
        <SectionTitle
          eyebrow="Needs your attention"
          title="3 items"
          hint="Approve, review, or retry — each opens directly where you need to be."
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <AttentionCard
            tone="warn"
            icon={<Clock className="size-4" strokeWidth={1.5} />}
            count={2}
            title="awaiting approval"
            blurb="Two drafts ready: Roast curves explained · Cupping protocol."
            cta="Review drafts"
          />
          <AttentionCard
            tone="info"
            icon={<PenLine className="size-4" strokeWidth={1.5} />}
            count={1}
            title="in human-review"
            blurb="Editor passed notes on Wholesale price sheet. Light revisions."
            cta="Open in editor"
          />
          <AttentionCard
            tone="danger"
            icon={<AlertTriangle className="size-4" strokeWidth={1.5} />}
            count={1}
            title="failed to publish"
            blurb="Filter vs. pressure — image CDN timed out. Safe to retry."
            cta="Retry publish"
          />
        </div>
      </section>

      {/* Pipeline + metrics */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Pipeline
              </div>
              <h3 className="mt-1 font-display text-xl text-ink-900">This week</h3>
            </div>
            <button className="postics-btn-ghost text-xs">Open full board →</button>
          </div>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {[
              ["Idea", 8],
              ["Draft", 4],
              ["Review", 2],
              ["Approved", 3],
              ["Published", 11],
            ].map(([label, n], i) => (
              <div
                key={label as string}
                className="rounded-lg border border-line bg-surface-sunken/40 p-3"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="font-mono-num mt-1 text-2xl text-ink-900">{n}</div>
                <div className="mt-2 space-y-1">
                  {Array.from({ length: Math.min(3, n as number) }).map((_, j) => (
                    <div
                      key={j}
                      className={cn(
                        "h-1.5 rounded",
                        i === 4 ? "bg-brand-700/70" : "bg-ink-900/15",
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Traffic · 30d
                </div>
                <div className="font-mono-num mt-1 text-2xl text-ink-900">2,847</div>
              </div>
              <span className="text-xs text-[color:var(--success)]">+18.2%</span>
            </div>
            <Sparkline color="var(--color-brand-700)" />
          </Card>
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Avg. position
                </div>
                <div className="font-mono-num mt-1 text-2xl text-ink-900">12.4</div>
              </div>
              <span className="text-xs text-[color:var(--success)]">↑ 3.1</span>
            </div>
            <Sparkline color="var(--color-accent-gold)" inverted />
          </Card>
        </div>
      </section>

      {/* Activity + preview */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Recent activity
              </div>
              <h3 className="mt-1 font-display text-xl text-ink-900">Last 48 hours</h3>
            </div>
            <button className="postics-btn-ghost text-xs">All activity →</button>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3.5">
                <span
                  className={cn(
                    "mt-0.5 grid size-7 place-items-center rounded-full",
                    a.tone === "publish" && "bg-brand-100 text-brand-700",
                    a.tone === "edit" && "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)]",
                    a.tone === "social" && "bg-[#E2ECF3] text-[color:var(--info)]",
                  )}
                >
                  <a.icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink-900">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.actor} · <span className="font-mono-num">{a.when}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <BrowserFrame url="https://vellumandbean.postics.site">
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div className="font-display text-sm text-ink-900">Vellum & Bean</div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Journal</span><span>Wholesale</span><span>Shop</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  Featured essay
                </div>
                <div className="mt-1 font-display text-lg leading-snug text-ink-900">
                  On provenance, patience, and the quiet economics of small-batch coffee.
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="space-y-1.5">
                    <div className="aspect-[4/3] rounded bg-surface-sunken" />
                    <div className="h-1.5 w-3/4 rounded bg-ink-900/20" />
                    <div className="h-1.5 w-1/2 rounded bg-ink-900/10" />
                  </div>
                ))}
              </div>
            </div>
          </BrowserFrame>

          <Card className="flex items-start gap-3 border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30 p-4">
            <Sparkle className="mt-0.5 size-4 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
            <div className="flex-1 text-sm text-ink-700">
              You're at 32% of monthly credits.{" "}
              <span className="text-muted-foreground">
                Upgrade for unlimited drafts and priority generation.
              </span>
            </div>
            <button className="postics-btn-secondary text-xs">View plans</button>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
  foot,
}: {
  label: string;
  value: string;
  tone?: "success";
  icon?: React.ReactNode;
  foot?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        {icon ? (
          <span
            className={cn(
              "grid size-7 place-items-center rounded-md border border-line bg-surface text-muted-foreground",
              tone === "success" && "text-[color:var(--success)]",
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="mt-3 text-base font-medium text-ink-900">{value}</div>
      {foot && <div className="mt-2 text-xs text-muted-foreground">{foot}</div>}
    </Card>
  );
}

function AttentionCard({
  tone,
  icon,
  count,
  title,
  blurb,
  cta,
}: {
  tone: "warn" | "danger" | "info";
  icon: React.ReactNode;
  count: number;
  title: string;
  blurb: string;
  cta: string;
}) {
  const ring =
    tone === "danger"
      ? "border-[#F1D2CE] bg-[#F7E2DF]/30"
      : tone === "warn"
      ? "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30"
      : "border-[#D2DFE9] bg-[#E2ECF3]/40";
  const iconBg =
    tone === "danger"
      ? "bg-[#F7E2DF] text-[color:var(--danger)]"
      : tone === "warn"
      ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)]"
      : "bg-[#E2ECF3] text-[color:var(--info)]";
  return (
    <Card className={cn("p-5", ring)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 place-items-center rounded-lg", iconBg)}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-base text-ink-900">
            <span className="font-mono-num">{count}</span> {title}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
        </div>
      </div>
      <button className="mt-4 text-sm font-medium text-brand-700 hover:text-brand-500">
        {cta} →
      </button>
    </Card>
  );
}

function Sparkline({ color, inverted }: { color: string; inverted?: boolean }) {
  const pts = inverted
    ? [30, 28, 26, 24, 22, 21, 19, 18, 16, 15, 12]
    : [6, 9, 8, 12, 11, 15, 14, 18, 21, 20, 26];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 240;
  const h = 60;
  const step = w / (pts.length - 1);
  const path = pts
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-12 w-full">
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} opacity="0.08" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const ACTIVITY = [
  {
    id: 1,
    tone: "publish" as const,
    icon: CheckCircle2,
    title: "Published “How we cup: a working roaster's tasting protocol”",
    actor: "Auto-publish",
    when: "12 min ago",
  },
  {
    id: 2,
    tone: "edit" as const,
    icon: PenLine,
    title: "Eliza edited intro of “Decaf, reconsidered”",
    actor: "Eliza M.",
    when: "1h 24m ago",
  },
  {
    id: 3,
    tone: "social" as const,
    icon: Globe2,
    title: "Posted thread on X linking to the journal",
    actor: "Social agent",
    when: "3h ago",
  },
  {
    id: 4,
    tone: "publish" as const,
    icon: CheckCircle2,
    title: "Approved 2 drafts for next week's schedule",
    actor: "Eliza M.",
    when: "Yesterday",
  },
  {
    id: 5,
    tone: "edit" as const,
    icon: PenLine,
    title: "Regenerated hero image for Wholesale page",
    actor: "Design agent",
    when: "Yesterday",
  },
];