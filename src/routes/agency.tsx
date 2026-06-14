import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  AlertTriangle,
  Palette,
  Filter,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/features/shell/AppShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/agency")({ component: AgencyPage });

const CLIENTS = [
  {
    name: "Vellum & Bean",
    initials: "VB",
    domain: "vellumbean.co",
    plan: "Growth",
    status: "live" as const,
    pipeline: { drafting: 3, review: 2, published: 14 },
    mrr: 449,
    margin: 38,
    attention: 2,
  },
  {
    name: "Northwall Roasters",
    initials: "NR",
    domain: "northwall.coffee",
    plan: "Advanced",
    status: "live" as const,
    pipeline: { drafting: 5, review: 1, published: 22 },
    mrr: 899,
    margin: 42,
    attention: 0,
  },
  {
    name: "Cedar & Sumac",
    initials: "CS",
    domain: "cedarsumac.com",
    plan: "Starter",
    status: "preview" as const,
    pipeline: { drafting: 1, review: 0, published: 0 },
    mrr: 199,
    margin: 28,
    attention: 1,
  },
  {
    name: "Quill & Quire Studio",
    initials: "QQ",
    domain: "quillquire.studio",
    plan: "Premium",
    status: "live" as const,
    pipeline: { drafting: 8, review: 4, published: 38 },
    mrr: 999,
    margin: 46,
    attention: 4,
  },
];

function AgencyPage() {
  const totalAttention = CLIENTS.reduce((a, c) => a + c.attention, 0);
  return (
    <AppShell active="agency" breadcrumb={["Workspace", "Agency Console"]}>
      <div className="mx-auto w-full max-w-7xl px-8 py-8 space-y-6">
        <header className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Agency · Acme Studio
            </div>
            <h1 className="font-display text-3xl text-ink-900">Client console</h1>
            <p className="text-sm text-muted-foreground">
              {CLIENTS.length} client projects · {totalAttention} items need attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
              <Palette className="size-3.5" strokeWidth={1.5} /> Brand kit
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700">
              <Plus className="size-3.5" strokeWidth={1.75} /> New client project
            </button>
          </div>
        </header>

        {/* Assistant card */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-gradient-to-br from-brand-100/60 to-surface px-5 py-4 text-sm">
          <div className="flex items-center gap-3 text-ink-900">
            <div className="grid size-8 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
              <Users className="size-4" strokeWidth={1.5} />
            </div>
            <span>
              <span className="font-medium">12 articles</span> awaiting approval across{" "}
              <span className="font-medium">4 clients</span> — review now?
            </span>
          </div>
          <button className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30">
            Open review queue
          </button>
        </div>

        {/* Aggregates */}
        <div className="grid grid-cols-5 gap-3">
          <Agg label="Projects" value={String(CLIENTS.length)} />
          <Agg label="In progress" value="17" />
          <Agg label="Awaiting approval" value="7" tone="warn" />
          <Agg label="Total traffic" value="48.2k" delta="+12%" />
          <Agg label="Margin / take-rate" value="39%" gold />
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
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CLIENTS.map((c) => (
            <Link
              key={c.name}
              to="/dashboard"
              className="group block"
            >
              <Card className="p-5 transition-colors hover:border-ink-700/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 place-items-center rounded-lg bg-brand-100 font-display text-base text-brand-700">
                      {c.initials}
                    </div>
                    <div>
                      <div className="font-display text-lg text-ink-900">{c.name}</div>
                      <div className="font-mono-num text-xs text-muted-foreground">{c.domain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.attention > 0 ? (
                      <StatusChip tone="warn">
                        <AlertTriangle className="size-2.5" strokeWidth={2} /> {c.attention} attn
                      </StatusChip>
                    ) : null}
                    <StatusChip tone={c.status}>{c.status === "live" ? "Live" : "Preview"}</StatusChip>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
                  <Mini label="Drafting" value={c.pipeline.drafting} />
                  <Mini label="In review" value={c.pipeline.review} />
                  <Mini label="Published" value={c.pipeline.published} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <div className="uppercase tracking-wider text-muted-foreground">Plan</div>
                      <div className="text-ink-900">{c.plan}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-muted-foreground">MRR</div>
                      <div className="font-mono-num text-ink-900">${c.mrr}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-muted-foreground">Margin</div>
                      <div className="font-mono-num text-brand-700">{c.margin}%</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-ink-900">
                    Open <ChevronRight className="size-3.5" strokeWidth={1.5} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Credit pool */}
        <Card className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-surface-sunken">
              <TrendingUp className="size-4 text-ink-700" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-medium text-ink-900">Shared credit pool</div>
              <div className="text-xs text-muted-foreground">
                28,400 / 40,000 used · allocates dynamically across clients
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full bg-brand-700" style={{ width: "71%" }} />
            </div>
            <button className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs text-paper hover:bg-ink-700">
              Allocate
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
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
        <span className={cn("font-mono-num text-2xl", gold ? "text-[color:var(--accent-gold)]" : "text-ink-900")}>
          {value}
        </span>
        {delta ? <span className="text-xs text-brand-700">{delta}</span> : null}
        {tone === "warn" ? <StatusChip tone="warn">attn</StatusChip> : null}
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono-num text-base text-ink-900">{value}</div>
    </div>
  );
}