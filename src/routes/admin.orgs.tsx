// Orgs & Activation — admin tab. Cross-tenant for platform-admin; sub-client scoped for agency-admin.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Eye,
  Info,
  KeyRound,
  Lock,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminPage } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import {
  ConfirmReasonDialog,
  DataPanel,
  Dot,
  TrafficLight,
  type Tone,
} from "@/features/admin/ui";

export const Route = createFileRoute("/admin/orgs")({
  component: OrgsPage,
});

/* ============================== sample data ============================= */

type OrgType = "Direct" | "Agency" | "Owner";
type Plan = "Starter" | "Growth" | "Premium" | "Agency";
type Status = "active" | "trial" | "past_due" | "suspended";

type AdminOrgRow = {
  id: string;
  name: string;
  domain: string;
  type: OrgType;
  plan: Plan;
  status: Status;
  takeRate: number | null; // 0..1, only for Agency rows
  projects: number;
  connected: number;
  exportOnly: number;
  balance: number; // credits
  grant: number;
  gm: number | null; // 0..1
  createdAt: string;
  ownerEmail: string;
  stripeId: string;
  /** parent agency id if this is a sub-client of an agency */
  parentAgencyId?: string;
};

const ORGS: AdminOrgRow[] = [
  { id: "org_north", name: "Northbound Coffee", domain: "northboundroasters.com", type: "Direct", plan: "Growth", status: "active", takeRate: null, projects: 1, connected: 1, exportOnly: 0, balance: 1840, grant: 4000, gm: 0.71, createdAt: "2026-02-11", ownerEmail: "ops@northboundroasters.com", stripeId: "cus_QkR4n8M2" },
  { id: "org_loom", name: "Loomwell Linens", domain: "loomwell.co", type: "Direct", plan: "Premium", status: "active", takeRate: null, projects: 2, connected: 1, exportOnly: 1, balance: 2740, grant: 10000, gm: 0.62, createdAt: "2025-11-04", ownerEmail: "alex@loomwell.co", stripeId: "cus_QkR7m4P1" },
  { id: "org_velourie", name: "Velourie Atelier", domain: "velourie.shop", type: "Direct", plan: "Starter", status: "trial", takeRate: null, projects: 1, connected: 0, exportOnly: 1, balance: 110, grant: 2000, gm: 0.44, createdAt: "2026-05-18", ownerEmail: "studio@velourie.shop", stripeId: "cus_QkR9b1F3" },
  { id: "org_harbor", name: "Harbor & Ash Outfitters", domain: "harborandash.com", type: "Direct", plan: "Growth", status: "trial", takeRate: null, projects: 1, connected: 0, exportOnly: 1, balance: 1640, grant: 4000, gm: 0.51, createdAt: "2026-06-24", ownerEmail: "matt@harborandash.com", stripeId: "cus_QkS01dQ2" },
  { id: "org_solstice", name: "Solstice Soap Co.", domain: "solsticesoap.com", type: "Direct", plan: "Starter", status: "past_due", takeRate: null, projects: 1, connected: 1, exportOnly: 0, balance: 60, grant: 2000, gm: 0.21, createdAt: "2025-09-10", ownerEmail: "hi@solsticesoap.com", stripeId: "cus_QkS22vN6" },
  { id: "org_brightwell", name: "Brightwell Goods", domain: "brightwell.shop", type: "Direct", plan: "Premium", status: "active", takeRate: null, projects: 2, connected: 2, exportOnly: 0, balance: 5210, grant: 10000, gm: 0.57, createdAt: "2025-12-02", ownerEmail: "lena@brightwell.shop", stripeId: "cus_QkS39wY7" },

  // Agency parents + sub-client projects
  { id: "org_maison_b5", name: "Maison B5", domain: "maisonb5.agency", type: "Agency", plan: "Agency", status: "active", takeRate: 0.22, projects: 5, connected: 3, exportOnly: 2, balance: 18400, grant: 30000, gm: 0.58, createdAt: "2025-07-19", ownerEmail: "ben@maisonb5.agency", stripeId: "cus_QkS44eA8" },
  { id: "org_maple", name: "Maple & Co Agency", domain: "mapleco.agency", type: "Agency", plan: "Agency", status: "active", takeRate: 0.18, projects: 4, connected: 2, exportOnly: 2, balance: 9120, grant: 20000, gm: 0.63, createdAt: "2025-10-04", ownerEmail: "rae@mapleco.agency", stripeId: "cus_QkS51oF9" },
  { id: "org_atlas", name: "Atlas Studio", domain: "atlasstudio.co", type: "Agency", plan: "Agency", status: "past_due", takeRate: 0.18, projects: 3, connected: 1, exportOnly: 2, balance: 240, grant: 15000, gm: 0.39, createdAt: "2025-08-22", ownerEmail: "ops@atlasstudio.co", stripeId: "cus_QkS17gH4" },

  { id: "org_pinegrove", name: "Pinegrove Pet Supply", domain: "pinegrovepet.com", type: "Owner", plan: "Growth", status: "active", takeRate: null, projects: 1, connected: 1, exportOnly: 0, balance: 1320, grant: 4000, gm: 0.55, createdAt: "2026-01-14", ownerEmail: "ops@pinegrovepet.com", stripeId: "cus_QkS62hL0", parentAgencyId: "org_maison_b5" },
  { id: "org_aurora", name: "Aurora Skincare", domain: "auroraskin.co", type: "Owner", plan: "Premium", status: "active", takeRate: null, projects: 1, connected: 1, exportOnly: 0, balance: 4210, grant: 8000, gm: 0.49, createdAt: "2026-03-02", ownerEmail: "lily@auroraskin.co", stripeId: "cus_QkS71kM1", parentAgencyId: "org_maison_b5" },
  { id: "org_trailhaul", name: "TrailHaul Co.", domain: "trailhaul.gear", type: "Owner", plan: "Growth", status: "trial", takeRate: null, projects: 1, connected: 0, exportOnly: 1, balance: 290, grant: 4000, gm: null, createdAt: "2026-06-09", ownerEmail: "kev@trailhaul.gear", stripeId: "cus_QkS82lN2", parentAgencyId: "org_maison_b5" },
];

type Seat = { email: string; role: "Owner" | "Editor" | "Viewer"; lastActive: string };
const SEATS_BY_ORG: Record<string, Seat[]> = {
  org_north: [
    { email: "ops@northboundroasters.com", role: "Owner", lastActive: "2m" },
    { email: "marketing@northboundroasters.com", role: "Editor", lastActive: "1h" },
  ],
  org_loom: [
    { email: "alex@loomwell.co", role: "Owner", lastActive: "11m" },
    { email: "ana@loomwell.co", role: "Editor", lastActive: "Yesterday" },
    { email: "freelance@studio42.io", role: "Viewer", lastActive: "3d" },
  ],
};

type FunnelStep = { key: string; label: string; count: number; pending?: boolean };
const FUNNEL_BY_ORG: Record<string, FunnelStep[]> = {
  org_north: [
    { key: "signup", label: "signup", count: 1 },
    { key: "site_added", label: "site added", count: 1 },
    { key: "plan", label: "plan generated", count: 1 },
    { key: "ready", label: "first piece ready", count: 1 },
    { key: "export", label: "first export", count: 1, pending: true },
    { key: "published", label: "published · connected", count: 1 },
  ],
  org_velourie: [
    { key: "signup", label: "signup", count: 1 },
    { key: "site_added", label: "site added", count: 1 },
    { key: "plan", label: "plan generated", count: 1 },
    { key: "ready", label: "first piece ready", count: 0 },
    { key: "export", label: "first export", count: 0, pending: true },
    { key: "published", label: "published · connected", count: 0 },
  ],
};

/* =============================== helpers =============================== */

const planChip: Record<Plan, string> = {
  Starter: "bg-surface-sunken text-ink-700",
  Growth: "bg-brand-100 text-ink-900",
  Premium: "bg-[color:var(--accent-gold,#B98A3E)]/15 text-ink-900",
  Agency: "bg-brand-700 text-paper",
};

function statusTone(s: Status): Tone {
  if (s === "active") return "success";
  if (s === "trial") return "info";
  if (s === "past_due") return "warning";
  return "danger";
}
function statusLabel(s: Status): string {
  return s === "past_due" ? "past-due" : s;
}
function gmTone(gm: number | null): Tone {
  if (gm == null) return "muted";
  if (gm >= 0.6) return "success";
  if (gm >= 0.4) return "warning";
  return "danger";
}

/* ================================ page ================================= */

function OrgsPage() {
  const { session, impersonation, startImpersonation } = useAdmin();
  const realRole = session?.role ?? "platform";

  // Allow founder to PREVIEW the agency-admin scope without losing platform session.
  const [previewRole, setPreviewRole] = useState<"platform" | "agency">(realRole);
  const effectiveRole: "platform" | "agency" = realRole === "agency" ? "agency" : previewRole;
  const isPlatform = effectiveRole === "platform";
  const scopedAgencyId = "org_maison_b5"; // demo: agency view scopes to Maison B5

  // Filters
  const [q, setQ] = useState("");
  const [fType, setFType] = useState<"all" | OrgType>("all");
  const [fPlan, setFPlan] = useState<"all" | Plan>("all");
  const [fStatus, setFStatus] = useState<"all" | Status>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [negOnly, setNegOnly] = useState(false);

  // Drawer
  const [openOrgId, setOpenOrgId] = useState<string | null>(null);

  const scopedRows = useMemo(() => {
    let rows = ORGS;
    if (!isPlatform) {
      // Agency-admin sees their own agency + sub-client projects only.
      rows = rows.filter(
        (r) => r.id === scopedAgencyId || r.parentAgencyId === scopedAgencyId,
      );
    }
    return rows;
  }, [isPlatform]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return scopedRows.filter((r) => {
      if (fType !== "all" && r.type !== fType) return false;
      if (fPlan !== "all" && r.plan !== fPlan) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (lowOnly && r.balance / r.grant > 0.1) return false;
      if (negOnly && (r.gm == null || r.gm >= 0.4)) return false;
      if (ql) {
        const hay = `${r.name} ${r.domain} ${r.ownerEmail} ${r.stripeId} ${r.id}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [scopedRows, q, fType, fPlan, fStatus, lowOnly, negOnly]);

  const openOrg = useMemo(
    () => ORGS.find((o) => o.id === openOrgId) ?? null,
    [openOrgId],
  );

  return (
    <AdminPage title="Orgs & Activation">
      <div className="space-y-4">
        <HeaderRow
          realRole={realRole}
          previewRole={effectiveRole}
          onPreviewRole={(r) => setPreviewRole(r)}
        />

        <Omnibox value={q} onChange={setQ} isPlatform={isPlatform} />

        <ActivationStrip />

        <OrgsTable
          rows={rows}
          isPlatform={isPlatform}
          fType={fType} setFType={setFType}
          fPlan={fPlan} setFPlan={setFPlan}
          fStatus={fStatus} setFStatus={setFStatus}
          lowOnly={lowOnly} setLowOnly={setLowOnly}
          negOnly={negOnly} setNegOnly={setNegOnly}
          onOpen={setOpenOrgId}
        />

        <LowCreditQueue rows={scopedRows} onOpen={setOpenOrgId} />

        {impersonation ? (
          <p className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Mutations are disabled site-wide during view-as.
          </p>
        ) : null}
      </div>

      <OrgDrawer
        org={openOrg}
        isPlatform={isPlatform}
        onClose={() => setOpenOrgId(null)}
        onViewAs={(o) => {
          startImpersonation({ orgName: o.name, orgId: o.id, reason: "viewed from /admin/orgs", minutes: 25 });
          toast.success(`Viewing as ${o.name} · read-only`);
        }}
      />
    </AdminPage>
  );
}

/* ============================== chrome ============================== */

function HeaderRow({
  realRole,
  previewRole,
  onPreviewRole,
}: {
  realRole: "platform" | "agency";
  previewRole: "platform" | "agency";
  onPreviewRole: (r: "platform" | "agency") => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Orgs &amp; Activation</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Founder's cross-tenant book of business — orgs, activation funnel, connector health.
        </p>
      </div>
      {realRole === "platform" ? (
        <div className="font-mono-num inline-flex items-center rounded-md border border-line bg-surface p-0.5 text-[10px] uppercase tracking-[0.12em]">
          <span className="px-1.5 text-muted-foreground">viewing as:</span>
          {(["platform", "agency"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onPreviewRole(r)}
              className={cn(
                "rounded-sm px-2 py-0.5 transition",
                previewRole === r ? "bg-brand-700 text-paper" : "text-muted-foreground hover:text-ink-900",
              )}
            >
              {r === "platform" ? "platform-admin" : "agency-admin (demo)"}
            </button>
          ))}
        </div>
      ) : (
        <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-700">
          agency-admin
        </span>
      )}
    </div>
  );
}

/* =============================== omnibox =============================== */

function Omnibox({
  value,
  onChange,
  isPlatform,
}: {
  value: string;
  onChange: (v: string) => void;
  isPlatform: boolean;
}) {
  const showResults = value.trim().length > 0;
  const ql = value.toLowerCase();
  const matchOrgs = ORGS.filter((o) =>
    `${o.name} ${o.domain}`.toLowerCase().includes(ql),
  ).slice(0, 4);
  return (
    <div className="rounded-[14px] border border-line bg-surface">
      <div className="flex items-center gap-2 px-3 py-2">
        <Search className="size-4 text-muted-foreground" strokeWidth={1.7} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isPlatform
              ? "Search email · org · client domain · Stripe id · job id · asset_uid"
              : "Search your clients · domains · asset_uid"
          }
          className="font-mono-num w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-muted-foreground/70"
        />
        <span className="font-mono-num hidden rounded border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:inline">
          ⌘K
        </span>
      </div>
      {showResults ? (
        <div className="border-t border-line p-2">
          <ResultGroup label="Orgs">
            {matchOrgs.length === 0 ? (
              <EmptyResultRow text="No matching orgs" />
            ) : (
              matchOrgs.map((o) => (
                <ResultRow
                  key={o.id}
                  primary={o.name}
                  secondary={o.domain}
                  meta={o.plan}
                />
              ))
            )}
          </ResultGroup>
          <ResultGroup label="People">
            <ResultRow primary="alex@loomwell.co" secondary="Loomwell Linens · Editor" meta="seat" />
          </ResultGroup>
          <ResultGroup label="Domains">
            <ResultRow primary="northboundroasters.com" secondary="connected · plugin 1.2.0" meta="domain" />
          </ResultGroup>
          <ResultGroup label="Stripe">
            <ResultRow primary="cus_QkR4n8M2" secondary="Northbound Coffee" meta="stripe" />
          </ResultGroup>
          <ResultGroup label="Jobs" pendingNote="jobs table not yet written — only echo(); engineer must persist job rows.">
            <div className="px-2 py-2 text-[11px] text-muted-foreground">No jobs persisted yet.</div>
          </ResultGroup>
          <ResultGroup label="Assets">
            <ResultRow primary="ast_9f2c4a7e" secondary="Article · Northbound Coffee · qa_running" meta="asset_uid" />
          </ResultGroup>
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  label,
  pendingNote,
  children,
}: {
  label: string;
  pendingNote?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        {pendingNote ? (
          <span
            title={pendingNote}
            className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            <Info className="size-3" strokeWidth={1.7} />
            pending instrumentation
          </span>
        ) : null}
      </div>
      <div className="rounded-md border border-line/60">{children}</div>
    </div>
  );
}
function ResultRow({ primary, secondary, meta }: { primary: string; secondary: string; meta: string }) {
  return (
    <button className="flex w-full items-center justify-between gap-3 px-2 py-1.5 text-left text-xs hover:bg-surface-sunken">
      <span className="flex items-center gap-2">
        <span className="font-mono-num text-ink-900">{primary}</span>
        <span className="text-muted-foreground">{secondary}</span>
      </span>
      <span className="font-mono-num rounded bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {meta}
      </span>
    </button>
  );
}
function EmptyResultRow({ text }: { text: string }) {
  return <div className="px-2 py-2 text-[11px] text-muted-foreground">{text}</div>;
}

/* ============================ activation strip ========================= */

function Spark({ tone = "success" as Tone }: { tone?: Tone }) {
  const pts = [4, 6, 5, 7, 6, 9, 8, 11, 10, 13, 12, 14];
  const max = Math.max(...pts);
  const w = 100 / (pts.length - 1);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * w} ${100 - (p / max) * 80 - 10}`)
    .join(" ");
  const color =
    tone === "danger" ? "var(--danger,#A6453C)"
    : tone === "warning" ? "var(--warning,#B07B2C)"
    : tone === "info" ? "var(--info,#3A6079)"
    : "var(--brand-700,#1E3A34)";
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function ActivationStrip() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <ActivationTile
        label="Signups · 30d"
        value="14"
        delta="+3 vs prior 30d"
        tone="success"
        hint="approx — true time-buckets pending"
      />
      <ActivationTile
        label="Activation funnel · 30d"
        value="9 / 14"
        delta="signup → first-generate (64%)"
        tone="info"
      />
      <PendingTile
        label="First-export rate"
        note="no export event yet — engineer must emit unit_events.event_type='exported'; this is the default-path activation North-Star."
      />
      <ActivationTile
        label="Connected vs export"
        value="38% / 62%"
        delta="moat eligibility · projects.wp_connection_id"
        tone="info"
        bar={[38, 62]}
      />
    </div>
  );
}

function ActivationTile({
  label, value, delta, tone, bar, hint,
}: { label: string; value: string; delta: string; tone: Tone; bar?: [number, number]; hint?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <div className="flex items-center gap-1.5">
        <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        {hint ? (
          <span title={hint} className="text-muted-foreground">
            <Info className="size-3" strokeWidth={1.7} />
          </span>
        ) : null}
      </div>
      <div className="font-mono-num mt-1 text-2xl tabular-nums text-ink-900">{value}</div>
      <div className="font-mono-num mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Dot tone={tone} /> {delta}
      </div>
      {bar ? (
        <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div style={{ width: `${bar[0]}%`, backgroundColor: "var(--brand-700,#1E3A34)" }} />
          <div style={{ width: `${bar[1]}%`, backgroundColor: "var(--info,#3A6079)" }} />
        </div>
      ) : (
        <Spark tone={tone} />
      )}
    </div>
  );
}

function PendingTile({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2">
        <span
          title={note}
          className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        >
          <Info className="size-3" strokeWidth={1.7} />
          pending instrumentation
        </span>
      </div>
      <div className="font-mono-num mt-3 text-[11px] text-muted-foreground">
        Wire <span className="text-ink-700">unit_events.event_type='exported'</span> first.
      </div>
    </div>
  );
}

/* ============================== orgs table ============================== */

function OrgsTable({
  rows, isPlatform,
  fType, setFType, fPlan, setFPlan, fStatus, setFStatus,
  lowOnly, setLowOnly, negOnly, setNegOnly,
  onOpen,
}: {
  rows: AdminOrgRow[];
  isPlatform: boolean;
  fType: "all" | OrgType; setFType: (v: "all" | OrgType) => void;
  fPlan: "all" | Plan; setFPlan: (v: "all" | Plan) => void;
  fStatus: "all" | Status; setFStatus: (v: "all" | Status) => void;
  lowOnly: boolean; setLowOnly: (v: boolean) => void;
  negOnly: boolean; setNegOnly: (v: boolean) => void;
  onOpen: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  return (
    <DataPanel
      title={isPlatform ? "All orgs · cross-tenant" : "Your clients & sub-projects"}
      actions={<TrafficLight tone="success" label="live" />}
    >
      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select label="Type" value={fType} onChange={(v) => setFType(v as "all" | OrgType)} options={["all","Direct","Agency","Owner"]} />
        <Select label="Plan" value={fPlan} onChange={(v) => setFPlan(v as "all" | Plan)} options={["all","Starter","Growth","Premium","Agency"]} />
        <Select label="Status" value={fStatus} onChange={(v) => setFStatus(v as "all" | Status)} options={["all","active","trial","past_due","suspended"]} />
        <Toggle label="Low-credit only" value={lowOnly} onChange={setLowOnly} />
        {isPlatform ? <Toggle label="Margin-negative only" value={negOnly} onChange={setNegOnly} /> : null}
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 ? (
            <button
              onClick={() => { toast.success(`Re-probe queued · ${selected.size} orgs`); setSelected(new Set()); }}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken"
            >
              Re-probe connectors ({selected.size})
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="font-mono-num sticky top-0 z-[1] bg-surface text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr className="border-b border-line">
              <th className="px-2 py-2 w-7" />
              <th className="px-2 py-2">Org</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Plan</th>
              <th className="px-2 py-2">Status</th>
              {isPlatform ? <th className="px-2 py-2 text-right">Take-rate</th> : null}
              <th className="px-2 py-2 text-right">Projects</th>
              <th className="px-2 py-2">Conn / Exp</th>
              <th className="px-2 py-2 text-right">Balance</th>
              {isPlatform ? <th className="px-2 py-2 text-right">GM%</th> : null}
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={isPlatform ? 11 : 9} className="px-2 py-8 text-center text-xs text-muted-foreground">
                  No orgs match — clear filters or wait for first signup.
                </td>
              </tr>
            ) : null}
            {rows.map((r) => {
              const low = r.balance / r.grant <= 0.1;
              return (
                <tr key={r.id} className="cursor-pointer border-b border-line/60 hover:bg-surface-sunken/50" onClick={() => onOpen(r.id)}>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="accent-[var(--brand-700,#1E3A34)]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-5 items-center justify-center rounded bg-surface-sunken text-[10px] text-muted-foreground">
                        {r.type === "Agency" ? <Building2 className="size-3" /> : r.type === "Owner" ? <Users className="size-3" /> : <span>·</span>}
                      </span>
                      <div>
                        <div className="text-ink-900">{r.name}</div>
                        <div className="font-mono-num text-[10px] text-muted-foreground">{r.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <span className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={cn("font-mono-num rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]", planChip[r.plan])}>
                      {r.plan}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <TrafficLight tone={statusTone(r.status)} label={statusLabel(r.status)} />
                  </td>
                  {isPlatform ? (
                    <td className="px-2 py-2 text-right font-mono-num tabular-nums text-ink-700">
                      {r.takeRate == null ? "—" : `${(r.takeRate * 100).toFixed(0)}%`}
                    </td>
                  ) : null}
                  <td className="px-2 py-2 text-right font-mono-num tabular-nums text-ink-700">{r.projects}</td>
                  <td className="px-2 py-2">
                    <span className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-700">
                      {r.connected} conn · {r.exportOnly} exp
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className="font-mono-num inline-flex items-center justify-end gap-1.5 tabular-nums text-ink-700">
                      {low ? <Dot tone="warning" /> : null}
                      {r.balance.toLocaleString()}
                    </span>
                  </td>
                  {isPlatform ? (
                    <td className="px-2 py-2 text-right">
                      {r.gm == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className="font-mono-num tabular-nums"
                          style={{
                            color:
                              gmTone(r.gm) === "success" ? "var(--success,#3C7D5C)"
                              : gmTone(r.gm) === "warning" ? "var(--warning,#B07B2C)"
                              : "var(--danger,#A6453C)",
                          }}
                        >
                          {(r.gm * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                  ) : null}
                  <td className="px-2 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpen(r.id)}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isPlatform ? (
        <p className="font-mono-num mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Lock className="size-3" /> Plan · status · GM% · take-rate · suspend — managed by Postics
        </p>
      ) : null}
    </DataPanel>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700">
      <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "rounded-md border px-2 py-1 text-[11px] transition",
        value ? "border-brand-700 bg-brand-100 text-ink-900" : "border-line bg-surface text-ink-700 hover:bg-surface-sunken",
      )}
    >
      {label}
    </button>
  );
}

/* ============================== low-credit ============================== */

function LowCreditQueue({ rows, onOpen }: { rows: AdminOrgRow[]; onOpen: (id: string) => void }) {
  const low = rows.filter((r) => r.balance / r.grant <= 0.1);
  return (
    <DataPanel title="Low-credit queue" actions={<TrafficLight tone="warning" label="live" />}>
      {low.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-center text-[12px] text-muted-foreground">
          No orgs near depletion.
        </div>
      ) : (
        <ul className="divide-y divide-line/60 rounded-md border border-line">
          {low.map((r) => {
            const ratio = r.balance / r.grant;
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <Dot tone="warning" />
                  <span className="text-ink-900">{r.name}</span>
                  <span className="font-mono-num text-[10px] text-muted-foreground">
                    {r.balance.toLocaleString()} / {r.grant.toLocaleString()} ({Math.round(ratio * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GrantButton org={r} />
                  <button onClick={() => onOpen(r.id)} className="font-mono-num text-[11px] text-brand-700 hover:underline">
                    Open ↗
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DataPanel>
  );
}

function GrantButton({ org }: { org: AdminOrgRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken"
      >
        Grant credits
      </button>
      <ConfirmReasonDialog
        open={open}
        title={`Grant credits — ${org.name}`}
        description="Idempotent ledger insert. Pool = action by default. Writes audit-log."
        confirmLabel="Post to ledger"
        destructive={false}
        onCancel={() => setOpen(false)}
        onConfirm={(reason) => {
          toast.success("Grant recorded · audit-logged", { description: `"${reason}"` });
          setOpen(false);
        }}
      />
    </>
  );
}

/* ============================== drawer ============================== */

function OrgDrawer({
  org, isPlatform, onClose, onViewAs,
}: {
  org: AdminOrgRow | null;
  isPlatform: boolean;
  onClose: () => void;
  onViewAs: (o: AdminOrgRow) => void;
}) {
  const [action, setAction] = useState<null | "suspend" | "plan" | "grant" | "rotate">(null);
  if (!org) return null;
  const funnel = FUNNEL_BY_ORG[org.id] ?? FUNNEL_BY_ORG.org_north;
  const seats = SEATS_BY_ORG[org.id] ?? [
    { email: org.ownerEmail, role: "Owner" as const, lastActive: "today" },
  ];
  const ratio = org.balance / org.grant;
  const low = ratio <= 0.1;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal>
      <button aria-label="Close" onClick={onClose} className="flex-1 bg-ink-900/30" />
      <aside className="flex h-full w-[540px] max-w-full flex-col border-l border-line bg-surface">
        <header className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg text-ink-900">{org.name}</h2>
            <div className="font-mono-num mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>{org.type}</span>
              <span className={cn("rounded px-1.5 py-0.5", planChip[org.plan])}>{org.plan}</span>
              <TrafficLight tone={statusTone(org.status)} label={statusLabel(org.status)} />
              <span>· created {org.createdAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewAs(org)}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-2.5 py-1.5 text-[11px] text-paper hover:bg-brand-500"
            >
              <Eye className="size-3.5" /> View as (read-only)
            </button>
            <button onClick={onClose} className="rounded-md border border-line bg-surface px-2 py-1.5 text-muted-foreground hover:text-ink-900">
              <X className="size-3.5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Activation funnel + TTV */}
          <Section title="Activation funnel · TTV">
            <div className="font-mono-num mb-3 flex items-center gap-3 text-[11px]">
              <span className="text-muted-foreground">Time-to-value:</span>
              <span className="tabular-nums text-ink-900">2d 4h</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--warning,#B07B2C)" }}>
                <Dot tone="warning" /> Stalled at: plan generated · 9d
              </span>
            </div>
            <ol className="space-y-1.5">
              {funnel.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-xs">
                  <span className="text-ink-700">{s.label}</span>
                  <span className="flex items-center gap-2">
                    {s.pending ? (
                      <span
                        title="export event not emitted — engineer must add unit_events.event_type='exported'"
                        className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        <Info className="size-3" /> pending
                      </span>
                    ) : null}
                    <span className="font-mono-num tabular-nums text-ink-900">{s.count}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Connected vs export · publish sub-funnel">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div style={{ width: `${(org.connected / Math.max(1, org.connected + org.exportOnly)) * 100}%`, backgroundColor: "var(--brand-700,#1E3A34)" }} />
              <div style={{ width: `${(org.exportOnly / Math.max(1, org.connected + org.exportOnly)) * 100}%`, backgroundColor: "var(--info,#3A6079)" }} />
            </div>
            <div className="font-mono-num mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Dot tone="success" /> connected {org.connected}</span>
              <span className="inline-flex items-center gap-1.5"><Dot tone="info" /> export-only {org.exportOnly}</span>
            </div>
          </Section>

          <Section title="Seats & roles">
            <table className="w-full text-left text-xs">
              <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr className="border-b border-line">
                  <th className="px-1 py-1.5">email</th>
                  <th className="px-1 py-1.5">role</th>
                  <th className="px-1 py-1.5 text-right">last-active</th>
                </tr>
              </thead>
              <tbody>
                {seats.map((s) => (
                  <tr key={s.email} className="border-b border-line/60">
                    <td className="px-1 py-1.5 font-mono-num text-ink-900">{s.email}</td>
                    <td className="px-1 py-1.5 text-muted-foreground">{s.role}</td>
                    <td className="px-1 py-1.5 text-right font-mono-num tabular-nums text-muted-foreground">{s.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Balance · low-credit">
            <div className="font-mono-num flex items-center justify-between text-xs">
              <span className="text-muted-foreground">credits</span>
              <span className="tabular-nums text-ink-900">
                {org.balance.toLocaleString()} / {org.grant.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full"
                style={{ width: `${ratio * 100}%`, backgroundColor: low ? "var(--warning,#B07B2C)" : "var(--brand-700,#1E3A34)" }}
              />
            </div>
            {low ? (
              <div className="font-mono-num mt-2 inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--warning,#B07B2C)" }}>
                <AlertTriangle className="size-3.5" /> ≤10% of grant
              </div>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              {isPlatform ? (
                <button onClick={() => setAction("grant")} className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken">
                  Grant / refund credits
                </button>
              ) : (
                <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <Lock className="size-3" /> Grant — managed by Postics
                </span>
              )}
            </div>
          </Section>

          {isPlatform ? (
            <Section title="Margin snapshot · platform-only">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "COGS · MTD", v: "$0.18" },
                  { k: "GM%", v: org.gm == null ? "—" : `${(org.gm * 100).toFixed(0)}%` },
                  { k: "cost / action", v: "$0.0009" },
                ].map((m) => (
                  <div key={m.k} className="rounded-md border border-line bg-surface-sunken/40 p-2">
                    <div className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{m.k}</div>
                    <div className="font-mono-num mt-0.5 tabular-nums text-ink-900">{m.v}</div>
                  </div>
                ))}
              </div>
              <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                values ~ $0 today · AI Gateway stub
              </p>
            </Section>
          ) : (
            <Section title="Margin snapshot">
              <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 p-3 text-center text-[11px] text-muted-foreground">
                <Lock className="mx-auto mb-1 size-3.5" /> Platform-only — managed by Postics
              </div>
            </Section>
          )}

          <Section title="Connectors · per project">
            <ul className="space-y-1.5">
              {Array.from({ length: org.projects }).map((_, i) => {
                const connected = i < org.connected;
                return (
                  <li key={i} className="flex items-center justify-between rounded-md border border-line bg-surface px-2 py-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Dot tone={connected ? "success" : "muted"} />
                      <span className="text-ink-900">project_{i + 1}</span>
                      {connected ? (
                        <span className="font-mono-num text-[10px] text-muted-foreground">plugin 1.2.0 · last-health 4m</span>
                      ) : (
                        <span className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          pending — connector m1+
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toast.success(`Re-probe · project_${i + 1}`)}
                        className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] hover:bg-surface-sunken"
                      >
                        <RefreshCw className="size-3" />
                      </button>
                      <button
                        onClick={() => setAction("rotate")}
                        className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] text-[color:var(--danger,#A6453C)] hover:bg-surface-sunken"
                      >
                        <KeyRound className="size-3" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          {isPlatform ? (
            <Section title="Danger zone · platform-only">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setAction("plan")} className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken">
                  Change plan / take-rate
                </button>
                <button onClick={() => setAction("suspend")} className="rounded-md border border-[color:var(--danger,#A6453C)]/40 bg-surface px-2 py-1 text-[11px] text-[color:var(--danger,#A6453C)] hover:bg-surface-sunken">
                  <PauseCircle className="mr-1 inline-block size-3" /> Suspend org
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Suspend gates outgoing expensive paths (generation / video / auto-publish), not just login.
              </p>
            </Section>
          ) : null}
        </div>

        <DrawerActionDialog
          kind={action}
          org={org}
          onClose={() => setAction(null)}
        />
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-line bg-surface p-3">
      <h3 className="font-mono-num mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DrawerActionDialog({
  kind, org, onClose,
}: {
  kind: null | "suspend" | "plan" | "grant" | "rotate";
  org: AdminOrgRow;
  onClose: () => void;
}) {
  const meta = useMemo(() => {
    switch (kind) {
      case "suspend":
        return { title: `Suspend ${org.name}`, desc: "Gates outgoing expensive paths (generation / video / auto-publish), not just login.", destructive: true, confirm: "Suspend org" };
      case "plan":
        return { title: `Change plan / take-rate — ${org.name}`, desc: "Overrides apply on next billing tick. Writes audit-log.", destructive: false, confirm: "Apply change" };
      case "grant":
        return { title: `Grant / refund credits — ${org.name}`, desc: "Pool = action (default) · idempotent ledger insert.", destructive: false, confirm: "Post to ledger" };
      case "rotate":
        return { title: `Rotate credential — ${org.name}`, desc: "Removes the WordPress Application Password and rotates the HMAC secret. Client must re-pair.", destructive: true, confirm: "Rotate credential" };
      default:
        return null;
    }
  }, [kind, org]);
  if (!meta) return null;
  return (
    <ConfirmReasonDialog
      open={!!kind}
      title={meta.title}
      description={meta.desc}
      destructive={meta.destructive}
      confirmLabel={meta.confirm}
      onCancel={onClose}
      onConfirm={(reason) => {
        toast.success(`${meta.confirm} · audit-logged`, { description: `"${reason}"` });
        onClose();
      }}
    />
  );
}