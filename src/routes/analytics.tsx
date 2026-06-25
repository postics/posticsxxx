import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Lock,
  Info,
  Globe,
  ShoppingBag,
  Search,
  BarChart3,
  Radar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, StatusChip } from "@/features/shared/primitives";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Outcomes — Postics" },
      {
        name: "description",
        content:
          "What your published content earns — indexation, position, on-page conversions, revenue per page/SKU.",
      },
    ],
  }),
  component: AnalyticsPage,
});

type Period = "1d" | "7d" | "30d" | "90d";

function AnalyticsPage() {
  return (
    <ProjectShell breadcrumb={[{ label: "Outcomes" }]}>
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-8 py-8 animate-rise">
        <Body />
      </div>
    </ProjectShell>
  );
}

function Body() {
  const { currentProject } = useScope();
  const [period, setPeriod] = useState<Period>("30d");
  // Flip to true to preview the "collecting" empty state.
  const collecting = false;

  return (
    <>
      <Header projectName={currentProject.name} period={period} setPeriod={setPeriod} />
      <SampleBanner />
      {collecting ? (
        <Collecting />
      ) : (
        <>
          <Kpis period={period} />
          <ChartsGrid period={period} />
          <AssetsTable />
          <DataLoop />
        </>
      )}
    </>
  );
}

/* ---------------- header ---------------- */

function Header({
  projectName,
  period,
  setPeriod,
}: {
  projectName: string;
  period: Period;
  setPeriod: (p: Period) => void;
}) {
  return (
    <header className="space-y-4">
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Measure
          </div>
          <h1 className="text-3xl font-medium text-ink-900">Outcomes</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            What your published content earns — indexation, position, on-page
            conversions, revenue per page/SKU.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/50 px-2 py-1 font-mono-num text-[11px] uppercase tracking-wider text-[color:var(--accent-gold)]">
          Sample data
        </span>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-brand-100 text-brand-700">
            <ShoppingBag className="size-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink-900">{projectName}</span>
              <StatusChip tone="live">Connected</StatusChip>
              <StatusChip tone="neutral">Growth</StatusChip>
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono-num text-[11px] text-muted-foreground">
              <span>northboundcoffee.com</span>
              <span className="opacity-40">·</span>
              <span>EN · DE · ES · FR</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SourceChip icon={Search} label="GSC" />
          <SourceChip icon={BarChart3} label="GA4" />
          <SourceChip icon={Radar} label="GEO/AEO" />
          <SourceChip icon={ShoppingBag} label="Woo" />
          <div className="mx-1 h-5 w-px bg-line" />
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>
      </Card>
    </header>
  );
}

function SourceChip({
  icon: Icon,
  label,
}: {
  icon: typeof Search;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-100/40 px-2 py-1 font-mono-num text-[11px] uppercase tracking-wider text-brand-700">
      <Icon className="size-3" strokeWidth={1.75} />
      {label}
    </span>
  );
}

function PeriodPicker({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const opts: Period[] = ["1d", "7d", "30d", "90d"];
  return (
    <div className="inline-flex rounded-md border border-line bg-surface-sunken p-0.5">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-[6px] px-2.5 py-1 font-mono-num text-[11px] uppercase tracking-wider transition",
            value === o
              ? "bg-surface text-ink-900 shadow-[0_1px_0_rgba(20,24,31,0.04)]"
              : "text-muted-foreground hover:text-ink-700",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SampleBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-line bg-surface-sunken/60 px-3.5 py-2 text-[12px] text-muted-foreground">
      <Info className="size-3.5" strokeWidth={1.75} />
      <span>
        Sample data — your real signals appear ~14–30 days after publish &
        indexation.
      </span>
    </div>
  );
}

/* ---------------- kpis ---------------- */

function Kpis({ period }: { period: Period }) {
  const scale = period === "1d" ? 0.05 : period === "7d" ? 0.3 : period === "90d" ? 2.4 : 1;
  const seriesA = useMemo(() => makeSeries(28, 12, 60, 0.18), []);
  const seriesB = useMemo(() => makeSeries(28, 60, 20, -0.25), []);
  const seriesC = useMemo(() => makeSeries(28, 18, 31, 0.12), []);
  const seriesD = useMemo(() => makeSeries(28, 24, 42, 0.2), []);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        label="Indexation"
        value={fmt(Math.round(1284 * (scale * 0.6 + 0.4)))}
        total="/ 1,640 pages"
        delta="+62"
        up
        series={seriesA}
      />
      <Kpi
        label="Avg position"
        value="14.2"
        delta="−1.8"
        up
        hint="lower is better"
        series={seriesB}
      />
      <Kpi
        label="On-page conversions"
        value="3.1%"
        delta="+0.4 pp"
        up
        series={seriesC}
      />
      <Kpi
        label="Revenue per page/SKU"
        value="$42"
        hint="avg"
        delta="+$6"
        up
        gold
        series={seriesD}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  total,
  hint,
  delta,
  up,
  gold,
  series,
}: {
  label: string;
  value: string;
  total?: string;
  hint?: string;
  delta: string;
  up: boolean;
  gold?: boolean;
  series: { i: number; v: number }[];
}) {
  return (
    <Card className={cn("p-4", gold && "border-[color:var(--accent-gold-soft)]")}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono-num text-[9px] uppercase tracking-wider text-muted-foreground">
          sample
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono-num text-2xl text-ink-900">{value}</span>
        {total ? (
          <span className="font-mono-num text-xs text-muted-foreground">{total}</span>
        ) : null}
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-mono-num text-[11px]",
            gold
              ? "text-[color:var(--accent-gold)]"
              : up
                ? "text-brand-700"
                : "text-[color:var(--danger)]",
          )}
        >
          {up ? (
            <TrendingUp className="size-3" strokeWidth={2} />
          ) : (
            <TrendingDown className="size-3" strokeWidth={2} />
          )}
          {delta}
        </span>
        <span className="text-[10px] text-muted-foreground">vs prev. period</span>
      </div>
      <div className="mt-2 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id={`kpi-${label}`} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={gold ? "var(--accent-gold)" : "var(--brand-700)"}
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor={gold ? "var(--accent-gold)" : "var(--brand-700)"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={gold ? "var(--accent-gold)" : "var(--brand-700)"}
              strokeWidth={1.5}
              fill={`url(#kpi-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ---------------- charts grid ---------------- */

function ChartsGrid({ period: _period }: { period: Period }) {
  const indexation = useMemo(
    () =>
      makeSeries(30, 720, 1284, 0.04).map((d) => ({
        day: `D${d.i + 1}`,
        v: d.v,
      })),
    [],
  );
  const position = useMemo(
    () =>
      makeSeries(30, 28, 14.2, -0.04).map((d) => ({
        day: `D${d.i + 1}`,
        v: Number(d.v.toFixed(1)),
      })),
    [],
  );
  const conversions = useMemo(
    () =>
      [1.6, 1.8, 2.1, 2.0, 2.4, 2.9, 3.1, 3.0, 3.3].map((v, i) => ({
        w: `W${i + 1}`,
        v,
      })),
    [],
  );
  const revenue = useMemo(
    () => [
      { name: "Konga (250g)", v: 1820 },
      { name: "Brew kit · starter", v: 1240 },
      { name: "Pour-over guide", v: 940 },
      { name: "Espresso blend", v: 720 },
      { name: "Decaf · Sumatra", v: 410 },
    ],
    [],
  );

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard
        title="Indexation over time"
        hint="Pages discovered + indexed by Google"
        source="GSC"
      >
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={indexation} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--brand-700)"
              strokeWidth={1.75}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Avg position over time"
        hint="Lower is better"
        source="GSC"
      >
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={position} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis
              reversed
              domain={[1, 30]}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--accent-gold)"
              strokeWidth={1.75}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="On-page conversions"
        hint="Weekly conversion rate, %"
        source="GA4"
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={conversions} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="w" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="v" fill="var(--brand-700)" radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Revenue per page/SKU"
        hint="Top items, 30d, $"
        source="Woo · GA4"
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={revenue}
            layout="vertical"
            margin={{ top: 6, right: 12, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
            <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ ...axisTick, width: 110 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="v" fill="var(--accent-gold)" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  source,
  children,
}: {
  title: string;
  hint: string;
  source: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">{title}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          {source}
        </span>
      </div>
      <div className="mt-3">{children}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Sample — real series fill in ~14–30 days after publish.
      </div>
    </Card>
  );
}

/* ---------------- assets table ---------------- */

type AssetRow = {
  title: string;
  uid: string;
  type: string;
  locale: string;
  channel: "site" | "social-locked";
  publishedAt: string;
  indexed: boolean;
  position: number | null;
  conv: string;
  revenue: string;
};

const ASSETS: AssetRow[] = [
  {
    title: "Pour-over vs immersion buyer's guide",
    uid: "ast_9f3a1b",
    type: "Article",
    locale: "EN",
    channel: "site",
    publishedAt: "12 Mar",
    indexed: true,
    position: 4.1,
    conv: "2.8%",
    revenue: "$1,240",
  },
  {
    title: "Origin spotlight: Yirgacheffe Konga",
    uid: "ast_2c71e0",
    type: "Article",
    locale: "EN",
    channel: "site",
    publishedAt: "08 Mar",
    indexed: true,
    position: 7.3,
    conv: "1.9%",
    revenue: "$1,820",
  },
  {
    title: "Konga (250g) — product page",
    uid: "ast_4b88d2",
    type: "Product",
    locale: "EN",
    channel: "site",
    publishedAt: "06 Mar",
    indexed: true,
    position: 12.0,
    conv: "3.2%",
    revenue: "$1,820",
  },
  {
    title: "Konga (250g) — page produit",
    uid: "ast_4b88d2",
    type: "Product",
    locale: "FR",
    channel: "site",
    publishedAt: "06 Mar",
    indexed: true,
    position: 18.4,
    conv: "1.1%",
    revenue: "$410",
  },
  {
    title: "Brewing checklist for café owners",
    uid: "ast_77cf09",
    type: "Guide",
    locale: "EN",
    channel: "site",
    publishedAt: "01 Mar",
    indexed: false,
    position: null,
    conv: "—",
    revenue: "—",
  },
  {
    title: "Spring lineup teaser",
    uid: "ast_a14e22",
    type: "Social post",
    locale: "EN",
    channel: "social-locked",
    publishedAt: "—",
    indexed: false,
    position: null,
    conv: "—",
    revenue: "—",
  },
];

function AssetsTable() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
        <div>
          <div className="text-sm font-medium text-ink-900">
            Published assets — measured by stable asset_uid
          </div>
          <div className="text-xs text-muted-foreground">
            Outcomes are anchored to each asset's immutable{" "}
            <span className="font-mono-num">asset_uid</span>, so they survive
            every Strategy revision.
          </div>
        </div>
        <span className="rounded-sm bg-surface px-1.5 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          sample
        </span>
      </div>
      <div className="grid grid-cols-[2fr_0.6fr_0.5fr_0.8fr_0.6fr_0.4fr_0.5fr_0.5fr_0.6fr] gap-4 border-b border-line px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <div>Asset</div>
        <div>Type</div>
        <div>Locale</div>
        <div>Channel</div>
        <div>Published</div>
        <div>Indexed</div>
        <div>Position</div>
        <div>Conv.</div>
        <div className="text-right">Revenue</div>
      </div>
      {ASSETS.map((a, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_0.6fr_0.5fr_0.8fr_0.6fr_0.4fr_0.5fr_0.5fr_0.6fr] items-center gap-4 border-b border-line px-5 py-3 text-sm last:border-b-0 hover:bg-surface-sunken/50"
        >
          <div className="min-w-0">
            <div className="truncate text-ink-900">{a.title}</div>
            <div className="font-mono-num text-[10px] text-muted-foreground">
              {a.uid}
            </div>
          </div>
          <div>
            <StatusChip tone="neutral">{a.type}</StatusChip>
          </div>
          <div className="font-mono-num text-[11px] text-muted-foreground">
            {a.locale}
          </div>
          <div>
            {a.channel === "site" ? (
              <StatusChip tone="live">
                <Globe className="size-3" strokeWidth={1.75} />
                Published
              </StatusChip>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-sunken px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Lock className="size-3" strokeWidth={1.75} />
                pending audit
              </span>
            )}
          </div>
          <div className="font-mono-num text-xs text-ink-700">{a.publishedAt}</div>
          <div>
            {a.indexed ? (
              <span className="font-mono-num text-sm text-brand-700">✓</span>
            ) : (
              <span className="font-mono-num text-xs text-muted-foreground">—</span>
            )}
          </div>
          <div className="font-mono-num text-xs text-ink-700">
            {a.position ?? "—"}
          </div>
          <div className="font-mono-num text-xs text-ink-700">{a.conv}</div>
          <div className="text-right font-mono-num text-xs text-ink-900">
            {a.revenue}
          </div>
        </div>
      ))}
    </Card>
  );
}

/* ---------------- data loop ---------------- */

function DataLoop() {
  return (
    <Card className="border-[color:var(--accent-gold-soft)] bg-gradient-to-br from-[color:var(--accent-gold-soft)]/40 to-surface p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-xl space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent-gold)]">
            The moat
          </div>
          <h3 className="text-lg font-medium text-ink-900">
            Every outcome teaches the next plan.
          </h3>
          <p className="text-sm text-muted-foreground">
            Winners get more quota. Laggards get refreshed. Per-locale results
            steer the multilingual plan.
          </p>
          <Link
            to="/plan"
            className="mt-2 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
          >
            Open Strategy & Plan <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto">
          <LoopNode label="Publish" />
          <LoopArrow />
          <LoopNode label="Measure" sub="GSC · GA4 · GEO · Woo" />
          <LoopArrow strong />
          <LoopNode label="Strategy v(N+1)" gold />
        </div>
      </div>
    </Card>
  );
}

function LoopNode({
  label,
  sub,
  gold,
}: {
  label: string;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface px-3 py-2 text-center",
        gold
          ? "border-[color:var(--accent-gold-soft)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-gold)_18%,transparent)]"
          : "border-line",
      )}
    >
      <div
        className={cn(
          "text-xs font-medium",
          gold ? "text-[color:var(--accent-gold)]" : "text-ink-900",
        )}
      >
        {label}
      </div>
      {sub ? (
        <div className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function LoopArrow({ strong }: { strong?: boolean }) {
  return (
    <ArrowRight
      className={cn(
        "size-4 shrink-0",
        strong ? "text-[color:var(--accent-gold)]" : "text-muted-foreground",
      )}
      strokeWidth={strong ? 2 : 1.5}
    />
  );
}

/* ---------------- empty state ---------------- */

function Collecting() {
  return (
    <Card className="grid place-items-center px-8 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-surface-sunken text-muted-foreground">
        <BarChart3 className="size-5" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-ink-900">
        Collecting — first signals in ~14–30 days
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        We're listening to GSC, GA4 and your store. Outcomes appear here once
        your first pages are published and indexed.
      </p>
      <Link
        to="/plan"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30"
      >
        Open Strategy & Plan <ArrowRight className="size-3.5" strokeWidth={1.75} />
      </Link>
    </Card>
  );
}

/* ---------------- utils ---------------- */

const axisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 10,
  fontFamily: "var(--font-mono, ui-monospace)",
};

const tooltipProps = {
  cursor: { stroke: "var(--line)", strokeWidth: 1 },
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    fontSize: 11,
    color: "var(--ink-900)",
    fontFamily: "var(--font-mono, ui-monospace)",
  },
  labelStyle: { color: "var(--muted-foreground)" },
} as const;

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeSeries(n: number, start: number, end: number, jitter: number) {
  const out: { i: number; v: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * t;
    const noise = base * jitter * Math.sin(i * 1.3);
    out.push({ i, v: Math.max(0, base + noise) });
  }
  return out;
}