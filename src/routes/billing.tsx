import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Download,
  AlertTriangle,
  ArrowRight,
  Wallet,
  RefreshCw,
  Users,
  Share2,
  Sliders,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing & shared credits — Postics" }] }),
  component: BillingPage,
});

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

type Health = "healthy" | "low" | "depleted" | "payment-failed";

function BillingPage() {
  const { projects } = useScope();
  const [health, setHealth] = useState<Health>("low");

  const total = 10_000;
  const used = health === "depleted" ? 10_000 : health === "low" ? 8_640 : 4_120;
  const remaining = Math.max(0, total - used);
  const pct = Math.min(100, Math.round((used / total) * 100));

  const planByIndex = ["Growth", "Advanced", "Premium", "Starter"];
  const mrrByIndex = [449, 899, 999, 199];
  const capByIndex = [3200, 2400, 1800, 1240];
  const burnByIndex = [128, 96, 72, 40];

  const allocation = projects.map((p, i) => {
    const cap = capByIndex[i] ?? 800;
    return {
      id: p.id,
      name: p.name,
      initials: p.initials,
      domain: p.domain,
      cap,
      spent: Math.min(cap, Math.round(cap * (0.4 + i * 0.15))),
      dailyBurn: burnByIndex[i] ?? 30,
      plan: planByIndex[i] ?? "Starter",
      mrr: mrrByIndex[i] ?? 199,
    };
  });
  const allocated = allocation.reduce((s, a) => s + a.cap, 0);
  const unallocated = Math.max(0, total - allocated);
  const dailyBurn = allocation.reduce((s, a) => s + a.dailyBurn, 0);
  const daysLeft = dailyBurn > 0 ? Math.max(0, Math.floor(remaining / dailyBurn)) : 999;

  return (
    <WorkspaceShell active="billing" breadcrumb={["Billing & shared credits"]}>
      <div className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-8 py-8 space-y-6">
          <header className="flex items-end justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Workspace · Agency-level billing
              </div>
              <h1 className="font-display text-3xl text-ink-900">Billing & shared credits</h1>
              <p className="text-sm text-muted-foreground">
                One pool, transparent action pricing. Per-project plans live inside each
                client's Settings.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              {(["healthy", "low", "depleted", "payment-failed"] as Health[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setHealth(s)}
                  className={
                    "rounded-md px-2 py-1 " +
                    (health === s ? "bg-ink-900 text-paper" : "hover:bg-surface-sunken")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </header>

          {health === "payment-failed" ? (
            <Banner
              tone="danger"
              icon={<XCircle className="size-4" strokeWidth={1.5} />}
              text="Last charge for $999 was declined by the issuer. Generation continues for 48h grace; update your card to avoid interruption."
              cta="Retry payment"
            />
          ) : health === "depleted" ? (
            <Banner
              tone="danger"
              icon={<AlertTriangle className="size-4" strokeWidth={1.5} />}
              text="Shared pool depleted. New generation is paused — already-approved content can still publish. No hard lockout."
              cta="Top up 5,000 credits"
            />
          ) : health === "low" ? (
            <Banner
              tone="warn"
              icon={<AlertTriangle className="size-4" strokeWidth={1.5} />}
              text={`Pool will likely deplete in ~${daysLeft} days at current burn. Publishing stays available even at zero — only new generation pauses.`}
              cta="Add 5,000 credits"
            />
          ) : null}

          <div className="grid grid-cols-[1.6fr_1fr] gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Shared credit pool
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="font-mono-num text-5xl tracking-tight text-ink-900">
                      {fmt(remaining)}
                    </span>
                    <span className="font-mono-num text-sm text-muted-foreground">
                      / {fmt(total)} credits
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Actions · not LLM tokens. One pool, shared across every client project.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
                    <RefreshCw className="size-3.5" strokeWidth={1.5} /> Autopay
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] hover:opacity-90">
                    <Wallet className="size-3.5" strokeWidth={1.5} /> Top-up
                  </button>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={
                    "h-full " +
                    (health === "depleted"
                      ? "bg-[color:var(--danger)]"
                      : health === "low"
                        ? "bg-[color:var(--warning)]"
                        : "bg-brand-700")
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono-num text-xs text-muted-foreground">
                <span>{pct}% used this period</span>
                <span>
                  Burn ~{fmt(dailyBurn)}/day · Projected depletion ·{" "}
                  {health === "depleted" ? "today" : `in ${daysLeft}d`}
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Agency plan
                </div>
                <StatusChip tone="gold">Premium</StatusChip>
              </div>
              <div className="mt-3 font-display text-2xl text-ink-900">Studio · $999/mo</div>
              <div className="mt-1 text-sm text-muted-foreground">
                10,000 pooled credits · Renews Jul 12 · Visa •• 4242
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-lg bg-ink-900 px-3 py-2 text-sm text-paper hover:bg-ink-700">
                  Manage plan
                </button>
                <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
                  Update card
                </button>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Sliders className="size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.75} />
                Per-client allocation
              </div>
              <div className="font-mono-num text-xs text-muted-foreground">
                Allocated {fmt(allocated)} · Unallocated buffer {fmt(unallocated)}
              </div>
            </div>
            <div className="grid grid-cols-[1.6fr_120px_1fr_120px_120px_90px] gap-3 border-b border-line px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <div>Client</div>
              <div>Plan</div>
              <div>Usage vs cap</div>
              <div className="text-right">Burn /day</div>
              <div className="text-right">Depletes</div>
              <div className="text-right">Action</div>
            </div>
            {allocation.map((a) => {
              const cPct = Math.min(100, Math.round((a.spent / a.cap) * 100));
              const cDays = a.dailyBurn > 0 ? Math.floor((a.cap - a.spent) / a.dailyBurn) : 99;
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[1.6fr_120px_1fr_120px_120px_90px] items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-7 place-items-center rounded-md bg-surface-sunken text-[11px] font-medium text-ink-900">
                      {a.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-ink-900">{a.name}</div>
                      <div className="font-mono-num text-[11px] text-muted-foreground">
                        {a.domain}
                      </div>
                    </div>
                  </div>
                  <div>
                    <StatusChip tone={a.plan === "Premium" ? "gold" : "neutral"}>
                      {a.plan}
                    </StatusChip>
                  </div>
                  <div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className={
                          "h-full " +
                          (cPct > 90 ? "bg-[color:var(--warning)]" : "bg-brand-700")
                        }
                        style={{ width: `${cPct}%` }}
                      />
                    </div>
                    <div className="mt-1 font-mono-num text-[11px] text-muted-foreground">
                      {fmt(a.spent)} / {fmt(a.cap)} cr
                    </div>
                  </div>
                  <div className="font-mono-num text-right text-sm text-ink-700">
                    {a.dailyBurn} cr
                  </div>
                  <div className="font-mono-num text-right text-xs text-muted-foreground">
                    in {cDays}d
                  </div>
                  <div className="text-right">
                    <button className="text-xs text-brand-700 hover:underline">Allocate</button>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Sparkles className="size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.75} />
                Action cost table
              </div>
              <div className="text-xs text-muted-foreground">
                In credits · framed as actions, not raw LLM tokens
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-line">
              {[
                ["Generate article (1,500w)", "64", "AI draft + SEO + GEO check"],
                ["Generate landing block", "18", "1 section, ready to drop in"],
                ["Human edit pass", "120", "Editor + QA, SLA 48h"],
                ["Publish to site", "4", "Includes RankMath sync"],
                ["Boost / refresh", "40", "Re-rank update for stale post"],
                ["Social repurpose", "12", "Per channel, behind approval"],
              ].map(([a, c, h]) => (
                <div key={a} className="bg-surface px-5 py-4">
                  <div className="text-sm text-ink-900">{a}</div>
                  <div className="font-mono-num mt-1 text-lg text-brand-700">{c} cr</div>
                  <div className="mt-1 text-xs text-muted-foreground">{h}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-[1.4fr_1fr] gap-4">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  <Users className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  Human services · payout history
                </div>
                <div className="text-xs text-muted-foreground">
                  Aggregator take-rate <span className="text-ink-900">22%</span> · transparent
                </div>
              </div>
              {[
                ["Jun 12", "Maya Okafor", "Editor · 4 articles", 880, 194],
                ["Jun 10", "Daniel Reiss", "Strategist · brief", 420, 92],
                ["Jun 08", "Inés Vargas", "SEO QA · 6 items", 540, 119],
                ["Jun 05", "LetoLab expert", "Crisis rewrite", 1200, 240],
              ].map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[70px_1.2fr_1.4fr_110px_110px] items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-b-0"
                >
                  <div className="font-mono-num text-xs text-muted-foreground">{r[0]}</div>
                  <div className="text-ink-900">{r[1]}</div>
                  <div className="text-ink-700">{r[2]}</div>
                  <div className="font-mono-num text-right text-ink-900">
                    ${fmt(r[3] as number)}
                  </div>
                  <div className="font-mono-num text-right text-xs text-muted-foreground">
                    take ${fmt(r[4] as number)}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-surface-sunken px-5 py-2.5 text-xs text-muted-foreground">
                <span>4 payouts · 30d</span>
                <span className="font-mono-num text-ink-900">
                  Payouts $3,040 · Take $645
                </span>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  <Share2 className="size-4 text-muted-foreground" strokeWidth={1.5} /> Partner
                  &amp; referrals
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Earn <span className="text-ink-900">25–30%</span> recurring on every workspace
                  you refer.
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface-sunken px-3 py-2 font-mono-num text-xs text-ink-700">
                  <span className="flex-1 truncate">postics.io/r/acme-studio</span>
                  <button className="text-muted-foreground hover:text-ink-900">
                    <Copy className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-mono-num text-xl text-ink-900">$420</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      earned · 30d
                    </div>
                  </div>
                  <div>
                    <div className="font-mono-num text-xl text-ink-900">6</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      active referrals
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="text-sm font-medium text-ink-900">Plans roll-up</div>
                <div className="mt-3 space-y-2">
                  {allocation.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink-700 truncate">{a.name}</span>
                      <span className="font-mono-num text-ink-900">
                        {a.plan} · ${fmt(a.mrr)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="text-muted-foreground">MRR roll-up</span>
                  <span className="font-mono-num text-ink-900">
                    ${fmt(allocation.reduce((s, a) => s + a.mrr, 0))} / mo
                  </span>
                </div>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
              <div className="text-sm font-medium text-ink-900">Invoices</div>
              <button className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
                <Download className="size-3" strokeWidth={1.75} /> Export all (CSV)
              </button>
            </div>
            <div className="grid grid-cols-[100px_1fr_160px_100px_100px_60px] gap-3 border-b border-line px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <div>Date</div>
              <div>Description</div>
              <div>Scope</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Status</div>
              <div></div>
            </div>
            {[
              ["Jun 12, 2026", "Studio plan · monthly", "Agency master", "$999.00", "paid"],
              ["Jun 12, 2026", "Top-up · 5,000 credits", "Agency master", "$199.00", "paid"],
              ["Jun 02, 2026", "Premium add-on · publishing", "Linden Mercantile", "$199.00", "paid"],
              ["May 28, 2026", "Editor pass · 4 articles", "Vellum & Bean", "$880.00", "paid"],
              ["May 12, 2026", "Studio plan · monthly", "Agency master", "$999.00", "paid"],
            ].map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[100px_1fr_160px_100px_100px_60px] items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-b-0"
              >
                <div className="font-mono-num text-xs text-muted-foreground">{r[0]}</div>
                <div className="text-ink-900 truncate">{r[1]}</div>
                <div className="text-ink-700 text-xs truncate">{r[2]}</div>
                <div className="font-mono-num text-right text-ink-900">{r[3]}</div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs text-[color:var(--success,#2E7D5B)]">
                    <CheckCircle2 className="size-3" strokeWidth={1.75} /> {r[4]}
                  </span>
                </div>
                <div className="text-right">
                  <button className="text-muted-foreground hover:text-ink-900">
                    <Download className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </Card>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Need per-client billing detail? Open the client's{" "}
              <span className="text-ink-700">Settings → Plan &amp; credits</span>.
            </span>
            <span>Tax &amp; VAT · Billing contacts · Receipts language</span>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Banner({
  tone,
  icon,
  text,
  cta,
}: {
  tone: "warn" | "danger";
  icon: ReactNode;
  text: string;
  cta: string;
}) {
  const styles =
    tone === "danger"
      ? "border-[#F1D2CE] bg-[#FBEEEC]"
      : "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40";
  return (
    <div
      className={
        "flex items-center justify-between rounded-xl border px-5 py-3 text-sm " + styles
      }
    >
      <div className="flex items-center gap-2.5 text-ink-900">
        <span className={tone === "danger" ? "text-[color:var(--danger)]" : "text-[color:var(--warning)]"}>
          {icon}
        </span>
        <span>{text}</span>
      </div>
      <button className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline">
        {cta} <ArrowRight className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}