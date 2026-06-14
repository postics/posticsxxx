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
} from "lucide-react";
import { AppShell } from "@/features/shell/AppShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/billing")({ component: BillingPage });

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function BillingPage() {
  const used = 6_760;
  const total = 10_000;
  const pct = Math.round((used / total) * 100);

  return (
    <AppShell active="billing" breadcrumb={["Workspace", "Billing & Credits"]}>
      <div className="mx-auto w-full max-w-6xl px-8 py-8 space-y-6">
        <header className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Workspace · Acme Studio
          </div>
          <h1 className="font-display text-3xl text-ink-900">Billing & credits</h1>
          <p className="text-sm text-muted-foreground">
            Transparent action pricing. No token math, no surprises.
          </p>
        </header>

        {/* Plan + credits */}
        <div className="grid grid-cols-[1fr_1.4fr] gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Current plan
              </div>
              <StatusChip tone="gold">Premium</StatusChip>
            </div>
            <div className="mt-3 font-display text-2xl text-ink-900">Growth</div>
            <div className="mt-1 text-sm text-muted-foreground">
              $449 / mo · 10,000 credits · Renews Jul 12
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-lg bg-ink-900 px-3 py-2 text-sm text-paper hover:bg-ink-700">
                Upgrade plan
              </button>
              <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
                Compare
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Credit balance
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono-num text-4xl text-ink-900">{fmt(total - used)}</span>
                  <span className="font-mono-num text-sm text-muted-foreground">
                    / {fmt(total)} credits
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
                  <RefreshCw className="size-3.5" strokeWidth={1.5} /> Auto-refill
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] hover:opacity-90">
                  <Wallet className="size-3.5" strokeWidth={1.5} /> Top-up
                </button>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full bg-brand-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono-num text-xs text-muted-foreground">
              <span>{pct}% used this period</span>
              <span>Projected depletion · Jul 06</span>
            </div>
          </Card>
        </div>

        {/* Low credits banner */}
        <div className="flex items-center justify-between rounded-xl border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-5 py-3 text-sm">
          <div className="flex items-center gap-2.5 text-ink-900">
            <AlertTriangle className="size-4 text-[color:var(--warning)]" strokeWidth={1.5} />
            <span>
              You'll likely run out before renewal. Publishing stays available even at zero — only
              new generation pauses.
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline">
            Add 5,000 credits <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Action cost table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <Sparkles className="size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.75} />
              Action cost table
            </div>
            <div className="text-xs text-muted-foreground">In credits · not LLM tokens</div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-line">
            {[
              ["Generate article (1,500w)", "64", "AI draft + SEO check"],
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

        {/* Usage history */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-4">
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-surface-sunken px-5 py-3 text-sm font-medium text-ink-900">
              Recent usage
            </div>
            {[
              ["Jun 12", "Generate article", "Why we batch-roast on Tuesdays", -64],
              ["Jun 12", "Human edit pass", "Origin spotlight: Yirgacheffe", -120],
              ["Jun 11", "Publish", "Pour-over vs immersion guide", -4],
              ["Jun 11", "Boost", "Espresso maintenance checklist", -40],
              ["Jun 10", "Top-up", "Pack: 5,000 credits", +5000],
            ].map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_140px_1fr_100px] items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-b-0"
              >
                <div className="font-mono-num text-xs text-muted-foreground">{r[0]}</div>
                <div className="text-ink-700">{r[1]}</div>
                <div className="truncate text-ink-900">{r[2]}</div>
                <div className="font-mono-num text-right text-sm" style={{ color: (r[3] as number) > 0 ? "var(--brand-700)" : "var(--ink-900)" }}>
                  {(r[3] as number) > 0 ? "+" : ""}{r[3]}
                </div>
              </div>
            ))}
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Users className="size-4 text-muted-foreground" strokeWidth={1.5} /> Human services
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Transparent take-rate · 22% on freelancer payouts
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-mono-num text-2xl text-ink-900">$1,840</span>
                <span className="text-xs text-muted-foreground">paid out · 30d</span>
              </div>
              <button className="mt-3 text-xs text-brand-700 hover:underline">
                View payout history →
              </button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Share2 className="size-4 text-muted-foreground" strokeWidth={1.5} /> Referrals
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Earn 25–30% recurring</div>
              <div className="mt-3 rounded-lg border border-line bg-surface-sunken px-3 py-2 font-mono-num text-xs text-ink-700">
                postics.io/r/acme-studio
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono-num text-lg text-ink-900">$420</span>
                <span className="text-xs text-muted-foreground">earned · 30d</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-ink-900">Invoices</div>
                <button className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
                  <Download className="size-3" strokeWidth={1.75} /> All
                </button>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                {["Jun 2026 · $449", "May 2026 · $449", "Apr 2026 · $449"].map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-surface-sunken"
                  >
                    <span className="text-ink-700">{s}</span>
                    <Download className="size-3 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}