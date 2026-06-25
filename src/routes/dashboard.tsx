import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  ArrowRight,
  AlertTriangle,
  Download,
  Plug,
  RefreshCcw,
  Lock,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, StatusChip, SectionTitle } from "@/features/shared/primitives";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Northbound Coffee Roasters — Postics" },
      { name: "description", content: "Generate-first project overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <ProjectShell breadcrumb={["Overview"]}>
      <div className="px-8 py-8">
        <DashboardBody />
      </div>
    </ProjectShell>
  );
}

// ---------------- body ----------------

function DashboardBody() {
  const { currentProject } = useScope();
  const [connected, setConnected] = useState(false);
  // Empty-state toggle: flip to true to preview the zero state.
  const isEmpty = false;

  // Mock counts.
  const counts = {
    generated: 184,
    ready: 12,
    exported: 47,
    published: connected ? 38 : 0,
    draft: 6,
    generating: 2,
    failed: 3,
    weekGenerated: 18,
    weekReady: 9,
    failedGen: 2,
    failedGate: 1,
    failedPublish: connected ? 1 : 0,
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 animate-rise">
      <StoreHeader connected={connected} setConnected={setConnected} projectName={currentProject.name} />

      {isEmpty ? (
        <EmptyHero />
      ) : (
        <HeroContent counts={counts} connected={connected} />
      )}

      <CycleStrip counts={counts} connected={connected} />

      <AttentionSection counts={counts} connected={connected} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <MiniKanban counts={counts} connected={connected} />
        <NorthStar counts={counts} />
      </div>

      <LowCreditsBanner />
    </div>
  );
}

// ---------------- store header ----------------

function StoreHeader({
  connected,
  setConnected,
  projectName,
}: {
  connected: boolean;
  setConnected: (v: boolean) => void;
  projectName: string;
}) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <StatusChip tone="live">Connected</StatusChip>
          ) : (
            <StatusChip tone="neutral">Not connected — export mode</StatusChip>
          )}
          <StatusChip tone="gold">Growth · monthly</StatusChip>
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-700">
            EN
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-700">
            ES
          </span>
        </div>
        <h1 className="font-display text-4xl leading-tight text-ink-900">{projectName}</h1>
        {connected ? (
          <div className="font-mono-num text-sm text-muted-foreground">northboundcoffee.com</div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Your site isn't connected yet — Postics works as a content generator and ships to export.
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setConnected(!connected)}
          className="postics-btn-ghost text-xs"
          aria-label="Toggle demo connection state"
          title="Demo toggle"
        >
          <RefreshCcw className="size-3.5" strokeWidth={1.5} />
          Demo: {connected ? "connected" : "export-only"}
        </button>
        {!connected && (
          <Link to="/settings" className="postics-btn-secondary">
            <Plug className="size-4" strokeWidth={1.5} /> Connect store
          </Link>
        )}
        <Link to="/plan" className="postics-btn-primary">
          <Plus className="size-4" strokeWidth={1.75} /> Generate next
        </Link>
      </div>
    </section>
  );
}

// ---------------- hero ----------------

function HeroContent({
  counts,
  connected,
}: {
  counts: Record<string, number>;
  connected: boolean;
}) {
  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Your content"
        title="What you've produced"
        hint="Generate-first. Publish only when you connect a store."
      />
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CountTile label="Generated" value={counts.generated} />
          <CountTile label="Ready to export" value={counts.ready} accent />
          <CountTile label="Exported" value={counts.exported} />
          {connected ? (
            <CountTile label="Published" value={counts.published} />
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface-sunken/40 p-4">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <Lock className="size-3" strokeWidth={1.75} /> Published
              </div>
              <div className="font-mono-num mt-1 text-2xl text-muted-foreground/60">—</div>
              <div className="mt-2 text-xs text-muted-foreground">Connect to enable</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
          <Link to="/plan" className="postics-btn-primary">
            <Plus className="size-4" strokeWidth={1.75} /> Generate next
          </Link>
          <Link to="/plan" className="postics-btn-secondary">
            <Download className="size-4" strokeWidth={1.5} /> Export ready pieces
            <span className="font-mono-num ml-1 rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] text-ink-700">
              {counts.ready}
            </span>
          </Link>
        </div>

        {connected ? <OutcomesStrip /> : <ConnectUpsell />}
      </Card>
    </section>
  );
}

function CountTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4",
        accent ? "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/20" : "border-line",
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="font-mono-num mt-1 text-3xl text-ink-900">{value}</div>
    </div>
  );
}

function ConnectUpsell() {
  return (
    <div className="mt-5 flex flex-wrap items-start gap-3 rounded-lg border border-dashed border-line bg-surface-sunken/40 p-4">
      <Plug className="mt-0.5 size-4 text-muted-foreground" strokeWidth={1.5} />
      <div className="min-w-0 flex-1 text-sm text-ink-700">
        Connect your site or store to auto-publish & measure outcomes{" "}
        <span className="text-muted-foreground">(optional — Postics works without it).</span>
      </div>
      <Link to="/settings" className="postics-btn-ghost text-xs">
        Connect <ArrowRight className="size-3.5" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function OutcomesStrip() {
  const items = [
    { title: "Decaf, reconsidered", type: "Article" },
    { title: "Filter vs. pressure: a buyer's guide", type: "Article" },
    { title: "Ethiopia Yirgacheffe — product page", type: "Product page" },
  ];
  return (
    <div className="mt-6 space-y-3 border-t border-line pt-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Recently published · outcomes
        </div>
        <Link to="/plan" className="text-xs text-brand-700 hover:text-brand-500">
          Outcomes feed your next Strategy <ArrowRight className="ml-0.5 inline size-3" strokeWidth={1.75} />
        </Link>
      </div>
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {items.map((it) => (
          <li key={it.title} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm text-ink-900">{it.title}</div>
              <div className="font-mono-num text-[11px] uppercase tracking-wide text-muted-foreground">
                {it.type}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" strokeWidth={1.75} />
              collecting — first signals in ~14–30 days
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyHero() {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto max-w-lg space-y-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Your content</div>
        <h2 className="font-display text-2xl text-ink-900">
          Your strategy is ready — generate your first piece
        </h2>
        <p className="text-sm text-muted-foreground">
          Each piece is auto quality-gated and ready to export. Connect a store later to publish.
        </p>
        <div className="flex justify-center pt-2">
          <Link to="/plan" className="postics-btn-primary">
            <Plus className="size-4" strokeWidth={1.75} /> Generate first piece
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ---------------- cycle strip ----------------

function CycleStrip({
  counts,
  connected,
}: {
  counts: Record<string, number>;
  connected: boolean;
}) {
  const steps: Array<{ label: string; count?: number; muted?: boolean; optional?: boolean }> = [
    { label: "Analyze" },
    { label: "Strategy" },
    { label: "Generate", count: counts.generating },
    { label: "Quality-gate (auto)" },
    { label: "Export", count: counts.exported },
    { label: "Publish", count: connected ? counts.published : undefined, muted: !connected, optional: true },
    { label: "Measure", muted: !connected },
  ];
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {steps.map((s, i) => (
          <span key={s.label} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px]",
                s.muted
                  ? "border-dashed border-line bg-surface-sunken/40 text-muted-foreground/70"
                  : "border-line bg-surface text-ink-700",
              )}
            >
              <span className="font-mono-num text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {s.label}
              {s.optional && <span className="text-[10px] text-muted-foreground">· optional</span>}
              {typeof s.count === "number" && (
                <span className="font-mono-num rounded bg-surface-sunken px-1 py-0.5 text-[10px] text-ink-900">
                  {s.count}
                </span>
              )}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="size-3 text-muted-foreground/70" strokeWidth={1.5} />
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

// ---------------- attention ----------------

function AttentionSection({
  counts,
  connected,
}: {
  counts: Record<string, number>;
  connected: boolean;
}) {
  const items: Array<{
    tone: "danger" | "warn";
    icon: React.ReactNode;
    count: number;
    title: string;
    blurb: string;
    cta: string;
  }> = [];
  if (counts.failedGen > 0)
    items.push({
      tone: "danger",
      icon: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      count: counts.failedGen,
      title: "failed to generate",
      blurb: "Model timed out mid-render. Safe to retry — credits are refunded on failure.",
      cta: "Retry generation",
    });
  if (counts.failedGate > 0)
    items.push({
      tone: "warn",
      icon: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      count: counts.failedGate,
      title: "failed quality gate",
      blurb: "Auto-gate flagged thin sourcing. Regenerate with stricter brief or open in editor.",
      cta: "Open items",
    });
  if (connected && counts.failedPublish > 0)
    items.push({
      tone: "danger",
      icon: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      count: counts.failedPublish,
      title: "failed to publish",
      blurb: "Site connector returned 502. Re-handshake or retry the publish.",
      cta: "Retry publish",
    });

  return (
    <section className="space-y-3">
      <SectionTitle
        eyebrow="Needs your attention"
        title={items.length ? `${items.length} stuck item${items.length === 1 ? "" : "s"}` : "Nothing stuck"}
        hint={
          items.length
            ? "Only genuinely blocked items — no approval backlog, no human-review queue."
            : "Keep generating — Postics surfaces only items that actually need you."
        }
      />
      {items.length ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {items.map((it) => (
            <AttentionCard key={it.title} {...it} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-[color:var(--success)]" strokeWidth={1.5} />
          Nothing stuck — keep generating.
        </Card>
      )}
    </section>
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
  tone: "warn" | "danger";
  icon: React.ReactNode;
  count: number;
  title: string;
  blurb: string;
  cta: string;
}) {
  const ring =
    tone === "danger"
      ? "border-[#F1D2CE] bg-[#F7E2DF]/30"
      : "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30";
  const iconBg =
    tone === "danger"
      ? "bg-[#F7E2DF] text-[color:var(--danger)]"
      : "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)]";
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
      <Link to="/plan" className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-500">
        {cta} <ArrowRight className="ml-1 size-3.5" strokeWidth={1.75} />
      </Link>
    </Card>
  );
}

// ---------------- mini kanban ----------------

function MiniKanban({
  counts,
  connected,
}: {
  counts: Record<string, number>;
  connected: boolean;
}) {
  const cols: Array<{ label: string; n: number; tone?: "muted" | "good" | "warn" }> = [
    { label: "Draft", n: counts.draft },
    { label: "Generating", n: counts.generating, tone: "warn" },
    { label: "Ready", n: counts.ready, tone: "good" },
    { label: "Published", n: counts.published, tone: connected ? "good" : "muted" },
    { label: "Failed", n: counts.failed, tone: "warn" },
  ];
  return (
    <Card className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Pipeline</div>
          <h3 className="mt-1 font-display text-xl text-ink-900">This week</h3>
        </div>
        <Link to="/plan" className="postics-btn-ghost text-xs">
          Open full board <ArrowRight className="size-3.5" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-5 gap-3">
        {cols.map((c) => (
          <div
            key={c.label}
            className={cn(
              "rounded-lg border p-3",
              c.tone === "muted"
                ? "border-dashed border-line bg-surface-sunken/30 opacity-70"
                : "border-line bg-surface-sunken/40",
            )}
          >
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{c.label}</div>
            <div
              className={cn(
                "font-mono-num mt-1 text-2xl",
                c.tone === "muted" ? "text-muted-foreground/60" : "text-ink-900",
              )}
            >
              {c.tone === "muted" ? "—" : c.n}
            </div>
            <div className="mt-2 space-y-1">
              {Array.from({ length: Math.min(3, c.n) }).map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    "h-1.5 rounded",
                    c.tone === "good"
                      ? "bg-brand-700/70"
                      : c.tone === "warn"
                      ? "bg-[color:var(--accent-gold)]/60"
                      : "bg-ink-900/15",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!connected && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3" strokeWidth={1.75} />
          Published lane unlocks when a store is connected.
        </div>
      )}
    </Card>
  );
}

// ---------------- north star ----------------

function NorthStar({ counts }: { counts: Record<string, number> }) {
  return (
    <Card className="flex flex-col p-6">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">North star</div>
      <h3 className="mt-1 font-display text-xl text-ink-900">This week</h3>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Generated</div>
          <div className="font-mono-num mt-1 text-3xl text-ink-900">{counts.weekGenerated}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ready</div>
          <div className="font-mono-num mt-1 text-3xl text-ink-900">{counts.weekReady}</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-line bg-surface-sunken/40 p-3">
        <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          adherence — calibrating
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Trend builds after a few cycles. No threshold alerts yet.
        </div>
      </div>

      <div className="mt-auto pt-5">
        <button
          disabled
          className="postics-btn-secondary w-full cursor-not-allowed opacity-60"
          title="Scheduling activates after setup (M1)"
        >
          <Clock className="size-4" strokeWidth={1.5} /> Catch Up
        </button>
        <div className="mt-2 text-center text-[11px] text-muted-foreground">
          Scheduling activates after setup (M1).
        </div>
      </div>
    </Card>
  );
}

// ---------------- low credits ----------------

function LowCreditsBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <Card className="flex items-start gap-3 border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30 p-4">
      <AlertTriangle className="mt-0.5 size-4 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
      <div className="flex-1 text-sm text-ink-700">
        You're at <span className="font-mono-num">32%</span> of monthly credits.{" "}
        <span className="text-muted-foreground">
          Generate-heavy weeks may run short before reset.
        </span>
      </div>
      <Link to="/billing" className="postics-btn-secondary text-xs">
        View plans
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken"
        aria-label="Dismiss"
      >
        <X className="size-3.5" strokeWidth={1.75} />
      </button>
    </Card>
  );
}