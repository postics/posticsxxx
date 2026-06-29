// Pipeline & Quality Ops — admin tab. Cross-tenant for platform-admin; scoped for agency-admin.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Copy,
  Eye,
  Info,
  Lock,
  PlayCircle,
  Pin,
  RefreshCw,
  ShieldAlert,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import {
  ConfirmReasonDialog,
  DataPanel,
  Dot,
  TrafficLight,
  type Tone,
} from "@/features/admin/ui";

export const Route = createFileRoute("/admin/pipeline")({
  component: PipelinePage,
});

/* ============================== sample data ============================== */

type Window = "24h" | "7d" | "30d";

type FunnelData = {
  planned: number;
  generating: number;
  qa_running: number;
  auto_approved: number;
  needs_review: number;
  approved: number;
  publishing: number;
  published: number;
  qa_failed: number;
  publish_failed: number;
  dead_letter: number;
};

const FUNNEL: Record<Window, FunnelData> = {
  "24h": {
    planned: 412, generating: 396, qa_running: 380,
    auto_approved: 311, needs_review: 48, approved: 352,
    publishing: 209, published: 203,
    qa_failed: 38, publish_failed: 6, dead_letter: 3,
  },
  "7d": {
    planned: 2814, generating: 2701, qa_running: 2588,
    auto_approved: 2104, needs_review: 312, approved: 2386,
    publishing: 1417, published: 1389,
    qa_failed: 261, publish_failed: 22, dead_letter: 11,
  },
  "30d": {
    planned: 11820, generating: 11403, qa_running: 10911,
    auto_approved: 8869, needs_review: 1268, approved: 10063,
    publishing: 5990, published: 5874,
    qa_failed: 1077, publish_failed: 81, dead_letter: 38,
  },
};

const STAGE_LATENCY: { stage: string; p50: string }[] = [
  { stage: "generating", p50: "~42s" },
  { stage: "qa_running", p50: "~11s" },
  { stage: "needs_review", p50: "~3h 14m" },
  { stage: "publishing", p50: "~28s" },
];

type StuckRow = {
  uid: string;
  org: string;
  type: "Article" | "Product" | "Social";
  state: "generating" | "qa_running" | "needs_review";
  inState: string; // human
  toneStuck: Tone; // warning / danger
  actor: string;
};
const STUCK_ROWS: StuckRow[] = [
  { uid: "ast_9f2c4a7e", org: "Northbound Coffee", type: "Article", state: "qa_running", inState: "47m", toneStuck: "warning", actor: "system" },
  { uid: "ast_b7e1d2af", org: "Atlas Wholesale", type: "Product", state: "needs_review", inState: "3h 12m", toneStuck: "danger", actor: "—" },
  { uid: "ast_61aa90c2", org: "Maple & Co Agency", type: "Article", state: "generating", inState: "9m", toneStuck: "warning", actor: "system" },
  { uid: "ast_3d77f1b9", org: "Loomwell Linens", type: "Social", state: "needs_review", inState: "1d 04h", toneStuck: "danger", actor: "ana@loomwell" },
  { uid: "ast_22c8e4f0", org: "Brightwell Goods", type: "Product", state: "qa_running", inState: "22m", toneStuck: "warning", actor: "system" },
  { uid: "ast_57bb02d1", org: "Maison B5", type: "Article", state: "needs_review", inState: "6h 41m", toneStuck: "danger", actor: "—" },
];

type AutoApprovalSpike = { org: string; auto: number; review: number; delta: number };
const SPIKES: AutoApprovalSpike[] = [
  { org: "Loomwell Linens", auto: 61.2, review: 32.4, delta: +14.1 },
  { org: "Atlas Wholesale", auto: 68.8, review: 24.0, delta: +5.7 },
  { org: "Maison B5", auto: 74.5, review: 18.2, delta: -0.1 },
  { org: "Northbound Coffee", auto: 86.4, review: 11.1, delta: -7.2 },
];
const BASELINE_REVIEW = 18.3; // cross-tenant baseline (%)

type G0Row = { name: string; klass: "hard" | "soft"; fails: number; rate: number; stub?: boolean };
const G0_CHECKS: G0Row[] = [
  { name: "Originality / duplicates", klass: "hard", fails: 84, rate: 7.1, stub: true },
  { name: "SEO validator", klass: "hard", fails: 51, rate: 4.3 },
  { name: "Schema / JSON-LD", klass: "hard", fails: 33, rate: 2.8 },
  { name: "Disclosure", klass: "hard", fails: 12, rate: 1.0 },
  { name: "Product · no invented attrs", klass: "hard", fails: 9, rate: 0.7 },
  { name: "AI-detection risk", klass: "soft", fails: 142, rate: 12.0, stub: true },
  { name: "GEO / AEO answer-blocks", klass: "soft", fails: 71, rate: 6.0 },
  { name: "E-E-A-T / brand vocabulary", klass: "soft", fails: 58, rate: 4.9 },
];
const RESCUE_RATE = { passed: 137, retried: 188 };

type FabRow = {
  uid: string;
  org: string;
  product: string;
  claim: string;
  attempt: number;
  state: "needs_review" | "rejected" | "queued";
  detected: string;
};
const FABRICATION: FabRow[] = [
  { uid: "ast_77ef1a02", org: "Atlas Wholesale", product: "TrailHaul 40L pack", claim: '"waterproof to 50m" — not in source', attempt: 1, state: "needs_review", detected: "11:42" },
  { uid: "ast_4d2bf983", org: "Pinegrove Pet Supply", product: "Calm Chews · 60ct", claim: '"FDA-approved" — not in source', attempt: 2, state: "needs_review", detected: "10:08" },
  { uid: "ast_9b88e221", org: "Brightwell Goods", product: "Halo Lamp · 12W", claim: '"50,000 h lifetime" — not in source', attempt: 1, state: "rejected", detected: "Yesterday" },
];

/* ================================= page ================================= */

function PipelinePage() {
  const { session, impersonation } = useAdmin();
  const isPlatform = session?.role === "platform";
  const scopedOrg = !isPlatform ? session?.agencyName ?? "Maison B5" : null;
  const [win, setWin] = useState<Window>("7d");
  const funnel = FUNNEL[win];

  // Scope stuck-state rows for agency-admin
  const stuckRows = useMemo(
    () => (isPlatform ? STUCK_ROWS : STUCK_ROWS.filter((r) => r.org === scopedOrg).slice(0, 6).length
      ? STUCK_ROWS.filter((r) => r.org === scopedOrg)
      : [STUCK_ROWS[5]]),
    [isPlatform, scopedOrg],
  );

  return (
    <AdminShell title="Pipeline & Quality Ops">
      <div className="space-y-4">
        <StubBanner />
        <HeaderRow isPlatform={isPlatform} scopedOrg={scopedOrg} />

        {/* widget 1: FSM funnel */}
        <FsmFunnelCard win={win} setWin={setWin} d={funnel} />

        {/* Two-column row: stuck list (left) + job queue + auto-approval (right) */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <StuckStateCard rows={stuckRows} isPlatform={isPlatform} />
            <G0Card />
          </div>
          <div className="space-y-4">
            <JobQueuePanel />
            <AutoApprovalCard isPlatform={isPlatform} scopedOrg={scopedOrg} />
          </div>
        </div>

        <FabricationCard isPlatform={isPlatform} />

        {impersonation ? (
          <p className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Mutations during impersonation are blocked (read-only).
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}

/* ============================== chrome bits ============================== */

function StubBanner() {
  return (
    <div
      className="font-mono-num flex items-start gap-2 rounded-md border border-line bg-surface-sunken px-3 py-2 text-[11px] text-muted-foreground"
      style={{ borderLeft: "2px solid var(--warning, #B07B2C)" }}
    >
      <Dot tone="warning" className="mt-1" />
      <div>
        <div className="uppercase tracking-[0.14em] text-ink-900">AI Gateway: STUB</div>
        <div className="opacity-80">
          costs ~$0, content is placeholder. Originality &amp; AI-detect scores below are stub values, not trustworthy yet.
        </div>
      </div>
    </div>
  );
}

function HeaderRow({ isPlatform, scopedOrg }: { isPlatform: boolean; scopedOrg: string | null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Pipeline &amp; Quality Ops</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Cross-tenant pipeline health, auto-QA triage, and stuck-state recovery.
        </p>
      </div>
      <RoleChip isPlatform={isPlatform} scopedOrg={scopedOrg} />
    </div>
  );
}

function RoleChip({ isPlatform, scopedOrg }: { isPlatform: boolean; scopedOrg: string | null }) {
  if (isPlatform) {
    return (
      <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-paper">
        <Dot tone="success" /> Platform-admin
      </span>
    );
  }
  return (
    <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-700">
      Agency-admin · {scopedOrg}
    </span>
  );
}

function LockedTile({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line bg-surface-sunken/40 p-4 text-center">
      <Lock className="mx-auto size-4 text-muted-foreground" strokeWidth={1.7} />
      <div className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Platform-only
      </div>
      <div className="mt-1 text-xs text-ink-700">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function PendingChip({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
    >
      <Info className="size-3" strokeWidth={1.7} />
      pending instrumentation
    </span>
  );
}

/* ============================== widget 1: FSM ============================ */

function FsmFunnelCard({
  win,
  setWin,
  d,
}: {
  win: Window;
  setWin: (w: Window) => void;
  d: FunnelData;
}) {
  const pct = (n: number) => `${Math.round((n / d.planned) * 100)}%`;
  const stages: { key: keyof FunnelData; label: string }[] = [
    { key: "planned", label: "planned" },
    { key: "generating", label: "generating" },
    { key: "qa_running", label: "qa_running" },
    { key: "auto_approved", label: "auto-approved" },
    { key: "approved", label: "approved" },
    { key: "publishing", label: "publishing" },
    { key: "published", label: "published" },
  ];
  return (
    <DataPanel
      title="FSM funnel — pipeline retention"
      hint={`Counts in ${win} window from unit_events transitions.`}
      actions={
        <div className="flex items-center gap-2">
          <TrafficLight tone="success" label="live" />
          <WindowSegmented value={win} onChange={setWin} />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-stretch gap-2">
          {stages.map((s, i) => (
            <FsmNode
              key={s.key}
              label={s.label}
              count={d[s.key]}
              pct={pct(d[s.key])}
              isLast={i === stages.length - 1}
              accent={s.key === "published" ? "brand" : "neutral"}
            />
          ))}
        </div>
        {/* drop-off rail */}
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <DropOff label="qa_failed" count={d.qa_failed} />
          <DropOff label="needs_review" count={d.needs_review} tone="warning" />
          <DropOff label="publish_failed" count={d.publish_failed} />
          <DropOff label="dead_letter" count={d.dead_letter} tone="danger" hard />
        </div>

        {/* latency row */}
        <div className="mt-4 rounded-md border border-line bg-surface-sunken/40 p-3">
          <div className="font-mono-num mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>Per-stage latency · p50</span>
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground/80">p95 / p99</span>
              <PendingChip note="p95 / p99 from OTel, outside Postgres — wire OTel exporter to surface here." />
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {STAGE_LATENCY.map((l) => (
              <span key={l.stage} className="font-mono-num text-ink-700">
                <span className="text-muted-foreground">{l.stage}</span>{" "}
                <span className="tabular-nums">{l.p50}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </DataPanel>
  );
}

function FsmNode({
  label, count, pct, isLast, accent,
}: { label: string; count: number; pct: string; isLast: boolean; accent: "brand" | "neutral" }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <div
        className={cn(
          "min-w-[110px] flex-1 rounded-[10px] border px-3 py-2",
          accent === "brand"
            ? "border-brand-700/60 bg-brand-100 text-ink-900"
            : "border-line bg-surface",
        )}
      >
        <div className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div className="font-mono-num mt-0.5 text-base tabular-nums text-ink-900">{count.toLocaleString()}</div>
        <div className="font-mono-num text-[10px] tabular-nums text-muted-foreground">{pct}</div>
      </div>
      {!isLast ? (
        <div aria-hidden className="h-px w-2 bg-line md:w-3" />
      ) : null}
    </div>
  );
}

function DropOff({
  label, count, tone = "warning", hard,
}: { label: string; count: number; tone?: Tone; hard?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[10px] border bg-surface px-3 py-2",
        hard ? "border-[color:var(--danger,#A6453C)]/40" : "border-line",
      )}
    >
      <div className="font-mono-num flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Dot tone={tone} />
        {label}
      </div>
      <div className="font-mono-num mt-0.5 text-sm tabular-nums text-ink-900">−{count.toLocaleString()}</div>
    </div>
  );
}

function WindowSegmented({ value, onChange }: { value: Window; onChange: (w: Window) => void }) {
  const opts: Window[] = ["24h", "7d", "30d"];
  return (
    <div className="font-mono-num inline-flex items-center rounded-md border border-line bg-surface p-0.5 text-[10px] uppercase tracking-[0.12em]">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-sm px-2 py-0.5 transition",
            value === o ? "bg-brand-700 text-paper" : "text-muted-foreground hover:text-ink-900",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ============================== widget 2: stuck ========================== */

function StuckStateCard({ rows, isPlatform }: { rows: StuckRow[]; isPlatform: boolean }) {
  const [action, setAction] = useState<{ kind: ActionKind; uid: string } | null>(null);
  return (
    <DataPanel
      title="Stuck-state list — units lingering past SLA"
      hint="Interim proxy for queue health until the jobs table is live."
      actions={
        <div className="flex items-center gap-2">
          <TrafficLight tone="warning" label="live" />
          <button
            onClick={() => setAction({ kind: "catchup", uid: "project_lagging_q3" })}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken"
          >
            Catch-Up lagging project
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr className="border-b border-line">
              <th className="px-2 py-2">asset_uid</th>
              {isPlatform ? <th className="px-2 py-2">org</th> : null}
              <th className="px-2 py-2">type</th>
              <th className="px-2 py-2">state</th>
              <th className="px-2 py-2">in-state</th>
              <th className="px-2 py-2">last actor</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uid} className="border-b border-line/60">
                <td className="px-2 py-2">
                  <button
                    onClick={() => { navigator.clipboard?.writeText(r.uid); toast.success("Copied asset_uid"); }}
                    className="font-mono-num inline-flex items-center gap-1 text-ink-900 hover:underline"
                  >
                    {r.uid.slice(0, 12)}…
                    <Copy className="size-3 opacity-50" />
                  </button>
                </td>
                {isPlatform ? <td className="px-2 py-2 text-muted-foreground">{r.org}</td> : null}
                <td className="px-2 py-2">
                  <span className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700">
                    {r.type}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span className="font-mono-num text-[11px] text-ink-700">{r.state}</span>
                </td>
                <td className="px-2 py-2">
                  <span
                    className="font-mono-num inline-flex items-center gap-1.5 tabular-nums"
                    style={{ color: r.toneStuck === "danger" ? "var(--danger,#A6453C)" : "var(--warning,#B07B2C)" }}
                  >
                    <Dot tone={r.toneStuck} />
                    {r.inState}
                  </span>
                </td>
                <td className="px-2 py-2 text-muted-foreground">{r.actor}</td>
                <td className="px-2 py-2 text-right">
                  <RowMenu uid={r.uid} onPick={(kind) => setAction({ kind, uid: r.uid })} isPlatform={isPlatform} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ActionDialog ctx={action} onClose={() => setAction(null)} />
    </DataPanel>
  );
}

/* ============================== widget 3: jobs =========================== */

function JobQueuePanel() {
  const kinds = ["plan", "generate", "qa", "publish", "social"];
  return (
    <DataPanel
      title="Job queue — by kind"
      state="pending"
      pendingNote="jobs table is not written yet (orchestrator only calls echo()). Until the orchestrator + jobs writer is live, queue health is proxied by the FSM Stuck-State list →"
      actions={<TrafficLight tone="warning" label="not wired" />}
    >
      <table className="w-full text-left text-xs opacity-60">
        <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <tr className="border-b border-line">
            <th className="px-2 py-1.5">kind</th>
            <th className="px-2 py-1.5 text-right">queued</th>
            <th className="px-2 py-1.5 text-right">running</th>
            <th className="px-2 py-1.5 text-right">retry</th>
            <th className="px-2 py-1.5 text-right">DLQ</th>
          </tr>
        </thead>
        <tbody>
          {kinds.map((k) => (
            <tr key={k} className="border-b border-line/60">
              <td className="px-2 py-1.5 font-mono-num text-ink-700">{k}</td>
              <td className="px-2 py-1.5 text-right font-mono-num text-muted-foreground">—</td>
              <td className="px-2 py-1.5 text-right font-mono-num text-muted-foreground">—</td>
              <td className="px-2 py-1.5 text-right font-mono-num text-muted-foreground">—</td>
              <td className="px-2 py-1.5 text-right font-mono-num text-muted-foreground">—</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-mono-num mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>retry-classes:</span>
        <span className="inline-flex items-center gap-1"><Dot tone="info" /> transient · max 6</span>
        <span className="inline-flex items-center gap-1"><Dot tone="warning" /> auth/config · 0</span>
        <span className="inline-flex items-center gap-1"><Dot tone="danger" /> validation · 1</span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Using FSM stuck-state as interim proxy →
      </p>
    </DataPanel>
  );
}

/* ============================== widget 4: auto-approval ================== */

function AutoApprovalCard({
  isPlatform,
  scopedOrg,
}: {
  isPlatform: boolean;
  scopedOrg: string | null;
}) {
  const auto = 81.3;
  const review = 14.8;
  const rejected = 3.9;
  return (
    <DataPanel
      title="Auto-approval vs needs-review"
      actions={<TrafficLight tone="success" label="live" />}
    >
      <div className="font-mono-num text-2xl tabular-nums text-ink-900">{auto.toFixed(1)}%</div>
      <div className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        auto-approved · 7d
      </div>

      {/* stacked bar */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div style={{ width: `${auto}%`, backgroundColor: "var(--brand-700, #1E3A34)" }} />
        <div style={{ width: `${review}%`, backgroundColor: "var(--warning, #B07B2C)" }} />
        <div style={{ width: `${rejected}%`, backgroundColor: "var(--danger, #A6453C)" }} />
      </div>
      <div className="font-mono-num mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Dot tone="success" /> auto {auto}%</span>
        <span className="inline-flex items-center gap-1.5"><Dot tone="warning" /> review {review}%</span>
        <span className="inline-flex items-center gap-1.5"><Dot tone="danger" /> rejected {rejected}%</span>
      </div>

      <div className="mt-4">
        <div className="font-mono-num mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Per-org spike — needs-review vs baseline {BASELINE_REVIEW}%
        </div>
        {isPlatform ? (
          <table className="w-full text-left text-xs">
            <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr className="border-b border-line">
                <th className="px-2 py-1.5">org</th>
                <th className="px-2 py-1.5 text-right">auto%</th>
                <th className="px-2 py-1.5 text-right">review%</th>
                <th className="px-2 py-1.5 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {SPIKES.map((s) => {
                const tone: Tone = s.delta > 10 ? "danger" : s.delta > 3 ? "warning" : "muted";
                return (
                  <tr key={s.org} className="border-b border-line/60">
                    <td className="px-2 py-1.5 text-ink-900">{s.org}</td>
                    <td className="px-2 py-1.5 text-right font-mono-num tabular-nums text-ink-700">{s.auto.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right font-mono-num tabular-nums text-ink-700">{s.review.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">
                      <span className="font-mono-num inline-flex items-center gap-1 tabular-nums" style={{ color: tone === "danger" ? "var(--danger,#A6453C)" : tone === "warning" ? "var(--warning,#B07B2C)" : "var(--muted-foreground)" }}>
                        <Dot tone={tone} />
                        {s.delta > 0 ? "+" : ""}{s.delta.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <LockedTile label="Cross-tenant baseline table" hint={`${scopedOrg} sees only its own auto-approval %.`} />
        )}
      </div>
    </DataPanel>
  );
}

/* ============================== widget 5: G0 ============================= */

function G0Card() {
  const max = Math.max(...G0_CHECKS.map((c) => c.fails));
  return (
    <DataPanel
      title="G0 per-check failure frequency"
      actions={<TrafficLight tone="success" label="live" />}
    >
      <div className="font-mono-num mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Dot tone="danger" /> hard · blocks publish</span>
        <span className="inline-flex items-center gap-1.5"><Dot tone="warning" /> soft · advisory</span>
      </div>
      <ul className="space-y-1.5">
        {G0_CHECKS.map((c) => {
          const w = (c.fails / max) * 100;
          const color = c.klass === "hard" ? "var(--danger,#A6453C)" : "var(--warning,#B07B2C)";
          return (
            <li key={c.name} className="grid grid-cols-[180px,1fr,100px] items-center gap-2 text-xs">
              <span className="truncate text-ink-700">
                {c.name}
                {c.stub ? (
                  <span
                    title="Originality.ai / AI-detect are on STUB — these pass/fail values are placeholder, not trustworthy."
                    className="font-mono-num ml-1.5 rounded bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    stub
                  </span>
                ) : null}
              </span>
              <div className="relative h-2 rounded-full bg-surface-sunken">
                <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color }} />
              </div>
              <span className="font-mono-num text-right tabular-nums text-muted-foreground">
                {c.fails} · {c.rate.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 rounded-md border border-line bg-surface-sunken/40 p-3">
        <div className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Remediation rescue rate
        </div>
        <div className="font-mono-num mt-1 text-sm tabular-nums text-ink-900">
          {RESCUE_RATE.passed} / {RESCUE_RATE.retried}{" "}
          <span className="text-muted-foreground">
            ({Math.round((RESCUE_RATE.passed / RESCUE_RATE.retried) * 100)}%)
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">attempt=2 passed / total retried</div>
      </div>
    </DataPanel>
  );
}

/* ============================== widget 6: fabrication =================== */

function FabricationCard({ isPlatform }: { isPlatform: boolean }) {
  const [action, setAction] = useState<{ kind: ActionKind; uid: string } | null>(null);
  return (
    <section
      className="rounded-[14px] border border-line bg-surface p-4"
      style={{ borderLeft: "3px solid var(--danger, #A6453C)" }}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[13px] font-medium text-ink-900">
            Brand-safety queue — product attribute fabrication
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            qa_reports.checks · name=product_attr_fabrication — brand-ending risk class.
          </p>
        </div>
        <TrafficLight tone="danger" label="high priority" />
      </header>

      {FABRICATION.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-center text-[12px] text-[color:var(--success,#3C7D5C)]">
          ✓ No fabrication incidents in window — clean.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr className="border-b border-line">
                <th className="px-2 py-2">asset_uid</th>
                {isPlatform ? <th className="px-2 py-2">org</th> : null}
                <th className="px-2 py-2">product</th>
                <th className="px-2 py-2">fabricated claim</th>
                <th className="px-2 py-2 text-right">attempt</th>
                <th className="px-2 py-2">state</th>
                <th className="px-2 py-2">detected</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {FABRICATION.map((f) => (
                <tr key={f.uid} className="border-b border-line/60">
                  <td className="px-2 py-2 font-mono-num text-ink-900">{f.uid.slice(0, 12)}…</td>
                  {isPlatform ? <td className="px-2 py-2 text-muted-foreground">{f.org}</td> : null}
                  <td className="px-2 py-2 text-ink-700">{f.product}</td>
                  <td className="px-2 py-2 font-mono-num text-[11px] text-[color:var(--danger,#A6453C)]">{f.claim}</td>
                  <td className="px-2 py-2 text-right font-mono-num tabular-nums">{f.attempt}</td>
                  <td className="px-2 py-2">
                    <span className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700">
                      {f.state}
                    </span>
                  </td>
                  <td className="px-2 py-2 font-mono-num text-muted-foreground">{f.detected}</td>
                  <td className="px-2 py-2 text-right">
                    <RowMenu
                      uid={f.uid}
                      isPlatform={isPlatform}
                      variant="fabrication"
                      onPick={(kind) => setAction({ kind, uid: f.uid })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActionDialog ctx={action} onClose={() => setAction(null)} />
    </section>
  );
}

/* ============================== row menu + actions ====================== */

type ActionKind =
  | "redrive"
  | "rerun_g0"
  | "fsm_override"
  | "catchup"
  | "pin_route"
  | "view_as"
  | "reject_regen"
  | "manual_approve";

function RowMenu({
  uid,
  onPick,
  isPlatform,
  variant,
}: {
  uid: string;
  onPick: (kind: ActionKind) => void;
  isPlatform: boolean;
  variant?: "fabrication";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
      >
        Actions <ChevronDown className="size-3" />
      </button>
      {open ? (
        <div
          className="absolute right-0 z-30 mt-1 w-60 rounded-md border border-line bg-surface p-1 text-xs shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          {variant === "fabrication" ? (
            <>
              <MenuItem icon={<RefreshCw className="size-3.5" />} onClick={() => { onPick("reject_regen"); setOpen(false); }}>
                Reject &amp; regenerate
              </MenuItem>
              <MenuItem icon={<Wand2 className="size-3.5" />} danger onClick={() => { onPick("manual_approve"); setOpen(false); }}>
                Manual override (approve)
              </MenuItem>
              {isPlatform ? (
                <MenuItem icon={<Eye className="size-3.5" />} onClick={() => { onPick("view_as"); setOpen(false); }}>
                  View-as org (read-only)
                </MenuItem>
              ) : null}
            </>
          ) : (
            <>
              <MenuItem icon={<PlayCircle className="size-3.5" />} onClick={() => { onPick("redrive"); setOpen(false); }}>
                Re-drive
              </MenuItem>
              <MenuItem icon={<RefreshCw className="size-3.5" />} onClick={() => { onPick("rerun_g0"); setOpen(false); }}>
                Force re-run G0
              </MenuItem>
              <MenuItem icon={<Wand2 className="size-3.5" />} danger onClick={() => { onPick("fsm_override"); setOpen(false); }}>
                Manual FSM override
              </MenuItem>
              {isPlatform ? (
                <>
                  <MenuItem icon={<Pin className="size-3.5" />} onClick={() => { onPick("pin_route"); setOpen(false); }}>
                    Pin AI-route
                  </MenuItem>
                  <MenuItem icon={<Eye className="size-3.5" />} onClick={() => { onPick("view_as"); setOpen(false); }}>
                    View-as org (read-only)
                  </MenuItem>
                </>
              ) : (
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Pin AI-route · platform-only
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  children, icon, danger, onClick,
}: { children: React.ReactNode; icon?: React.ReactNode; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-surface-sunken",
        danger ? "text-[color:var(--danger,#A6453C)]" : "text-ink-700",
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function ActionDialog({
  ctx,
  onClose,
}: {
  ctx: { kind: ActionKind; uid: string } | null;
  onClose: () => void;
}) {
  const open = !!ctx;
  const meta = useMemo(() => {
    if (!ctx) return null;
    switch (ctx.kind) {
      case "redrive":
        return { title: `Re-drive ${ctx.uid}`, desc: "Retry-classes are policy-fixed: transient max 6 · auth/config 0 · validation 1.", destructive: false, confirm: "Queue re-drive", toast: "Re-drive queued" };
      case "rerun_g0":
        return { title: `Force re-run G0 — ${ctx.uid}`, desc: "Re-runs the quality gate on this unit. Counts as attempt+1.", destructive: false, confirm: "Re-run G0", toast: "G0 re-run started" };
      case "fsm_override":
        return { title: `Manual FSM override — ${ctx.uid}`, desc: "needs_review → approved | rejected. Actor recorded as founder in unit_events.", destructive: true, confirm: "Record override", toast: "FSM override recorded" };
      case "catchup":
        return { title: "Catch-Up lagging project", desc: "Schedules catch-up generation for an under-pace project.", destructive: false, confirm: "Trigger Catch-Up", toast: "Catch-Up triggered" };
      case "pin_route":
        return { title: `Pin AI-route — ${ctx.uid}`, desc: "Pin a model route for this unit or content-type. Platform-only.", destructive: false, confirm: "Pin route", toast: "Route pinned" };
      case "view_as":
        return { title: `View-as org for ${ctx.uid}`, desc: "Time-boxed 20–30 min. READ-ONLY. Persistent banner shows expiry. Audit-logged with staff actor.", destructive: false, confirm: "Start view-as", toast: "View-as session started" };
      case "reject_regen":
        return { title: `Reject & regenerate — ${ctx.uid}`, desc: "Marks the unit rejected and queues a regeneration with brand-safety penalty.", destructive: false, confirm: "Reject & regenerate", toast: "Regeneration queued" };
      case "manual_approve":
        return { title: `Manual approve (override) — ${ctx.uid}`, desc: "Approves despite a fabrication flag. Reason becomes audit evidence.", destructive: true, confirm: "Approve with reason", toast: "Override recorded" };
      default:
        return null;
    }
  }, [ctx]);

  if (!meta) return null;
  return (
    <ConfirmReasonDialog
      open={open}
      title={meta.title}
      description={meta.desc}
      destructive={meta.destructive}
      confirmLabel={meta.confirm}
      onCancel={onClose}
      onConfirm={(reason) => {
        toast.success(meta.toast, { description: `"${reason}" · audit-logged` });
        onClose();
      }}
    />
  );
}