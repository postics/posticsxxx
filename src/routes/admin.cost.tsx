// Platform-admin only route. The sidebar hides the Money group for agency-admin
// (see AdminShell), and this component guards the URL too. Agency users get a
// locked state — never any cross-tenant USD, take_rate, or unit_cost_usd_est.
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  Info,
  Lock,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import { DataPanel, Dot, TrafficLight, type Tone } from "@/features/admin/ui";

export const Route = createFileRoute("/admin/cost")({
  component: CostPage,
});

/* ---------------------------------- data ---------------------------------- */

type OrgRow = {
  id: string;
  org: string;
  type: "agency" | "ecom" | "services" | "saas";
  plan: "Starter" | "Growth" | "Premium" | "Agency" | "—";
  revenueUSD: number;
  cogsUSD: number;
  gm: number | null;
  takeRate: number | null;
  status: "active" | "suspended" | "trial";
  note?: string;
  star?: boolean;
};

const ORG_ROWS: OrgRow[] = [
  { id: "org_north", org: "Northbound Coffee", type: "ecom", plan: "Growth", revenueUSD: 0, cogsUSD: 0.18, gm: null, takeRate: null, status: "active", note: "GM% meaningless at stub COGS / $0 revenue" },
  { id: "org_bright", org: "Brightwell Goods", type: "ecom", plan: "Premium", revenueUSD: 0, cogsUSD: 0.41, gm: null, takeRate: null, status: "active", note: "Stub COGS · would flag negative at launch" },
  { id: "org_velourie", org: "Velourie Atelier", type: "ecom", plan: "Starter", revenueUSD: 0, cogsUSD: 0.07, gm: null, takeRate: null, status: "active" },
  { id: "org_solstice", org: "Solstice Soap", type: "ecom", plan: "Starter", revenueUSD: 0, cogsUSD: 0.02, gm: null, takeRate: null, status: "suspended" },
  { id: "org_loomwell", org: "Loomwell Linens", type: "ecom", plan: "Premium", revenueUSD: 0, cogsUSD: 0.22, gm: null, takeRate: null, status: "active" },
  { id: "org_pinegrove", org: "Pinegrove Pet Supply", type: "ecom", plan: "Agency", revenueUSD: 0, cogsUSD: 0.14, gm: null, takeRate: null, status: "active" },
  { id: "org_maple", org: "Maple & Co Agency", type: "agency", plan: "Agency", revenueUSD: 0, cogsUSD: 0.31, gm: null, takeRate: 0.18, status: "active", star: true, note: "wholesale ICP" },
  { id: "org_atlas", org: "Atlas Studio", type: "agency", plan: "Agency", revenueUSD: 0, cogsUSD: 0.09, gm: null, takeRate: 0.18, status: "active", star: true },
  { id: "org_harbor", org: "Harbor & Ash", type: "services", plan: "Growth", revenueUSD: 0, cogsUSD: 0.05, gm: null, takeRate: null, status: "trial" },
];

type LedgerRow = {
  ts: string;
  org: string;
  action: "generate" | "grant" | "refund" | "regenerate" | "humanize";
  pool: "action" | "video";
  qty: number;
  unitCostUSD: number;
  ref: string;
};

const LEDGER: LedgerRow[] = [
  { ts: "19:41:22", org: "Northbound Coffee", action: "generate", pool: "action", qty: -12, unitCostUSD: 0.0009, ref: "art_8410_5d4f9a" },
  { ts: "19:41:08", org: "Brightwell Goods", action: "generate", pool: "action", qty: -8, unitCostUSD: 0.0011, ref: "art_8409_b21e7c" },
  { ts: "19:40:55", org: "Maple & Co Agency", action: "regenerate", pool: "action", qty: -3, unitCostUSD: 0.0014, ref: "art_8408_71fa2b" },
  { ts: "19:39:12", org: "Loomwell Linens", action: "humanize", pool: "action", qty: -2, unitCostUSD: 0.0018, ref: "art_8405_aa19cc" },
  { ts: "19:38:01", org: "Pinegrove Pet Supply", action: "generate", pool: "video", qty: -1, unitCostUSD: 0.0, ref: "art_8404_v1_stub" },
  { ts: "19:36:44", org: "Atlas Studio", action: "grant", pool: "action", qty: 5000, unitCostUSD: 0, ref: "grant_q3_topup" },
  { ts: "19:31:18", org: "Velourie Atelier", action: "refund", pool: "action", qty: 12, unitCostUSD: 0, ref: "rf_qa_failed_8395" },
  { ts: "19:29:02", org: "Solstice Soap", action: "generate", pool: "action", qty: -4, unitCostUSD: 0.0008, ref: "art_8392_d11e90" },
];

const TREND_DAYS = 30;
const TREND = Array.from({ length: TREND_DAYS }, (_, i) => {
  const stub = 0.008 + Math.abs(Math.sin(i * 0.7)) * 0.018;
  const real = 0;
  return { day: i + 1, stub, real };
});
const MTD_COGS = TREND.reduce((s, d) => s + d.stub + d.real, 0);
const STUB_SHARE = 0.998;
const BLENDED_CPC = 0.0009;

type ActionCost = { key: string; label: string; usd: number | null; soon?: boolean };
const ACTION_COSTS: ActionCost[] = [
  { key: "article", label: "Article", usd: 0.0011 },
  { key: "product_description", label: "Product description", usd: 0.0008 },
  { key: "social_post", label: "Social post", usd: 0.0004 },
  { key: "product_photo", label: "Product photo", usd: null, soon: true },
  { key: "product_video", label: "Product video", usd: null, soon: true },
];

const HEATMAP_ORGS = ORG_ROWS.map((o) => o.org);
const HEATMAP = HEATMAP_ORGS.map((_org, i) =>
  Array.from({ length: 14 }, (_, d) => {
    const seed = (i * 13 + d * 7) % 100;
    return seed / 100;
  }),
);
const NEAR_DEPLETION = [
  { org: "Atlas Studio", left: "4%", balance: "2,140" },
  { org: "Velourie Atelier", left: "8%", balance: "1,610" },
  { org: "Harbor & Ash", left: "9%", balance: "1,820" },
];
const HOARDING = [
  { org: "Loomwell Linens", unburned: "78%", balance: "39,000" },
  { org: "Pinegrove Pet Supply", unburned: "71%", balance: "44,600" },
];

/* ---------------------------------- page ---------------------------------- */

type Range = "7d" | "30d" | "MTD" | "QTD";
type CostMode = "usd" | "credits";

function CostPage() {
  const { session } = useAdmin();
  if (session && session.role !== "platform") {
    return <Navigate to="/admin" />;
  }

  const [range, setRange] = useState<Range>("MTD");
  const [mode, setMode] = useState<CostMode>("usd");

  return (
    <AdminShell
      title="Unit-economics & cost"
      breadcrumb={["Admin", "Money", "Unit-economics"]}
      actions={<TrafficLight tone="warning" label="Stub data" />}
    >
      <div className="space-y-4">
        <StubBanner />
        <TitleRow range={range} onRange={setRange} mode={mode} onMode={setMode} />

        <GrossCogsHero range={range} />
        <PerOrgMarginTable />

        <div className="grid gap-4 xl:grid-cols-2">
          <CostPerActionType />
          <CreditHeatmap />
        </div>

        <FounderLedger />

        <div className="grid gap-4 xl:grid-cols-2">
          <ModelMixPending />
          <UnaccountedSpend />
        </div>

        <p className="border-t border-line pt-3 text-[11px] text-muted-foreground">
          Read-only analytics. Mutations during any impersonation session are blocked (read-only by default).
        </p>
      </div>
    </AdminShell>
  );
}

/* --------------------------------- banners -------------------------------- */

function StubBanner() {
  const { stubMode } = useAdmin();
  if (!stubMode) return null;
  return (
    <div
      className="flex items-start gap-2.5 rounded-[10px] border px-3 py-2 text-[12px]"
      style={{
        borderColor: "color-mix(in oklab, var(--warning, #B07B2C) 40%, var(--line, #E7E2D9))",
        backgroundColor: "color-mix(in oklab, var(--warning, #B07B2C) 8%, var(--surface, #FFFFFF))",
      }}
    >
      <Dot tone="warning" className="mt-1.5" />
      <div className="flex-1">
        <p className="text-ink-900">
          AI Gateway: <span className="font-mono-num">STUB</span> — costs ~$0, content placeholder. Margin thesis is{" "}
          <span className="font-medium">UNVERIFIABLE</span> until a real Anthropic key is live.
        </p>
      </div>
      <span
        title="All USD COGS on this page reflect unit_cost_usd_est, which is ~0 while the Gateway runs on a stub. Numbers go real when the key flips."
        className="mt-0.5 text-muted-foreground"
      >
        <Info className="size-3.5" strokeWidth={1.75} />
      </span>
    </div>
  );
}

function TitleRow({
  range,
  onRange,
  mode,
  onMode,
}: {
  range: Range;
  onRange: (r: Range) => void;
  mode: CostMode;
  onMode: (m: CostMode) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Unit-Economics & Cost</h2>
          <p className="font-mono-num mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Platform-admin · cross-tenant · founder-only USD
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented<Range>
            value={range}
            onChange={onRange}
            options={[
              { v: "7d", label: "7d" },
              { v: "30d", label: "30d" },
              { v: "MTD", label: "MTD" },
              { v: "QTD", label: "QTD" },
            ]}
          />
          <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">cost mode</span>
          <Segmented<CostMode>
            value={mode}
            onChange={onMode}
            options={[
              { v: "usd", label: "USD" },
              { v: "credits", label: "Credits" },
            ]}
          />
        </div>
      </div>
      <div className="mt-3 border-t border-line" />
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-line bg-surface p-0.5">
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "font-mono-num rounded-md px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] transition active:scale-[0.97]",
              active
                ? "bg-[color:var(--brand-700,#1E3A34)] text-paper"
                : "text-muted-foreground hover:text-ink-900",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- 1) hero -------------------------------- */

function GrossCogsHero({ range }: { range: Range }) {
  const w = 920;
  const h = 140;
  const max = Math.max(...TREND.map((d) => d.stub + d.real), 0.04);
  const step = w / (TREND.length - 1);
  const points = (pick: (d: typeof TREND[number]) => number) =>
    TREND.map((d, i) => `${(i * step).toFixed(1)},${(h - (pick(d) / max) * (h - 12)).toFixed(1)}`).join(" ");

  const stubArea = `0,${h} ${points((d) => d.stub)} ${w},${h}`;

  return (
    <DataPanel
      title="Gross COGS · cross-tenant"
      hint="Daily sum unit_cost_usd_est. Real-model USD stacked on stub USD (~$0 today)."
      actions={<TrafficLight tone="success" label="live" />}
    >
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <Metric label={`${range} COGS`} value={`$${MTD_COGS.toFixed(2)}`} sub="tiny — stub gateway" />
          <div className="rounded-md border border-line bg-surface-sunken/40 p-3">
            <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Blended cost / credit
            </span>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-mono-num text-xl text-ink-900">${BLENDED_CPC.toFixed(4)}</span>
              <span className="font-mono-num text-[11px] text-muted-foreground">vs $0.0150 target</span>
            </div>
            <span className="font-mono-num mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
              <Dot tone="success" /> under target
            </span>
          </div>
          <Metric label="Stub share" value={`${(STUB_SHARE * 100).toFixed(1)}%`} sub="real share emerges post-flip" />
        </div>

        <div>
          <svg width="100%" viewBox={`0 0 ${w} ${h + 22}`} className="w-full">
            <line x1={0} y1={h} x2={w} y2={h} stroke="var(--line, #E7E2D9)" />
            <polygon
              points={stubArea}
              fill="color-mix(in oklab, var(--warning, #B07B2C) 18%, transparent)"
            />
            <polyline
              points={points((d) => d.stub)}
              fill="none"
              stroke="var(--warning, #B07B2C)"
              strokeWidth={1.25}
            />
            <polyline
              points={points((d) => d.stub + d.real)}
              fill="none"
              stroke="var(--brand-700, #1E3A34)"
              strokeWidth={1.5}
            />
            <text x={4} y={12} className="font-mono-num" fontSize="9" fill="var(--muted-foreground, #6B6F78)">
              ${max.toFixed(2)}
            </text>
            <text x={4} y={h - 2} className="font-mono-num" fontSize="9" fill="var(--muted-foreground, #6B6F78)">
              $0.00
            </text>
          </svg>
          <div className="font-mono-num mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-sm" style={{ background: "var(--brand-700, #1E3A34)" }} /> real-model USD
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-sm" style={{ background: "var(--warning, #B07B2C)" }} /> stub USD ~$0
            </span>
            <span>last {TREND_DAYS}d · daily</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Real COGS appears once the Gateway key is live.
          </p>
        </div>
      </div>
    </DataPanel>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="font-mono-num mt-0.5 text-2xl text-ink-900">{value}</div>
      {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

/* --------------------------- 2) per-org margin --------------------------- */

type Filter = { type?: OrgRow["type"]; plan?: OrgRow["plan"]; status?: OrgRow["status"]; lossOnly?: boolean };
type SortKey = "gm" | "revenue" | "cogs" | "org";

function PerOrgMarginTable() {
  const [filter, setFilter] = useState<Filter>({});
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "gm", dir: "asc" });
  const [action, setAction] = useState<{ row: OrgRow; kind: ActionKind } | null>(null);

  const rows = useMemo(() => {
    let r = [...ORG_ROWS];
    if (filter.type) r = r.filter((x) => x.type === filter.type);
    if (filter.plan) r = r.filter((x) => x.plan === filter.plan);
    if (filter.status) r = r.filter((x) => x.status === filter.status);
    if (filter.lossOnly) r = r.filter((x) => x.gm == null || x.gm < 0);
    r.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const get = (x: OrgRow): number | string => {
        if (sort.key === "org") return x.org;
        if (sort.key === "revenue") return x.revenueUSD;
        if (sort.key === "cogs") return x.cogsUSD;
        return x.gm ?? -Infinity;
      };
      const av = get(a);
      const bv = get(b);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return r;
  }, [filter, sort]);

  return (
    <>
      <DataPanel
        title="Per-org margin · worst-first"
        hint="Cross-tenant. Loss-makers flagged. GM% reads meaningfully once revenue and real COGS land."
        actions={
          <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
            <Lock className="size-3" strokeWidth={1.75} /> founder-only USD
          </span>
        }
      >
        <FilterBar filter={filter} setFilter={setFilter} />

        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="sticky top-0 bg-surface-sunken/60">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Th label="Org" onClick={() => toggleSort(sort, setSort, "org")} active={sort.key === "org"} dir={sort.dir} />
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <Th label="Revenue" align="right" onClick={() => toggleSort(sort, setSort, "revenue")} active={sort.key === "revenue"} dir={sort.dir} />
                <Th label="Real COGS" align="right" onClick={() => toggleSort(sort, setSort, "cogs")} active={sort.key === "cogs"} dir={sort.dir} />
                <Th label="GM%" align="right" onClick={() => toggleSort(sort, setSort, "gm")} active={sort.key === "gm"} dir={sort.dir} />
                <th className="px-3 py-2 text-right font-medium">take_rate</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <OrgRowEl key={r.id} row={r} onAction={(kind) => setAction({ row: r, kind })} />
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-[11px] text-muted-foreground">No rows match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DataPanel>

      <ConfirmActionDialog
        action={action}
        onClose={() => setAction(null)}
      />
    </>
  );
}

function toggleSort(
  sort: { key: SortKey; dir: "asc" | "desc" },
  set: (s: { key: SortKey; dir: "asc" | "desc" }) => void,
  key: SortKey,
) {
  if (sort.key === key) set({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
  else set({ key, dir: key === "gm" ? "asc" : "desc" });
}

function Th({
  label,
  align,
  onClick,
  active,
  dir,
}: {
  label: string;
  align?: "right";
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className={cn("px-3 py-2 font-medium", align === "right" && "text-right")}>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-[0.12em] hover:text-ink-900",
          active && "text-ink-900",
        )}
      >
        {label}
        {active ? <span className="text-[8px]">{dir === "asc" ? "▲" : "▼"}</span> : null}
      </button>
    </th>
  );
}

function FilterBar({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        label="Type"
        value={filter.type ?? ""}
        onChange={(v) => setFilter({ ...filter, type: (v || undefined) as OrgRow["type"] | undefined })}
        options={[
          { v: "", label: "All types" },
          { v: "agency", label: "Agency" },
          { v: "ecom", label: "E-com" },
          { v: "services", label: "Services" },
          { v: "saas", label: "SaaS" },
        ]}
      />
      <Select
        label="Plan"
        value={filter.plan ?? ""}
        onChange={(v) => setFilter({ ...filter, plan: (v || undefined) as OrgRow["plan"] | undefined })}
        options={[
          { v: "", label: "All plans" },
          { v: "Starter", label: "Starter" },
          { v: "Growth", label: "Growth" },
          { v: "Premium", label: "Premium" },
          { v: "Agency", label: "Agency" },
        ]}
      />
      <Select
        label="Status"
        value={filter.status ?? ""}
        onChange={(v) => setFilter({ ...filter, status: (v || undefined) as OrgRow["status"] | undefined })}
        options={[
          { v: "", label: "Any status" },
          { v: "active", label: "Active" },
          { v: "trial", label: "Trial" },
          { v: "suspended", label: "Suspended" },
        ]}
      />
      <label className="font-mono-num ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-700 hover:bg-surface-sunken">
        <input
          type="checkbox"
          checked={!!filter.lossOnly}
          onChange={(e) => setFilter({ ...filter, lossOnly: e.target.checked })}
          className="size-3 accent-[color:var(--brand-700,#1E3A34)]"
        />
        loss-makers only
      </label>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
}) {
  return (
    <label className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-ink-700 outline-none hover:bg-surface-sunken focus:border-brand-500"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function gmTone(gm: number | null): Tone {
  if (gm == null) return "muted";
  if (gm < 0.6) return "danger";
  if (gm < 0.7) return "warning";
  return "success";
}

function OrgRowEl({ row, onAction }: { row: OrgRow; onAction: (k: ActionKind) => void }) {
  const loss = row.gm == null || row.gm < 0;
  const [menu, setMenu] = useState(false);
  return (
    <tr
      className={cn("border-t border-line align-middle hover:bg-surface-sunken/40", loss && "relative")}
      style={loss ? { boxShadow: "inset 3px 0 0 var(--danger, #A6453C)" } : undefined}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-ink-900">{row.org}</span>
          {row.star ? <span className="font-mono-num text-[10px] text-[color:var(--accent-gold,#B98A3E)]" title="Wholesale ICP">★</span> : null}
          {loss ? (
            <span className="font-mono-num inline-flex items-center gap-1 rounded-md border border-[color:var(--danger,#A6453C)]/40 bg-[color:var(--danger,#A6453C)]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[color:var(--danger,#A6453C)]">
              loss-maker
            </span>
          ) : null}
        </div>
        {row.note ? <p className="mt-0.5 text-[10px] text-muted-foreground">{row.note}</p> : null}
      </td>
      <td className="px-3 py-2"><Chip>{row.type}</Chip></td>
      <td className="px-3 py-2"><Chip>{row.plan}</Chip></td>
      <td className="font-mono-num px-3 py-2 text-right text-ink-700">${row.revenueUSD.toFixed(2)}</td>
      <td className="font-mono-num px-3 py-2 text-right text-muted-foreground">${row.cogsUSD.toFixed(2)}</td>
      <td className="font-mono-num px-3 py-2 text-right">
        <span className="inline-flex items-center gap-1.5">
          <Dot tone={gmTone(row.gm)} />
          <span className={cn(row.gm == null && "text-muted-foreground", row.gm != null && "text-ink-900")}>
            {row.gm == null ? "—" : `${(row.gm * 100).toFixed(0)}%`}
          </span>
        </span>
      </td>
      <td className="font-mono-num px-3 py-2 text-right text-muted-foreground">
        {row.takeRate == null ? "—" : `${(row.takeRate * 100).toFixed(0)}%`}
      </td>
      <td className="px-3 py-2">
        <Chip tone={row.status === "suspended" ? "danger" : row.status === "trial" ? "info" : "success"}>{row.status}</Chip>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setMenu((v) => !v)}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface-sunken hover:text-ink-900"
            aria-label="row actions"
          >
            <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
          </button>
          {menu && (
            <div
              onMouseLeave={() => setMenu(false)}
              className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]"
            >
              <MenuItem onClick={() => { setMenu(false); onAction("grant"); }}>Grant / refund credits</MenuItem>
              <MenuItem onClick={() => { setMenu(false); onAction("override"); }}>Override plan / take_rate</MenuItem>
              <MenuItem onClick={() => { setMenu(false); onAction("suspend"); }} danger>
                {row.status === "suspended" ? "Reactivate org" : "Suspend org"}
              </MenuItem>
              <a
                href={`/admin/orgs?org=${row.id}`}
                className="block border-t border-line px-3 py-2 text-[11px] text-ink-700 hover:bg-surface-sunken"
              >
                Open org ↗
              </a>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className="font-mono-num inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-sunken/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700">
      {tone !== "muted" ? <Dot tone={tone} /> : null}
      {children}
    </span>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full px-3 py-2 text-left text-[11px] hover:bg-surface-sunken",
        danger ? "text-[color:var(--danger,#A6453C)]" : "text-ink-700",
      )}
    >
      {children}
    </button>
  );
}

/* ----------------------------- confirm dialog ----------------------------- */

type ActionKind = "grant" | "override" | "suspend";

function ConfirmActionDialog({
  action,
  onClose,
}: {
  action: { row: OrgRow; kind: ActionKind } | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [pool, setPool] = useState<"action" | "video">("action");
  const [qty, setQty] = useState<string>("1000");
  const [plan, setPlan] = useState<OrgRow["plan"]>("Growth");
  const [takeRate, setTakeRate] = useState<string>("18");

  if (!action) return null;
  const { row, kind } = action;
  const title =
    kind === "grant"
      ? "Grant / refund credits"
      : kind === "override"
      ? "Override plan / take_rate"
      : row.status === "suspended" ? "Reactivate org" : "Suspend org";
  const destructive = kind === "suspend" && row.status !== "suspended";

  const summary =
    kind === "suspend"
      ? `${row.org} · ${row.status} → ${row.status === "suspended" ? "active" : "suspended"}`
      : kind === "override"
      ? `${row.org} · ${row.plan}/${row.takeRate != null ? (row.takeRate * 100).toFixed(0) + "%" : "—"} → ${plan}/${takeRate}%`
      : `${row.org} · ${pool} pool · ${qty.startsWith("-") ? "refund" : "grant"} ${qty} credits`;

  const valid = reason.trim().length >= 3 && (kind !== "grant" || qty.trim() !== "0");

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-line bg-surface p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        <h3 className="font-display text-base text-ink-900">{title}</h3>
        <p className="font-mono-num mt-1 text-[11px] text-muted-foreground">{summary}</p>

        {kind === "grant" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Pool
              <select
                value={pool}
                onChange={(e) => setPool(e.target.value as "action" | "video")}
                className="font-mono-num mt-1 w-full rounded-md border border-line bg-surface-sunken/40 px-2 py-1.5 text-sm text-ink-900"
              >
                <option value="action">action</option>
                <option value="video">video</option>
              </select>
            </label>
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Qty (use − for refund)
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="font-mono-num mt-1 w-full rounded-md border border-line bg-surface-sunken/40 px-2 py-1.5 text-sm text-ink-900"
              />
            </label>
          </div>
        )}

        {kind === "override" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Plan
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as OrgRow["plan"])}
                className="font-mono-num mt-1 w-full rounded-md border border-line bg-surface-sunken/40 px-2 py-1.5 text-sm text-ink-900"
              >
                {["Starter", "Growth", "Premium", "Agency"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              take_rate %
              <input
                value={takeRate}
                onChange={(e) => setTakeRate(e.target.value)}
                className="font-mono-num mt-1 w-full rounded-md border border-line bg-surface-sunken/40 px-2 py-1.5 text-sm text-ink-900"
              />
            </label>
          </div>
        )}

        {kind === "suspend" && (
          <p className="mt-3 rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-[11px] text-ink-700">
            Suspend gates OUTBOUND expensive paths (generation / video / auto-publish), not just login.
          </p>
        )}

        <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Reason (required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Why are you doing this?"
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Writes to append-only audit-log (actor = founder).
          {kind === "grant" ? " · Grant/refund inserts are idempotent." : ""}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => {
              toast.success(`Logged to audit-log · ${title}`);
              setReason("");
              onClose();
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium text-paper transition disabled:opacity-50",
              destructive
                ? "bg-[color:var(--danger,#A6453C)] hover:opacity-90"
                : "bg-[color:var(--brand-700,#1E3A34)] hover:bg-[color:var(--brand-500,#2F5B50)]",
            )}
          >
            {destructive ? "Suspend" : kind === "override" ? "Override" : kind === "grant" ? "Grant" : "Reactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- 3) cost per action type ------------------------ */

function CostPerActionType() {
  const max = Math.max(...ACTION_COSTS.map((a) => a.usd ?? 0));
  return (
    <DataPanel
      title="Cost per action-type"
      hint="Mean USD per unit. Photos/videos pending model (M2)."
      actions={<TrafficLight tone="success" label="live" />}
    >
      <ul className="space-y-2">
        {ACTION_COSTS.map((a) => {
          const pct = a.usd == null ? 0 : Math.max(4, (a.usd / max) * 100);
          return (
            <li key={a.key} className="flex items-center gap-3">
              <div className="w-44 text-[11px] text-ink-700">{a.label}</div>
              <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-surface-sunken/60">
                {a.soon ? (
                  <div className="absolute inset-0 flex items-center px-2">
                    <div className="h-2 w-1/3 rounded bg-line" />
                    <span className="font-mono-num ml-auto rounded-md border border-line bg-surface px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      soon · M2
                    </span>
                  </div>
                ) : (
                  <div
                    className="h-full rounded-md bg-[color:var(--brand-700,#1E3A34)]/85"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
              <div className="w-28 text-right font-mono-num text-[11px] text-ink-900">
                {a.usd == null ? "—" : `$${a.usd.toFixed(4)}`}
                {a.usd != null ? <span className="text-muted-foreground"> (stub)</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Costs are ~$0 on stub; ranking holds, magnitudes don't.
      </p>
    </DataPanel>
  );
}

/* --------------------------- 4) credit heatmap --------------------------- */

function CreditHeatmap() {
  return (
    <DataPanel
      title="Credit utilization"
      hint="Burned / granted ratio per org · last 14 days."
      actions={<TrafficLight tone="success" label="live" />}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1 text-[11px]">
            <tbody>
              {HEATMAP.map((row, i) => (
                <tr key={HEATMAP_ORGS[i]}>
                  <td className="pr-2 text-ink-700 whitespace-nowrap">{HEATMAP_ORGS[i]}</td>
                  {row.map((v, j) => (
                    <td key={j} className="px-0.5">
                      <div
                        title={`${(v * 100).toFixed(0)}% burned`}
                        className="h-3.5 w-3.5 rounded-[3px]"
                        style={{
                          background:
                            v > 0.9
                              ? "var(--danger, #A6453C)"
                              : `color-mix(in oklab, var(--brand-700, #1E3A34) ${Math.round(v * 90 + 8)}%, var(--brand-100, #E4EDE8))`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="font-mono-num mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>low</span>
            <div className="h-2 w-24 rounded" style={{ background: "linear-gradient(to right, var(--brand-100, #E4EDE8), var(--brand-700, #1E3A34))" }} />
            <span>high</span>
            <span className="ml-2 inline-flex items-center gap-1"><Dot tone="danger" />&gt;90% burned</span>
          </div>
        </div>

        <div className="space-y-3">
          <MiniList title="Near depletion (<=10% left)" tone="warning">
            {NEAR_DEPLETION.map((r) => (
              <li key={r.org} className="flex items-center justify-between gap-2 py-1 text-[11px]">
                <span className="text-ink-700 truncate">{r.org}</span>
                <span className="font-mono-num text-muted-foreground">{r.left} · {r.balance}</span>
              </li>
            ))}
          </MiniList>
          <MiniList title="Hoarding (unburned)" tone="info">
            {HOARDING.map((r) => (
              <li key={r.org} className="flex items-center justify-between gap-2 py-1 text-[11px]">
                <span className="text-ink-700 truncate">{r.org}</span>
                <span className="font-mono-num text-muted-foreground">{r.unburned} · {r.balance}</span>
              </li>
            ))}
          </MiniList>
        </div>
      </div>
    </DataPanel>
  );
}

function MiniList({ title, tone, children }: { title: string; tone: Tone; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface-sunken/40 p-2.5">
      <div className="font-mono-num mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Dot tone={tone} /> {title}
      </div>
      <ul className="divide-y divide-line">{children}</ul>
    </div>
  );
}

/* ------------------------- 5) founder-only ledger ------------------------- */

function FounderLedger() {
  const [org, setOrg] = useState<string>("");
  const [act, setAct] = useState<string>("");
  const [pool, setPool] = useState<string>("");

  const rows = LEDGER.filter(
    (r) =>
      (!org || r.org === org) &&
      (!act || r.action === act) &&
      (!pool || r.pool === pool),
  );

  const orgOpts = Array.from(new Set(LEDGER.map((r) => r.org)));

  return (
    <DataPanel
      title="Founder-only USD ledger"
      hint="Mirrors credit_ledger + unit_cost_usd_est (never exposed to tenants)."
      actions={
        <div className="flex items-center gap-2">
          <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
            <Lock className="size-3" strokeWidth={1.75} /> founder-only · hidden from tenants
          </span>
          <button
            onClick={() => toast.success("CSV export queued (mock)")}
            className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-700 hover:bg-surface-sunken active:scale-[0.97]"
          >
            <Download className="size-3" strokeWidth={1.75} /> Export CSV
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select label="Org" value={org} onChange={setOrg} options={[{ v: "", label: "All orgs" }, ...orgOpts.map((o) => ({ v: o, label: o }))]} />
        <Select label="Action" value={act} onChange={setAct} options={[
          { v: "", label: "Any action" },
          { v: "generate", label: "generate" },
          { v: "grant", label: "grant" },
          { v: "refund", label: "refund" },
          { v: "regenerate", label: "regenerate" },
          { v: "humanize", label: "humanize" },
        ]} />
        <Select label="Pool" value={pool} onChange={setPool} options={[
          { v: "", label: "Any pool" },
          { v: "action", label: "action" },
          { v: "video", label: "video" },
        ]} />
      </div>

      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-sunken/60">
            <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-2 font-medium">ts</th>
              <th className="px-3 py-2 font-medium">Org</th>
              <th className="px-3 py-2 font-medium">action_type</th>
              <th className="px-3 py-2 font-medium">pool</th>
              <th className="px-3 py-2 text-right font-medium">qty</th>
              <th className="px-3 py-2 text-right font-medium">unit_cost_usd_est</th>
              <th className="px-3 py-2 font-medium">ref</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line hover:bg-surface-sunken/40">
                <td className="font-mono-num px-3 py-1.5 text-muted-foreground">{r.ts}</td>
                <td className="px-3 py-1.5 text-ink-900">{r.org}</td>
                <td className="px-3 py-1.5"><Chip>{r.action}</Chip></td>
                <td className="px-3 py-1.5"><Chip>{r.pool}</Chip></td>
                <td className={cn("font-mono-num px-3 py-1.5 text-right tabular-nums", r.qty < 0 ? "text-muted-foreground" : "text-ink-900")}>
                  {r.qty > 0 ? `+${r.qty}` : r.qty}
                </td>
                <td className="font-mono-num px-3 py-1.5 text-right text-ink-900">${r.unitCostUSD.toFixed(4)}</td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  <span title={r.ref} className="font-mono-num inline-block max-w-[180px] truncate align-middle text-[11px]">
                    {r.ref}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        The <span className="font-mono-num">unit_cost_usd_est</span> column is intentionally absent from the customer LedgerEntry.
      </p>
    </DataPanel>
  );
}

/* ------------------------- 6) model-mix · pending ------------------------- */

function ModelMixPending() {
  const tiles = [
    { label: "Cost by model/tier (Opus/Sonnet/Haiku)", hint: "Wire it: artifacts.model_route is a stub ({artifact_key}); persist real route + cost per artifact." },
    { label: "Cache-hit rate & savings", hint: "Wire it: cache_read/cache_creation tokens live only in debug logs; persist on the usage/ai_calls row." },
    { label: "Batch vs interactive split", hint: "Wire it: the batch flag is not persisted." },
  ];
  return (
    <DataPanel
      title="Model mix · cache · batch"
      hint="Three sub-tiles, all currently un-instrumented."
      actions={
        <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <Dot tone="danger" /> pending instrumentation
        </span>
      }
    >
      <div className="grid gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md border border-dashed border-line bg-surface-sunken/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-ink-700">{t.label}</span>
              <span
                title={t.hint}
                className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <Info className="size-3" strokeWidth={1.75} /> pending
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-line" />
              <div className="h-2 w-1/2 rounded bg-line/70" />
              <div className="h-2 w-2/5 rounded bg-line/50" />
            </div>
          </div>
        ))}
      </div>
    </DataPanel>
  );
}

/* ---------------------- 7) unaccounted spend warning --------------------- */

function UnaccountedSpend() {
  return (
    <section
      className="rounded-[14px] border p-4"
      style={{
        borderColor: "color-mix(in oklab, var(--danger, #A6453C) 45%, var(--line, #E7E2D9))",
        backgroundColor: "color-mix(in oklab, var(--danger, #A6453C) 4%, var(--surface, #FFFFFF))",
      }}
    >
      <header className="mb-2 flex items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-[13px] text-ink-900">
          <ShieldAlert className="size-4 text-[color:var(--danger,#A6453C)]" strokeWidth={1.75} />
          Unaccounted spend
        </h3>
        <span
          title="Wire it: bill & log analysis/strategy/brief spend; keep spend-coverage integrity (credit_ledger.ref_artifact_id × artifacts)."
          className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        >
          <Dot tone="danger" /> pending instrumentation
        </span>
      </header>
      <p className="text-[12px] text-ink-700">
        Blind spot: <span className="font-mono-num">analysis</span> &{" "}
        <span className="font-mono-num">strategy</span> spend is computed but{" "}
        <span className="font-medium">NOT debited</span> — gross COGS is understated.
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        No invented figure shown. Wire briefs/strategy spend into the ledger to lift the blind spot.
      </p>
    </section>
  );
}
