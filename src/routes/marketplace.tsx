import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Star,
  ShieldCheck,
  Clock,
  Search,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
  validateSearch: (s: Record<string, unknown>) => ({
    brief: typeof s.brief === "string" ? s.brief : undefined,
    niche: typeof s.niche === "string" ? s.niche : undefined,
  }),
});

type Expert = {
  id: string;
  name: string;
  initials: string;
  title: string;
  letolab?: boolean;
  verified: boolean;
  niches: string[];
  langs: string[];
  rating: number;
  jobs: number;
  sla: string;
  rate: number;
  tier: "Standard" | "Pro" | "Elite";
  onTime: number;
  revision: number;
  available: "now" | "soon" | "busy";
  samples: string[];
  bio: string;
  trend?: number[]; // last-30d jobs micro-trend
};

const EXPERTS: Expert[] = [
  {
    id: "e1",
    name: "Marta Liang",
    initials: "ML",
    title: "Long-form editor · specialty coffee, food",
    verified: true,
    niches: ["Food & beverage", "Lifestyle", "Editorial"],
    langs: ["EN", "ZH"],
    rating: 4.9,
    jobs: 214,
    sla: "first review < 18h",
    rate: 0.18,
    tier: "Elite",
    onTime: 98,
    revision: 6,
    available: "now",
    samples: ["Origin spotlight series — Vellum & Bean", "Wholesale buyer's guide — Northwall"],
    bio: "Eight years editing food and lifestyle long-form. Calm pen, strong on voice and structure.",
    trend: [3, 4, 2, 5, 6, 5, 7, 6, 8, 7, 9, 8],
  },
  {
    id: "e2",
    name: "Daniel Reyes",
    initials: "DR",
    title: "Technical writer · SaaS, dev tools",
    verified: true,
    niches: ["SaaS", "Developer", "B2B"],
    langs: ["EN", "ES"],
    rating: 4.7,
    jobs: 138,
    sla: "first review < 24h",
    rate: 0.14,
    tier: "Pro",
    onTime: 95,
    revision: 9,
    available: "now",
    samples: ["Engineering blog refresh — Lattice", "API reference rewrite — Plaid"],
    bio: "Engineer-turned-writer. Comfortable with code samples, sequence diagrams, and changelogs.",
    trend: [4, 3, 5, 4, 4, 6, 5, 7, 6, 5, 7, 6],
  },
  {
    id: "e3",
    name: "Iris Kowalski",
    initials: "IK",
    title: "LetoLab in-house · senior editor",
    letolab: true,
    verified: true,
    niches: ["E-commerce", "DTC brands", "Editorial"],
    langs: ["EN", "PL", "DE"],
    rating: 5.0,
    jobs: 312,
    sla: "first review < 12h",
    rate: 0.22,
    tier: "Elite",
    onTime: 99,
    revision: 4,
    available: "soon",
    samples: ["Cedar & Sumac brand voice playbook", "Quill & Quire holiday campaign"],
    bio: "LetoLab senior editor. Lead on premium accounts; sets QA bar across the network.",
    trend: [6, 7, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11],
  },
  {
    id: "e4",
    name: "Jonas Becker",
    initials: "JB",
    title: "SEO content strategist",
    verified: true,
    niches: ["SEO", "Content strategy", "B2B"],
    langs: ["EN", "DE"],
    rating: 4.8,
    jobs: 96,
    sla: "first review < 36h",
    rate: 0.16,
    tier: "Pro",
    onTime: 94,
    revision: 11,
    available: "now",
    samples: ["Cluster strategy — Northwall Roasters", "Topical map — Cedar & Sumac"],
    bio: "Strategy-first writer. Builds cluster plans before drafting a single sentence.",
    trend: [2, 3, 2, 4, 3, 5, 4, 4, 5, 4, 6, 5],
  },
  {
    id: "e5",
    name: "Amara Okafor",
    initials: "AO",
    title: "Brand copy · DTC, lifestyle",
    verified: false,
    niches: ["DTC brands", "Lifestyle", "Beauty"],
    langs: ["EN", "FR"],
    rating: 4.6,
    jobs: 41,
    sla: "first review < 48h",
    rate: 0.11,
    tier: "Standard",
    onTime: 91,
    revision: 14,
    available: "now",
    samples: ["Launch copy — Maren Skincare", "Holiday landing — Holt Goods"],
    bio: "Punchy short-form. Best for landings and product narratives.",
    trend: [1, 2, 1, 3, 2, 2, 3, 2, 4, 3, 3, 4],
  },
  {
    id: "e6",
    name: "Hiroshi Tan",
    initials: "HT",
    title: "Technical editor · fintech, infra",
    verified: true,
    niches: ["Fintech", "Infrastructure", "B2B"],
    langs: ["EN", "JA"],
    rating: 4.9,
    jobs: 178,
    sla: "first review < 24h",
    rate: 0.19,
    tier: "Elite",
    onTime: 97,
    revision: 5,
    available: "busy",
    samples: ["Risk model whitepaper — Verity Capital", "Edge compute series — Northbeam"],
    bio: "Editor for hard-to-explain products. Strong on accuracy and tone calibration.",
    trend: [5, 6, 5, 7, 6, 8, 7, 9, 8, 9, 8, 10],
  },
];

const NICHES = ["All", "Food & beverage", "SaaS", "E-commerce", "Fintech", "DTC brands", "SEO"];
const LANGS = ["Any", "EN", "ES", "DE", "FR", "JA", "ZH", "PL"];

function MarketplacePage() {
  const search = Route.useSearch();
  const [open, setOpen] = useState<Expert | null>(null);
  const [niche, setNiche] = useState(search.niche ?? "All");
  const [lang, setLang] = useState("Any");
  const [type, setType] = useState<"all" | "freelancer" | "letolab">("all");
  const [minRating, setMinRating] = useState(0);

  const filtered = EXPERTS.filter((e) => {
    if (niche !== "All" && !e.niches.includes(niche)) return false;
    if (lang !== "Any" && !e.langs.includes(lang)) return false;
    if (type === "letolab" && !e.letolab) return false;
    if (type === "freelancer" && e.letolab) return false;
    if (e.rating < minRating) return false;
    return true;
  });

  return (
    <WorkspaceShell active="marketplace" breadcrumb={["Marketplace"]}>
      <div className="mx-auto w-full max-w-7xl px-8 py-8 space-y-6">
        {search.brief ? (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-brand-100 bg-brand-100/40 px-4 py-3">
            <div className="flex items-start gap-2.5 text-sm">
              <Sparkles className="mt-0.5 size-4 text-brand-700" strokeWidth={1.75} />
              <div>
                <div className="text-ink-900">
                  Pre-filtered for brief · <span className="font-mono-num">{search.brief}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Pick an expert; assignment returns you to the Review Queue.
                </div>
              </div>
            </div>
            <a href="/review" className="text-xs text-brand-700 hover:underline">
              Back to Review →
            </a>
          </div>
        ) : null}

        <header className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Verified experts · curated network
            </div>
            <h1 className="font-display text-3xl text-ink-900">Freelancer marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Every profile vetted. No bidding, no race-to-the-bottom — just calm, skilled editors.
            </p>
          </div>
          <StatusChip tone="gold">
            <ShieldCheck className="size-2.5" strokeWidth={2.5} /> Verified network
          </StatusChip>
        </header>

        {/* Recommended */}
        <Card className="border-[color:var(--accent-gold-soft)] bg-gradient-to-br from-[color:var(--accent-gold-soft)]/30 to-surface p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
              <Sparkles className="size-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-ink-900">
                Recommended for "Why we batch-roast on Tuesdays — 1,800w"
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Matched on niche (Food & beverage), language (EN), SLA (P1 · 48h), and tone fit.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXPERTS.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setOpen(e)}
                    className="flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-xs hover:border-ink-700/30"
                  >
                    <div className="grid size-5 place-items-center rounded-full bg-brand-100 font-display text-[9px] text-brand-700">
                      {e.initials}
                    </div>
                    <span className="text-ink-900">{e.name}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Star className="size-2.5 fill-current text-[color:var(--accent-gold)]" strokeWidth={0} />
                      {e.rating} · {e.jobs}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" strokeWidth={1.5} />
            <input
              placeholder="Search experts, niches, languages…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Select value={niche} onChange={setNiche} options={NICHES} label="Niche" />
          <Select value={lang} onChange={setLang} options={LANGS} label="Language" />
          <div className="flex rounded-lg border border-line bg-surface p-0.5 text-xs">
            {([
              ["all", "All"],
              ["freelancer", "Freelancer"],
              ["letolab", "LetoLab"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setType(k)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors",
                  type === k ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-surface-sunken",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs">
            <span className="text-muted-foreground">Min ★</span>
            {[0, 4.5, 4.8].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono-num",
                  minRating === r ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-surface-sunken",
                )}
              >
                {r === 0 ? "Any" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Card className="grid place-items-center px-8 py-16 text-center">
            <div className="space-y-2">
              <div className="font-display text-lg text-ink-900">No experts match these filters</div>
              <p className="text-sm text-muted-foreground">
                Broaden filters, or route this task to LetoLab in-house experts.
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700">
                Route to LetoLab <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((e) => (
              <ExpertCard key={e.id} e={e} onOpen={() => setOpen(e)} />
            ))}
          </div>
        )}
      </div>

      {open ? <Drawer e={open} onClose={() => setOpen(null)} /> : null}
    </WorkspaceShell>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-ink-900 outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function ExpertCard({ e, onOpen }: { e: Expert; onOpen: () => void }) {
  return (
    <Card className="flex flex-col p-5 hover-lift shadow-elev-sm hover:border-ink-700/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="grid size-12 place-items-center rounded-full bg-brand-100 font-display text-base text-brand-700">
              {e.initials}
            </div>
            {e.available === "now" ? (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-brand-700" />
            ) : e.available === "busy" ? (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-[color:var(--danger)]" />
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-[color:var(--accent-gold)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base text-ink-900">{e.name}</span>
              {e.verified && !e.letolab ? (
                <span
                  title="Vetted by LetoLab — identity, portfolio, and SLA confirmed"
                  className="inline-flex"
                >
                  <ShieldCheck
                    className="size-3.5 fill-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
                    strokeWidth={1.75}
                  />
                </span>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">{e.title}</div>
          </div>
        </div>
        {e.letolab ? (
          <StatusChip tone="gold">LetoLab</StatusChip>
        ) : (
          <StatusChip tone={e.tier === "Elite" ? "live" : "neutral"}>{e.tier}</StatusChip>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-y border-line py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-current text-[color:var(--accent-gold)]" strokeWidth={0} />
            <span className="font-mono-num text-sm text-ink-900">{e.rating}</span>
            <span className="font-mono-num text-xs text-muted-foreground">· {e.jobs} jobs</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" strokeWidth={1.5} /> {e.sla}
          </div>
        </div>
        {e.trend ? (
          <div className="flex flex-col items-end">
            <Sparkline data={e.trend} />
            <span className="font-mono-num text-[10px] text-muted-foreground">last 30d</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {e.niches.slice(0, 3).map((n) => (
          <span
            key={n}
            className="rounded-md bg-surface-sunken px-2 py-0.5 text-[11px] text-ink-700"
          >
            {n}
          </span>
        ))}
        <span className="rounded-md border border-line px-2 py-0.5 font-mono-num text-[11px] text-muted-foreground">
          {e.langs.join(" · ")}
        </span>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recent work</div>
        <div className="mt-1 text-xs text-ink-700">· {e.samples[0]}</div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <div>
          <div className="font-mono-num text-sm text-ink-900">${e.rate.toFixed(2)}/word</div>
          <div className="font-mono-num text-[10px] text-muted-foreground">
            agency take 22% · ${(e.rate * 0.22).toFixed(3)}
          </div>
        </div>
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30"
        >
          View profile <ArrowRight className="size-3" strokeWidth={1.75} />
        </button>
      </div>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 64;
  const h = 18;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  const last = data[data.length - 1];
  const lastX = w;
  const lastY = h - ((last - min) / range) * h;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="1.75" fill="var(--color-brand-700)" />
    </svg>
  );
}

function Drawer({ e, onClose }: { e: Expert; onClose: () => void }) {
  const [assigned, setAssigned] = useState(false);
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-[560px] flex-col border-l border-line bg-paper shadow-2xl">
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid size-14 place-items-center rounded-full bg-brand-100 font-display text-lg text-brand-700">
              {e.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl text-ink-900">{e.name}</span>
                {e.verified ? (
                  <ShieldCheck
                    className="size-4 fill-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
                    strokeWidth={1.75}
                  />
                ) : null}
                {e.letolab ? <StatusChip tone="gold">LetoLab</StatusChip> : null}
              </div>
              <div className="text-sm text-muted-foreground">{e.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <Star className="size-3 fill-current text-[color:var(--accent-gold)]" strokeWidth={0} />
                <span className="font-mono-num text-ink-900">{e.rating}</span>
                <span className="font-mono-num text-muted-foreground">· {e.jobs} jobs completed</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-surface-sunken">
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {e.available === "busy" ? (
            <div className="flex items-center justify-between rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-4 py-3 text-sm">
              <span className="text-ink-900">Currently booked through next week.</span>
              <button className="text-xs text-brand-700 hover:underline">Join waitlist</button>
            </div>
          ) : null}

          <Section title="Bio">
            <p className="text-sm leading-relaxed text-ink-700">{e.bio}</p>
          </Section>

          <Section title="Performance metrics">
            <div className="grid grid-cols-3 gap-3">
              <Metric label="On-time" value={`${e.onTime}%`} />
              <Metric label="Revisions" value={`${e.revision}%`} hint="lower is better" />
              <Metric label="SLA" value={e.sla.replace("first review ", "")} />
            </div>
          </Section>

          <Section title="Portfolio samples">
            <div className="space-y-2">
              {e.samples.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5 text-sm"
                >
                  <span className="truncate text-ink-900">{s}</span>
                  <button className="text-xs text-brand-700 hover:underline">Open ↗</button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Recent reviews">
            <div className="space-y-3">
              {[
                { who: "Vellum & Bean", text: "Caught a structural issue our previous editor missed. Will book again." },
                { who: "Northwall Roasters", text: "Calm, fast turnarounds. Great taste for tone." },
              ].map((r) => (
                <div key={r.who} className="rounded-lg border border-line bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-900">{r.who}</span>
                    <div className="flex items-center gap-0.5 text-[10px] text-[color:var(--accent-gold)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-2.5 fill-current" strokeWidth={0} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{r.text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Pricing">
            <div className="rounded-lg border border-line bg-surface p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-700">Base rate</span>
                <span className="font-mono-num text-ink-900">${e.rate.toFixed(2)} / word</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Agency take-rate (22%)</span>
                <span className="font-mono-num">${(e.rate * 0.22).toFixed(3)} / word</span>
              </div>
              <div className="mt-2 border-t border-line pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Client price</span>
                <span className="font-mono-num text-ink-900">${(e.rate * 1.22).toFixed(2)} / word</span>
              </div>
            </div>
          </Section>
        </div>

        <div className="border-t border-line bg-surface px-6 py-4">
          {assigned ? (
            <div className="flex items-center justify-between rounded-lg bg-brand-100 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-brand-700">
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
                Assigned · task created in Review Queue
              </div>
              <a href="/review" className="text-xs text-brand-700 hover:underline">
                Open queue →
              </a>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
                Invite
              </button>
              <button
                onClick={() => setAssigned(true)}
                className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm text-paper hover:bg-ink-700"
              >
                Assign to task <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono-num mt-0.5 text-lg text-ink-900">{value}</div>
      {hint ? <div className="text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}