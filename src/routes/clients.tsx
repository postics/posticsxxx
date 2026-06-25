import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  Globe,
  Grid3x3,
  Instagram,
  LayoutList,
  Linkedin,
  Lock,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Settings,
  Sparkle,
  Twitter,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";
import { useLanguage } from "@/features/shared/PreferencesControls";
import { comingSoon } from "@/features/shared/coming-soon";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — Postics" }] }),
  component: ClientsPage,
});

// ---------------------------------------------------------------------------
// EN/RU dictionary
// ---------------------------------------------------------------------------
const DICT = {
  en: {
    eyebrow: "Agency · Acme Studio",
    title: "Clients",
    sub: "Every site you run, on one calm surface.",
    newClient: "Add site",
    sampleNote: "Sample / indicative — outcomes accrue over time.",
    tiles: {
      sites: "Active sites",
      units: "Units published this month",
      awaiting: "Items awaiting approval",
      seo: "Aggregate SEO trend",
    },
    search: "Search sites…",
    all: "All",
    plan: "Plan",
    cadence: "Cadence",
    status: "Status",
    awaiting: "Awaiting > 0",
    selected: "selected",
    clear: "Clear",
    bulkApprove: "Approve",
    bulkPlan: "Generate next plan",
    bulkReschedule: "Reschedule",
    soon: "Coming",
    cols: {
      site: "Site",
      domain: "Domain",
      plan: "Plan",
      cadence: "Cadence",
      awaiting: "Awaiting",
      lastPublish: "Last publish",
      seo: "SEO trend",
      status: "Status",
    },
    live: "Live",
    setup: "Setup",
    degraded: "Degraded",
    paused: "Paused",
    socialPending: "pending platform audit",
    rowMenu: {
      open: "Open dashboard",
      plan: "Generate next plan",
      viewPlan: "View plan",
      settings: "Settings",
    },
    table: "Table",
    grid: "Grid",
    emptyTitle: "No clients yet",
    emptySub: "Add your first site to start a content plan.",
    noResultsTitle: "No matching sites",
    noResultsSub: "Adjust filters or clear the search.",
    clearFilters: "Clear filters",
    open: "Open",
  },
  ru: {
    eyebrow: "Агентство · Acme Studio",
    title: "Клиенты",
    sub: "Все сайты, которыми вы управляете — в одной панели.",
    newClient: "Добавить сайт",
    sampleNote: "Пример / индикативно — результаты накапливаются со временем.",
    tiles: {
      sites: "Активных сайтов",
      units: "Опубликовано за месяц",
      awaiting: "Ждут одобрения",
      seo: "Сводный SEO-тренд",
    },
    search: "Поиск сайтов…",
    all: "Все",
    plan: "Тариф",
    cadence: "Каденс",
    status: "Статус",
    awaiting: "На ревью > 0",
    selected: "выбрано",
    clear: "Сброс",
    bulkApprove: "Одобрить",
    bulkPlan: "След. план",
    bulkReschedule: "Перепланировать",
    soon: "Скоро",
    cols: {
      site: "Сайт",
      domain: "Домен",
      plan: "Тариф",
      cadence: "Каденс",
      awaiting: "Ревью",
      lastPublish: "Публикация",
      seo: "SEO",
      status: "Статус",
    },
    live: "Активен",
    setup: "Настройка",
    degraded: "Сбой",
    paused: "Пауза",
    socialPending: "ждёт аудит платформы",
    rowMenu: {
      open: "Открыть дашборд",
      plan: "След. контент-план",
      viewPlan: "Открыть план",
      settings: "Настройки",
    },
    table: "Таблица",
    grid: "Сетка",
    emptyTitle: "Пока нет клиентов",
    emptySub: "Добавьте первый сайт, чтобы начать контент-план.",
    noResultsTitle: "Ничего не найдено",
    noResultsSub: "Поменяйте фильтры или очистите поиск.",
    clearFilters: "Сбросить фильтры",
    open: "Открыть",
  },
};

type TLabels = typeof DICT.en;

function useT(): TLabels {
  const [lang] = useLanguage();
  const key = (lang === "ru" ? "ru" : "en") as "en" | "ru";
  return DICT[key];
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
type Connector =
  | { id: "wp-woo"; label: "WordPress / WooCommerce"; tone: "live" }
  | { id: "wp"; label: "WordPress"; tone: "live" }
  | { id: "shopify"; label: "Shopify · soon"; tone: "muted" }
  | { id: "custom"; label: "Custom API · soon"; tone: "muted" };

type Plan = "Starter" | "Growth" | "Advanced" | "Premium" | "Agency";
type Status = "live" | "setup" | "degraded" | "paused";

type Row = {
  id: string;
  /** map to existing project id for drill-in when available */
  projectId?: string;
  name: string;
  domain: string;
  vertical: string;
  connector: Connector;
  plan: Plan;
  cadence: number; // units/mo
  awaiting: number;
  lastPublishLabel: string;
  spark: number[];
  trend: "up" | "down" | "flat";
  status: Status;
};

const ROWS: Row[] = [
  {
    id: "northbound-coffee",
    projectId: "vellum-bean",
    name: "Northbound Coffee Roasters",
    domain: "northboundcoffee.com",
    vertical: "E-commerce · Coffee",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Growth",
    cadence: 12,
    awaiting: 4,
    lastPublishLabel: "2h ago",
    spark: [12, 13, 14, 14, 16, 19, 22, 23, 26, 29, 30, 33],
    trend: "up",
    status: "live",
  },
  {
    id: "linden-mercantile",
    projectId: "linden-mercantile",
    name: "Linden Mercantile",
    domain: "lindenmercantile.shop",
    vertical: "E-commerce · Home goods",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Advanced",
    cadence: 16,
    awaiting: 3,
    lastPublishLabel: "yesterday",
    spark: [8, 9, 10, 10, 11, 12, 13, 13, 15, 16, 18, 20],
    trend: "up",
    status: "live",
  },
  {
    id: "harbor-dental",
    name: "Harbor Dental Group",
    domain: "harbordental.care",
    vertical: "Local service · Healthcare",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Growth",
    cadence: 8,
    awaiting: 1,
    lastPublishLabel: "3d ago",
    spark: [3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 8, 9],
    trend: "up",
    status: "live",
  },
  {
    id: "alder-legal",
    name: "Alder & Finch Legal",
    domain: "alderfinch.law",
    vertical: "Local service · Legal",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Starter",
    cadence: 4,
    awaiting: 0,
    lastPublishLabel: "5d ago",
    spark: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6],
    trend: "flat",
    status: "degraded",
  },
  {
    id: "tessera-saas",
    name: "Tessera Analytics",
    domain: "tessera.app",
    vertical: "SaaS · Analytics",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Advanced",
    cadence: 16,
    awaiting: 5,
    lastPublishLabel: "6h ago",
    spark: [6, 7, 8, 8, 10, 12, 13, 14, 16, 18, 20, 23],
    trend: "up",
    status: "live",
  },
  {
    id: "fernbrook-bikes",
    name: "Fernbrook Bicycles",
    domain: "fernbrookbikes.co",
    vertical: "E-commerce · Sport",
    connector: { id: "shopify", label: "Shopify · soon", tone: "muted" },
    plan: "Growth",
    cadence: 8,
    awaiting: 0,
    lastPublishLabel: "—",
    spark: [4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    trend: "flat",
    status: "setup",
  },
  {
    id: "meadowline",
    name: "Meadowline Co.",
    domain: "meadowline.co",
    vertical: "E-commerce · Apparel",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Growth",
    cadence: 8,
    awaiting: 2,
    lastPublishLabel: "4d ago",
    spark: [5, 6, 6, 7, 7, 8, 8, 9, 10, 11, 11, 12],
    trend: "up",
    status: "live",
  },
  {
    id: "vellum-cms",
    name: "Vellum CMS",
    domain: "vellum.cms",
    vertical: "SaaS · Dev tools",
    connector: { id: "custom", label: "Custom API · soon", tone: "muted" },
    plan: "Premium",
    cadence: 24,
    awaiting: 6,
    lastPublishLabel: "—",
    spark: [10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
    trend: "flat",
    status: "setup",
  },
  {
    id: "ironwood-supply",
    name: "Ironwood Supply Co.",
    domain: "ironwoodsupply.com",
    vertical: "E-commerce · Hardware",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Premium",
    cadence: 24,
    awaiting: 1,
    lastPublishLabel: "1h ago",
    spark: [14, 15, 17, 18, 20, 21, 23, 25, 27, 30, 33, 36],
    trend: "up",
    status: "live",
  },
  {
    id: "parsec-studio",
    name: "Parsec Studio",
    domain: "parsec.studio",
    vertical: "Local service · Architecture",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Starter",
    cadence: 4,
    awaiting: 0,
    lastPublishLabel: "—",
    spark: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    trend: "flat",
    status: "paused",
  },
  {
    id: "kalevra-fit",
    name: "Kalevra Fitness",
    domain: "kalevra.fit",
    vertical: "SaaS · Fitness",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Growth",
    cadence: 12,
    awaiting: 2,
    lastPublishLabel: "yesterday",
    spark: [5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13],
    trend: "up",
    status: "live",
  },
  {
    id: "borealis-shop",
    name: "Borealis Skin",
    domain: "borealisskin.com",
    vertical: "E-commerce · Beauty",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Agency",
    cadence: 32,
    awaiting: 9,
    lastPublishLabel: "30m ago",
    spark: [18, 19, 21, 22, 24, 26, 28, 31, 34, 37, 41, 45],
    trend: "up",
    status: "live",
  },
];

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------
function Sparkline({
  data,
  tone = "brand",
  w = 88,
  h = 22,
}: {
  data: number[];
  tone?: "brand" | "gold" | "muted";
  w?: number;
  h?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    tone === "gold" ? "var(--accent-gold)" : tone === "muted" ? "var(--ink-700)" : "var(--brand-700)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={tone === "muted" ? 0.55 : 1}
      />
    </svg>
  );
}

function MonoChip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "muted" | "gold";
  className?: string;
}) {
  const t: Record<string, string> = {
    neutral: "border-line bg-surface text-ink-700",
    muted: "border-line bg-surface-sunken text-muted-foreground",
    gold: "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono-num text-[10.5px] uppercase tracking-wider",
        t[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Plan }) {
  const isPremium = plan === "Premium";
  return <MonoChip tone={isPremium ? "gold" : "neutral"}>{plan}</MonoChip>;
}

function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const map: Record<Status, { tone: "live" | "warn" | "danger" | "neutral"; label: string }> = {
    live: { tone: "live", label: t.live },
    setup: { tone: "neutral", label: t.setup },
    degraded: { tone: "warn", label: t.degraded },
    paused: { tone: "neutral", label: t.paused },
  };
  const m = map[status];
  return <StatusChip tone={m.tone}>{m.label}</StatusChip>;
}

function SocialGlyphs({ pendingLabel }: { pendingLabel: string }) {
  return (
    <span
      title={pendingLabel}
      className="inline-flex items-center gap-1 text-muted-foreground/60"
      aria-label={pendingLabel}
    >
      <Lock className="size-3" strokeWidth={1.5} />
      <Instagram className="size-3" strokeWidth={1.5} />
      <Linkedin className="size-3" strokeWidth={1.5} />
      <Twitter className="size-3" strokeWidth={1.5} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function ClientsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { setCurrentProjectId } = useScope();

  const [view, setView] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [cadenceFilter, setCadenceFilter] = useState<"all" | "low" | "mid" | "high">("all");
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Tile aggregates
  const aggSites = ROWS.length;
  const aggUnits = 1284;
  const aggAwaiting = ROWS.reduce((a, r) => a + r.awaiting, 0);
  const aggSpark = [42, 44, 43, 46, 48, 50, 52, 55, 58, 61, 64, 68];
  const aggDelta = "+18%";

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (search && !`${r.name} ${r.domain} ${r.vertical}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (planFilter !== "all" && r.plan !== planFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (awaitingOnly && r.awaiting <= 0) return false;
      if (cadenceFilter !== "all") {
        const c = r.cadence;
        if (cadenceFilter === "low" && c > 8) return false;
        if (cadenceFilter === "mid" && (c <= 8 || c > 16)) return false;
        if (cadenceFilter === "high" && c <= 16) return false;
      }
      return true;
    });
  }, [search, planFilter, statusFilter, cadenceFilter, awaitingOnly]);

  const isFiltered =
    !!search || planFilter !== "all" || statusFilter !== "all" || cadenceFilter !== "all" || awaitingOnly;

  function clearFilters() {
    setSearch("");
    setPlanFilter("all");
    setStatusFilter("all");
    setCadenceFilter("all");
    setAwaitingOnly(false);
  }

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  }
  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openClient(r: Row) {
    if (r.projectId) {
      setCurrentProjectId(r.projectId);
      navigate({ to: "/dashboard" });
    } else {
      toast(`Opening ${r.name}`, { description: "Switching to project shell — preview seed." });
    }
  }

  return (
    <WorkspaceShell active="clients" breadcrumb={["Clients"]}>
      <div className="mx-auto w-full max-w-[1320px] space-y-6 px-6 py-8 md:px-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.eyebrow}
            </div>
            <h1 className="font-display text-3xl text-ink-900">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} setView={setView} t={t} />
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700"
            >
              <Plus className="size-3.5" strokeWidth={1.75} /> {t.newClient}
            </button>
          </div>
        </header>

        {/* A) Stats strip */}
        <section className="space-y-2">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label={t.tiles.sites} value={aggSites} />
            <Tile label={t.tiles.units} value={aggUnits.toLocaleString()} foot="+12% MoM" />
            <Tile label={t.tiles.awaiting} value={aggAwaiting} tone={aggAwaiting > 0 ? "gold" : "neutral"} />
            <Tile
              label={t.tiles.seo}
              custom={
                <div className="flex items-center gap-3">
                  <Sparkline data={aggSpark} tone="brand" />
                  <span className="font-mono-num text-sm text-[color:var(--brand-700)]">{aggDelta}</span>
                </div>
              }
            />
          </div>
          <div className="text-[11px] text-muted-foreground">{t.sampleNote}</div>
        </section>

        {/* B) Toolbar */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[260px] flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="postics-input h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-sm"
              />
            </div>
            <FilterChip
              label={t.plan}
              value={planFilter}
              onChange={(v) => setPlanFilter(v as any)}
              options={[
                { v: "all", l: t.all },
                { v: "Starter", l: "Starter" },
                { v: "Growth", l: "Growth" },
                { v: "Advanced", l: "Advanced" },
                { v: "Premium", l: "Premium" },
                { v: "Agency", l: "Agency" },
              ]}
            />
            <FilterChip
              label={t.cadence}
              value={cadenceFilter}
              onChange={(v) => setCadenceFilter(v as any)}
              options={[
                { v: "all", l: t.all },
                { v: "low", l: "≤ 8 /mo" },
                { v: "mid", l: "9–16 /mo" },
                { v: "high", l: "> 16 /mo" },
              ]}
            />
            <FilterChip
              label={t.status}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              options={[
                { v: "all", l: t.all },
                { v: "live", l: t.live },
                { v: "setup", l: t.setup },
                { v: "degraded", l: t.degraded },
                { v: "paused", l: t.paused },
              ]}
            />
            <button
              onClick={() => setAwaitingOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                awaitingOnly
                  ? "border-[color:var(--accent-gold)] bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
                  : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
              )}
            >
              {t.awaiting}
            </button>
            {isFiltered ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-ink-900"
              >
                <X className="size-3" strokeWidth={1.5} /> {t.clearFilters}
              </button>
            ) : null}
          </div>

          {/* Bulk bar */}
          {selected.size > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface-sunken px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono-num uppercase tracking-wider text-ink-700">
                  {selected.size} {t.selected}
                </span>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-muted-foreground hover:text-ink-900"
                >
                  {t.clear}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <BulkBtn
                  icon={Check}
                  label={t.bulkApprove}
                  onClick={() =>
                    toast(`${t.bulkApprove} · ${selected.size}`, {
                      description: "Stub approval — applies to selected sites.",
                    })
                  }
                />
                <BulkBtn
                  icon={Sparkle}
                  label={t.bulkPlan}
                  onClick={() =>
                    toast(`${t.bulkPlan} · ${selected.size}`, {
                      description: "Queued next plan generation.",
                    })
                  }
                />
                <BulkBtn
                  icon={Lock}
                  label={t.bulkReschedule}
                  soon
                  onClick={() => comingSoon(`${t.bulkReschedule} — ${t.soon}`)}
                />
              </div>
            </div>
          ) : null}
        </section>

        {/* C/D) List */}
        {filtered.length === 0 ? (
          <EmptyState t={t} isFiltered={isFiltered} onClear={clearFilters} />
        ) : view === "table" ? (
          <ClientsTable
            t={t}
            rows={filtered}
            selected={selected}
            allSelected={allSelected}
            toggleAll={toggleAll}
            toggleRow={toggleRow}
            openClient={openClient}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            navigate={(to) => navigate({ to } as any)}
          />
        ) : (
          <ClientsGrid
            t={t}
            rows={filtered}
            selected={selected}
            toggleRow={toggleRow}
            openClient={openClient}
          />
        )}
      </div>
    </WorkspaceShell>
  );
}

// ---------------------------------------------------------------------------
// Header sub-bits
// ---------------------------------------------------------------------------
function ViewToggle({
  view,
  setView,
  t,
}: {
  view: "table" | "grid";
  setView: (v: "table" | "grid") => void;
  t: TLabels;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs">
      <button
        onClick={() => setView("table")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1",
          view === "table" ? "bg-surface-sunken text-ink-900" : "text-muted-foreground hover:text-ink-900",
        )}
      >
        <LayoutList className="size-3.5" strokeWidth={1.5} />
        {t.table}
      </button>
      <button
        onClick={() => setView("grid")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1",
          view === "grid" ? "bg-surface-sunken text-ink-900" : "text-muted-foreground hover:text-ink-900",
        )}
      >
        <Grid3x3 className="size-3.5" strokeWidth={1.5} />
        {t.grid}
      </button>
    </div>
  );
}

function Tile({
  label,
  value,
  foot,
  tone = "neutral",
  custom,
}: {
  label: string;
  value?: React.ReactNode;
  foot?: React.ReactNode;
  tone?: "neutral" | "gold";
  custom?: React.ReactNode;
}) {
  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center justify-between text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
      </div>
      {custom ? (
        <div className="mt-2">{custom}</div>
      ) : (
        <div
          className={cn(
            "mt-2 font-mono-num text-2xl tabular-nums",
            tone === "gold" ? "text-[color:var(--accent-gold)]" : "text-ink-900",
          )}
        >
          {value}
        </div>
      )}
      {foot ? (
        <div className="mt-1.5 text-[11px] text-[color:var(--brand-700)]">{foot}</div>
      ) : null}
    </Card>
  );
}

function FilterChip({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-xs">
      <span className="font-mono-num uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-ink-900 outline-none"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}

function BulkBtn({
  icon: Icon,
  label,
  onClick,
  soon,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  soon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs hover:border-ink-700/30",
        soon && "opacity-70",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} />
      {label}
      {soon ? (
        <span className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          soon
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------
function ClientsTable({
  t,
  rows,
  selected,
  allSelected,
  toggleAll,
  toggleRow,
  openClient,
  menuOpenId,
  setMenuOpenId,
  navigate,
}: {
  t: TLabels;
  rows: Row[];
  selected: Set<string>;
  allSelected: boolean;
  toggleAll: () => void;
  toggleRow: (id: string) => void;
  openClient: (r: Row) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  navigate: (to: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="border-b border-line bg-surface-sunken text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="w-9 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-3.5 accent-[color:var(--brand-700)]"
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2.5 text-left">{t.cols.site}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.domain}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.plan}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.cadence}</th>
              <th className="px-3 py-2.5 text-right">{t.cols.awaiting}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.lastPublish}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.seo}</th>
              <th className="px-3 py-2.5 text-left">{t.cols.status}</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isSel = selected.has(r.id);
              return (
                <tr
                  key={r.id}
                  className={cn(
                    "group border-t border-line transition-colors hover:bg-surface-sunken/60 postics-hover-lift",
                    isSel && "bg-[color:var(--brand-100)]/60",
                  )}
                >
                  <td className="px-3 py-2.5 align-middle">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleRow(r.id)}
                      className="size-3.5 accent-[color:var(--brand-700)]"
                      aria-label={`Select ${r.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <button onClick={() => openClient(r)} className="flex items-start gap-2.5 text-left">
                      <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface-sunken font-mono-num text-[11px] uppercase text-ink-700">
                        {r.name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-900 group-hover:underline">
                          {r.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <MonoChip tone={r.connector.tone === "muted" ? "muted" : "neutral"}>
                            {r.connector.label}
                          </MonoChip>
                          <span className="text-[11px] text-muted-foreground">{r.vertical}</span>
                        </div>
                      </div>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <span className="inline-flex items-center gap-1.5 font-mono-num text-xs text-ink-700">
                      <Globe className="size-3 text-muted-foreground" strokeWidth={1.5} />
                      {r.domain}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <PlanBadge plan={r.plan} />
                  </td>
                  <td className="px-3 py-2.5 align-middle font-mono-num text-xs tabular-nums text-ink-700">
                    {r.cadence} units/mo
                  </td>
                  <td className="px-3 py-2.5 text-right align-middle font-mono-num tabular-nums">
                    {r.awaiting > 0 ? (
                      <span className="text-[color:var(--accent-gold)]">{r.awaiting}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-xs text-muted-foreground">
                        {r.lastPublishLabel}
                      </span>
                      <SocialGlyphs pendingLabel={`Social — ${t.socialPending}`} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <Sparkline data={r.spark} tone={r.trend === "up" ? "brand" : "muted"} />
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="relative px-3 py-2.5 text-right align-middle">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-surface-sunken hover:text-ink-900"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="size-4" strokeWidth={1.5} />
                    </button>
                    {menuOpenId === r.id ? (
                      <RowMenu
                        t={t}
                        onClose={() => setMenuOpenId(null)}
                        onOpen={() => openClient(r)}
                        onPlan={() => {
                          toast(`${t.rowMenu.plan} — ${r.name}`);
                          setMenuOpenId(null);
                        }}
                        onViewPlan={() => {
                          if (r.projectId) {
                            navigate("/plan");
                          } else {
                            comingSoon(t.rowMenu.viewPlan);
                          }
                          setMenuOpenId(null);
                        }}
                        onSettings={() => {
                          if (r.projectId) {
                            navigate("/settings");
                          } else {
                            comingSoon(t.rowMenu.settings);
                          }
                          setMenuOpenId(null);
                        }}
                      />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RowMenu({
  t,
  onClose,
  onOpen,
  onPlan,
  onViewPlan,
  onSettings,
}: {
  t: TLabels;
  onClose: () => void;
  onOpen: () => void;
  onPlan: () => void;
  onViewPlan: () => void;
  onSettings: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="postics-rise absolute right-2 top-9 z-20 w-52 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
    >
      {[
        { icon: ChevronRight, label: t.rowMenu.open, onClick: onOpen },
        { icon: Sparkle, label: t.rowMenu.plan, onClick: onPlan },
        { icon: LayoutList, label: t.rowMenu.viewPlan, onClick: onViewPlan },
        { icon: Settings, label: t.rowMenu.settings, onClick: onSettings },
      ].map((it) => (
        <button
          key={it.label}
          onClick={it.onClick}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-sunken"
        >
          <it.icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-ink-900">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid view
// ---------------------------------------------------------------------------
function ClientsGrid({
  t,
  rows,
  selected,
  toggleRow,
  openClient,
}: {
  t: TLabels;
  rows: Row[];
  selected: Set<string>;
  toggleRow: (id: string) => void;
  openClient: (r: Row) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const isSel = selected.has(r.id);
        return (
          <Card
            key={r.id}
            className={cn(
              "postics-hover-lift relative p-4 transition-colors hover:border-ink-700/30",
              isSel && "ring-1 ring-[color:var(--brand-700)]",
            )}
          >
            <div className="absolute left-3 top-3">
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => toggleRow(r.id)}
                className="size-3.5 accent-[color:var(--brand-700)]"
                aria-label={`Select ${r.name}`}
              />
            </div>
            <button onClick={() => openClient(r)} className="block w-full text-left">
              <div className="mb-3 flex items-start justify-between gap-3 pl-6">
                <div className="min-w-0">
                  <div className="truncate text-base font-medium text-ink-900">{r.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono-num text-[11px] text-muted-foreground">
                    <Globe className="size-3" strokeWidth={1.5} />
                    {r.domain}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pl-6">
                <MonoChip tone={r.connector.tone === "muted" ? "muted" : "neutral"}>
                  {r.connector.label}
                </MonoChip>
                <PlanBadge plan={r.plan} />
                <MonoChip>
                  {r.cadence}/mo
                </MonoChip>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                <div className="space-y-0.5">
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    {t.cols.awaiting}
                  </div>
                  <div className="font-mono-num text-lg tabular-nums">
                    {r.awaiting > 0 ? (
                      <span className="text-[color:var(--accent-gold)]">{r.awaiting}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5 text-right">
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    {t.cols.lastPublish}
                  </div>
                  <div className="font-mono-num text-xs text-muted-foreground">
                    {r.lastPublishLabel}
                  </div>
                </div>
                <Sparkline data={r.spark} tone={r.trend === "up" ? "brand" : "muted"} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <SocialGlyphs pendingLabel={`Social — ${t.socialPending}`} />
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-ink-900">
                  {t.open} <ChevronRight className="size-3" strokeWidth={1.5} />
                </span>
              </div>
            </button>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / no-results
// ---------------------------------------------------------------------------
function EmptyState({
  t,
  isFiltered,
  onClear,
}: {
  t: TLabels;
  isFiltered: boolean;
  onClear: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid size-10 place-items-center rounded-md border border-line bg-surface-sunken text-muted-foreground">
        <Wrench className="size-4" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-base font-medium text-ink-900">
          {isFiltered ? t.noResultsTitle : t.emptyTitle}
        </div>
        <div className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isFiltered ? t.noResultsSub : t.emptySub}
        </div>
      </div>
      {isFiltered ? (
        <button
          onClick={onClear}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30"
        >
          {t.clearFilters}
        </button>
      ) : (
        <button
          onClick={() => comingSoon(t.newClient)}
          className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs text-paper hover:bg-ink-700"
        >
          <Plus className="mr-1 inline size-3.5" strokeWidth={1.75} /> {t.newClient}
        </button>
      )}
    </Card>
  );
}