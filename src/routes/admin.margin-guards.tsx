// Platform-admin only. Cross-tenant video margin guards — agency-admin sees the locked card.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Info,
  Lock,
  MoreHorizontal,
  PauseCircle,
  ShieldAlert,
  SquareSlash,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/features/admin/AdminShell";
import { useAdmin } from "@/features/admin/AdminContext";
import {
  ConfirmReasonDialog,
  DataPanel,
  Dot,
  KPI,
  TrafficLight,
} from "@/features/admin/ui";

export const Route = createFileRoute("/admin/margin-guards")({
  component: MarginGuardsPage,
});

/* ------------------------------- sample data ------------------------------ */

type PlanTier = "Advanced" | "Premium" | "Agency";
const FLAGSHIP_CAP: Record<PlanTier, number> = {
  Advanced: 30,
  Premium: 45,
  Agency: 90,
};

type PoolRow = {
  id: string;
  org: string;
  type: "ecom" | "agency" | "services";
  plan: PlanTier;
  cogsUSD: number;
  flagshipUsed: number;
  state: "ok" | "alert75" | "alert90" | "alert95" | "reject";
  note?: string;
};

const PREVIEW_POOL: PoolRow[] = [
  { id: "p1", org: "Aurora Skincare", type: "ecom", plan: "Advanced", cogsUSD: 9.0, flagshipUsed: 12, state: "ok" },
  { id: "p2", org: "Maison B5", type: "agency", plan: "Agency", cogsUSD: 53.25, flagshipUsed: 71, state: "alert75", note: "near cap" },
  { id: "p3", org: "Loomwell Linens", type: "ecom", plan: "Premium", cogsUSD: 31.5, flagshipUsed: 43, state: "alert95", note: "1 job from REJECT" },
];

type BreachRow = {
  id: string;
  org: string;
  kind: "flagship-cap" | "budget-95" | "runaway-p95";
  ts: string;
  overageUSD: number;
  detail: string;
};
const PREVIEW_BREACH: BreachRow[] = [
  { id: "b1", org: "Maison B5 / sub: Pinegrove", kind: "runaway-p95", ts: "—", overageUSD: 0, detail: "single-job > 5× org avg (preview)" },
];

type HybridRow = {
  id: string;
  org: string;
  takeRate: number; // 0..1
};
const HYBRID: HybridRow[] = [
  { id: "h1", org: "Maple & Co Agency", takeRate: 0.18 },
  { id: "h2", org: "Atlas Studio", takeRate: 0.18 },
  { id: "h3", org: "Maison B5", takeRate: 0.22 },
];

type OverageRow = {
  plan: PlanTier | "Starter" | "Growth";
  overageBundle: string;
  overageUSD: number;
  upgradeTo: string;
  upgradeDeltaUSD: number;
  verdict: "ok" | "leak";
};
const OVERAGE: OverageRow[] = [
  { plan: "Starter", overageBundle: "+1k credits", overageUSD: 39, upgradeTo: "Growth", upgradeDeltaUSD: 250, verdict: "ok" },
  { plan: "Growth", overageBundle: "+2k credits", overageUSD: 69, upgradeTo: "Premium", upgradeDeltaUSD: 550, verdict: "ok" },
  { plan: "Premium", overageBundle: "+5k credits", overageUSD: 149, upgradeTo: "Agency", upgradeDeltaUSD: 0, verdict: "leak" },
];

// Refund spike line — last 14 days. Honest, low-volume sample (stub costs ~$0).
const REFUND_DAYS = Array.from({ length: 14 }, (_, i) => {
  const refunds = i === 11 ? 4 : i === 12 ? 6 : i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
  return { d: i + 1, refunds };
});

/* ------------------------------- helpers --------------------------------- */

function fmtUSD(n: number) {
  return `$${n.toFixed(2)}`;
}
function pct(n: number, d: number) {
  if (d === 0) return 0;
  return Math.min(100, Math.round((n / d) * 100));
}
function capTone(p: number): "success" | "warning" | "danger" {
  if (p >= 95) return "danger";
  if (p >= 75) return "warning";
  return "success";
}

/* --------------------------------- page ---------------------------------- */

function MarginGuardsPage() {
  const { session, impersonation } = useAdmin();
  const isPlatform = session?.role === "platform";

  return (
    <AdminShell title="Video & Margin Guards">
      {!isPlatform ? <LockedCard /> : <PlatformView />}
      {impersonation ? (
        <p className="font-mono-num mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Mutations during impersonation are blocked (read-only).
        </p>
      ) : null}
    </AdminShell>
  );
}

function LockedCard() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-[14px] border border-line bg-surface p-6 text-center">
      <Lock className="mx-auto size-5 text-muted-foreground" strokeWidth={1.6} />
      <h2 className="mt-3 font-display text-base text-ink-900">Platform-admin only</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Video margin guards are cross-tenant and hidden from agency accounts.
      </p>
    </div>
  );
}

function PlatformView() {
  return (
    <div className="space-y-4">
      <BannerStack />
      <TitleRow />
      <KpiRow />
      <VideoPoolCard />
      <BudgetCapsCard />
      <BreachWatchCard />
      <HybridGmCard />
      <OverageVsUpgradeCard />
      <RefundSpikeCard />
    </div>
  );
}

/* --------------------------------- chrome -------------------------------- */

function BannerStack() {
  return (
    <div className="space-y-2">
      <div className="font-mono-num flex items-center gap-2 rounded-md border border-line bg-surface-sunken px-3 py-1.5 text-[11px] text-muted-foreground">
        <Dot tone="info" />
        <span className="uppercase tracking-[0.14em]">AI Gateway: STUB</span>
        <span className="opacity-70">— costs ~$0, content placeholder.</span>
      </div>
      <div className="font-mono-num flex items-center gap-2 rounded-md border border-dashed border-line bg-surface px-3 py-1.5 text-[11px] text-muted-foreground">
        <Info className="size-3.5" strokeWidth={1.7} />
        Video pipeline = M2 — most guards shown as empty scaffolds until video ships.
      </div>
    </div>
  );
}

function TitleRow() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Video &amp; Margin Guards</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Police the three margin killers: flagship video · option-B hybrid GM · overage-vs-upgrade.
        </p>
        <p className="font-mono-num mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Platform-admin · cross-tenant · founder-only USD
        </p>
      </div>
      <GuardsMenu />
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KPI label="Video pool COGS · MTD" value="$0.00" delta="no video spend yet · M2" tone="muted" />
      <KPI label="Orgs over flagship cap" value="0 / 0" delta="watchlist empty" tone="success" />
      <KPI label="Refund / refusal spike · 24h" value="2 rev." delta="↑ low volume — honest at stub" tone="info" />
      <div className="rounded-[14px] border border-line bg-surface p-4">
        <div className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Option-B hybrid GM
        </div>
        <div className="mt-2">
          <span
            className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
            title="Pending backend: persist a take_rate roll-up + edits/unit before this computes"
          >
            <Info className="size-3" strokeWidth={1.7} />
            Pending instrumentation
          </span>
        </div>
        <div className="font-mono-num mt-2 text-[11px] text-muted-foreground">
          take_rate × edits/unit not persisted yet
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- CARD 1 -------------------------------- */

function VideoPoolCard() {
  return (
    <DataPanel
      title="Video pool · USD per org, with flagship-second caps"
      hint="Hardest cap sits on the video pool per vendor (Kling / Hailuo / Veo)."
      actions={<TrafficLight tone="muted" label="empty · m2" />}
    >
      <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-4 text-center text-[11px] text-muted-foreground">
        No video generated yet — caps shown for reference: Advanced 30s · Premium 45s · Agency 90s.
        Rows populate when the video pipeline ships (M2).
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr className="border-b border-line">
              <th className="px-2 py-2">Org</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Plan</th>
              <th className="px-2 py-2 text-right">Video COGS · MTD</th>
              <th className="px-2 py-2 text-right">Flagship s</th>
              <th className="px-2 py-2 text-right">Cap</th>
              <th className="px-2 py-2 w-[180px]">Usage</th>
              <th className="px-2 py-2">State</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {PREVIEW_POOL.map((r) => {
              const cap = FLAGSHIP_CAP[r.plan];
              const p = pct(r.flagshipUsed, cap);
              const tone = capTone(p);
              return (
                <tr key={r.id} className="border-b border-line/60 opacity-50">
                  <td className="px-2 py-2 text-ink-900">
                    {r.org}{" "}
                    <span className="font-mono-num ml-1 rounded bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      preview
                    </span>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{r.type}</td>
                  <td className="px-2 py-2 text-muted-foreground">{r.plan}</td>
                  <td className="font-mono-num px-2 py-2 text-right tabular-nums">{fmtUSD(r.cogsUSD)}</td>
                  <td className="font-mono-num px-2 py-2 text-right tabular-nums">{r.flagshipUsed}s</td>
                  <td className="font-mono-num px-2 py-2 text-right tabular-nums">{cap}s</td>
                  <td className="px-2 py-2">
                    <CapBar pct={p} tone={tone} />
                  </td>
                  <td className="px-2 py-2">
                    <TrafficLight
                      tone={tone}
                      label={tone === "danger" ? "≥95%" : tone === "warning" ? "≥75%" : "ok"}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <RowMenu org={r.org} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DataPanel>
  );
}

function CapBar({ pct: p, tone }: { pct: number; tone: "success" | "warning" | "danger" }) {
  const color =
    tone === "danger"
      ? "var(--danger, #A6453C)"
      : tone === "warning"
        ? "var(--warning, #B07B2C)"
        : "var(--brand-700, #1E3A34)";
  return (
    <div className="relative h-2 w-full rounded-full bg-surface-sunken">
      <div
        className="h-full rounded-full"
        style={{ width: `${p}%`, backgroundColor: color }}
      />
      <div
        aria-hidden
        className="absolute inset-y-[-2px] right-0 w-px"
        style={{ backgroundColor: "var(--ink-900, #14181F)", opacity: 0.4 }}
      />
    </div>
  );
}

/* --------------------------------- CARD 2 -------------------------------- */

function BudgetCapsCard() {
  return (
    <DataPanel
      title="Per-tenant budget caps (75 / 90 / 95 / 100%)"
      actions={<TrafficLight tone="muted" label="empty · m2" />}
    >
      <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-4 text-center text-[11px] text-muted-foreground">
        No tenant budget caps tripped — video spend is $0 (M2).
      </div>
      <div className="mt-3 space-y-3 opacity-50">
        <SegmentedGauge org="Maison B5" used={71} cap={90} />
      </div>
      <Legend />
    </DataPanel>
  );
}

function SegmentedGauge({ org, used, cap }: { org: string; used: number; cap: number }) {
  const p = pct(used, cap);
  const tone = capTone(p);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-ink-900">
          {org}{" "}
          <span className="font-mono-num ml-1 rounded bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            preview
          </span>
        </span>
        <span className="font-mono-num text-[11px] tabular-nums text-muted-foreground">
          {used}s / {cap}s · {p}%
        </span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-surface-sunken">
        <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: tone === "danger" ? "var(--danger,#A6453C)" : tone === "warning" ? "var(--warning,#B07B2C)" : "var(--brand-700,#1E3A34)" }} />
        {[75, 90, 95, 100].map((m) => (
          <div
            key={m}
            className="absolute inset-y-[-3px] w-px bg-line"
            style={{ left: `${m}%` }}
            aria-label={`${m}%`}
          />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="font-mono-num mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><Dot tone="warning" /> ≥75% alert</span>
      <span className="inline-flex items-center gap-1.5"><Dot tone="warning" /> ≥90% alert</span>
      <span className="inline-flex items-center gap-1.5"><Dot tone="danger" /> ≥95% alert</span>
      <span className="inline-flex items-center gap-1.5"><Dot tone="danger" /> 100% REJECT (hard cap → credit system)</span>
    </div>
  );
}

/* --------------------------------- CARD 3 -------------------------------- */

function BreachWatchCard() {
  return (
    <DataPanel
      title="Flagship-cap breach watchlist"
      actions={<TrafficLight tone="success" label="clear" />}
    >
      <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-center text-[12px] text-[color:var(--success,#3C7D5C)]">
        ✓ Watchlist clear — nothing over cap
      </div>
      <ul className="mt-3 divide-y divide-line/60 rounded-md border border-line opacity-50">
        {PREVIEW_BREACH.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-[color:var(--warning,#B07B2C)]" strokeWidth={1.7} />
              <span className="text-ink-900">{b.org}</span>
              <span className="font-mono-num rounded bg-surface-sunken px-1 py-[1px] text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                preview
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {b.kind}
              </span>
              <span className="font-mono-num text-[11px] tabular-nums text-muted-foreground">
                {fmtUSD(b.overageUSD)}
              </span>
              <button className="font-mono-num text-[11px] text-brand-700 hover:underline">
                Open org ↗
              </button>
            </div>
          </li>
        ))}
      </ul>
    </DataPanel>
  );
}

/* --------------------------------- CARD 4 -------------------------------- */

function HybridGmCard() {
  return (
    <DataPanel
      title="Option-B hybrid gross-margin (reseller take-rate)"
      hint="take_rate is LIVE-capable; edits/unit + implied GM pending instrumentation."
      actions={<TrafficLight tone="warning" label="partial" />}
    >
      <table className="w-full text-left text-xs">
        <thead className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <tr className="border-b border-line">
            <th className="px-2 py-2">Agency org</th>
            <th className="px-2 py-2 text-right">take_rate</th>
            <th className="px-2 py-2 text-right">edits / unit</th>
            <th className="px-2 py-2 text-right">implied hybrid GM%</th>
          </tr>
        </thead>
        <tbody>
          {HYBRID.map((h) => (
            <tr key={h.id} className="border-b border-line/60">
              <td className="px-2 py-2 text-ink-900">{h.org}</td>
              <td className="font-mono-num px-2 py-2 text-right tabular-nums text-ink-900">
                {(h.takeRate * 100).toFixed(0)}%
              </td>
              <td className="px-2 py-2 text-right">
                <PendingChip note="edits/unit not persisted yet — backend to log per-unit revision count" />
              </td>
              <td className="px-2 py-2 text-right">
                <PendingChip note="computes once take_rate roll-up + edits/unit land" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataPanel>
  );
}

function PendingChip({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="font-mono-num inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
    >
      <Info className="size-3" strokeWidth={1.7} />
      pending
    </span>
  );
}

/* --------------------------------- CARD 5 -------------------------------- */

function OverageVsUpgradeCard() {
  return (
    <DataPanel
      title="Overage vs upgrade — is overage still pricier than upgrading?"
      hint="Activates with overage billing (M1)."
      actions={<TrafficLight tone="warning" label="m1+" />}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 opacity-90">
        {OVERAGE.map((o) => {
          const leak = o.verdict === "leak";
          return (
            <div key={o.plan} className="rounded-[12px] border border-line bg-surface-sunken/40 p-3">
              <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {o.plan}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Buy overage</div>
                  <div className="font-mono-num mt-0.5 text-sm tabular-nums text-ink-900">
                    {fmtUSD(o.overageUSD)}
                  </div>
                  <div className="font-mono-num text-[10px] text-muted-foreground">{o.overageBundle}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Upgrade Δ</div>
                  <div className="font-mono-num mt-0.5 text-sm tabular-nums text-ink-900">
                    {o.upgradeDeltaUSD === 0 ? "—" : fmtUSD(o.upgradeDeltaUSD)}
                  </div>
                  <div className="font-mono-num text-[10px] text-muted-foreground">→ {o.upgradeTo}</div>
                </div>
              </div>
              <div className="mt-2">
                <TrafficLight
                  tone={leak ? "danger" : "success"}
                  label={leak ? "✗ overage cheaper — leak" : "✓ overage pricier"}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="font-mono-num mt-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        forward-looking scaffold · sample tiers · numbers go real with Stripe M1
      </p>
    </DataPanel>
  );
}

/* --------------------------------- CARD 6 -------------------------------- */

function RefundSpikeCard() {
  const max = Math.max(...REFUND_DAYS.map((d) => d.refunds), 1);
  const w = 100 / REFUND_DAYS.length;
  const points = REFUND_DAYS.map((d, i) => {
    const x = i * w + w / 2;
    const y = 100 - (d.refunds / max) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <DataPanel
      title="Refund / refusal spike monitor"
      hint="A refund/refusal spike = silent margin leak; each failed video still costs USD."
      actions={<TrafficLight tone="warning" label="partial" />}
    >
      <div className="rounded-[12px] border border-line bg-surface-sunken/40 p-3">
        <svg viewBox="0 0 100 100" className="h-40 w-full" preserveAspectRatio="none" aria-hidden>
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--line, #E7E2D9)" strokeWidth="0.2" />
          ))}
          {/* refund area */}
          <polyline
            fill="none"
            stroke="var(--brand-700, #1E3A34)"
            strokeWidth="0.8"
            points={points}
          />
          {/* refusal/retry placeholder dashed line */}
          <line
            x1="0"
            y1="70"
            x2="100"
            y2="65"
            stroke="var(--muted-foreground, #6B6F78)"
            strokeDasharray="1.5 1.5"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </svg>
        <div className="font-mono-num mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-4 bg-brand-700" />
            ledger reversals (LIVE)
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            title="backend to add Gateway refusal/retry counters (ai_calls)"
          >
            <span className="inline-block h-[2px] w-4 border-t border-dashed border-muted-foreground" />
            refusal / retry — pending
          </span>
        </div>
      </div>
    </DataPanel>
  );
}

/* --------------------------------- actions ------------------------------- */

type ActionKind =
  | "cap"
  | "force-mode"
  | "suspend"
  | "grant-video"
  | "kill-video";

function RowMenu({ org }: { org: string }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ActionKind | null>(null);
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
          className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-line bg-surface p-1 text-xs shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <MenuItem icon={<SquareSlash className="size-3.5" />} onClick={() => { setAction("cap"); setOpen(false); }}>
            Lower / force video cap
          </MenuItem>
          <MenuItem icon={<MoreHorizontal className="size-3.5" />} onClick={() => { setAction("force-mode"); setOpen(false); }}>
            Force budget-provider mode
          </MenuItem>
          <MenuItem icon={<PauseCircle className="size-3.5" />} danger onClick={() => { setAction("suspend"); setOpen(false); }}>
            Suspend runaway consumer
          </MenuItem>
          <MenuItem icon={<Info className="size-3.5" />} onClick={() => { setAction("grant-video"); setOpen(false); }}>
            Grant / refund video credits
          </MenuItem>
        </div>
      ) : null}

      <ActionDialog
        kind={action}
        org={org}
        onClose={() => setAction(null)}
      />
    </div>
  );
}

function MenuItem({
  children,
  icon,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
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

function GuardsMenu() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ActionKind | null>(null);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-900 hover:bg-surface-sunken"
      >
        <ShieldAlert className="size-3.5" /> Guards <ChevronDown className="size-3" />
      </button>
      {open ? (
        <div
          className="absolute right-0 z-30 mt-1 w-64 rounded-md border border-line bg-surface p-1 text-xs shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <MenuItem icon={<PauseCircle className="size-3.5" />} danger onClick={() => { setAction("kill-video"); setOpen(false); }}>
            Disable video globally (kill-switch)
          </MenuItem>
        </div>
      ) : null}
      <ActionDialog kind={action} org="ALL TENANTS" onClose={() => setAction(null)} />
    </div>
  );
}

function ActionDialog({
  kind,
  org,
  onClose,
}: {
  kind: ActionKind | null;
  org: string;
  onClose: () => void;
}) {
  const open = !!kind;
  const meta = useMemo(() => {
    switch (kind) {
      case "cap":
        return { title: `Lower / force video cap — ${org}`, desc: "Set a new flagship-second or USD budget cap. Hooks the credit system on breach.", destructive: false, confirm: "Apply cap" };
      case "force-mode":
        return { title: `Force budget-provider mode — ${org}`, desc: "Queue, throttle, or notify-only. Graceful degradation while you investigate.", destructive: false, confirm: "Set mode" };
      case "suspend":
        return { title: `Suspend runaway consumer — ${org}`, desc: "Gates OUTBOUND expensive paths (video / generation / auto-publish) — not just login.", destructive: true, confirm: "Suspend org" };
      case "grant-video":
        return { title: `Grant / refund VIDEO credits — ${org}`, desc: "Pool = VIDEO explicitly. Idempotent ledger insert.", destructive: false, confirm: "Post to ledger" };
      case "kill-video":
        return { title: "Disable video globally", desc: "Direct margin insurance + graceful degradation if the video vendor is down. All tenants.", destructive: true, confirm: "Disable video" };
      default:
        return { title: "", desc: "", destructive: false, confirm: "Confirm" };
    }
  }, [kind, org]);

  return (
    <ConfirmReasonDialog
      open={open}
      title={meta.title}
      description={meta.desc}
      destructive={meta.destructive}
      confirmLabel={meta.confirm}
      onCancel={onClose}
      onConfirm={(reason) => {
        toast.success("Recorded · audit-logged", { description: `${meta.title} · "${reason}"` });
        onClose();
      }}
    />
  );
}