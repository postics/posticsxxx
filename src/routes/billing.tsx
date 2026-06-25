import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  X,
  ArrowUpRight,
  CreditCard,
  Download,
  Eye,
  Check,
  Info,
  Lock,
  Zap,
  Film,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, StatusChip } from "@/features/shared/primitives";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & plan — Postics" },
      {
        name: "description",
        content: "Plan, credits, usage and invoices for Northbound Coffee Roasters.",
      },
    ],
  }),
  component: BillingPage,
});

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const money = (n: number) => `$${fmt(n)}`;

type Cycle = "monthly" | "annual";

function BillingPage() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [banner, setBanner] = useState(true);
  const [confirmTier, setConfirmTier] = useState<Tier | null>(null);

  return (
    <WorkspaceShell breadcrumb={["Billing & plan"]}>
      <div className="mx-auto w-full max-w-[1180px] space-y-5 px-8 py-8 animate-rise">
        <Header cycle={cycle} setCycle={setCycle} />
        {banner ? <LowCreditsBanner onDismiss={() => setBanner(false)} /> : null}
        <CurrentPlan cycle={cycle} />
        <CreditBalance />
        <UsageThisPeriod />
        <PlanComparison cycle={cycle} onPick={(t) => setConfirmTier(t)} />
        <Invoices />
      </div>
      {confirmTier ? (
        <ConfirmDialog
          tier={confirmTier}
          cycle={cycle}
          onClose={() => setConfirmTier(null)}
        />
      ) : null}
    </WorkspaceShell>
  );
}

/* ---------------- header ---------------- */

function Header({ cycle, setCycle }: { cycle: Cycle; setCycle: (c: Cycle) => void }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Northbound Coffee Roasters
        </div>
        <h1 className="text-3xl font-medium text-ink-900">Billing & plan</h1>
        <p className="text-sm text-muted-foreground">
          Plan, credits, usage and invoices for this workspace.
        </p>
      </div>
      <CycleToggle value={cycle} onChange={setCycle} />
    </header>
  );
}

function CycleToggle({ value, onChange }: { value: Cycle; onChange: (c: Cycle) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface-sunken p-0.5">
      <button
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-[6px] px-3 py-1.5 text-xs font-medium transition",
          value === "monthly"
            ? "bg-surface text-ink-900 shadow-[0_1px_0_rgba(20,24,31,0.04)]"
            : "text-muted-foreground hover:text-ink-700",
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange("annual")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition",
          value === "annual"
            ? "bg-surface text-ink-900 shadow-[0_1px_0_rgba(20,24,31,0.04)]"
            : "text-muted-foreground hover:text-ink-700",
        )}
      >
        Annual
        <span className="rounded-sm bg-[color:var(--accent-gold-soft)] px-1 font-mono-num text-[10px] text-[color:var(--accent-gold)]">
          −20%
        </span>
      </button>
    </div>
  );
}

/* ---------------- low credits banner ---------------- */

function LowCreditsBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-6 place-items-center rounded-md bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
          <Info className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="text-sm">
          <div className="font-medium text-ink-900">You're low on action credits</div>
          <div className="text-muted-foreground">
            <span className="font-mono-num">120 of 2,000</span> left this period. Top up or
            upgrade to keep generating.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Lock className="size-3" strokeWidth={1.75} />
          Top up — coming (M1)
        </button>
        <button
          onClick={() => toast.info("Open Plan comparison to upgrade.")}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
        >
          Upgrade plan <ArrowUpRight className="size-3" strokeWidth={2} />
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- current plan ---------------- */

function CurrentPlan({ cycle }: { cycle: Cycle }) {
  const monthly = 449;
  const annualEquiv = Math.round(monthly * 0.8);
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-medium text-ink-900">Growth</h2>
            <StatusChip tone="live">Current plan</StatusChip>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono-num text-3xl text-ink-900">
              {cycle === "annual" ? `${money(annualEquiv)}/mo` : `${money(monthly)}/mo`}
            </span>
            {cycle === "annual" ? (
              <span className="font-mono-num text-xs text-muted-foreground">
                billed annually · {money(annualEquiv * 12)}/yr
              </span>
            ) : (
              <span className="font-mono-num text-xs text-muted-foreground">
                billed monthly
              </span>
            )}
          </div>
          <div className="font-mono-num text-xs text-muted-foreground">
            Renews Jul 24, 2026
          </div>
          <button
            onClick={() => toast.info("Payment method drawer — stub")}
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand-700 hover:underline"
          >
            <CreditCard className="size-3.5" strokeWidth={1.75} /> Manage payment method
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Open Change plan below.")}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30"
          >
            Change plan
          </button>
          <button
            onClick={() => toast.info("Open Upgrade — Premium recommended")}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
          >
            Upgrade <ArrowUpRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- credit balance ---------------- */

function CreditBalance() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-900">Credit balance</div>
          <div className="text-xs text-muted-foreground">
            Two pools, tracked separately. Resets each period.
          </div>
        </div>
        <span className="font-mono-num text-[11px] text-muted-foreground">
          period · Jun 1 – Jun 30, 2026
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CreditTile
          icon={Zap}
          label="Action credits"
          used={1880}
          total={2000}
          resetsIn={12}
        />
        <CreditTile
          icon={Film}
          label="Video credits"
          used={14}
          total={20}
          resetsIn={12}
          tone="gold"
        />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Grants refill each period; unused credits partially roll over (action ≤
        20%, video ≤ 10%).
      </p>
    </Card>
  );
}

function CreditTile({
  icon: Icon,
  label,
  used,
  total,
  resetsIn,
  tone = "brand",
}: {
  icon: typeof Zap;
  label: string;
  used: number;
  total: number;
  resetsIn: number;
  tone?: "brand" | "gold";
}) {
  const remaining = total - used;
  const pct = Math.min(100, Math.round((used / total) * 100));
  const barColor =
    tone === "gold" ? "bg-[color:var(--accent-gold)]" : "bg-brand-700";
  return (
    <div className="rounded-lg border border-line bg-surface-sunken/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Icon className="size-3.5" strokeWidth={1.75} />
          {label}
        </div>
        <span className="font-mono-num text-[11px] text-muted-foreground">
          resets in {resetsIn} days
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono-num text-2xl text-ink-900">{fmt(remaining)}</span>
        <span className="font-mono-num text-xs text-muted-foreground">/ {fmt(total)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div className={cn("h-full", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 font-mono-num text-[10px] text-muted-foreground">
        {fmt(used)} used · {fmt(remaining)} remaining
      </div>
    </div>
  );
}

/* ---------------- usage chart ---------------- */

const USAGE = [
  { name: "Articles", v: 920, color: "var(--brand-700)" },
  { name: "Product/page copy", v: 540, color: "var(--brand-700)" },
  { name: "Regenerate/Humanize", v: 280, color: "var(--accent-gold)" },
  { name: "Internal links", v: 140, color: "var(--brand-700)" },
];

function UsageThisPeriod() {
  const total = useMemo(() => USAGE.reduce((s, x) => s + x.v, 0), []);
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">Usage this period</div>
          <div className="font-mono-num text-xs text-muted-foreground">
            Jun 1 – Jun 30, 2026
          </div>
        </div>
        <div className="font-mono-num text-sm text-ink-700">
          <span className="text-ink-900">{fmt(total)}</span> action credits used ·{" "}
          <span className="text-muted-foreground">120 remaining</span>
        </div>
      </div>

      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={USAGE} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 10,
                fontFamily: "var(--font-mono, ui-monospace)",
              }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-sunken)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Bar dataKey="v" radius={[6, 6, 0, 0]} barSize={42}>
              {USAGE.map((u) => (
                <Cell key={u.name} fill={u.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-num text-[11px] text-muted-foreground">
        {USAGE.map((u) => (
          <span key={u.name} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-sm"
              style={{ background: u.color }}
            />
            {u.name} · {fmt(u.v)}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- plan comparison ---------------- */

type Tier = {
  id: "starter" | "growth" | "advanced" | "premium" | "agency";
  name: string;
  monthly: number;
  agencyFrom?: boolean;
  popular?: boolean;
  lines: string[];
  review: string;
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 199,
    lines: ["8 units / mo", "800 action · 5 video credits", "1 language", "Site export"],
    review: "AI-only + quality-gate",
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 449,
    lines: ["20 units / mo", "2,000 action · 20 video credits", "2 languages", "Connector publish"],
    review: "AI-only + quality-gate",
  },
  {
    id: "advanced",
    name: "Advanced",
    monthly: 899,
    lines: ["48 units / mo", "5,000 action · 60 video credits", "4 languages", "AI + freelancer review"],
    review: "AI + freelancer review",
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 999,
    popular: true,
    lines: ["60 units / mo", "6,500 action · 80 video credits", "6 languages", "AI + LetoLab expert"],
    review: "AI + LetoLab expert",
  },
  {
    id: "agency",
    name: "Agency",
    monthly: 999,
    agencyFrom: true,
    lines: ["Multi-client console", "Shared credit pool", "White-label reports", "Priority support"],
    review: "Per-client review settings",
  },
];

const CURRENT: Tier["id"] = "growth";
const RANK: Record<Tier["id"], number> = {
  starter: 1,
  growth: 2,
  advanced: 3,
  premium: 4,
  agency: 5,
};

function PlanComparison({ cycle, onPick }: { cycle: Cycle; onPick: (t: Tier) => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-900">Change plan</div>
          <div className="text-xs text-muted-foreground">
            {cycle === "annual"
              ? "Annual billing — −20% (shown as monthly equivalent)"
              : "Monthly billing"}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {TIERS.map((t) => {
          const isCurrent = t.id === CURRENT;
          const direction = RANK[t.id] > RANK[CURRENT] ? "up" : "down";
          const price = cycle === "annual" ? Math.round(t.monthly * 0.8) : t.monthly;
          return (
            <div
              key={t.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-surface p-4 transition",
                isCurrent
                  ? "border-brand-700/60 shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-700)_12%,transparent)]"
                  : "border-line hover:border-ink-700/30",
                t.popular && !isCurrent && "border-[color:var(--accent-gold-soft)]",
              )}
            >
              {t.popular ? (
                <span className="absolute -top-2 right-3 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-1.5 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-[color:var(--accent-gold)]">
                  Popular
                </span>
              ) : null}
              <div className="text-sm font-medium text-ink-900">{t.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                {t.agencyFrom ? (
                  <span className="text-[11px] text-muted-foreground">from</span>
                ) : null}
                <span className="font-mono-num text-2xl text-ink-900">${price}</span>
                <span className="font-mono-num text-[11px] text-muted-foreground">/mo</span>
              </div>
              {cycle === "annual" ? (
                <div className="font-mono-num text-[10px] text-muted-foreground">
                  billed annually
                </div>
              ) : null}

              <ul className="mt-3 space-y-1.5 text-xs text-ink-700">
                {t.lines.map((l) => (
                  <li key={l} className="flex items-start gap-1.5">
                    <Check
                      className="mt-0.5 size-3 shrink-0 text-brand-700"
                      strokeWidth={2}
                    />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-md border border-line bg-surface-sunken px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    Current plan
                  </button>
                ) : direction === "up" ? (
                  <button
                    onClick={() => onPick(t)}
                    className="w-full rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
                  >
                    Upgrade
                  </button>
                ) : (
                  <button
                    onClick={() => onPick(t)}
                    className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-ink-700/30 hover:text-ink-700"
                  >
                    Downgrade
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ConfirmDialog({
  tier,
  cycle,
  onClose,
}: {
  tier: Tier;
  cycle: Cycle;
  onClose: () => void;
}) {
  const price = cycle === "annual" ? Math.round(tier.monthly * 0.8) : tier.monthly;
  const direction = RANK[tier.id] > RANK[CURRENT] ? "Upgrade" : "Downgrade";
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {direction}
        </div>
        <h3 className="mt-1 text-xl font-medium text-ink-900">
          Switch to {tier.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You'll be charged{" "}
          <span className="font-mono-num text-ink-900">${price}/mo</span>{" "}
          {cycle === "annual" ? "billed annually" : "billed monthly"}. Pro-rated
          for the remainder of this period.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.success(`Checkout would start for ${tier.name}.`);
              onClose();
            }}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
          >
            Continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- invoices ---------------- */

type Invoice = {
  date: string;
  desc: string;
  amount: number;
  status: "paid" | "open";
  id: string;
};

const INVOICES: Invoice[] = [
  { date: "2026-06-24", desc: "Growth — monthly", amount: 449, status: "open", id: "INV-2026-06" },
  { date: "2026-05-24", desc: "Growth — monthly", amount: 449, status: "paid", id: "INV-2026-05" },
  { date: "2026-04-24", desc: "Growth — monthly", amount: 449, status: "paid", id: "INV-2026-04" },
  { date: "2026-03-24", desc: "Growth — monthly", amount: 449, status: "paid", id: "INV-2026-03" },
  { date: "2026-02-24", desc: "Starter — monthly", amount: 199, status: "paid", id: "INV-2026-02" },
];

function Invoices() {
  const empty = false;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
        <div>
          <div className="text-sm font-medium text-ink-900">Invoices</div>
          <div className="text-xs text-muted-foreground">
            Receipts and open balances
          </div>
        </div>
      </div>
      {empty ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          No invoices yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.2fr_2fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-line px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>
          {INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1.2fr_2fr_0.8fr_0.8fr_0.8fr] items-center gap-4 border-b border-line px-5 py-3 text-sm last:border-b-0 hover:bg-surface-sunken/40"
            >
              <div className="font-mono-num text-xs text-ink-700">{inv.date}</div>
              <div className="min-w-0">
                <div className="truncate text-ink-900">{inv.desc}</div>
                <div className="font-mono-num text-[10px] text-muted-foreground">
                  {inv.id}
                </div>
              </div>
              <div className="font-mono-num text-sm text-ink-900">
                ${inv.amount.toFixed(2)}
              </div>
              <div>
                {inv.status === "paid" ? (
                  <StatusChip tone="live">Paid</StatusChip>
                ) : (
                  <StatusChip tone="gold">Open</StatusChip>
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                {inv.status === "open" ? (
                  <button
                    onClick={() => toast.info(`${inv.id} — opened`)}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-xs hover:border-ink-700/30"
                  >
                    <Eye className="size-3" strokeWidth={1.75} /> View
                  </button>
                ) : (
                  <button
                    onClick={() => toast.success(`${inv.id}.pdf — downloaded`)}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-xs hover:border-ink-700/30"
                  >
                    <Download className="size-3" strokeWidth={1.75} /> PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}