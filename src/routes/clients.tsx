import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useScope, type Project } from "@/features/shell/scope";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Client console — Postics" }] }),
  component: ClientsPage,
});

type ClientMeta = {
  plan: string;
  status: "live" | "preview";
  pipeline: { idea: number; draft: number; review: number; approved: number; published: number };
  mrr: number;
  margin: number;
  attention: number;
  traffic: string;
};

const META: Record<string, ClientMeta> = {
  "vellum-bean": {
    plan: "Growth",
    status: "live",
    pipeline: { idea: 4, draft: 3, review: 2, approved: 1, published: 14 },
    mrr: 449, margin: 38, attention: 2, traffic: "12.4k",
  },
  "northwind-tea": {
    plan: "Advanced",
    status: "live",
    pipeline: { idea: 6, draft: 5, review: 1, approved: 3, published: 22 },
    mrr: 899, margin: 42, attention: 0, traffic: "18.1k",
  },
  "linden-mercantile": {
    plan: "Premium",
    status: "live",
    pipeline: { idea: 9, draft: 8, review: 4, approved: 2, published: 38 },
    mrr: 999, margin: 46, attention: 4, traffic: "14.6k",
  },
  "old-mill-roasters": {
    plan: "Starter",
    status: "preview",
    pipeline: { idea: 2, draft: 1, review: 0, approved: 0, published: 0 },
    mrr: 199, margin: 28, attention: 1, traffic: "3.1k",
  },
};

function ClientsPage() {
  const { projects, setCurrentProjectId, credits } = useScope();
  const enriched = projects.map((p) => ({ ...p, ...(META[p.id] ?? META["vellum-bean"]) }));
  const totalAttention = enriched.reduce((a, c) => a + c.attention, 0);
  const awaiting = enriched.reduce((a, c) => a + c.pipeline.review, 0);
  const inProgress = enriched.reduce((a, c) => a + c.pipeline.draft + c.pipeline.idea, 0);
  const poolPct = Math.round((credits.used / credits.total) * 100);

  return (
    <WorkspaceShell active="clients" breadcrumb={["Clients"]}>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-8">
        {/* Header */}
        <header className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Agency · Acme Studio
            </div>
            <h1 className="font-display text-3xl text-ink-900">Client console</h1>
            <p className="text-sm text-muted-foreground">
              {enriched.length} client projects · {totalAttention} items need attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
              Bulk operations
            </button>
            <Link
              to="/onboarding"
              className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700"
            >
              <Plus className="size-3.5" strokeWidth={1.75} /> New client project
            </Link>
          </div>
        </header>

        {/* Assistant line */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-gradient-to-br from-brand-100/60 to-surface px-5 py-4 text-sm">
          <div className="flex items-center gap-3 text-ink-900">
            <div className="grid size-8 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
              <Wand2 className="size-4" strokeWidth={1.5} />
            </div>
            <span>
              <span className="font-medium">{awaiting} articles</span> awaiting approval across{" "}
              <span className="font-medium">
                {enriched.filter((c) => c.pipeline.review > 0).length} clients
              </span>{" "}
              — review now?
            </span>
          </div>
          <Link
            to="/review"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30"
          >
            Open cross-client review
          </Link>
        </div>

        {/* Aggregates */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Agg label="Projects" value={String(enriched.length)} />
          <Agg label="In progress" value={String(inProgress)} />
          <Agg label="Awaiting approval" value={String(awaiting)} tone="warn" />
          <Agg label="Total traffic" value="48.2k" delta="+12%" />
          <Agg label="Blended margin" value="39%" gold />
          <Agg label="Credit pool" value={`${poolPct}%`} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" strokeWidth={1.5} />
            <input
              placeholder="Search clients, domains…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
            <Filter className="size-3.5" strokeWidth={1.5} /> Status
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
            <Users className="size-3.5" strokeWidth={1.5} /> Assign from pool
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {enriched.map((c) => (
            <ClientCard
              key={c.id}
              project={c}
              meta={c}
              onPick={() => setCurrentProjectId(c.id)}
            />
          ))}
        </div>

        {/* Shared credit pool */}
        <Card className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-surface-sunken">
              <TrendingUp className="size-4 text-ink-700" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-medium text-ink-900">Shared credit pool</div>
              <div className="text-xs text-muted-foreground">
                <span className="font-mono-num">{credits.used.toLocaleString()}</span> /{" "}
                <span className="font-mono-num">{credits.total.toLocaleString()}</span> used ·
                allocates dynamically across clients
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cn("h-full", poolPct >= 90 ? "bg-[color:var(--warn)]" : "bg-brand-700")}
                style={{ width: `${Math.min(poolPct, 100)}%` }}
              />
            </div>
            <Link
              to="/billing"
              className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs text-paper hover:bg-ink-700"
            >
              Allocate
            </Link>
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

function ClientCard({
  project,
  meta,
  onPick,
}: {
  project: Project;
  meta: ClientMeta;
  onPick: () => void;
}) {
  return (
    <Link to="/dashboard" onClick={onPick} className="group block">
      <Card className="p-5 transition-colors hover:border-ink-700/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-brand-100 font-display text-base text-brand-700">
              {project.initials}
            </div>
            <div>
              <div className="font-display text-lg text-ink-900">{project.name}</div>
              <div className="font-mono-num text-xs text-muted-foreground">{project.domain}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {meta.attention > 0 ? (
              <StatusChip tone="warn">
                <AlertTriangle className="size-2.5" strokeWidth={2} /> {meta.attention} attn
              </StatusChip>
            ) : null}
            <StatusChip tone={meta.status}>
              {meta.status === "live" ? "Live" : "Preview"}
            </StatusChip>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mt-4 border-t border-line pt-4">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Pipeline</span>
            <span>Idea → Published</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            <Stage label="Idea" value={meta.pipeline.idea} />
            <Stage label="Draft" value={meta.pipeline.draft} />
            <Stage label="Review" value={meta.pipeline.review} warn />
            <Stage label="Apprv" value={meta.pipeline.approved} />
            <Stage label="Pub" value={meta.pipeline.published} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <div className="flex items-center gap-4 text-xs">
            <Meta label="Plan" value={meta.plan} />
            <Meta label="MRR" value={`$${meta.mrr}`} mono />
            <Meta label="Margin" value={`${meta.margin}%`} gold />
            <Meta label="Traffic" value={meta.traffic} mono />
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-ink-900">
            Open <ChevronRight className="size-3.5" strokeWidth={1.5} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Stage({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface px-1.5 py-1 text-center",
        warn && value > 0 && "border-[color:var(--warn-soft)] bg-[color:var(--warn-soft)]/30",
      )}
    >
      <div className="font-mono-num text-sm text-ink-900">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Meta({
  label,
  value,
  mono,
  gold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  gold?: boolean;
}) {
  return (
    <div>
      <div className="uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          mono && "font-mono-num",
          gold ? "text-[color:var(--accent-gold)]" : "text-ink-900",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Agg({
  label,
  value,
  delta,
  tone,
  gold,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "warn";
  gold?: boolean;
}) {
  return (
    <Card className={cn("p-4", gold && "border-[color:var(--accent-gold-soft)]")}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono-num text-2xl",
            gold ? "text-[color:var(--accent-gold)]" : "text-ink-900",
          )}
        >
          {value}
        </span>
        {delta ? <span className="text-xs text-brand-700">{delta}</span> : null}
        {tone === "warn" ? <StatusChip tone="warn">attn</StatusChip> : null}
      </div>
    </Card>
  );
}