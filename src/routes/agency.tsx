import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkle,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";
import { useLanguage } from "@/features/shared/PreferencesControls";
import { comingSoon } from "@/features/shared/coming-soon";

export const Route = createFileRoute("/agency")({
  head: () => ({ meta: [{ title: "Agency cabinet — Postics" }] }),
  component: AgencyCabinet,
});

// ---------------------------------------------------------------------------
// Tiny EN/RU dictionary — keep the surface bilingual without a full i18n stack.
// ---------------------------------------------------------------------------
const DICT = {
  en: {
    eyebrow: "Workspace · Acme Studio",
    title: "Agency",
    sub: "One control surface for every client site you run.",
    invite: "Invite client",
    whiteLabel: "White-label settings",
    role: "Role",
    tiles: {
      sites: "Active sites",
      units: "Units published this month",
      review: "Items awaiting review",
      seo: "Aggregate SEO trend",
    },
    sample: "sample",
    sectionClients: "Client sites",
    sectionClientsHint: "Click a row to drill into that client's dashboard.",
    filterAll: "All",
    connected: "Connected",
    degraded: "Degraded",
    broken: "Broken",
    awaiting: "Awaiting",
    lastPublish: "Last publish",
    cadence: "Cadence",
    plan: "Plan",
    connector: "Connector",
    bulkApprove: "Approve all",
    bulkPlan: "Generate next plan",
    bulkReschedule: "Reschedule",
    bulkSelected: "selected",
    sectionReview: "Review queue across clients",
    sectionReviewHint:
      "AI-only with an automatic quality-gate is the default. Human review is an Advanced/Premium add-on — shown here for clients on those plans.",
    approve: "Approve",
    requestEdit: "Request edit",
    reject: "Reject",
    sectionWL: "White-label",
    sectionWLHint: "The client never sees Postics.",
    brandColor: "Brand color",
    logo: "Logo",
    domain: "Custom domain",
    clientReport: "Client-facing report",
    enabled: "Enabled",
    sectionReports: "Client reports",
    sectionReportsHint:
      "White-labeled, exportable. Outcomes shown honestly — first SEO signals arrive in ~14–30 days.",
    exportPdf: "Export PDF",
    exportCsv: "Export CSV",
    collecting: "Collecting — first signals in ~14–30 days",
    partner: "Partner program",
    partnerHint: "20% revenue share on referred agencies. Net-30 payouts.",
    payouts: "Payouts",
  },
  ru: {
    eyebrow: "Кабинет · Acme Studio",
    title: "Агентство",
    sub: "Единая панель управления всеми сайтами клиентов.",
    invite: "Пригласить клиента",
    whiteLabel: "White-label настройки",
    role: "Роль",
    tiles: {
      sites: "Активных сайтов",
      units: "Опубликовано за месяц",
      review: "На ревью",
      seo: "Сводный SEO-тренд",
    },
    sample: "пример",
    sectionClients: "Сайты клиентов",
    sectionClientsHint: "Кликните по строке, чтобы открыть дашборд клиента.",
    filterAll: "Все",
    connected: "Подключено",
    degraded: "Сбой",
    broken: "Разрыв",
    awaiting: "На ревью",
    lastPublish: "Публикация",
    cadence: "Каденс",
    plan: "Тариф",
    connector: "Коннектор",
    bulkApprove: "Одобрить",
    bulkPlan: "След. план",
    bulkReschedule: "Перепланировать",
    bulkSelected: "выбрано",
    sectionReview: "Очередь ревью по клиентам",
    sectionReviewHint:
      "По умолчанию — AI с автоматическим quality-gate. Ручное ревью входит в Advanced/Premium и показано только для этих клиентов.",
    approve: "Одобрить",
    requestEdit: "Правки",
    reject: "Отклонить",
    sectionWL: "White-label",
    sectionWLHint: "Клиент не видит Postics.",
    brandColor: "Цвет бренда",
    logo: "Лого",
    domain: "Свой домен",
    clientReport: "Отчёт для клиента",
    enabled: "Включено",
    sectionReports: "Отчёты клиентам",
    sectionReportsHint:
      "White-label, можно выгрузить. Результаты честно — первые SEO-сигналы через ~14–30 дней.",
    exportPdf: "PDF",
    exportCsv: "CSV",
    collecting: "Сбор данных — первые сигналы через ~14–30 дней",
    partner: "Партнёрская программа",
    partnerHint: "20% revshare за приведённые агентства. Выплаты Net-30.",
    payouts: "Выплаты",
  },
} as const;

function useT() {
  const [lang] = useLanguage();
  const key = (lang === "ru" ? "ru" : "en") as "en" | "ru";
  return DICT[key];
}

// ---------------------------------------------------------------------------
// Seed data — a mixed agency book (e-commerce flagship + local-service + SaaS).
// ---------------------------------------------------------------------------
type Connector =
  | { id: "wp-woo"; label: "WordPress / WooCommerce"; tone: "live" }
  | { id: "wp"; label: "WordPress"; tone: "live" }
  | { id: "shopify"; label: "Shopify · coming M1+"; tone: "muted" }
  | { id: "custom"; label: "Custom API · coming M1+"; tone: "muted" };

type ClientRow = {
  id: string;
  name: string;
  domain: string;
  vertical: string;
  connector: Connector;
  plan: "Starter" | "Growth" | "Advanced" | "Premium" | "Agency";
  cadence: string;
  awaiting: number;
  lastPublish: string;
  spark: number[];
  status: "connected" | "degraded" | "broken";
  mrr: number;
};

const CLIENTS: ClientRow[] = [
  {
    id: "northbound-coffee",
    name: "Northbound Coffee Roasters",
    domain: "northboundcoffee.com",
    vertical: "E-commerce · Coffee",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Premium",
    cadence: "24 units/mo",
    awaiting: 4,
    lastPublish: "2h ago",
    spark: [12, 14, 13, 16, 19, 22, 21, 24, 27, 31, 30, 34],
    status: "connected",
    mrr: 999,
  },
  {
    id: "linden-mercantile",
    name: "Linden Mercantile",
    domain: "lindenmercantile.shop",
    vertical: "E-commerce · Home goods",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Advanced",
    cadence: "16 units/mo",
    awaiting: 3,
    lastPublish: "yesterday",
    spark: [8, 9, 9, 11, 10, 12, 14, 15, 14, 17, 18, 19],
    status: "connected",
    mrr: 899,
  },
  {
    id: "harbor-dental",
    name: "Harbor Dental Group",
    domain: "harbordental.care",
    vertical: "Local service · Healthcare",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Growth",
    cadence: "8 units/mo",
    awaiting: 1,
    lastPublish: "3d ago",
    spark: [3, 3, 4, 5, 5, 6, 6, 7, 8, 9, 10, 11],
    status: "connected",
    mrr: 449,
  },
  {
    id: "alder-legal",
    name: "Alder & Finch Legal",
    domain: "alderfinch.law",
    vertical: "Local service · Legal",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Starter",
    cadence: "4 units/mo",
    awaiting: 0,
    lastPublish: "5d ago",
    spark: [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
    status: "degraded",
    mrr: 199,
  },
  {
    id: "tessera-saas",
    name: "Tessera Analytics",
    domain: "tessera.app",
    vertical: "SaaS · Analytics",
    connector: { id: "wp", label: "WordPress", tone: "live" },
    plan: "Advanced",
    cadence: "16 units/mo",
    awaiting: 5,
    lastPublish: "6h ago",
    spark: [6, 7, 8, 8, 10, 12, 13, 14, 16, 18, 20, 23],
    status: "connected",
    mrr: 899,
  },
  {
    id: "fernbrook-bikes",
    name: "Fernbrook Bicycles",
    domain: "fernbrookbikes.co",
    vertical: "E-commerce · Sport",
    connector: { id: "shopify", label: "Shopify · coming M1+", tone: "muted" },
    plan: "Growth",
    cadence: "8 units/mo",
    awaiting: 2,
    lastPublish: "1w ago",
    spark: [4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9],
    status: "broken",
    mrr: 449,
  },
  {
    id: "meadowline-co",
    name: "Meadowline Co.",
    domain: "meadowline.co",
    vertical: "E-commerce · Apparel",
    connector: { id: "wp-woo", label: "WordPress / WooCommerce", tone: "live" },
    plan: "Growth",
    cadence: "8 units/mo",
    awaiting: 2,
    lastPublish: "4d ago",
    spark: [5, 6, 6, 7, 7, 7, 8, 9, 10, 11, 11, 12],
    status: "connected",
    mrr: 449,
  },
  {
    id: "vellum-cms",
    name: "Vellum CMS",
    domain: "vellum.cms",
    vertical: "SaaS · Dev tools",
    connector: { id: "custom", label: "Custom API · coming M1+", tone: "muted" },
    plan: "Premium",
    cadence: "24 units/mo",
    awaiting: 6,
    lastPublish: "10h ago",
    spark: [10, 11, 13, 14, 15, 17, 19, 22, 24, 26, 29, 32],
    status: "connected",
    mrr: 999,
  },
];

type ReviewItem = {
  id: string;
  clientId: string;
  type: "Article" | "Product" | "Social";
  keyword: string;
  reviewer: string;
  reviewerKind: "Expert" | "Freelancer";
  state: "in_progress" | "awaiting" | "overdue";
  gate: "Originality 94" | "E-E-A-T 88" | "On-brand 91";
};

const REVIEW: ReviewItem[] = [
  { id: "r1", clientId: "northbound-coffee", type: "Article", keyword: "ethiopia yirgacheffe pour over", reviewer: "Marta L.", reviewerKind: "Expert", state: "awaiting", gate: "E-E-A-T 88" },
  { id: "r2", clientId: "northbound-coffee", type: "Product", keyword: "single-origin · subscription", reviewer: "Marta L.", reviewerKind: "Expert", state: "in_progress", gate: "Originality 94" },
  { id: "r3", clientId: "linden-mercantile", type: "Article", keyword: "linen tablecloth care guide", reviewer: "Sasha P.", reviewerKind: "Freelancer", state: "awaiting", gate: "On-brand 91" },
  { id: "r4", clientId: "tessera-saas", type: "Article", keyword: "cohort retention analysis", reviewer: "Dr. R. Iwu", reviewerKind: "Expert", state: "overdue", gate: "E-E-A-T 88" },
  { id: "r5", clientId: "vellum-cms", type: "Article", keyword: "headless cms vs monolith", reviewer: "Sasha P.", reviewerKind: "Freelancer", state: "awaiting", gate: "Originality 94" },
];

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------
function Sparkline({ data, tone = "brand" }: { data: number[]; tone?: "brand" | "gold" }) {
  const w = 88;
  const h = 22;
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
  const stroke = tone === "gold" ? "var(--accent-gold)" : "var(--brand-700)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function StatusDot({ status }: { status: ClientRow["status"] }) {
  const t = useT();
  const map = {
    connected: { tone: "live" as const, label: t.connected },
    degraded: { tone: "warn" as const, label: t.degraded },
    broken: { tone: "danger" as const, label: t.broken },
  };
  const m = map[status];
  return <StatusChip tone={m.tone}>{m.label}</StatusChip>;
}

function PlanBadge({ plan }: { plan: ClientRow["plan"] }) {
  const isPremium = plan === "Premium";
  return (
    <MonoChip tone={isPremium ? "gold" : "neutral"}>{plan}</MonoChip>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
type RoleId = "owner" | "admin" | "editor" | "reviewer" | "viewer" | "client_viewer";

function AgencyCabinet() {
  const t = useT();
  const navigate = useNavigate();
  const { setCurrentProjectId } = useScope();

  // Role indicator + switcher (stub)
  const [role, setRole] = useState<RoleId>("owner");
  const [roleOpen, setRoleOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClientRow["status"]>("all");
  const [planFilter, setPlanFilter] = useState<"all" | ClientRow["plan"]>("all");
  const [connectorFilter, setConnectorFilter] = useState<"all" | Connector["id"]>("all");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Review queue (local stub state)
  const [review, setReview] = useState(REVIEW);

  // White-label preview
  const [brandColor, setBrandColor] = useState("#1E3A34");
  const [agencyName, setAgencyName] = useState("Acme Studio");
  const [domain, setDomain] = useState("reports.acmestudio.co");
  const [reportEnabled, setReportEnabled] = useState(true);

  // Filter results
  const filtered = useMemo(() => {
    return CLIENTS.filter((c) => {
      if (search && !`${c.name} ${c.domain}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (planFilter !== "all" && c.plan !== planFilter) return false;
      if (connectorFilter !== "all" && c.connector.id !== connectorFilter) return false;
      return true;
    });
  }, [search, statusFilter, planFilter, connectorFilter]);

  // Aggregates (tiles)
  const sites = CLIENTS.length;
  const unitsThisMonth = 1284;
  const awaitingTotal = CLIENTS.reduce((a, c) => a + c.awaiting, 0);
  const seoTrend = [42, 44, 43, 46, 48, 50, 52, 55, 58, 61, 64, 68];
  const seoDelta = "+18%";

  // Selection helpers
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

  function openClient(id: string) {
    // Map agency client → project shell where possible; otherwise notify.
    const knownProjects: Record<string, string> = {
      "northbound-coffee": "vellum-bean",
      "linden-mercantile": "linden-mercantile",
    };
    const projectId = knownProjects[id];
    if (projectId) {
      setCurrentProjectId(projectId);
      navigate({ to: "/dashboard" });
    } else {
      toast(`Opening ${CLIENTS.find((c) => c.id === id)?.name}`, {
        description: "Switching to project shell — preview seed.",
      });
    }
  }

  return (
    <WorkspaceShell active="agency" breadcrumb={["Agency"]}>
      <div className="mx-auto w-full max-w-[1280px] space-y-8 px-6 py-8 md:px-8">
        <Header
          t={t}
          role={role}
          setRole={(r) => {
            setRole(r);
            setRoleOpen(false);
            toast(`Role · ${r}`, { description: "Stub role switch — UI scope reflected only." });
          }}
          roleOpen={roleOpen}
          setRoleOpen={setRoleOpen}
        />

        <Tiles
          t={t}
          sites={sites}
          units={unitsThisMonth}
          awaiting={awaitingTotal}
          spark={seoTrend}
          delta={seoDelta}
        />

        <ClientsSection
          t={t}
          rows={filtered}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          connectorFilter={connectorFilter}
          setConnectorFilter={setConnectorFilter}
          selected={selected}
          allSelected={allSelected}
          toggleAll={toggleAll}
          toggleRow={toggleRow}
          openClient={openClient}
        />

        <ReviewSection
          t={t}
          items={review}
          act={(id, action) => {
            setReview((prev) => prev.filter((r) => r.id !== id));
            const labels: Record<string, string> = {
              approve: t.approve,
              edit: t.requestEdit,
              reject: t.reject,
            };
            toast(labels[action], { description: `Item ${id} · ${action}` });
          }}
        />

        <WhiteLabelSection
          t={t}
          brandColor={brandColor}
          setBrandColor={setBrandColor}
          agencyName={agencyName}
          setAgencyName={setAgencyName}
          domain={domain}
          setDomain={setDomain}
          reportEnabled={reportEnabled}
          setReportEnabled={setReportEnabled}
        />

        <ReportSection
          t={t}
          brandColor={brandColor}
          agencyName={agencyName}
        />

        <PartnerStrip t={t} />
      </div>
    </WorkspaceShell>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({
  t,
  role,
  setRole,
  roleOpen,
  setRoleOpen,
}: {
  t: typeof DICT["en"];
  role: RoleId;
  setRole: (r: RoleId) => void;
  roleOpen: boolean;
  setRoleOpen: (b: boolean) => void;
}) {
  const roles: RoleId[] = ["owner", "admin", "editor", "reviewer", "viewer", "client_viewer"];
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t.eyebrow}
        </div>
        <h1 className="font-display text-3xl text-ink-900">{t.title}</h1>
        <p className="max-w-xl text-sm text-muted-foreground">{t.sub}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Role chip + switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs hover:border-ink-700/30"
          >
            <ShieldCheck className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="font-mono-num uppercase tracking-wider text-ink-700">
              {t.role}
            </span>
            <span className="font-mono-num text-[11px] uppercase tracking-wider text-ink-900">
              {role}
            </span>
            <ChevronDown className="size-3 text-muted-foreground" strokeWidth={1.5} />
          </button>
          {roleOpen ? (
            <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-surface-sunken",
                    r === role && "bg-surface-sunken",
                  )}
                >
                  <span className="font-mono-num uppercase tracking-wider text-ink-900">{r}</span>
                  {r === role ? <Check className="size-3.5" strokeWidth={1.5} /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          onClick={() => comingSoon(t.whiteLabel)}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-700 hover:border-ink-700/30"
        >
          <Settings2 className="size-3.5" strokeWidth={1.5} />
          {t.whiteLabel}
        </button>
        <button
          onClick={() => comingSoon(t.invite)}
          className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700"
        >
          <Plus className="size-3.5" strokeWidth={1.75} /> {t.invite}
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Stat tiles
// ---------------------------------------------------------------------------
function Tiles({
  t,
  sites,
  units,
  awaiting,
  spark,
  delta,
}: {
  t: typeof DICT["en"];
  sites: number;
  units: number;
  awaiting: number;
  spark: number[];
  delta: string;
}) {
  const Tile = ({
    label,
    value,
    foot,
    sample = false,
  }: {
    label: string;
    value: React.ReactNode;
    foot?: React.ReactNode;
    sample?: boolean;
  }) => (
    <Card className="px-4 py-3.5">
      <div className="flex items-center justify-between text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
        {sample ? <MonoChip tone="muted">{t.sample}</MonoChip> : null}
      </div>
      <div className="mt-2 font-mono-num text-2xl tabular-nums text-ink-900">{value}</div>
      {foot ? <div className="mt-1.5 text-[11px] text-muted-foreground">{foot}</div> : null}
    </Card>
  );

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label={t.tiles.sites} value={sites} />
      <Tile
        label={t.tiles.units}
        value={units.toLocaleString()}
        foot={<span className="text-[color:var(--brand-700)]">+12% vs last month</span>}
        sample
      />
      <Tile label={t.tiles.review} value={awaiting} />
      <Tile
        label={t.tiles.seo}
        value={
          <div className="flex items-center gap-3">
            <Sparkline data={spark} tone="brand" />
            <span className="text-[color:var(--brand-700)]">{delta}</span>
          </div>
        }
        sample
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Clients table
// ---------------------------------------------------------------------------
function ClientsSection({
  t,
  rows,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
  connectorFilter,
  setConnectorFilter,
  selected,
  allSelected,
  toggleAll,
  toggleRow,
  openClient,
}: {
  t: typeof DICT["en"];
  rows: ClientRow[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: "all" | ClientRow["status"];
  setStatusFilter: (v: "all" | ClientRow["status"]) => void;
  planFilter: "all" | ClientRow["plan"];
  setPlanFilter: (v: "all" | ClientRow["plan"]) => void;
  connectorFilter: "all" | Connector["id"];
  setConnectorFilter: (v: "all" | Connector["id"]) => void;
  selected: Set<string>;
  allSelected: boolean;
  toggleAll: () => void;
  toggleRow: (id: string) => void;
  openClient: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-ink-900">{t.sectionClients}</h2>
          <p className="text-xs text-muted-foreground">{t.sectionClientsHint}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or domain"
            className="postics-input h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-sm"
          />
        </div>
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as any)}
          options={[
            { v: "all", l: t.filterAll },
            { v: "connected", l: t.connected },
            { v: "degraded", l: t.degraded },
            { v: "broken", l: t.broken },
          ]}
        />
        <FilterSelect
          label={t.plan}
          value={planFilter}
          onChange={(v) => setPlanFilter(v as any)}
          options={[
            { v: "all", l: t.filterAll },
            { v: "Starter", l: "Starter" },
            { v: "Growth", l: "Growth" },
            { v: "Advanced", l: "Advanced" },
            { v: "Premium", l: "Premium" },
            { v: "Agency", l: "Agency" },
          ]}
        />
        <FilterSelect
          label={t.connector}
          value={connectorFilter}
          onChange={(v) => setConnectorFilter(v as any)}
          options={[
            { v: "all", l: t.filterAll },
            { v: "wp-woo", l: "WP / Woo" },
            { v: "wp", l: "WordPress" },
            { v: "shopify", l: "Shopify (soon)" },
            { v: "custom", l: "Custom (soon)" },
          ]}
        />
      </div>

      {/* Bulk bar */}
      {selected.size > 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-line bg-surface-sunken px-3 py-2 text-xs">
          <div className="font-mono-num uppercase tracking-wider text-ink-700">
            {selected.size} {t.bulkSelected}
          </div>
          <div className="flex items-center gap-2">
            <BulkBtn icon={Check} label={t.bulkApprove} onClick={() => toast(`${t.bulkApprove} · ${selected.size}`)} />
            <BulkBtn icon={Sparkle} label={t.bulkPlan} onClick={() => toast(`${t.bulkPlan} · ${selected.size}`)} />
            <BulkBtn icon={Lock} label={t.bulkReschedule} disabled onClick={() => comingSoon(t.bulkReschedule)} />
          </div>
        </div>
      ) : null}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
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
                <th className="px-3 py-2.5 text-left">Client</th>
                <th className="px-3 py-2.5 text-left">{t.connector}</th>
                <th className="px-3 py-2.5 text-left">{t.plan}</th>
                <th className="px-3 py-2.5 text-left">{t.cadence}</th>
                <th className="px-3 py-2.5 text-right">{t.awaiting}</th>
                <th className="px-3 py-2.5 text-left">{t.lastPublish}</th>
                <th className="px-3 py-2.5 text-left">SEO</th>
                <th className="px-3 py-2.5 text-left">Status</th>
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
                      "border-t border-line transition-colors hover:bg-surface-sunken/60",
                      isSel && "bg-[color:var(--brand-100)]/50",
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleRow(r.id)}
                        className="size-3.5 accent-[color:var(--brand-700)]"
                        aria-label={`Select ${r.name}`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => openClient(r.id)}
                        className="group flex items-start gap-2.5 text-left"
                      >
                        <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface-sunken font-mono-num text-[11px] uppercase text-ink-700">
                          {r.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink-900 group-hover:underline">
                            {r.name}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono-num text-[11px] text-muted-foreground">
                            <Globe className="size-3" strokeWidth={1.5} />
                            {r.domain}
                            <span className="text-muted-foreground/60">·</span>
                            <span className="truncate">{r.vertical}</span>
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <MonoChip tone={r.connector.tone === "muted" ? "muted" : "neutral"}>
                        {r.connector.label}
                      </MonoChip>
                    </td>
                    <td className="px-3 py-2.5">
                      <PlanBadge plan={r.plan} />
                    </td>
                    <td className="px-3 py-2.5 font-mono-num text-xs tabular-nums text-ink-700">
                      {r.cadence}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono-num tabular-nums">
                      {r.awaiting > 0 ? (
                        <span className="text-[color:var(--accent-gold)]">{r.awaiting}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono-num text-xs text-muted-foreground">
                      {r.lastPublish}
                    </td>
                    <td className="px-3 py-2.5">
                      <Sparkline data={r.spark} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusDot status={r.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => openClient(r.id)}
                        className="text-muted-foreground hover:text-ink-900"
                        aria-label={`Open ${r.name}`}
                      >
                        <ChevronRight className="size-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    No clients match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function FilterSelect({
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
    <label className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-xs">
      <Filter className="size-3 text-muted-foreground" strokeWidth={1.5} />
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
  disabled,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs hover:border-ink-700/30",
        disabled && "opacity-60",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} />
      {label}
      {disabled ? <span className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">soon</span> : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Review queue across clients
// ---------------------------------------------------------------------------
function ReviewSection({
  t,
  items,
  act,
}: {
  t: typeof DICT["en"];
  items: ReviewItem[];
  act: (id: string, action: "approve" | "edit" | "reject") => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-ink-900">{t.sectionReview}</h2>
        </div>
      </div>
      <Card className="border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-4 py-2.5">
        <div className="flex items-start gap-2 text-xs text-ink-700">
          <Info className="mt-0.5 size-3.5 shrink-0 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
          <p>{t.sectionReviewHint}</p>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-line bg-surface-sunken text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left">Client</th>
                <th className="px-3 py-2.5 text-left">Type</th>
                <th className="px-3 py-2.5 text-left">Target keyword</th>
                <th className="px-3 py-2.5 text-left">Reviewer</th>
                <th className="px-3 py-2.5 text-left">State</th>
                <th className="px-3 py-2.5 text-left">Quality gate</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const client = CLIENTS.find((c) => c.id === it.clientId)!;
                const stateTone =
                  it.state === "overdue" ? "danger" : it.state === "in_progress" ? "info" : "warn";
                const stateLabel =
                  it.state === "overdue" ? "Overdue" : it.state === "in_progress" ? "In progress" : "Awaiting";
                return (
                  <tr key={it.id} className="border-t border-line">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink-900">{client.name}</div>
                      <div className="font-mono-num text-[11px] text-muted-foreground">{client.domain}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <MonoChip>{it.type}</MonoChip>
                    </td>
                    <td className="px-3 py-2.5 font-mono-num text-xs text-ink-700">{it.keyword}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-ink-900">{it.reviewer}</div>
                      <div className="text-[11px] text-muted-foreground">{it.reviewerKind}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusChip tone={stateTone}>{stateLabel}</StatusChip>
                    </td>
                    <td className="px-3 py-2.5">
                      <MonoChip tone="gold">{it.gate}</MonoChip>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => act(it.id, "approve")}
                          className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] hover:border-ink-700/30"
                        >
                          {t.approve}
                        </button>
                        <button
                          onClick={() => act(it.id, "edit")}
                          className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] hover:border-ink-700/30"
                        >
                          {t.requestEdit}
                        </button>
                        <button
                          onClick={() => act(it.id, "reject")}
                          className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-[color:var(--danger)] hover:border-[color:var(--danger)]/40"
                        >
                          {t.reject}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    Queue clear.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// White-label controls + live preview
// ---------------------------------------------------------------------------
function WhiteLabelSection({
  t,
  brandColor,
  setBrandColor,
  agencyName,
  setAgencyName,
  domain,
  setDomain,
  reportEnabled,
  setReportEnabled,
}: {
  t: typeof DICT["en"];
  brandColor: string;
  setBrandColor: (v: string) => void;
  agencyName: string;
  setAgencyName: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  reportEnabled: boolean;
  setReportEnabled: (v: boolean) => void;
}) {
  const swatches = ["#1E3A34", "#0F172A", "#7C2D12", "#1E40AF", "#B98A3E", "#3F3F46"];
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-ink-900">{t.sectionWL}</h2>
          <p className="text-xs text-muted-foreground">{t.sectionWLHint}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Controls */}
        <Card className="p-5 space-y-5">
          <div>
            <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Agency name
            </div>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="postics-input h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.brandColor}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {swatches.map((s) => (
                <button
                  key={s}
                  onClick={() => setBrandColor(s)}
                  aria-label={`Color ${s}`}
                  className={cn(
                    "size-7 rounded-md border border-line transition-transform hover:scale-110",
                    brandColor === s && "ring-2 ring-offset-2 ring-ink-900 ring-offset-paper",
                  )}
                  style={{ backgroundColor: s }}
                />
              ))}
              <label className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="size-4 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="font-mono-num text-[11px] uppercase tracking-wider text-ink-700">
                  {brandColor}
                </span>
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.logo}
            </div>
            <button
              onClick={() => comingSoon("Logo upload")}
              className="flex w-full items-center justify-between rounded-lg border border-dashed border-line bg-surface-sunken px-3 py-2 text-xs text-muted-foreground hover:border-ink-700/30"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="size-3.5" strokeWidth={1.5} />
                Upload SVG / PNG · transparent ok
              </span>
              <Upload className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <div>
            <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.domain}
            </div>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="postics-input h-9 w-full rounded-lg border border-line bg-surface px-3 font-mono-num text-xs"
            />
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="size-3 text-[color:var(--brand-700)]" strokeWidth={1.75} />
              DNS verified · TLS active
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface-sunken px-3 py-2.5">
            <div>
              <div className="text-sm text-ink-900">{t.clientReport}</div>
              <div className="text-[11px] text-muted-foreground">
                Read-only link for client_viewer role.
              </div>
            </div>
            <button
              role="switch"
              aria-checked={reportEnabled}
              onClick={() => setReportEnabled(!reportEnabled)}
              className={cn(
                "relative h-5 w-9 rounded-full border border-line transition-colors",
                reportEnabled ? "bg-[color:var(--brand-700)]" : "bg-surface",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-paper transition-all",
                  reportEnabled ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
          </div>
        </Card>

        {/* Live preview */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-3 py-2 font-mono-num text-[11px] text-muted-foreground">
            <Eye className="size-3.5" strokeWidth={1.5} />
            Live preview · {domain}
          </div>
          <div className="bg-surface p-5">
            <MiniClientReport brandColor={brandColor} agencyName={agencyName} t={t} />
          </div>
        </Card>
      </div>
    </section>
  );
}

function MiniClientReport({
  brandColor,
  agencyName,
  t,
}: {
  brandColor: string;
  agencyName: string;
  t: typeof DICT["en"];
}) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div
            className="grid size-7 place-items-center rounded-md text-[12px] text-white"
            style={{ backgroundColor: brandColor }}
          >
            {agencyName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </div>
          <div className="text-sm font-medium text-ink-900">{agencyName}</div>
        </div>
        <div className="font-mono-num text-[10.5px] uppercase tracking-wider text-muted-foreground">
          Monthly report · Nov
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Published", v: "24" },
          { l: "Indexed", v: "21" },
          { l: "Clusters", v: "5" },
        ].map((s) => (
          <div key={s.l} className="rounded-md border border-line bg-surface py-2">
            <div className="font-mono-num text-lg tabular-nums" style={{ color: brandColor }}>
              {s.v}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-line bg-surface px-3 py-2 text-[11px] text-muted-foreground">
        {t.collecting}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client reports (export)
// ---------------------------------------------------------------------------
function ReportSection({
  t,
  brandColor,
  agencyName,
}: {
  t: typeof DICT["en"];
  brandColor: string;
  agencyName: string;
}) {
  const rows = [
    { channel: "Site (WordPress)", state: "Publishing now", tone: "live" as const, count: 24, note: "Guaranteed channel" },
    { channel: "Instagram", state: "pending platform audit", tone: "warn" as const, count: 0, note: "Locked · best-effort" },
    { channel: "LinkedIn", state: "pending platform audit", tone: "warn" as const, count: 0, note: "Locked · best-effort" },
    { channel: "X / Twitter", state: "pending platform audit", tone: "warn" as const, count: 0, note: "Locked · best-effort" },
  ];
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-ink-900">{t.sectionReports}</h2>
          <p className="text-xs text-muted-foreground">{t.sectionReportsHint}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast(`${t.exportPdf} · queued`, { description: "White-labeled PDF will appear in /downloads." })}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30"
          >
            <Download className="size-3.5" strokeWidth={1.5} /> {t.exportPdf}
          </button>
          <button
            onClick={() => toast(`${t.exportCsv} · queued`)}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30"
          >
            <FileText className="size-3.5" strokeWidth={1.5} /> {t.exportCsv}
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Brand strip */}
        <div
          className="flex items-center justify-between px-5 py-3 text-paper"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-md bg-white/15 font-mono-num text-[11px]">
              {agencyName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </div>
            <div className="text-sm">{agencyName} · Client report</div>
          </div>
          <div className="font-mono-num text-[11px] uppercase tracking-wider opacity-80">
            Northbound Coffee · Nov 2026
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3">
          {[
            { l: "Units published", v: "24" },
            { l: "Indexed pages", v: "21" },
            { l: "Avg position", v: "21.4" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={cn(
                "px-5 py-4",
                i < 2 && "md:border-r border-line",
                "border-b border-line",
              )}
            >
              <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {s.l}
              </div>
              <div className="mt-1 font-mono-num text-2xl tabular-nums text-ink-900">{s.v}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{t.collecting}</div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4">
          <div className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Per channel
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.channel} className="border-t border-line first:border-t-0">
                    <td className="py-2 pr-3 text-ink-900">{r.channel}</td>
                    <td className="py-2 pr-3">
                      <StatusChip tone={r.tone}>
                        {r.tone === "warn" ? <Lock className="size-3" strokeWidth={1.5} /> : null}
                        {r.state}
                      </StatusChip>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono-num tabular-nums text-ink-700">
                      {r.count}
                    </td>
                    <td className="py-2 pl-3 text-right text-[11px] text-muted-foreground">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Partner strip
// ---------------------------------------------------------------------------
function PartnerStrip({ t }: { t: typeof DICT["en"] }) {
  return (
    <section>
      <Card className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-8 place-items-center rounded-md bg-surface-sunken text-ink-700">
            <Mail className="size-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-medium text-ink-900">{t.partner}</div>
            <div className="text-[11px] text-muted-foreground">{t.partnerHint}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono-num text-[11px] uppercase tracking-wider text-ink-700">
            Revshare 20%
          </div>
          <Link
            to="/partner"
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs hover:border-ink-700/30"
          >
            {t.payouts} <ArrowUpRight className="size-3" strokeWidth={1.75} />
          </Link>
        </div>
      </Card>
    </section>
  );
}