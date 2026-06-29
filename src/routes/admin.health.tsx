import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Info,
  Lock,
  KeyRound,
  ShieldAlert,
  ExternalLink,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import { Dot, TrafficLight, ConfirmReasonDialog, type Tone } from "@/features/admin/ui";

export const Route = createFileRoute("/admin/health")({
  component: HealthPage,
});

/* ============================== types & data ============================= */

type VendorState = "operational" | "degraded" | "down" | "maintenance";
const STATE_TONE: Record<VendorState, Tone> = {
  operational: "success",
  degraded: "warning",
  down: "danger",
  maintenance: "muted",
};
const STATE_LABEL: Record<VendorState, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  maintenance: "Maintenance",
};

type SectionId = "critical" | "important" | "infra" | "observability";

type ErrSplit = { auth4xx: number; r429: number; s5xx: number; timeout: number };

type Spend = {
  mtd: string;
  proj: string;
  headroomPct: number;
  cap: string;
  capPct: number; // 0..100 of cap consumed
  capNote?: string;
  flagship?: { label: string; usedSec: number; capSec: number }[];
};

type Wiring = {
  key: { label: string; ok: boolean; missing?: boolean };
  adapter: "live" | "STUB";
  env: { name: string; set: boolean };
  rotatedDays?: number;
  extra?: { label: string; tone?: Tone; mono?: boolean }[];
};

type Vendor = {
  id: string;
  name: string;
  role: string;
  section: SectionId;
  importance: "Critical" | "Important" | "Infra" | "Observability";
  state: VendorState;
  stub?: boolean;
  noSpend?: boolean;
  /** Health lens — set null bits to render pending/empty */
  health: {
    lastSuccess: string | "—";
    err?: ErrSplit | "pending" | "empty";
    p95?: string | "pending" | "empty";
    breaker?: string;
    sparkline?: number[];
  };
  spend?: Spend | "pending";
  wiring: Wiring;
  /** Used by WP-connector card → opens drawer */
  perTenant?: boolean;
  /** Big main card flag */
  big?: boolean;
};

const VENDORS: Vendor[] = [
  // --- Critical ---
  {
    id: "anthropic",
    name: "Anthropic Claude",
    role: "LLM text generation",
    section: "critical",
    importance: "Critical",
    state: "maintenance",
    stub: true,
    big: true,
    health: { lastSuccess: "—", err: "empty", p95: "empty", breaker: "—", sparkline: [] },
    spend: "pending",
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "ANTHROPIC_API_KEY", set: false },
      rotatedDays: undefined,
      extra: [{ label: "Cached usage poll ≤1/min", tone: "muted" }],
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    role: "Billing · subscriptions + credits",
    section: "critical",
    importance: "Critical",
    state: "operational",
    health: {
      lastSuccess: "8s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.0, timeout: 0.1 },
      p95: "184 ms",
      breaker: "breaker: closed",
      sparkline: spark([20, 22, 18, 25, 24, 27, 26, 25, 28, 30, 27, 26]),
    },
    spend: "pending",
    wiring: {
      key: { label: "valid · expires 2027-04", ok: true },
      adapter: "live",
      env: { name: "STRIPE_SECRET_KEY", set: true },
      rotatedDays: 18,
      extra: [
        { label: "webhook: 312 sent · 312 processed · 0 failed", tone: "success", mono: true },
        { label: "signing secret: set · 2xx ≤20s", tone: "success", mono: true },
      ],
    },
  },
  {
    id: "video",
    name: "Video API · Kling / Hailuo / Veo",
    role: "Product videos (flagship cost line)",
    section: "critical",
    importance: "Critical",
    state: "maintenance",
    stub: true,
    health: { lastSuccess: "—", err: "empty", p95: "empty", breaker: "—", sparkline: [] },
    spend: {
      mtd: "$0.00",
      proj: "$0.00",
      headroomPct: 100,
      cap: "$1,200 / mo",
      capPct: 0,
      capNote: "Veo ~$22.5 per 30s — named risk #1.",
      flagship: [
        { label: "Advanced · 30s cap", usedSec: 0, capSec: 30 },
        { label: "Premium · 45s cap", usedSec: 0, capSec: 45 },
        { label: "Agency · 90s cap", usedSec: 0, capSec: 90 },
      ],
    },
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "VIDEO_PROVIDER_KEY", set: false },
      extra: [{ label: "kill-switch wired to credit system", tone: "warning" }],
    },
  },
  {
    id: "image",
    name: "Image API",
    role: "Product photos (provider TBD)",
    section: "critical",
    importance: "Critical",
    state: "maintenance",
    stub: true,
    health: { lastSuccess: "—", err: "empty", p95: "empty", sparkline: [] },
    spend: "pending",
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "IMAGE_PROVIDER_KEY", set: false },
      extra: [{ label: "provider TBD", tone: "muted" }],
    },
  },

  // --- Important ---
  {
    id: "ayrshare",
    name: "Ayrshare / Upload-Post",
    role: "Social publishing — primary / fallback",
    section: "important",
    importance: "Important",
    state: "operational",
    health: {
      lastSuccess: "42s ago",
      err: { auth4xx: 0.4, r429: 1.1, s5xx: 0.0, timeout: 0.2 },
      p95: "612 ms",
      breaker: "primary Ayrshare · fallback Upload-Post",
      sparkline: spark([12, 14, 13, 18, 22, 20, 19, 17, 16, 18, 19, 21]),
    },
    spend: "pending",
    wiring: {
      key: { label: "valid · expires 2026-12", ok: true },
      adapter: "live",
      env: { name: "AYRSHARE_API_KEY", set: true },
      rotatedDays: 64,
      extra: [{ label: "best-effort · pending platform audit", tone: "warning" }],
    },
  },
  {
    id: "originality",
    name: "Originality.ai / Copyleaks",
    role: "Originality QA · hard-fail gate G0",
    section: "important",
    importance: "Important",
    state: "maintenance",
    stub: true,
    health: { lastSuccess: "—", err: "empty", p95: "empty", sparkline: [] },
    spend: "pending",
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "ORIGINALITY_API_KEY", set: false },
      extra: [{ label: "values not trusted yet", tone: "warning" }],
    },
  },
  {
    id: "aidetect",
    name: "AI-detect · GPTZero / Originality",
    role: "Soft AI-risk scoring",
    section: "important",
    importance: "Important",
    state: "maintenance",
    stub: true,
    noSpend: true,
    health: { lastSuccess: "—", err: "empty", p95: "empty", sparkline: [] },
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "AI_DETECT_API_KEY", set: false },
      extra: [{ label: "scores not trusted yet", tone: "muted" }],
    },
  },
  {
    id: "brevo",
    name: "Brevo SMTP",
    role: "Transactional email",
    section: "important",
    importance: "Important",
    state: "operational",
    health: {
      lastSuccess: "12s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.1, timeout: 0.0 },
      p95: "284 ms",
      breaker: "—",
      sparkline: spark([6, 7, 6, 8, 9, 10, 9, 11, 12, 10, 9, 8]),
    },
    spend: {
      mtd: "$0.00",
      proj: "$0.00",
      headroomPct: 92,
      cap: "300k / mo",
      capPct: 8,
      capNote: "success 99.7% · bounce 0.3%",
    },
    wiring: {
      key: { label: "valid · expires 2026-09", ok: true },
      adapter: "live",
      env: { name: "BREVO_API_KEY", set: true },
      rotatedDays: 91,
      extra: [{ label: "success 99.7% · bounce 0.3%", tone: "success", mono: true }],
    },
  },
  {
    id: "wp",
    name: "WP-connector",
    role: "Publish to client's own site (per-tenant)",
    section: "important",
    importance: "Important",
    state: "degraded",
    perTenant: true,
    health: {
      lastSuccess: "1m 04s ago",
      err: { auth4xx: 0.8, r429: 0.0, s5xx: 0.2, timeout: 0.4 },
      p95: "892 ms",
      breaker: "18 connected · 2 degraded · 1 broken",
      sparkline: spark([10, 11, 12, 13, 14, 12, 11, 13, 14, 12, 11, 13]),
    },
    spend: undefined,
    wiring: {
      key: { label: "per-tenant HMAC", ok: true },
      adapter: "live",
      env: { name: "WP_CONNECTOR_SECRET", set: true },
      rotatedDays: 22,
      extra: [{ label: "plugin v0.1.0 · 18/21 sites paired", tone: "muted", mono: true }],
    },
  },

  // --- Infra ---
  {
    id: "supabase",
    name: "Supabase",
    role: "Postgres + Auth + RLS",
    section: "infra",
    importance: "Infra",
    state: "operational",
    noSpend: true,
    health: {
      lastSuccess: "2s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.0, timeout: 0.0 },
      p95: "38 ms",
      breaker: "—",
      sparkline: spark([4, 5, 4, 6, 5, 5, 6, 5, 4, 5, 6, 5]),
    },
    wiring: {
      key: { label: "valid · service-role", ok: true },
      adapter: "live",
      env: { name: "SUPABASE_SERVICE_ROLE_KEY", set: true },
      rotatedDays: 11,
      extra: [
        { label: "pool 14/60 · storage 18% of plan", tone: "muted", mono: true },
      ],
    },
  },
  {
    id: "redis",
    name: "Redis / BullMQ",
    role: "Job queue (stub: LocalOrchestrator)",
    section: "infra",
    importance: "Infra",
    state: "degraded",
    stub: true,
    noSpend: true,
    health: { lastSuccess: "—", err: "pending", p95: "pending", breaker: "—", sparkline: [] },
    wiring: {
      key: { label: "n/a (local)", ok: true },
      adapter: "STUB",
      env: { name: "REDIS_URL", set: false },
      extra: [{ label: "jobs table not written — echo() only", tone: "warning" }],
    },
  },
  {
    id: "inngest",
    name: "Inngest",
    role: "Orchestration · schedules",
    section: "infra",
    importance: "Infra",
    state: "maintenance",
    stub: true,
    noSpend: true,
    health: { lastSuccess: "—", err: "pending", p95: "pending", sparkline: [] },
    wiring: {
      key: { label: "MISSING", ok: false, missing: true },
      adapter: "STUB",
      env: { name: "INNGEST_EVENT_KEY", set: false },
      extra: [{ label: "heartbeat on publish & Batch loops pending", tone: "muted" }],
    },
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    role: "R2 / edge / DNS",
    section: "infra",
    importance: "Infra",
    state: "degraded",
    health: {
      lastSuccess: "18s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.3, timeout: 0.6 },
      p95: "94 ms",
      breaker: "—",
      sparkline: spark([7, 8, 9, 10, 11, 12, 14, 13, 11, 10, 9, 10]),
    },
    spend: {
      mtd: "$12.40",
      proj: "$28.10",
      headroomPct: 71,
      cap: "200 GB egress",
      capPct: 29,
    },
    wiring: {
      key: { label: "valid · scoped token", ok: true },
      adapter: "live",
      env: { name: "CLOUDFLARE_API_TOKEN", set: true },
      rotatedDays: 5,
      extra: [{ label: "R2 58 GB · egress 29% of plan", tone: "muted", mono: true }],
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    role: "Frontend hosting",
    section: "infra",
    importance: "Infra",
    state: "operational",
    noSpend: true,
    health: {
      lastSuccess: "4s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.0, timeout: 0.0 },
      p95: "62 ms",
      breaker: "—",
      sparkline: spark([3, 4, 3, 4, 5, 4, 4, 5, 4, 4, 5, 4]),
    },
    wiring: {
      key: { label: "valid · team token", ok: true },
      adapter: "live",
      env: { name: "VERCEL_TOKEN", set: true },
      rotatedDays: 30,
      extra: [{ label: "commit a1f3c9d · 2026-06-29 10:42 UTC", tone: "muted", mono: true }],
    },
  },
  {
    id: "letsencrypt",
    name: "Let's Encrypt / Traefik",
    role: "TLS certs (prod-only)",
    section: "infra",
    importance: "Infra",
    state: "operational",
    noSpend: true,
    health: { lastSuccess: "—", err: "empty", p95: "—", sparkline: [] },
    wiring: {
      key: { label: "ACME account active", ok: true },
      adapter: "live",
      env: { name: "ACME_EMAIL", set: true },
      rotatedDays: 41,
      extra: [{ label: "cert expires in 64d", tone: "success", mono: true }],
    },
  },

  // --- Observability ---
  {
    id: "sentry",
    name: "Sentry",
    role: "Errors · SENTRY_DSN",
    section: "observability",
    importance: "Observability",
    state: "operational",
    noSpend: true,
    health: {
      lastSuccess: "9s ago",
      err: { auth4xx: 0.0, r429: 0.0, s5xx: 0.0, timeout: 0.0 },
      p95: "—",
      breaker: "issues 24h: 14 · new regressions: 2",
      sparkline: spark([8, 9, 11, 14, 12, 13, 15, 14, 12, 11, 13, 14]),
    },
    wiring: {
      key: { label: "DSN set", ok: true },
      adapter: "live",
      env: { name: "SENTRY_DSN", set: true },
      rotatedDays: 120,
      extra: [{ label: "issues 24h: 14 · regressions: 2", tone: "warning", mono: true }],
    },
  },
  {
    id: "otel",
    name: "OpenTelemetry / OTLP",
    role: "Traces / latency",
    section: "observability",
    importance: "Observability",
    state: "maintenance",
    stub: true,
    noSpend: true,
    health: { lastSuccess: "—", err: "pending", p95: "pending", sparkline: [] },
    wiring: {
      key: { label: "n/a", ok: true },
      adapter: "STUB",
      env: { name: "OTEL_EXPORTER_OTLP_ENDPOINT", set: false },
      extra: [{ label: "OTel backend not wired — add rollup table", tone: "muted" }],
    },
  },
];

function spark(xs: number[]): number[] {
  return xs;
}

const SECTION_TITLE: Record<SectionId, string> = {
  critical: "Critical",
  important: "Important",
  infra: "Infra",
  observability: "Observability",
};

/* WP-connector per-tenant rows */
type TenantRow = {
  org: string;
  url: string;
  plugin: string;
  tokenValid: boolean;
  hmacOk: boolean;
  lastSuccess: string;
  state: VendorState;
};
const TENANT_ROWS: TenantRow[] = [
  { org: "Northbound Coffee Roasters", url: "northboundcoffee.com", plugin: "v0.1.0", tokenValid: true, hmacOk: true, lastSuccess: "42s ago", state: "operational" },
  { org: "Vela & Loom", url: "velaloom.shop", plugin: "v0.1.0", tokenValid: true, hmacOk: true, lastSuccess: "1m 12s ago", state: "operational" },
  { org: "Ferndale Cycle Co.", url: "ferndalecycle.com", plugin: "v0.0.9", tokenValid: true, hmacOk: false, lastSuccess: "14m ago", state: "degraded" },
  { org: "Highline Botanicals", url: "highlinebotanicals.co", plugin: "v0.1.0", tokenValid: false, hmacOk: true, lastSuccess: "2h 04m ago", state: "degraded" },
  { org: "Saltwater Press", url: "saltwaterpress.shop", plugin: "v0.0.8", tokenValid: false, hmacOk: false, lastSuccess: "1d 03h ago", state: "down" },
  { org: "Otterway Outdoor", url: "otterway.gear", plugin: "v0.1.0", tokenValid: true, hmacOk: true, lastSuccess: "31s ago", state: "operational" },
  { org: "Mira Atelier", url: "mira-atelier.com", plugin: "v0.1.0", tokenValid: true, hmacOk: true, lastSuccess: "2m 50s ago", state: "operational" },
];

/* ============================== page ===================================== */

type FilterKey = "all" | "critical" | "important" | "infra" | "observability";

function HealthPage() {
  const { session, impersonation, stubMode } = useAdmin();
  const role = session?.role ?? "platform";
  const isAgency = role === "agency";
  const readOnly = !!impersonation;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [incidentView, setIncidentView] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState("14:32");
  const [tenantOpen, setTenantOpen] = useState(false);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm?: (reason: string) => void;
  }>({ open: false, title: "" });

  const [keyOpen, setKeyOpen] = useState(false);

  const counts = useMemo(() => {
    const ops = VENDORS.filter((v) => v.state === "operational" && !v.stub).length;
    const deg = VENDORS.filter((v) => v.state === "degraded").length;
    const down = VENDORS.filter((v) => v.state === "down").length;
    const stub = VENDORS.filter((v) => v.stub).length;
    return { ops, deg, down, stub };
  }, []);

  const visible = useMemo(() => {
    if (isAgency) {
      return VENDORS.filter((v) => v.id === "wp" || v.id === "ayrshare").map((v) =>
        v.id === "wp" ? { ...v, role: "Your client sites (per-tenant)" } : v,
      );
    }
    if (filter === "all") return VENDORS;
    return VENDORS.filter((v) => v.section === filter);
  }, [filter, isAgency]);

  const sections: SectionId[] = isAgency
    ? ["important"]
    : (["critical", "important", "infra", "observability"] as SectionId[]).filter((s) =>
        filter === "all" || filter === s ? true : false,
      );

  return (
    <AdminShell
      title="Healthcheck / Integrations"
      breadcrumb={["Admin", "Operations", "Healthcheck"]}
      actions={
        <div className="flex items-center gap-2">
          <span className="font-mono-num hidden text-[11px] text-muted-foreground md:inline">
            Last refreshed {refreshedAt} · auto 60s
          </span>
          <button
            onClick={() => {
              const d = new Date();
              const h = d.getHours().toString().padStart(2, "0");
              const m = d.getMinutes().toString().padStart(2, "0");
              setRefreshedAt(`${h}:${m}`);
              toast.success("Refreshed health snapshot");
            }}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            <RefreshCw className="size-3.5" strokeWidth={1.75} /> Refresh
          </button>
        </div>
      }
    >
      <p className="text-[13px] text-muted-foreground">
        Vendor health & spend — is it us or the vendor?
      </p>

      {/* Persistent local banner (in addition to shell's stub banner) */}
      {stubMode && !isAgency ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-[10px] border border-line bg-surface-sunken px-3 py-2 text-[12px] text-ink-700">
          <span
            aria-hidden
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: "var(--warning, #B07B2C)" }}
          />
          <span>
            <strong className="font-medium text-ink-900">AI Gateway: STUB</strong> — no live Anthropic
            key; generations cost ~$0 and content is placeholder. Cost & health telemetry below is
            not real until the key is live.
          </span>
          <button
            disabled={readOnly}
            onClick={() => setKeyOpen(true)}
            className="font-mono-num ml-auto rounded-md bg-brand-700 px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-brand-500 disabled:opacity-50"
            title={readOnly ? "Read-only during impersonation" : undefined}
          >
            Connect live key
          </button>
        </div>
      ) : null}

      {/* Summary tiles + segmented filter */}
      {!isAgency ? (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile label="Operational" value={`${counts.ops}/${VENDORS.length}`} tone="success" />
            <SummaryTile label="Degraded" value={`${counts.deg}`} tone="warning" />
            <SummaryTile label="Down" value={`${counts.down}`} tone="danger" />
            <SummaryTile label="Stub / not wired" value={`${counts.stub}`} tone="muted" />
          </div>
          <div className="flex items-center gap-2">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "critical", label: "Critical" },
                { id: "important", label: "Important" },
                { id: "infra", label: "Infra" },
                { id: "observability", label: "Observability" },
              ]}
            />
            <label className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700">
              <input
                type="checkbox"
                checked={incidentView}
                onChange={(e) => setIncidentView(e.target.checked)}
                className="accent-brand-700"
              />
              Incident view: us vs vendor
            </label>
          </div>
        </div>
      ) : (
        <AgencyScopeNote />
      )}

      {/* Grid sections */}
      <div className="mt-6 space-y-8">
        {(isAgency
          ? ([{ id: "important" as SectionId, title: "Your integrations", vendors: visible }])
          : sections.map((s) => ({
              id: s,
              title: SECTION_TITLE[s],
              vendors: visible.filter((v) => v.section === s),
            }))
        ).map((sec) => (
          <section key={sec.id}>
            <header className="mb-3 flex items-center gap-3 border-b border-line pb-1.5">
              <h2 className="font-display text-[15px] text-ink-900">{sec.title}</h2>
              <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {sec.vendors.length} vendor{sec.vendors.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sec.vendors.map((v) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  isAgency={isAgency}
                  readOnly={readOnly}
                  incidentView={incidentView}
                  onAction={(a) => handleAction(a, v, setConfirm, setKeyOpen, setTenantOpen)}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Agency lock note for hidden sections */}
        {isAgency ? (
          <div className="rounded-[14px] border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-center">
            <Lock className="mx-auto size-4 text-muted-foreground" strokeWidth={1.75} />
            <p className="mt-2 text-[12px] text-muted-foreground">
              Platform-only — visible to Postics staff.
            </p>
          </div>
        ) : null}
      </div>

      {/* WP-connector per-tenant drawer */}
      {tenantOpen ? (
        <TenantSheet
          onClose={() => setTenantOpen(false)}
          rows={isAgency ? TENANT_ROWS.slice(0, 4) : TENANT_ROWS}
          readOnly={readOnly}
          onAct={(label, row) =>
            setConfirm({
              open: true,
              title: `${label} · ${row.org}`,
              description: `Will run against ${row.url}.`,
              confirmLabel: label,
              destructive: label.toLowerCase().includes("rotate"),
              onConfirm: () => setConfirm({ open: false, title: "" }),
            })
          }
        />
      ) : null}

      {/* Connect-key dialog */}
      {keyOpen ? (
        <ConnectKeyDialog onClose={() => setKeyOpen(false)} />
      ) : null}

      <ConfirmReasonDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel ?? "Confirm"}
        destructive={confirm.destructive ?? true}
        onCancel={() => setConfirm({ open: false, title: "" })}
        onConfirm={(r) => {
          confirm.onConfirm?.(r);
          setConfirm({ open: false, title: "" });
        }}
      />
    </AdminShell>
  );
}

/* ============================ shared bits ================================ */

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Dot tone={tone} />
        <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="font-mono-num mt-1 text-[20px] tabular-nums text-ink-900">{value}</div>
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
  options: { id: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-[6px] px-2 py-1 text-[11px] transition-colors",
            o.id === value
              ? "bg-brand-100 text-brand-700"
              : "text-ink-700 hover:bg-surface-sunken",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PendingChip({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
    >
      <Info className="size-3" strokeWidth={1.75} />
      Pending instrumentation
    </span>
  );
}

function StubPill() {
  return (
    <span className="font-mono-num inline-flex items-center gap-1 rounded-md border border-dashed border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      Stub / not wired
    </span>
  );
}

/* ============================ vendor card ================================ */

type Action =
  | "set-cap"
  | "rotate"
  | "reprobe"
  | "flip"
  | "kill"
  | "connect-key"
  | "open-tenants";

function handleAction(
  a: Action,
  v: Vendor,
  setConfirm: (s: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm?: (reason: string) => void;
  }) => void,
  setKeyOpen: (b: boolean) => void,
  setTenantOpen: (b: boolean) => void,
) {
  if (a === "connect-key") return setKeyOpen(true);
  if (a === "open-tenants") return setTenantOpen(true);
  if (a === "reprobe") return toast.success(`${v.name} · re-probe queued`);
  const map: Record<string, { title: string; description: string; label: string; destructive?: boolean }> = {
    "set-cap": {
      title: `Set budget cap · ${v.name}`,
      description: "Cap (USD/mo) + alert thresholds at 75 / 90 / 95 / 100%.",
      label: "Save cap",
      destructive: false,
    },
    rotate: {
      title: `Rotate key · ${v.name}`,
      description: "Will mint a new credential and revoke the previous one.",
      label: "Rotate",
      destructive: true,
    },
    flip: {
      title: `Flip adapter · ${v.name}`,
      description: `Switch ${v.wiring.adapter === "live" ? "live → STUB" : "STUB → live"}.`,
      label: "Flip adapter",
      destructive: true,
    },
    kill: {
      title: `Kill-switch · disable ${v.name} globally`,
      description: "Direct margin insurance. Pauses all jobs in this vendor pool.",
      label: "Disable globally",
      destructive: true,
    },
  };
  const m = map[a];
  if (!m) return;
  setConfirm({
    open: true,
    title: m.title,
    description: m.description,
    confirmLabel: m.label,
    destructive: m.destructive ?? true,
    onConfirm: () => undefined,
  });
}

function VendorCard({
  vendor,
  isAgency,
  readOnly,
  incidentView,
  onAction,
}: {
  vendor: Vendor;
  isAgency: boolean;
  readOnly: boolean;
  incidentView: boolean;
  onAction: (a: Action) => void;
}) {
  const [tab, setTab] = useState<"health" | "spend" | "wiring">("health");
  const tone = STATE_TONE[vendor.state];
  const stateLabel = vendor.stub ? "Stub" : STATE_LABEL[vendor.state];

  // Agency view: only Health + Wiring on their own connectors
  const tabs: { id: "health" | "spend" | "wiring"; label: string }[] = isAgency
    ? [{ id: "health", label: "Health" }, { id: "wiring", label: "Wiring" }]
    : vendor.noSpend
    ? [
        { id: "health", label: "Health" },
        { id: "wiring", label: "Wiring" },
      ]
    : [
        { id: "health", label: "Health" },
        { id: "spend", label: "Spend" },
        { id: "wiring", label: "Wiring" },
      ];

  return (
    <article
      className={cn(
        "flex flex-col rounded-[14px] border border-line bg-surface p-4",
        vendor.big && !isAgency ? "md:col-span-2 xl:col-span-2" : "",
      )}
    >
      <header className="flex items-start gap-2.5">
        <Dot tone={tone} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-display text-[14px] font-medium text-ink-900">
              {vendor.name}
            </h3>
            <TrafficLight tone={tone} label={stateLabel} />
            {vendor.stub ? <StubPill /> : null}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {vendor.role} · <span className="font-mono-num">{vendor.importance}</span>
          </p>
        </div>
        {!isAgency ? (
          <VendorMenu
            vendor={vendor}
            readOnly={readOnly}
            onAction={onAction}
          />
        ) : null}
      </header>

      <div className="mt-3 inline-flex self-start rounded-md border border-line bg-surface-sunken p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-[6px] px-2 py-0.5 text-[11px]",
              tab === t.id ? "bg-surface text-ink-900 shadow-sm" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1">
        {tab === "health" ? (
          <HealthLens vendor={vendor} incidentView={incidentView} />
        ) : tab === "spend" && vendor.spend ? (
          <SpendLens spend={vendor.spend} vendorId={vendor.id} />
        ) : tab === "wiring" ? (
          <WiringLens
            wiring={vendor.wiring}
            vendor={vendor}
            readOnly={readOnly}
            isAgency={isAgency}
            onAction={onAction}
          />
        ) : (
          <p className="text-[12px] text-muted-foreground">— no direct spend</p>
        )}
      </div>
    </article>
  );
}

function VendorMenu({
  vendor,
  readOnly,
  onAction,
}: {
  vendor: Vendor;
  readOnly: boolean;
  onAction: (a: Action) => void;
}) {
  const [open, setOpen] = useState(false);
  const items: { label: string; action: Action; danger?: boolean; show: boolean }[] = ([
    { label: "Re-probe health", action: "reprobe", show: true },
    { label: "Set / edit budget cap", action: "set-cap", show: !!vendor.spend && vendor.spend !== "pending" },
    { label: "Rotate key", action: "rotate", danger: true, show: !vendor.wiring.key.missing },
    { label: vendor.wiring.adapter === "live" ? "Flip adapter live → STUB" : "Flip adapter STUB → live", action: "flip", danger: true, show: true },
    { label: "Kill-switch (disable globally)", action: "kill", danger: true, show: vendor.id === "video" || vendor.id === "image" },
    { label: "View per-tenant", action: "open-tenants", show: !!vendor.perTenant },
  ] as { label: string; action: Action; danger?: boolean; show: boolean }[]).filter((i) => i.show);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono-num rounded-md border border-line bg-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700 hover:bg-surface-sunken"
      >
        Actions
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+4px)] z-40 w-56 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]">
            {items.map((i) => (
              <button
                key={i.label}
                disabled={readOnly}
                title={readOnly ? "Read-only during impersonation" : undefined}
                onClick={() => {
                  setOpen(false);
                  onAction(i.action);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[12px] hover:bg-surface-sunken disabled:opacity-50",
                  i.danger ? "text-[color:var(--danger,#A6453C)]" : "text-ink-700",
                )}
              >
                {i.label}
                {i.danger ? <ShieldAlert className="size-3" strokeWidth={1.75} /> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ============================ lens components ============================ */

function HealthLens({ vendor, incidentView }: { vendor: Vendor; incidentView: boolean }) {
  const { health } = vendor;
  const isEmpty = health.lastSuccess === "—";
  return (
    <div className="space-y-2.5">
      <Row label="last success" value={health.lastSuccess} mono />

      <div>
        <Row label="error rate" value={typeof health.err === "object" ? "" : ""} mono />
        {health.err === "pending" ? (
          <div className="mt-1"><PendingChip note="Mirror BullMQ / orchestrator to expose per-class error rates." /></div>
        ) : health.err === "empty" || !health.err ? (
          <p className="mt-1 text-[11px] text-muted-foreground">No calls yet</p>
        ) : (
          <SplitBar err={health.err as ErrSplit} />
        )}
      </div>

      <Row
        label="p95"
        value={typeof health.p95 === "string" && health.p95 !== "pending" && health.p95 !== "empty" ? health.p95 : ""}
        mono
        rightSlot={
          health.p95 === "pending" ? <PendingChip note="OTel latency not wired yet." /> : health.p95 === "empty" || !health.p95 ? <span className="text-[11px] text-muted-foreground">No calls yet</span> : null
        }
      />

      {health.breaker ? (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-mono-num uppercase tracking-[0.12em] text-muted-foreground">breaker</span>
          <span
            className={cn(
              "font-mono-num truncate rounded-md border border-line px-1.5 py-0.5 text-[10px]",
              health.breaker.toLowerCase().includes("open")
                ? "bg-[color:var(--danger,#A6453C)]/10 text-[color:var(--danger,#A6453C)]"
                : "bg-surface-sunken text-ink-700",
            )}
          >
            {health.breaker}
          </span>
        </div>
      ) : null}

      {/* sparkline */}
      <Sparkline data={health.sparkline ?? []} empty={isEmpty} />

      {incidentView ? (
        <div className="rounded-md border border-dashed border-line bg-surface-sunken/50 px-2 py-1.5 text-[11px] text-muted-foreground">
          attribution · <span className="font-mono-num">us {vendor.state === "down" ? 0 : 12}%</span>{" "}
          · <span className="font-mono-num">vendor {vendor.state === "down" ? 100 : 88}%</span>
        </div>
      ) : null}
    </div>
  );
}

function SpendLens({ spend, vendorId }: { spend: Spend | "pending"; vendorId: string }) {
  if (spend === "pending") {
    return (
      <div className="space-y-2">
        <PendingChip note="Persist artifacts.cost_usd_est on each call (model + tier + tokens)." />
        <div className="space-y-1">
          <SkeletonRow label="MTD" />
          <SkeletonRow label="proj month-end" />
          <SkeletonRow label="headroom" />
        </div>
        <CapMeter pct={0} label="budget cap (idle)" />
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <Row label="MTD" value={spend.mtd} mono />
      <Row label="proj month-end" value={spend.proj} mono />
      <div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono-num uppercase tracking-[0.12em] text-muted-foreground">headroom</span>
          <span className="font-mono-num text-ink-900">{spend.headroomPct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full bg-brand-700" style={{ width: `${spend.headroomPct}%` }} />
        </div>
      </div>
      <CapMeter pct={spend.capPct} label={`budget cap · ${spend.cap}`} />
      {spend.capNote ? (
        <p className="text-[11px] text-muted-foreground">{spend.capNote}</p>
      ) : null}
      {spend.flagship ? (
        <div className="mt-2 space-y-1.5 rounded-md border border-line bg-surface-sunken/40 p-2">
          <div className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Flagship seconds caps
          </div>
          {spend.flagship.map((f) => {
            const pct = (f.usedSec / f.capSec) * 100;
            return (
              <div key={f.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-700">{f.label}</span>
                  <span className="font-mono-num text-ink-900">{f.usedSec}s / {f.capSec}s</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        pct >= 95
                          ? "var(--danger, #A6453C)"
                          : pct >= 75
                          ? "var(--warning, #B07B2C)"
                          : "var(--brand-700, #1E3A34)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function WiringLens({
  wiring,
  vendor,
  readOnly,
  isAgency,
  onAction,
}: {
  wiring: Wiring;
  vendor: Vendor;
  readOnly: boolean;
  isAgency: boolean;
  onAction: (a: Action) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Row
        label="key"
        value={wiring.key.label}
        mono
        tone={wiring.key.missing ? "danger" : "success"}
      />
      <Row
        label="adapter"
        value={wiring.adapter}
        mono
        tone={wiring.adapter === "live" ? "success" : "warning"}
      />
      <Row
        label={`env ${wiring.env.name}`}
        value={wiring.env.set ? "set" : "not set"}
        mono
        tone={wiring.env.set ? "success" : "danger"}
      />
      {wiring.rotatedDays != null ? (
        <Row
          label="rotated"
          value={`${wiring.rotatedDays}d ago`}
          mono
          tone={wiring.rotatedDays > 90 ? "warning" : "muted"}
        />
      ) : null}
      {wiring.extra?.map((e) => (
        <div key={e.label} className="flex items-center gap-1.5 text-[11px]">
          <Dot tone={e.tone ?? "muted"} />
          <span className={cn(e.mono ? "font-mono-num" : "", "text-ink-700")}>{e.label}</span>
        </div>
      ))}

      {vendor.perTenant ? (
        <button
          onClick={() => onAction("open-tenants")}
          className="font-mono-num mt-2 inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
        >
          View per-tenant <ExternalLink className="size-3" strokeWidth={1.75} />
        </button>
      ) : null}

      {vendor.id === "anthropic" && !isAgency ? (
        <button
          disabled={readOnly}
          onClick={() => onAction("connect-key")}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-2 py-1 text-[11px] font-medium text-paper hover:bg-brand-500 disabled:opacity-50"
        >
          <KeyRound className="size-3" strokeWidth={1.75} /> Connect live key
        </button>
      ) : null}
    </div>
  );
}

/* ============================ tiny primitives ============================ */

function Row({
  label,
  value,
  mono,
  tone,
  rightSlot,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  tone?: Tone;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="font-mono-num uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        {tone ? <Dot tone={tone} /> : null}
        {value ? (
          <span className={cn(mono ? "font-mono-num" : "", "truncate text-ink-900")}>{value}</span>
        ) : null}
        {rightSlot}
      </div>
    </div>
  );
}

function SkeletonRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="font-mono-num uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className="h-3 w-16 animate-pulse rounded bg-surface-sunken" />
    </div>
  );
}

function SplitBar({ err }: { err: ErrSplit }) {
  const total = err.auth4xx + err.r429 + err.s5xx + err.timeout || 0.001;
  const segs = [
    { key: "auth", pct: (err.auth4xx / total) * 100, color: "#3A6079", v: err.auth4xx, label: "4xx-auth" },
    { key: "429", pct: (err.r429 / total) * 100, color: "#B07B2C", v: err.r429, label: "429" },
    { key: "5xx", pct: (err.s5xx / total) * 100, color: "#A6453C", v: err.s5xx, label: "5xx" },
    { key: "to", pct: (err.timeout / total) * 100, color: "#6B6F78", v: err.timeout, label: "timeout" },
  ];
  return (
    <div className="mt-1 space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        {segs.map((s) => (
          <div key={s.key} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div className="font-mono-num flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
        {segs.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} {s.v.toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function CapMeter({ pct, label }: { pct: number; label: string }) {
  const ticks = [75, 90, 95, 100];
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-mono-num uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        <span className="font-mono-num text-ink-900">{pct}%</span>
      </div>
      <div className="relative mt-1 h-2 w-full rounded-full bg-surface-sunken">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor:
              pct >= 100
                ? "var(--danger, #A6453C)"
                : pct >= 90
                ? "var(--warning, #B07B2C)"
                : "var(--brand-700, #1E3A34)",
          }}
        />
        {ticks.map((t, i) => (
          <span
            key={t}
            className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full ring-2 ring-surface"
            style={{
              left: `calc(${t}% - 3px)`,
              backgroundColor:
                i === 0
                  ? "var(--success, #3C7D5C)"
                  : i === 3
                  ? "var(--danger, #A6453C)"
                  : "var(--warning, #B07B2C)",
            }}
          />
        ))}
      </div>
      <div className="font-mono-num mt-1 flex justify-between text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>75</span><span>90</span><span>95</span><span>ALERT → REJECT 100</span>
      </div>
    </div>
  );
}

function Sparkline({ data, empty }: { data: number[]; empty: boolean }) {
  if (empty || data.length === 0) {
    return (
      <div className="h-8 rounded-md border border-dashed border-line bg-surface-sunken/40 text-center text-[10px] leading-[2rem] text-muted-foreground">
        No samples yet
      </div>
    );
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / Math.max(1, max - min)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full">
      <polyline
        fill="none"
        stroke="var(--brand-700, #1E3A34)"
        strokeWidth={1}
        points={pts}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ============================ tenant sheet =============================== */

function TenantSheet({
  onClose,
  rows,
  readOnly,
  onAct,
}: {
  onClose: () => void;
  rows: TenantRow[];
  readOnly: boolean;
  onAct: (label: string, row: TenantRow) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-line bg-surface"
      >
        <header className="flex items-center gap-2 border-b border-line px-5 py-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] text-ink-900">WP-connector · per-tenant</h3>
            <p className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {rows.length} sites · separates "client broke it" from "vendor is down"
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-2 py-1 text-xs hover:bg-surface-sunken"
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        </header>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-sunken text-left text-muted-foreground">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em]">
                <th className="px-3 py-2 font-normal">Tenant · org</th>
                <th className="px-3 py-2 font-normal">Site URL</th>
                <th className="px-3 py-2 font-normal">Plugin</th>
                <th className="px-3 py-2 font-normal">Token</th>
                <th className="px-3 py-2 font-normal">HMAC</th>
                <th className="px-3 py-2 font-normal">Last success</th>
                <th className="px-3 py-2 font-normal">State</th>
                <th className="px-3 py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.org} className="hover:bg-surface-sunken/50">
                  <td className="px-3 py-2 text-ink-900">{r.org}</td>
                  <td className="font-mono-num px-3 py-2 text-ink-700">{r.url}</td>
                  <td className="font-mono-num px-3 py-2 text-muted-foreground">{r.plugin}</td>
                  <td className="px-3 py-2">
                    {r.tokenValid ? (
                      <span className="inline-flex items-center gap-1 text-[color:var(--success,#3C7D5C)]">
                        <CheckCircle2 className="size-3" strokeWidth={2} /> valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[color:var(--danger,#A6453C)]">
                        <AlertTriangle className="size-3" strokeWidth={2} /> expired
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.hmacOk ? (
                      <span className="inline-flex items-center gap-1 text-[color:var(--success,#3C7D5C)]">
                        <CheckCircle2 className="size-3" strokeWidth={2} /> ok
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[color:var(--danger,#A6453C)]">
                        <AlertTriangle className="size-3" strokeWidth={2} /> mismatch
                      </span>
                    )}
                  </td>
                  <td className="font-mono-num px-3 py-2 text-muted-foreground">{r.lastSuccess}</td>
                  <td className="px-3 py-2">
                    <TrafficLight tone={STATE_TONE[r.state]} label={STATE_LABEL[r.state]} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        disabled={readOnly}
                        onClick={() => onAct("Re-probe", r)}
                        className="font-mono-num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-ink-700 hover:bg-surface-sunken disabled:opacity-50"
                      >
                        Re-probe
                      </button>
                      <button
                        disabled={readOnly}
                        onClick={() => onAct("Rotate credential", r)}
                        className="font-mono-num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[color:var(--danger,#A6453C)] hover:bg-surface-sunken disabled:opacity-50"
                      >
                        Rotate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}

/* ============================ connect-key dialog ========================= */

function ConnectKeyDialog({ onClose }: { onClose: () => void }) {
  const [val, setVal] = useState("");
  const { setStubMode } = useAdmin();
  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-line bg-surface p-5"
      >
        <h3 className="font-display text-base text-ink-900">Connect Anthropic live key</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Once a valid key is set, the STUB banner clears and real spend &amp; health telemetry begins.
        </p>
        <label className="font-mono-num mt-3 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          ANTHROPIC_API_KEY
        </label>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="sk-ant-…"
          className="font-mono-num mt-1 w-full rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Stored in env at apply time · this action is recorded in the audit log.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            disabled={val.trim().length < 8}
            onClick={() => {
              setStubMode(false);
              toast.success("Anthropic key registered — STUB cleared");
              onClose();
            }}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-paper hover:bg-brand-500 disabled:opacity-50"
          >
            Apply &amp; clear stub
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ agency note =============================== */

function AgencyScopeNote() {
  return (
    <div className="mt-5 rounded-[10px] border border-line bg-surface-sunken px-3 py-2.5 text-[12px] text-muted-foreground">
      <span className="font-mono-num uppercase tracking-[0.12em] text-ink-700">Your integrations</span> ·
      only health for your WP-connector sites and social tokens. Vendor spend, budget caps, kill-switches
      and platform internals are hidden.
    </div>
  );
}