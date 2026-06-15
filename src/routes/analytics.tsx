import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Radar,
  Download,
  Zap,
  ExternalLink,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/features/shell/AppShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  return (
    <AppShell active="analytics" breadcrumb={["Projects", "Vellum & Bean", "Analytics"]}>
      <div className="mx-auto w-full max-w-7xl px-8 py-8 space-y-8">
        <header className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              SEO + GEO performance
            </div>
            <h1 className="font-display text-3xl text-ink-900">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Last 30 days · Vellum & Bean · GA4 + Search Console connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
              <Download className="size-3.5" strokeWidth={1.5} /> White-label PDF
            </button>
          </div>
        </header>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          <Kpi label="Organic traffic" value="12,480" delta="+18%" />
          <Kpi label="Indexed pages" value="184" delta="+12" />
          <Kpi label="Avg position" value="14.2" delta="-3.1" positive />
          <Kpi label="GEO mentions" value="64" delta="+27" gold />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink-900">Organic traffic</div>
                <div className="text-xs text-muted-foreground">Sessions, last 30 days</div>
              </div>
              <StatusChip tone="live">+18%</StatusChip>
            </div>
            <Spark />
          </Card>
          <Card className="p-5">
            <div className="text-sm font-medium text-ink-900">Topic coverage</div>
            <div className="text-xs text-muted-foreground">Cluster fill rate</div>
            <div className="mt-4 space-y-3">
              {[
                ["Brewing methods", 82],
                ["Origin stories", 64],
                ["Equipment", 41],
                ["Wholesale", 22],
              ].map(([n, v]) => (
                <div key={n as string} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-700">{n}</span>
                    <span className="font-mono-num text-muted-foreground">{v as number}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-brand-700" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* GEO panel */}
        <Card className="border-[color:var(--accent-gold-soft)] bg-gradient-to-br from-[color:var(--accent-gold-soft)]/40 to-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-md bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
                <Radar className="size-4" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-medium text-ink-900">Where your content appears in AI answers</div>
                <div className="text-xs text-muted-foreground">GEO visibility — citations in LLM-powered search</div>
              </div>
            </div>
            <StatusChip tone="gold">Premium signal</StatusChip>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {[
              { engine: "ChatGPT", mentions: 28, queries: '"best coffee subscription"' },
              { engine: "Perplexity", mentions: 19, queries: '"specialty roastery PNW"' },
              { engine: "Gemini", mentions: 11, queries: '"how often roast coffee"' },
              { engine: "Google AI Overviews", mentions: 6, queries: '"pour-over guide"' },
            ].map((e) => (
              <div key={e.engine} className="rounded-lg border border-line bg-surface p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {e.engine}
                </div>
                <div className="mt-1 font-mono-num text-2xl text-ink-900">{e.mentions}</div>
                <div className="mt-2 truncate font-mono-num text-[11px] text-muted-foreground">
                  {e.queries}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Content performance */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
            <div className="text-sm font-medium text-ink-900">Top-performing articles</div>
            <div className="text-xs text-muted-foreground">Boost ⤴ pushes a refresh task to the Content Plan</div>
          </div>
          <div className="grid grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-4 border-b border-line px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Article</div>
            <div>Traffic</div>
            <div>Position</div>
            <div>Conv. proxy</div>
            <div className="text-right">Action</div>
          </div>
          {[
            ["Pour-over vs immersion buyer's guide", "3,210", "4.1", "2.8%"],
            ["Origin spotlight: Yirgacheffe Konga", "1,840", "7.3", "1.9%"],
            ["Why we batch-roast on Tuesdays", "920", "12.0", "3.2%"],
            ["Espresso maintenance checklist", "640", "18.4", "1.1%"],
          ].map(([a, t, p, c], i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.6fr] items-center gap-4 border-b border-line px-5 py-3 text-sm last:border-b-0"
            >
              <div className="truncate text-ink-900">{a}</div>
              <div className="font-mono-num text-ink-700">{t}</div>
              <div className="font-mono-num text-ink-700">{p}</div>
              <div className="font-mono-num text-ink-700">{c}</div>
              <div className="text-right">
                <button className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs hover:border-ink-700/30">
                  <Zap className="size-3" strokeWidth={1.75} /> Boost
                </button>
              </div>
            </div>
          ))}
        </Card>

        {/* Partial-state hint */}
        <div className="flex items-center justify-between rounded-xl border border-dashed border-line bg-surface px-5 py-4 text-sm">
          <div className="flex items-center gap-3 text-ink-700">
            <Plug className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span>Connect Bing Webmaster to expand GEO coverage to Copilot answers.</span>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline">
            Connect <ExternalLink className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  delta,
  positive,
  gold,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  gold?: boolean;
}) {
  const up = delta.startsWith("+") || positive;
  return (
    <Card className={cn("p-5", gold && "border-[color:var(--accent-gold-soft)]")}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono-num text-2xl text-ink-900">{value}</span>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            up ? "text-brand-700" : "text-[color:var(--danger)]",
            gold && "text-[color:var(--accent-gold)]",
          )}
        >
          {up ? <TrendingUp className="size-3" strokeWidth={2} /> : <TrendingDown className="size-3" strokeWidth={2} />}
          {delta}
        </span>
      </div>
    </Card>
  );
}

function Spark() {
  const pts = [12, 14, 13, 18, 17, 22, 20, 24, 28, 26, 31, 36, 34, 40, 44, 42, 48, 52, 56, 60, 58, 64, 70, 68, 74, 80, 78, 84, 90, 96];
  const max = Math.max(...pts);
  const w = 720;
  const h = 160;
  const step = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (p / max) * (h - 8) - 4}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-700)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--brand-700)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path d={path} fill="none" stroke="var(--brand-700)" strokeWidth={1.75} />
    </svg>
  );
}