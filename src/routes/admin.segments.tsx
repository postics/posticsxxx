// Segmentation Lens — platform-admin (founder) only.
// Cross-tenant view: WHO our clients are by archetype, and does the PAYING mix match the wholesale ICP?
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, ChevronRight, Lock, RefreshCw } from "lucide-react";
import { AdminShell } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import {
  ConfirmReasonDialog,
  DataPanel,
  Dot,
  TrafficLight,
  type Tone,
} from "@/features/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/segments")({
  component: SegmentsPage,
});

/* ============================== archetypes ============================== */

type ArchId = "B1" | "B2" | "B3" | "B4" | "B5";

const ARCH: Record<
  ArchId,
  { id: ArchId; label: string; short: string; color: string; icp?: boolean; desc: string }
> = {
  B1: { id: "B1", label: "Faceless catalog", short: "Catalog", color: "#7AA6C2", desc: "Multi-SKU store with no visible owner — wants traffic." },
  B2: { id: "B2", label: "Founder-led", short: "Founder", color: "#D6A256", desc: "Personal brand front-and-center; voice matters." },
  B3: { id: "B3", label: "Wholesale wedge", short: "Wholesale", color: "#1E3A34", icp: true, desc: "Multi-locale catalog selling to retailers. Lead wedge." },
  B4: { id: "B4", label: "Local service", short: "Local", color: "#A6453C", desc: "Geo-bound service business; leads over traffic." },
  B5: { id: "B5", label: "Agency operator", short: "Agency", color: "#3C7D5C", icp: true, desc: "Runs Postics for N sub-clients. Meta-ICP buyer." },
};

const ARCH_ORDER: ArchId[] = ["B1", "B2", "B3", "B4", "B5"];

/* ============================== mock data =============================== */

const DISTRIBUTION = {
  projects: { B1: 31, B2: 9, B3: 18, B4: 52, B5: 19 } as Record<ArchId, number>,
  revenueShare: { B1: 14, B2: 6, B3: 28, B4: 11, B5: 38 } as Record<ArchId, number>,
};

const CONFIDENCE_TREND = [
  { week: "W-11", high: 62, med: 24, low: 14 },
  { week: "W-10", high: 64, med: 23, low: 13 },
  { week: "W-9", high: 66, med: 22, low: 12 },
  { week: "W-8", high: 68, med: 21, low: 11 },
  { week: "W-7", high: 69, med: 20, low: 11 },
  { week: "W-6", high: 70, med: 20, low: 10 },
  { week: "W-5", high: 71, med: 19, low: 10 },
  { week: "W-4", high: 72, med: 19, low: 9 },
  { week: "W-3", high: 73, med: 18, low: 9 },
  { week: "W-2", high: 74, med: 17, low: 9 },
  { week: "W-1", high: 74, med: 17, low: 9 },
  { week: "W-0", high: 75, med: 16, low: 9 },
];

type LowConfRow = {
  id: string;
  domain: string;
  org: string;
  current: ArchId;
  conf: "low" | "medium";
  confScore: number;
  competing: { id: ArchId; score: number };
  currentScore: number;
};

const LOW_CONF: LowConfRow[] = [
  { id: "p_north", domain: "northbound-coffee.com", org: "Northbound Coffee", current: "B1", conf: "low", confScore: 0.41, currentScore: 0.41, competing: { id: "B3", score: 0.38 } },
  { id: "p_loom",  domain: "loomwell.co",            org: "Loomwell Linens",    current: "B3", conf: "low", confScore: 0.46, currentScore: 0.46, competing: { id: "B1", score: 0.39 } },
  { id: "p_solar", domain: "solar-bloom.shop",       org: "Solar Bloom Studio", current: "B2", conf: "medium", confScore: 0.58, currentScore: 0.58, competing: { id: "B1", score: 0.34 } },
  { id: "p_velou", domain: "velourie.shop",          org: "Velourie Atelier",   current: "B4", conf: "low", confScore: 0.44, currentScore: 0.44, competing: { id: "B2", score: 0.40 } },
  { id: "p_harb",  domain: "harborandash.com",       org: "Harbor & Ash",       current: "B1", conf: "medium", confScore: 0.55, currentScore: 0.55, competing: { id: "B3", score: 0.41 } },
  { id: "p_pine",  domain: "pinegrovepet.com",       org: "Pinegrove Pet",      current: "B4", conf: "low", confScore: 0.48, currentScore: 0.48, competing: { id: "B1", score: 0.36 } },
];

type MarginRow = {
  arch: ArchId;
  projects: number;
  mrr: number;
  cogs: number; // stubbed near-zero
  gm: number; // 0..1 — sample target shape
  arpu: number;
  subsidized: boolean;
};

const MARGIN: MarginRow[] = [
  { arch: "B1", projects: 31, mrr: 6_169, cogs: 12, gm: 0.66, arpu: 199, subsidized: false },
  { arch: "B2", projects: 9,  mrr: 4_041, cogs:  6, gm: 0.72, arpu: 449, subsidized: false },
  { arch: "B3", projects: 18, mrr: 16_182, cogs: 14, gm: 0.81, arpu: 899, subsidized: false },
  { arch: "B4", projects: 52, mrr: 10_348, cogs: 21, gm: 0.58, arpu: 199, subsidized: true },
  { arch: "B5", projects: 19, mrr: 18_981, cogs: 18, gm: 0.78, arpu: 999, subsidized: false },
];

type AgencyRow = {
  id: string;
  name: string;
  domain: string;
  clients: number;
  seats: number;
  subMix: Partial<Record<ArchId, number>>;
  outcome: "healthy" | "watch" | "at_risk";
};

const AGENCIES: AgencyRow[] = [
  { id: "ag_light",  name: "Lighthouse Digital", domain: "lighthouse.digital", clients: 12, seats: 5, subMix: { B1: 4, B3: 6, B4: 2 }, outcome: "healthy" },
  { id: "ag_maison", name: "Maison B5",          domain: "maisonb5.agency",    clients: 8,  seats: 4, subMix: { B1: 2, B3: 4, B2: 1, B4: 1 }, outcome: "healthy" },
  { id: "ag_maple",  name: "Maple & Co",         domain: "mapleco.agency",     clients: 6,  seats: 3, subMix: { B3: 3, B4: 2, B1: 1 }, outcome: "watch" },
  { id: "ag_atlas",  name: "Atlas Studio",       domain: "atlasstudio.co",     clients: 4,  seats: 2, subMix: { B4: 3, B1: 1 }, outcome: "at_risk" },
  { id: "ag_ridge",  name: "Ridgeway Partners",  domain: "ridgeway.co",        clients: 9,  seats: 4, subMix: { B3: 5, B5: 0, B1: 2, B4: 2 }, outcome: "healthy" },
];

const FOUNDER_FACE = { yes: 22, no: 61, partly: 17 };
const CATALOG_LOCALE = { single: 73, multi: 27 };
const PRIMARY_GOAL = [
  { label: "Traffic", count: 48 },
  { label: "Conversion", count: 33 },
  { label: "Brand & trust", count: 26 },
  { label: "Leads", count: 22 },
];

/* =============================== page ================================== */

function SegmentsPage() {
  const { session } = useAdmin();
  const isPlatform = (session?.role ?? "platform") === "platform";

  if (!isPlatform) {
    return (
      <AdminShell title="Segmentation Lens" breadcrumb={["Admin", "Customers", "Segmentation Lens"]}>
        <LockedAgencyView />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Segmentation Lens"
      breadcrumb={["Admin", "Customers", "Segmentation Lens"]}
      actions={<HeaderActions />}
    >
      <p className="-mt-2 max-w-3xl text-[13px] text-muted-foreground">
        Who our clients are, by archetype — and whether the paying mix matches the wholesale ICP.
      </p>

      <ArchetypeLegend />

      <div className="mt-5 space-y-5">
        <DistributionCard />
        <ConfidenceCard />
        <MarginCard />
        <AgencyDepthCard />
        <DistributionStrip />
        <OverrideRateCard />
      </div>

      <p className="font-mono-num mt-6 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Future: agency-admins will get a SCOPED archetype view of THEIR sub-clients only — no margin, no cross-tenant data.
      </p>
    </AdminShell>
  );
}

/* ============================ header bits =============================== */

function HeaderActions() {
  const [range, setRange] = useState<"30d" | "90d" | "all">("90d");
  const [open, setOpen] = useState(false);
  return (
    <>
      <label className="font-mono-num inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-ink-700">
        Range
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as "30d" | "90d" | "all")}
          className="bg-transparent text-[11px] outline-none"
        >
          <option value="30d">Last 30d</option>
          <option value="90d">Last 90d</option>
          <option value="all">All time</option>
        </select>
      </label>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
      >
        <RefreshCw className="size-3.5" strokeWidth={1.75} /> Re-classify all stale
      </button>
      <ConfirmReasonDialog
        open={open}
        title="Re-classify all stale projects"
        description="Re-run the archetype classifier on ~37 stale projects. Existing founder overrides are preserved."
        confirmLabel="Re-classify"
        destructive={false}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

function ArchetypeLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {ARCH_ORDER.map((id) => {
        const a = ARCH[id];
        return (
          <span
            key={id}
            className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700"
            title={a.desc}
          >
            <span
              aria-hidden
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: a.color }}
            />
            {id} {a.label}
            {a.icp ? (
              <span
                aria-hidden
                className="ml-0.5 inline-block size-1.5 rounded-full"
                style={{ backgroundColor: "var(--brand-700, #1E3A34)" }}
                title="ICP / lead wedge"
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

/* =================== 1) Archetype distribution ========================= */

function DistributionCard() {
  const [tab, setTab] = useState<"projects" | "revenue">("projects");
  const totalProjects = ARCH_ORDER.reduce((s, k) => s + DISTRIBUTION.projects[k], 0);
  const pctProjects = (id: ArchId) => Math.round((DISTRIBUTION.projects[id] / totalProjects) * 100);
  const pctRevenue = (id: ArchId) => DISTRIBUTION.revenueShare[id];

  const isProjects = tab === "projects";
  const getPct = isProjects ? pctProjects : pctRevenue;
  const getCount = isProjects
    ? (id: ArchId) => `${DISTRIBUTION.projects[id]}`
    : (id: ArchId) => `${DISTRIBUTION.revenueShare[id]}%`;

  return (
    <DataPanel
      title="Archetype distribution"
      hint="Cross-tenant. Compare project count vs revenue-weighted share to see where the money concentrates."
      actions={
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-[11px]">
          {(["projects", "revenue"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2 py-1 transition-colors",
                tab === t ? "bg-brand-100 text-brand-700" : "text-muted-foreground hover:text-ink-700",
              )}
            >
              {t === "projects" ? "Projects" : "Revenue-weighted"}
            </button>
          ))}
        </div>
      }
    >
      <StackedBar getPct={getPct} />

      <div className="mt-4 overflow-hidden rounded-md border border-line">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-sunken/60 text-left">
            <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-2">Archetype</th>
              <th className="px-3 py-2 text-right">{isProjects ? "Projects" : "Rev %"}</th>
              <th className="px-3 py-2 text-right">Share</th>
              <th className="px-3 py-2">Distribution</th>
              {!isProjects ? <th className="px-3 py-2 text-right">Δ vs projects</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ARCH_ORDER.map((id) => {
              const a = ARCH[id];
              const pct = getPct(id);
              const delta = pctRevenue(id) - pctProjects(id);
              return (
                <tr key={id}>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="font-mono-num text-[11px] text-muted-foreground">{id}</span>
                      <span className="text-ink-900">{a.label}</span>
                      {a.icp ? (
                        <span
                          className="font-mono-num inline-flex items-center gap-1 rounded bg-brand-100 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-brand-700"
                        >
                          ICP
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-ink-900">{getCount(id)}</td>
                  <td className="px-3 py-2 text-right font-mono-num text-ink-900">{pct}%</td>
                  <td className="px-3 py-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: a.color }}
                      />
                    </div>
                  </td>
                  {!isProjects ? (
                    <td className="px-3 py-2 text-right">
                      <DeltaChip value={delta} />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {isProjects
          ? "By count, B4 (local service) dominates the long-tail — but watch the revenue tab."
          : "Revenue-weighted via org → subscriptions roll-up — your money concentrates in B5/B3 (the wholesale ICP), validating the wedge."}
      </p>
    </DataPanel>
  );
}

function StackedBar({ getPct }: { getPct: (id: ArchId) => number }) {
  return (
    <div className="mt-1">
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-line bg-surface-sunken">
        {ARCH_ORDER.map((id) => {
          const pct = getPct(id);
          if (pct <= 0) return null;
          return (
            <div
              key={id}
              title={`${id} ${ARCH[id].label} — ${pct}%`}
              style={{ width: `${pct}%`, backgroundColor: ARCH[id].color }}
            />
          );
        })}
      </div>
      <div className="font-mono-num mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {ARCH_ORDER.map((id) => (
          <span key={id} className="inline-flex items-center gap-1">
            <span aria-hidden className="inline-block size-1.5 rounded-full" style={{ backgroundColor: ARCH[id].color }} />
            {id} {getPct(id)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function DeltaChip({ value }: { value: number }) {
  const tone: Tone = value > 0 ? "success" : value < 0 ? "danger" : "muted";
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : null;
  return (
    <span
      className="font-mono-num inline-flex items-center gap-0.5 text-[11px]"
      style={{ color: tone === "success" ? "var(--success)" : tone === "danger" ? "var(--danger)" : "var(--muted-foreground)" }}
    >
      {Icon ? <Icon className="size-3" strokeWidth={2} /> : null}
      {value > 0 ? "+" : ""}
      {value} pp
    </span>
  );
}

/* =============== 2) Classifier confidence health ======================= */

function ConfidenceCard() {
  const [resolving, setResolving] = useState<LowConfRow | null>(null);
  return (
    <DataPanel
      title="Classifier confidence health"
      hint="Confidence mix over the last 12 weeks + the queue of projects the classifier isn't sure about."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* left: trend */}
        <div className="rounded-md border border-line bg-surface-sunken/30 p-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Low-confidence share
              </div>
              <div className="mt-0.5 font-mono-num text-xl text-ink-900">9%</div>
            </div>
            <span className="font-mono-num inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--success)" }}>
              <ArrowDown className="size-3" strokeWidth={2} />
              −5 pp vs W-11
            </span>
          </div>
          <div className="mt-3 h-[140px] w-full">
            <ResponsiveContainer>
              <AreaChart data={CONFIDENCE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} stroke="var(--line)" />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} stroke="var(--line)" />
                <RTooltip
                  contentStyle={{
                    fontSize: 11,
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    borderRadius: 8,
                  }}
                />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#3C7D5C" fill="#3C7D5C" fillOpacity={0.5} />
                <Area type="monotone" dataKey="med" stackId="1" stroke="#B07B2C" fill="#B07B2C" fillOpacity={0.5} />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#A6453C" fill="#A6453C" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="font-mono-num mt-1 flex gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Dot tone="success" /> High</span>
            <span className="inline-flex items-center gap-1"><Dot tone="warning" /> Medium</span>
            <span className="inline-flex items-center gap-1"><Dot tone="danger" /> Low</span>
          </div>
        </div>

        {/* right: queue */}
        <div className="rounded-md border border-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-sunken/60 px-3 py-1.5">
            <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Low-confidence queue · {LOW_CONF.length}
            </span>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <tbody className="divide-y divide-line">
                {LOW_CONF.map((r) => {
                  const a = ARCH[r.current];
                  const comp = ARCH[r.competing.id];
                  return (
                    <tr key={r.id} className="hover:bg-surface-sunken/40">
                      <td className="px-3 py-2">
                        <div className="font-mono-num text-ink-900">{r.domain}</div>
                        <div className="text-[10px] text-muted-foreground">{r.org}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: a.color }} />
                          <span className="font-mono-num text-[11px]">{r.current}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <TrafficLight tone={r.conf === "low" ? "danger" : "warning"} label={r.conf} />
                      </td>
                      <td className="px-3 py-2 font-mono-num text-[11px] text-muted-foreground">
                        <span className="text-ink-900">{r.current} {r.currentScore.toFixed(2)}</span>
                        <span className="mx-1">vs</span>
                        <span style={{ color: comp.color }}>{r.competing.id}</span>{" "}
                        {r.competing.score.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setResolving(r)}
                          className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmReasonDialog
        open={!!resolving}
        title={resolving ? `Override archetype — ${resolving.domain}` : "Override archetype"}
        description={
          resolving
            ? `Current: ${resolving.current} ${ARCH[resolving.current].label} (conf ${resolving.confScore.toFixed(2)}). Top competitor: ${resolving.competing.id} ${ARCH[resolving.competing.id].label} (${resolving.competing.score.toFixed(2)}). Logged to unit_events as classifier feedback + audit-log.`
            : undefined
        }
        confirmLabel="Save override"
        destructive={false}
        onCancel={() => setResolving(null)}
        onConfirm={() => setResolving(null)}
      />
    </DataPanel>
  );
}

/* ===================== 3) Segment × Margin (pending) =================== */

function MarginCard() {
  return (
    <DataPanel
      title="Segment × Margin"
      hint="Are B3/B5 actually profitable, or subsidized? Watch the B4 long-tail."
      state="pending"
      pendingNote="Margin needs the artifacts writer to persist real model_route + unit_cost_usd_est per action (pending backend). Until then COGS ≈ $0 (stub) — the column shapes are reviewable but values are placeholder."
    />
  );
}

/** Render the structure too — DataPanel.pending hides children, so we render a sibling table below. */
function MarginTable() {
  return (
    <section className="rounded-[14px] border border-line bg-surface p-4">
      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-sunken/60 text-left">
            <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-2">Archetype</th>
              <th className="px-3 py-2 text-right"># projects</th>
              <th className="px-3 py-2 text-right">MRR</th>
              <th className="px-3 py-2 text-right">USD COGS</th>
              <th className="px-3 py-2 text-right">GM %</th>
              <th className="px-3 py-2 text-right">ARPU</th>
              <th className="px-3 py-2">Subsidized?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-muted-foreground">
            {MARGIN.map((r) => {
              const a = ARCH[r.arch];
              const gmPct = Math.round(r.gm * 100);
              const tone: Tone = gmPct >= 70 ? "success" : gmPct >= 60 ? "warning" : "danger";
              return (
                <tr key={r.arch} className="opacity-70">
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="font-mono-num text-[11px]">{r.arch}</span>
                      <span>{a.label}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num">{r.projects}</td>
                  <td className="px-3 py-2 text-right font-mono-num">${r.mrr.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono-num" title="Stub — pending unit-cost instrumentation">
                    ${r.cogs}*
                  </td>
                  <td className="px-3 py-2 text-right">
                    <TrafficLight tone={tone} label={`${gmPct}%`} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num">${r.arpu}</td>
                  <td className="px-3 py-2">
                    {r.subsidized ? (
                      <TrafficLight tone="danger" label="subsidized" />
                    ) : (
                      <span className="font-mono-num text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        * COGS values are placeholder while AI Gateway runs on stub. GM % shown as target shape, not measured truth.
      </p>
    </section>
  );
}

/* ===================== 4) Agency (B5) portfolio depth ================== */

function AgencyDepthCard() {
  const [open, setOpen] = useState<AgencyRow | null>(null);
  return (
    <DataPanel
      title="Agency (B5) portfolio depth"
      hint="Our meta-ICP buyers and the archetype mix of THEIR clients. Click a row to drill in."
    >
      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-sunken/60 text-left">
            <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-2">Agency</th>
              <th className="px-3 py-2 text-right">Clients</th>
              <th className="px-3 py-2 text-right">Seats</th>
              <th className="px-3 py-2">Sub-mix</th>
              <th className="px-3 py-2">Outcome</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {AGENCIES.map((a) => (
              <tr key={a.id} className="hover:bg-surface-sunken/40">
                <td className="px-3 py-2">
                  <div className="text-ink-900">{a.name}</div>
                  <div className="font-mono-num text-[10px] text-muted-foreground">{a.domain}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono-num text-ink-900">{a.clients}</td>
                <td className="px-3 py-2 text-right font-mono-num text-ink-900">{a.seats}</td>
                <td className="px-3 py-2">
                  <SubMixBar mix={a.subMix} />
                </td>
                <td className="px-3 py-2">
                  <TrafficLight
                    tone={a.outcome === "healthy" ? "success" : a.outcome === "watch" ? "warning" : "danger"}
                    label={a.outcome.replace("_", " ")}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => setOpen(a)}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                  >
                    Drill <ChevronRight className="size-3" strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? <AgencyDrawer agency={open} onClose={() => setOpen(null)} /> : null}
    </DataPanel>
  );
}

function SubMixBar({ mix }: { mix: Partial<Record<ArchId, number>> }) {
  const total = Object.values(mix).reduce((s, n) => s + (n ?? 0), 0) || 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-32 overflow-hidden rounded-full border border-line bg-surface-sunken">
        {ARCH_ORDER.map((id) => {
          const n = mix[id] ?? 0;
          if (!n) return null;
          const pct = (n / total) * 100;
          return <div key={id} style={{ width: `${pct}%`, backgroundColor: ARCH[id].color }} />;
        })}
      </div>
      <span className="font-mono-num text-[10px] text-muted-foreground">
        {ARCH_ORDER.filter((id) => mix[id]).map((id) => `${id}×${mix[id]}`).join(" ")}
      </span>
    </div>
  );
}

function AgencyDrawer({ agency, onClose }: { agency: AgencyRow; onClose: () => void }) {
  // Build a sample client list from the sub-mix.
  const rows: { project: string; arch: ArchId; conf: number; status: "active" | "trial" | "paused" }[] = [];
  ARCH_ORDER.forEach((id) => {
    const n = agency.subMix[id] ?? 0;
    for (let i = 0; i < n; i++) {
      rows.push({
        project: `${agency.id.replace("ag_", "")}-client-${rows.length + 1}.com`,
        arch: id,
        conf: 0.55 + ((i + id.charCodeAt(1)) % 9) / 20,
        status: i % 5 === 0 ? "trial" : i % 7 === 0 ? "paused" : "active",
      });
    }
  });
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-ink-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col border-l border-line bg-surface"
      >
        <div className="flex items-start justify-between border-b border-line p-4">
          <div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Agency · B5
            </div>
            <h3 className="font-display text-lg text-ink-900">{agency.name}</h3>
            <div className="font-mono-num text-[11px] text-muted-foreground">{agency.domain}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-line p-4 text-center">
          <div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Clients</div>
            <div className="font-mono-num text-lg text-ink-900">{agency.clients}</div>
          </div>
          <div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Seats</div>
            <div className="font-mono-num text-lg text-ink-900">{agency.seats}</div>
          </div>
          <div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Outcome</div>
            <div className="mt-1">
              <TrafficLight
                tone={agency.outcome === "healthy" ? "success" : agency.outcome === "watch" ? "warning" : "danger"}
                label={agency.outcome.replace("_", " ")}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-surface-sunken/80 text-left">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Sub-archetype</th>
                <th className="px-3 py-2 text-right">Confidence</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 font-mono-num text-ink-900">{r.project}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: ARCH[r.arch].color }} />
                      <span className="font-mono-num text-[11px]">{r.arch}</span>
                      <span className="text-muted-foreground">{ARCH[r.arch].label}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-ink-900">{r.conf.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <TrafficLight
                      tone={r.status === "active" ? "success" : r.status === "trial" ? "info" : "warning"}
                      label={r.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== 5) Distribution strip =========================== */

function DistributionStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <DonutCard
        title="Founder-as-face"
        hint="Non-inferable signal — pivotal for B2 routing."
        slices={[
          { label: "Yes", value: FOUNDER_FACE.yes, color: "#D6A256" },
          { label: "No", value: FOUNDER_FACE.no, color: "#7AA6C2" },
          { label: "Partly", value: FOUNDER_FACE.partly, color: "#6B6F78" },
        ]}
      />
      <DonutCard
        title="Catalog × locale"
        hint="Feeds B1-vs-B3 routing. Multi-locale = wholesale wedge."
        slices={[
          { label: "Single", value: CATALOG_LOCALE.single, color: "#7AA6C2" },
          { label: "Multi (3+ langs)", value: CATALOG_LOCALE.multi, color: "#1E3A34" },
        ]}
      />
      <BarCard
        title="Primary goal"
        hint="Self-reported during onboarding."
        rows={PRIMARY_GOAL}
      />
    </div>
  );
}

function DonutCard({
  title,
  hint,
  slices,
}: {
  title: string;
  hint: string;
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const c = 56; // circumference reference
  let offset = 0;
  return (
    <DataPanel title={title} hint={hint}>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 36 36" className="size-24 shrink-0">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--surface-sunken)" strokeWidth="3.2" />
          {slices.map((s) => {
            const pct = (s.value / total) * 100;
            const dash = `${pct} ${100 - pct}`;
            const node = (
              <circle
                key={s.label}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={s.color}
                strokeWidth="3.2"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform="rotate(-90 18 18)"
              />
            );
            offset += pct;
            return node;
          })}
        </svg>
        <ul className="flex-1 space-y-1.5 text-[12px]">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-ink-700">{s.label}</span>
              </span>
              <span className="font-mono-num text-ink-900">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* swallow unused c */}
      <span className="hidden">{c}</span>
    </DataPanel>
  );
}

function BarCard({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <DataPanel title={title} hint={hint}>
      <ul className="space-y-2 text-[12px]">
        {rows.map((r) => {
          const pct = Math.round((r.count / max) * 100);
          return (
            <li key={r.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-ink-700">{r.label}</span>
                <span className="font-mono-num text-ink-900">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: "var(--brand-700, #1E3A34)" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DataPanel>
  );
}

/* ===================== 6) Override-rate (pending) ====================== */

function OverrideRateCard() {
  return (
    <DataPanel
      title="Classifier override-rate"
      state="pending"
      pendingNote="True classifier accuracy = founder corrections vs AUTO suggestion. The AUTO suggestion isn't persisted yet; needs `segment_corrected` / `archetype_overridden` events (pending backend). Each override you log here starts building this metric."
      hint="The honest 'we can't measure true accuracy yet' panel."
    />
  );
}

/* ============================== locked view ============================ */

function LockedAgencyView() {
  return (
    <div className="mx-auto mt-10 max-w-lg rounded-[14px] border border-line bg-surface p-8 text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-sunken">
        <Lock className="size-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 font-display text-base text-ink-900">Segmentation Lens is platform-only</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        It exposes cross-tenant cost &amp; margin, which is restricted to founder-level operators.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5">
        <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <Lock className="size-3" strokeWidth={1.75} /> Locked
        </span>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Future: agency-admins will get a SCOPED archetype view of THEIR sub-clients only — no margin, no cross-tenant data.
      </p>
    </div>
  );
}

// Re-export MarginTable into the page below the MarginCard pending block so the shape stays reviewable.
// (Wired inside SegmentsPage via a wrapper.)
SegmentsPage.MarginTable = MarginTable;