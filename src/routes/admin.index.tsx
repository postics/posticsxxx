import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  Lock,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAdmin } from "@/features/admin/AdminContext";
import { AdminPage } from "@/features/admin/AdminShell";
import {
  ConfirmReasonDialog,
  DataPanel,
  Dot,
  KPI,
  TrafficLight,
  type Tone,
} from "@/features/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: CockpitPage,
});

/* --------------------------- tiny inline charts --------------------------- */

function Donut({
  segments,
  size = 56,
  empty,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  empty?: boolean;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--line, #E7E2D9)"
        strokeWidth={empty ? 6 : 4}
        strokeDasharray={empty ? "2 3" : undefined}
      />
      {!empty &&
        segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={6}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
    </svg>
  );
}

function Gauge({
  value,
  target = [60, 70],
  muted,
}: {
  value: number | null;
  target?: [number, number];
  muted?: boolean;
}) {
  const size = 96;
  const r = 38;
  const cx = size / 2;
  const cy = size - 8;
  const arc = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = arc(180);
  const end = arc(0);
  const targetStart = arc(180 + (target[0] / 100) * 180);
  const targetEnd = arc(180 + (target[1] / 100) * 180);
  const needleDeg = value == null ? 0 : 180 + (value / 100) * 180;
  const needle = arc(needleDeg);
  return (
    <svg width={size} height={cy + 4} viewBox={`0 0 ${size} ${cy + 4}`}>
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        stroke="var(--line, #E7E2D9)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${targetStart.x} ${targetStart.y} A ${r} ${r} 0 0 1 ${targetEnd.x} ${targetEnd.y}`}
        stroke="var(--success, #3C7D5C)"
        strokeWidth={6}
        fill="none"
        opacity={muted ? 0.35 : 0.7}
      />
      {value != null && (
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke={muted ? "var(--muted-foreground, #6B6F78)" : "var(--brand-700, #1E3A34)"}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      <circle cx={cx} cy={cy} r={3} fill="var(--ink-900, #14181F)" />
    </svg>
  );
}

function Sparkline({ data, w = 120, h = 28 }: { data: number[]; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--brand-700, #1E3A34)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/* --------------------------------- data ---------------------------------- */

type AttentionRow = {
  id: string;
  tone: Tone;
  signal: string;
  org: string;
  value: string;
  age: string;
  to: string;
  scope: "platform" | "agency-own";
};

const PLATFORM_ATTENTION: AttentionRow[] = [
  { id: "a1", tone: "danger", signal: "Margin negative", org: "Brightwell Goods", value: "GM −8%", age: "12m", to: "/admin/cost", scope: "platform" },
  { id: "a2", tone: "danger", signal: "DLQ non-empty", org: "platform", value: "6 jobs dead-lettered", age: "27m", to: "/admin/pipeline", scope: "platform" },
  { id: "a3", tone: "warning", signal: "Connector auth/HMAC fail", org: "Northbound Coffee", value: "3 retries", age: "1h", to: "/admin/orgs", scope: "platform" },
  { id: "a4", tone: "warning", signal: "Low credits ≤10%", org: "Atlas Studio", value: "4% left", age: "2h", to: "/admin/orgs", scope: "platform" },
  { id: "a5", tone: "warning", signal: "Classifier low-confidence", org: "3 projects", value: "<0.6", age: "3h", to: "/admin/segments", scope: "platform" },
  { id: "a6", tone: "warning", signal: "Product-attr fabrication", org: "2 incidents", value: "QA flagged", age: "4h", to: "/admin/pipeline", scope: "platform" },
  { id: "a7", tone: "warning", signal: "Blended cost/credit > $0.02", org: "global", value: "$0.024", age: "today", to: "/admin/cost", scope: "platform" },
];

const AGENCY_ATTENTION: AttentionRow[] = [
  { id: "b1", tone: "warning", signal: "Low credits ≤10%", org: "Atlas Studio (your client)", value: "4% left", age: "2h", to: "/admin/orgs", scope: "agency-own" },
  { id: "b2", tone: "warning", signal: "Connector auth/HMAC fail", org: "Northbound Coffee (your client)", value: "3 retries", age: "1h", to: "/admin/orgs", scope: "agency-own" },
  { id: "b3", tone: "warning", signal: "Classifier low-confidence", org: "1 of your projects", value: "0.58", age: "3h", to: "/admin/segments", scope: "agency-own" },
];

/* --------------------------------- page ---------------------------------- */

function CockpitPage() {
  const { session } = useAdmin();
  const isPlatform = session?.role !== "agency";
  const navigate = useNavigate();

  return (
    <AdminPage
      title="Cockpit"
      breadcrumb={["Admin", "Overview", "Cockpit"]}
      actions={isPlatform ? <QuickActions /> : null}
    >
      <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono-num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {isPlatform ? "Platform · cross-tenant" : "Agency · your org only"}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {isPlatform
              ? "Founder god-view. Cross-tenant KPIs, the global attention queue, and the activation funnel."
              : "Scoped to your agency: your seats, your sub-clients, your usage and credits."}
          </p>
        </div>
      </header>

      {isPlatform ? <PlatformKPIs /> : <AgencyKPIs />}

      <AttentionQueue
        rows={isPlatform ? PLATFORM_ATTENTION : AGENCY_ATTENTION}
        onOpen={(to) => navigate({ to })}
        scope={isPlatform ? "platform" : "agency"}
      />

      <ActivationFunnel isPlatform={isPlatform} />
      </div>
    </AdminPage>
  );
}

/* -------------------------------- KPI rows ------------------------------- */

function PlatformKPIs() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {/* MRR — empty scaffold */}
      <div className="rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            MRR
          </span>
          <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Dot tone="muted" /> empty
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Donut segments={[]} empty />
          <div className="min-w-0">
            <div className="font-mono-num text-2xl text-ink-900">$0</div>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              No paying orgs yet — fills at launch.
            </p>
          </div>
        </div>
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          0 subscriptions
        </p>
      </div>

      {/* North-Star */}
      <div className="rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Net-new paying agencies
          </span>
          <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Dot tone="muted" /> empty
          </span>
        </div>
        <div className="mt-3 font-mono-num text-2xl text-ink-900">0 / ~10</div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full w-0 bg-[color:var(--brand-700,#1E3A34)]" />
        </div>
        <p className="mt-2 text-[11px] leading-tight text-muted-foreground">
          North-Star: ~10 paying agencies = moat trigger.
        </p>
      </div>

      {/* Blended margin — stub */}
      <div className="rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Blended margin
          </span>
          <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Dot tone="warning" /> stub data
          </span>
        </div>
        <div className="mt-2 flex items-end gap-3">
          <Gauge value={null} muted />
          <div className="min-w-0">
            <div className="font-mono-num text-2xl text-ink-900">—</div>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              Pending real AI key.
            </p>
          </div>
        </div>
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          cost/credit ~$0.000 · target $0.015
        </p>
      </div>

      {/* Burn / runway — live */}
      <div className="rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Runway / burn
          </span>
          <TrafficLight tone="success" label="live" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono-num text-2xl text-ink-900">14 mo</span>
          <span className="font-mono-num text-[11px] text-muted-foreground">runway</span>
        </div>
        <div className="mt-3">
          <Sparkline data={[8.8, 9.1, 9.0, 9.3, 9.6, 9.4, 9.2, 9.4, 9.5, 9.4]} />
        </div>
        <p className="font-mono-num mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          burn $9.4k/mo · last 10 wk
        </p>
      </div>
    </div>
  );
}

function AgencyKPIs() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KPI label="Active seats" value="8" delta="2 invites pending" tone="info" />
      <KPI label="Sub-client projects" value="14" delta="3 in onboarding" tone="muted" />
      <KPI label="Credits balance" value="62,400" delta="resets in 11 days" tone="success" />
      <KPI label="Usage · this month" value="37,600" delta="60% of cap" tone="warning" />
    </div>
  );
}

/* ----------------------------- attention queue ---------------------------- */

function AttentionQueue({
  rows,
  onOpen,
  scope,
}: {
  rows: AttentionRow[];
  onOpen: (to: string) => void;
  scope: "platform" | "agency";
}) {
  const grouped = useMemo(() => {
    const danger = rows.filter((r) => r.tone === "danger");
    const warning = rows.filter((r) => r.tone === "warning");
    return { danger, warning };
  }, [rows]);
  const total = rows.length;

  return (
    <DataPanel
      title="Global attention queue"
      hint={scope === "platform" ? "Cross-tenant signals that need a founder NOW." : "Scoped to your agency only."}
      actions={
        <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
          <ShieldAlert className="size-3" strokeWidth={1.75} /> {total} items
        </span>
      }
    >
      {total === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-xs text-muted-foreground">
          <Dot tone="success" />
          All clear — nothing needs attention.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-sunken/50">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Sev</th>
                <th className="px-3 py-2 font-medium">Signal</th>
                <th className="px-3 py-2 font-medium">Org</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Age</th>
                <th className="px-3 py-2 font-medium text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {grouped.danger.length > 0 && (
                <tr className="bg-surface-sunken/30">
                  <td colSpan={6} className="font-mono-num px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--danger,#A6453C)]">
                    Danger · {grouped.danger.length}
                  </td>
                </tr>
              )}
              {grouped.danger.map((r) => (
                <AttentionRowEl key={r.id} row={r} onOpen={onOpen} />
              ))}
              {grouped.warning.length > 0 && (
                <tr className="bg-surface-sunken/30">
                  <td colSpan={6} className="font-mono-num px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--warning,#B07B2C)]">
                    Warning · {grouped.warning.length}
                  </td>
                </tr>
              )}
              {grouped.warning.map((r) => (
                <AttentionRowEl key={r.id} row={r} onOpen={onOpen} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataPanel>
  );
}

function AttentionRowEl({ row, onOpen }: { row: AttentionRow; onOpen: (to: string) => void }) {
  return (
    <tr className="border-t border-line hover:bg-surface-sunken/40">
      <td className="px-3 py-2"><Dot tone={row.tone} /></td>
      <td className="px-3 py-2 text-ink-900">{row.signal}</td>
      <td className="px-3 py-2 font-mono-num text-ink-700">{row.org}</td>
      <td className="px-3 py-2 font-mono-num text-muted-foreground">{row.value}</td>
      <td className="px-3 py-2 font-mono-num text-muted-foreground">{row.age}</td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => onOpen(row.to)}
          className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-700 hover:bg-surface-sunken active:scale-[0.98]"
        >
          open <ArrowUpRight className="size-3" strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  );
}

/* ---------------------------- activation funnel --------------------------- */

function ActivationFunnel({ isPlatform }: { isPlatform: boolean }) {
  // honest sample numbers
  const main = [
    { label: "Signup", value: 412 },
    { label: "Verified email", value: 348 },
    { label: "First generate", value: 196 },
    { label: "First export rate", value: null as number | null, pending: true },
  ];
  const sub = [
    { label: "Connected", value: 142 },
    { label: "First publish", value: 88 },
  ];
  const trend = [9, 12, 11, 14, 13, 16, 15, 18, 17, 19, 22, 21, 24, 23];
  const maxMain = 412;
  const maxSub = 142;

  return (
    <DataPanel
      title={isPlatform ? "Activation funnel · 14 days" : "Your sub-clients · 14-day activation"}
      hint={isPlatform ? "Signup → first generate. Connected cohort below." : "Across your sub-clients only."}
      actions={
        <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <Dot tone="warning" /> throughput · pending instrumentation
        </span>
      }
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <p className="font-mono-num mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Signup → first generate
            </p>
            <div className="space-y-1.5">
              {main.map((s) => (
                <FunnelBar key={s.label} label={s.label} value={s.value} max={maxMain} pending={s.pending} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-num mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Connected cohort: connected → first publish
            </p>
            <div className="space-y-1.5">
              {sub.map((s) => (
                <FunnelBar key={s.label} label={s.label} value={s.value} max={maxSub} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-3">
          <div className="rounded-md border border-line bg-surface-sunken/40 p-3">
            <p className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              14-day trend · daily signups
            </p>
            <div className="mt-2"><Sparkline data={trend} w={180} h={40} /></div>
            <p className="font-mono-num mt-1 text-[11px] text-muted-foreground">
              {trend[trend.length - 1]} / day · ↑ 17%
            </p>
          </div>
        </div>
      </div>
    </DataPanel>
  );
}

function FunnelBar({
  label,
  value,
  max,
  pending,
}: {
  label: string;
  value: number | null;
  max: number;
  pending?: boolean;
}) {
  const pct = value == null ? 0 : Math.max(4, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 text-[11px] text-ink-700">{label}</div>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-surface-sunken/60">
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="font-mono-num inline-flex items-center gap-1.5">
              <Dot tone="warning" /> pending instrumentation
            </span>
          </div>
        ) : (
          <div
            className="h-full rounded-md bg-[color:var(--brand-700,#1E3A34)]/85"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <div className="w-16 text-right font-mono-num text-[11px] text-ink-900">
        {pending ? "—" : value!.toLocaleString()}
      </div>
    </div>
  );
}

/* ----------------------------- quick actions ----------------------------- */

type QAKind = "kill_video" | "disable_signups" | "flip_stub";

function QuickActions() {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<QAKind | null>(null);
  const { setStubMode, stubMode } = useAdmin();

  const meta: Record<QAKind, { title: string; description: string }> = {
    kill_video: {
      title: "Kill-switch: disable video globally",
      description: "All video generation jobs across every tenant will be paused immediately. Publishing of existing assets continues.",
    },
    disable_signups: {
      title: "Disable new signups",
      description: "The public /signup route will return a maintenance state for all visitors.",
    },
    flip_stub: {
      title: stubMode ? "Flip AI Gateway: STUB → REAL" : "Flip AI Gateway: REAL → STUB",
      description: stubMode
        ? "Real Anthropic key will become the default route for every tenant. COGS becomes real and the margin gauge starts reading live."
        : "Switches the gateway back to placeholder mode. Generations will cost ~$0 and return sample content.",
    },
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 py-2 text-xs text-ink-700 hover:bg-surface-sunken active:scale-[0.98]"
        >
          <Zap className="size-3.5" strokeWidth={1.75} />
          Quick actions
          <ChevronDown className="size-3.5" strokeWidth={1.75} />
        </button>
        {open && (
          <div
            onMouseLeave={() => setOpen(false)}
            className="absolute right-0 z-30 mt-1.5 w-72 overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]"
          >
            <QAItem
              icon={<AlertTriangle className="size-3.5" strokeWidth={1.75} />}
              label="Kill-switch: disable video globally"
              tone="danger"
              onClick={() => { setDialog("kill_video"); setOpen(false); }}
            />
            <QAItem
              icon={<Lock className="size-3.5" strokeWidth={1.75} />}
              label="Disable new signups"
              tone="warning"
              onClick={() => { setDialog("disable_signups"); setOpen(false); }}
            />
            <QAItem
              icon={<Sparkles className="size-3.5" strokeWidth={1.75} />}
              label={stubMode ? "Flip AI Gateway: stub → real" : "Flip AI Gateway: real → stub"}
              tone="info"
              onClick={() => { setDialog("flip_stub"); setOpen(false); }}
            />
            <div className="border-t border-line bg-surface-sunken/40 px-3 py-2 text-[10px] text-muted-foreground">
              All actions require a reason and are written to the audit log.
              <div className="mt-1">
                <Link to="/admin/build" className="underline decoration-dotted underline-offset-2">Build-Status →</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmReasonDialog
        open={dialog !== null}
        title={dialog ? meta[dialog].title : ""}
        description={dialog ? meta[dialog].description : undefined}
        confirmLabel="Apply"
        destructive={dialog !== "flip_stub"}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog === "flip_stub") setStubMode(!stubMode);
          setDialog(null);
        }}
      />
    </>
  );
}

function QAItem({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: Tone;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink-700 hover:bg-surface-sunken active:scale-[0.99]",
      )}
    >
      <Dot tone={tone} />
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}