import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Lock,
  AlertTriangle,
  Plug,
  RefreshCw,
  Globe2,
  Instagram,
  Linkedin,
  Facebook,
  Save,
  Calendar,
  Receipt,
  ArrowRight,
  Download,
  ShieldCheck,
  Info,
  Copy,
  Check,
  ShoppingBag,
  Webhook,
  ShieldOff,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Project settings — Postics" }] }),
  component: SettingsPage,
});

type Tab = "connection" | "channels" | "brand" | "cadence" | "billing";
const TABS: { id: Tab; label: string }[] = [
  { id: "connection", label: "Connection" },
  { id: "channels", label: "Channels" },
  { id: "brand", label: "Brand profile" },
  { id: "cadence", label: "Cadence" },
  { id: "billing", label: "Plan & credits" },
];

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("connection");
  const [saved, setSaved] = useState(false);
  const { currentProject } = useScope();

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <ProjectShell active="settings" breadcrumb={["Settings"]}>
      <div className="mx-auto w-full max-w-7xl px-8 py-8 space-y-6">
        <header className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Project · {currentProject.name}
          </div>
          <h1 className="font-display text-3xl text-ink-900">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Everything specific to this brand — site, channels, voice, cadence, and credits.
          </p>
        </header>

        <div className="flex items-end justify-between border-b border-line">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative -mb-px px-3 py-2.5 text-sm transition-colors",
                  tab === t.id
                    ? "text-ink-900"
                    : "text-muted-foreground hover:text-ink-700",
                )}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink-900" />
                )}
              </button>
            ))}
          </div>
          {saved && (
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs text-[color:var(--success)]">
              <CheckCircle2 className="size-3.5" strokeWidth={1.5} /> Saved
            </div>
          )}
        </div>

        {tab === "connection" && <ConnectionTab onSave={flashSaved} />}
        {tab === "channels" && <ChannelsTab onSave={flashSaved} />}
        {tab === "brand" && <BrandTab onSave={flashSaved} />}
        {tab === "cadence" && <CadenceTab onSave={flashSaved} />}
        {tab === "billing" && <BillingTab />}
      </div>
    </ProjectShell>
  );
}

/* ───────── Connection ───────── */

function ConnectionTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-5">
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="size-4 text-brand-700" strokeWidth={1.5} />
                <div className="text-sm font-medium text-ink-900">WordPress site</div>
                <StatusChip tone="live">Connected</StatusChip>
              </div>
              <div className="font-mono-num mt-1 text-xs text-muted-foreground">
                vellumandbean.com · paired 14 Mar
              </div>
            </div>
            <a className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline" href="#">
              Open site <ExternalLink className="size-3" strokeWidth={1.5} />
            </a>
          </div>

          <div className="mt-4 space-y-2.5 text-sm">
            <Row label="Application password" value="**** **** **** xK9p" action="Rotate" />
            <Row label="HMAC handshake" value="OK · 2025-06-12 09:14 UTC" tone="ok" />
            <Row label="Last healthcheck" value="240 ms · 2 min ago" tone="ok" action="Re-run" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-medium text-ink-900">RankMath endpoint</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Postics pushes published content + SEO meta through your custom RankMath endpoint.
          </p>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              defaultValue="https://vellumandbean.com/wp-json/postics/v1/publish"
              className="font-mono-num rounded-lg border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-ink-700/30"
            />
            <button onClick={onSave} className="rounded-lg bg-ink-900 px-3 py-2 text-xs text-[color:var(--primary-foreground)] hover:bg-ink-700">
              Save
            </button>
          </div>
        </Card>

        {/* LetoLab service lead (small, secondary) */}
        <Card className="border-dashed bg-surface-sunken/40 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-8 place-items-center rounded-md bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
              <Wand2 className="size-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-ink-900">No site yet?</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                LetoLab can build a simple, fast-publishing site for you. Separate service — not bundled.
              </p>
              <button className="mt-2 inline-flex items-center gap-1 text-xs text-brand-700 hover:underline">
                Talk to LetoLab <ArrowRight className="size-3" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          As on site
        </div>
        <BrowserFrame url="vellumandbean.com/journal">
          <div className="px-6 py-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Journal</div>
            <div className="font-display mt-1 text-lg text-ink-900">Decaf, reconsidered</div>
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-ink-900/10" />
              <div className="h-1.5 w-5/6 rounded bg-ink-900/10" />
              <div className="h-1.5 w-3/4 rounded bg-ink-900/10" />
            </div>
          </div>
        </BrowserFrame>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  action,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line py-2 first:border-t-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-3">
        <span className={cn("font-mono-num text-xs", tone === "ok" ? "text-[color:var(--success)]" : "text-ink-700")}>
          {value}
        </span>
        {action && (
          <button className="text-xs text-brand-700 hover:underline">{action}</button>
        )}
      </div>
    </div>
  );
}

/* ───────── Channels ───────── */

function ChannelsTab({ onSave }: { onSave: () => void }) {
  const channels = [
    { id: "site", label: "Your site (WordPress)", status: "live" as const, note: "Publishing now", icon: Globe2, connected: true, locked: false },
    { id: "ig", label: "Instagram", status: "gold" as const, note: "Best-effort · pending platform audit", icon: Instagram, connected: true, locked: true },
    { id: "li", label: "LinkedIn", status: "gold" as const, note: "Best-effort · pending platform audit", icon: Linkedin, connected: true, locked: true },
    { id: "fb", label: "Facebook", status: "neutral" as const, note: "Not connected", icon: Facebook, connected: false, locked: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-sunken/40 px-4 py-2.5 text-xs text-muted-foreground">
        <Info className="size-3.5" strokeWidth={1.5} />
        Site publishing is fully supported. Social channels are best-effort while platform audits complete — we surface that honestly here.
      </div>
      {channels.map((c) => (
        <Card key={c.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md border border-line bg-surface-sunken text-ink-700">
              <c.icon className="size-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-ink-900">{c.label}</div>
                <StatusChip tone={c.status}>{c.connected ? (c.locked ? "Audit pending" : "Live") : "Disconnected"}</StatusChip>
                {c.locked && c.connected && (
                  <span title="Posting via Ayrshare is queued and best-effort while the platform audit completes.">
                    <Lock className="size-3 text-[color:var(--accent-gold)]" strokeWidth={1.75} />
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{c.note}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {c.connected ? (
              <button onClick={onSave} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30">
                Disconnect
              </button>
            ) : (
              <button onClick={onSave} className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs text-[color:var(--primary-foreground)] hover:bg-ink-700">
                Connect
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ───────── Brand profile ───────── */

function BrandTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-5">
      <div className="space-y-4">
        <Card className="space-y-4 p-5">
          <Field label="Brand voice">
            <textarea
              defaultValue="Warm, expert, never advert-y. Specialty coffee for café owners and curious home brewers."
              className="min-h-[80px] w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
            />
          </Field>
          <Field label="Audience">
            <input
              defaultValue="Wholesale buyers, café owners, home enthusiasts (PNW + EU)"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
            />
          </Field>
          <Field label="Target keyword clusters">
            <div className="flex flex-wrap gap-1.5">
              {["specialty coffee", "decaf process", "single-origin", "wholesale roastery", "pour-over"].map((k) => (
                <span key={k} className="rounded-md bg-surface-sunken px-2 py-0.5 text-xs text-ink-700">{k}</span>
              ))}
              <button className="rounded-md border border-dashed border-line px-2 py-0.5 text-xs text-muted-foreground hover:border-ink-700/30">+ add</button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Language">
              <select className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <option>English (US)</option>
                <option>English (UK)</option>
              </select>
            </Field>
            <Field label="Market">
              <select className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <option>United States</option>
                <option>Europe</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={onSave} className="postics-btn-primary text-sm">
              <Save className="size-4" strokeWidth={1.5} /> Save voice
            </button>
          </div>
        </Card>
      </div>
      <div className="space-y-3">
        <Card className="p-5">
          <div className="text-sm font-medium text-ink-900">Palette</div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {["#1E3A34", "#C9A24B", "#FAF8F4", "#14181F", "#E7E2D9"].map((c) => (
              <div key={c} className="space-y-1">
                <div className="h-12 rounded-lg border border-line" style={{ background: c }} />
                <div className="font-mono-num text-[10px] text-muted-foreground">{c}</div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-brand-700 hover:underline">Edit in Brand Kit ↗</button>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-ink-900">Logo</div>
          <div className="mt-3 grid h-24 place-items-center rounded-lg border border-dashed border-line bg-surface-sunken/40 font-display text-2xl text-ink-900">
            V&B
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

/* ───────── Cadence ───────── */

function CadenceTab({ onSave }: { onSave: () => void }) {
  const [autopub, setAutopub] = useState<"A" | "B">("B");
  const [perMonth, setPerMonth] = useState(12);
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-5">
      <Card className="space-y-5 p-5">
        <Field label={`Posts per month · ${perMonth}`}>
          <input
            type="range"
            min={2}
            max={30}
            value={perMonth}
            onChange={(e) => setPerMonth(Number(e.target.value))}
            className="w-full accent-[color:var(--brand-700)]"
          />
          <div className="font-mono-num flex justify-between text-[10px] text-muted-foreground">
            <span>2</span><span>30</span>
          </div>
        </Field>
        <Field label="Content mix">
          <div className="space-y-2">
            {[
              ["Long-form articles", 55],
              ["Product/SEO pages", 25],
              ["Social posts", 20],
            ].map(([label, val]) => (
              <div key={label as string} className="flex items-center gap-3 text-sm">
                <span className="w-40 text-ink-700">{label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${val}%` }} />
                </div>
                <span className="font-mono-num w-10 text-right text-xs text-muted-foreground">{val}%</span>
              </div>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Publishing days">
            <div className="flex gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <button
                  key={i}
                  className={cn(
                    "size-8 rounded-md border text-xs",
                    i < 5 ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-muted-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Time · Timezone">
            <div className="flex gap-2">
              <input defaultValue="09:30" className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
              <select className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </div>
          </Field>
        </div>
        <Field label="Blackout dates">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-ink-700">Dec 23 – Jan 2</span>
            <button className="text-xs text-brand-700 hover:underline">+ add range</button>
          </div>
        </Field>
        <div className="flex justify-end pt-2">
          <button onClick={onSave} className="postics-btn-primary text-sm">
            <Save className="size-4" strokeWidth={1.5} /> Save cadence
          </button>
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="text-sm font-medium text-ink-900">Auto-publish</div>
        <p className="text-xs text-muted-foreground">
          Choose what happens once content is generated.
        </p>
        <button
          onClick={() => setAutopub("A")}
          className={cn(
            "w-full rounded-xl border p-3 text-left transition-colors",
            autopub === "A" ? "border-brand-700/40 bg-brand-100/50" : "border-line bg-surface hover:border-ink-700/30",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-ink-900">Option A — AI only</div>
            <StatusChip tone="info">Publish on generate</StatusChip>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Drafts auto-publish straight to the site at the scheduled time.</p>
        </button>
        <button
          onClick={() => setAutopub("B")}
          className={cn(
            "w-full rounded-xl border p-3 text-left transition-colors",
            autopub === "B" ? "border-[color:var(--accent-gold)]/40 bg-[color:var(--accent-gold-soft)]/40" : "border-line bg-surface hover:border-ink-700/30",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-ink-900">Option Б — AI + approval</div>
            <StatusChip tone="gold">Publish on approve</StatusChip>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Each piece waits for human review before going live.</p>
        </button>
      </Card>
    </div>
  );
}

/* ───────── Plan & credits (LIGHT, Stripe-clean) ───────── */

function BillingTab() {
  const balance = 3240;
  const monthly = 5000;
  const used = monthly - balance;
  const pct = Math.round((used / monthly) * 100);
  const lowBalance = pct >= 65;

  const history = [
    { type: "Generate · article", credits: 320, when: "Today" },
    { type: "Human edit · expert", credits: 240, when: "Today" },
    { type: "Publish · site", credits: 96, when: "Yesterday" },
    { type: "Boost · refresh", credits: 180, when: "Yesterday" },
    { type: "Generate · product photos (×6)", credits: 840, when: "Mon" },
  ];

  const costs = [
    { action: "Article (1,500w)", credits: 180 },
    { action: "Section regenerate", credits: 18 },
    { action: "Product description", credits: 60 },
    { action: "Product photo", credits: 140 },
    { action: "Product video · budget", credits: 1200 },
    { action: "Product video · premium", credits: 3400 },
    { action: "Human edit · expert", credits: 240 },
    { action: "Publish to site", credits: 24 },
    { action: "Boost (refresh + expand)", credits: 220 },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        {/* Plan + credits */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Current plan
              </div>
              <div className="font-display mt-1 text-2xl text-ink-900">Growth</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Renews 12 Jul · 5,000 credits / mo · $189
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm text-white hover:bg-ink-700">
              Upgrade to Advanced <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-baseline justify-between">
              <div className="text-sm text-muted-foreground">Credits balance</div>
              <div className="font-mono-num text-3xl text-ink-900">{balance.toLocaleString()}</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cn("h-full rounded-full transition-all", lowBalance ? "bg-[color:var(--accent-gold)]" : "bg-brand-700")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-mono-num">{used.toLocaleString()} used · {balance.toLocaleString()} left</span>
              <span className="font-mono-num">depletes ~ 24 Jun at current pace</span>
            </div>

            {lowBalance && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 p-3 text-xs">
                <AlertTriangle className="mt-0.5 size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.75} />
                <div className="flex-1 text-ink-700">
                  <div className="font-medium text-ink-900">Heads up — you're at {pct}% this period.</div>
                  <p className="mt-0.5 text-muted-foreground">
                    Already-approved content will still publish. Top up or upgrade to keep generating new pieces.
                  </p>
                </div>
                <button className="rounded-md border border-line bg-white px-2.5 py-1 text-xs hover:border-ink-700/30">
                  Top up
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="text-sm font-medium text-ink-900">Usage by action</div>
              <div className="text-xs text-muted-foreground">This period</div>
            </div>
            <ul className="divide-y divide-line">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink-700">{h.type}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono-num text-muted-foreground">{h.when}</span>
                    <span className="font-mono-num text-ink-900">−{h.credits}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-ink-900">Top up & autopay</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-brand-700" strokeWidth={1.75} /> Card · Visa •• 4242
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1000, 2500, 5000].map((n) => (
                <button key={n} className="rounded-lg border border-line bg-white px-3 py-2 text-sm hover:border-ink-700/30">
                  <div className="font-mono-num text-base text-ink-900">+{n.toLocaleString()}</div>
                  <div className="font-mono-num text-[10px] text-muted-foreground">${Math.round(n / 25)}</div>
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-ink-700">
              <input type="checkbox" defaultChecked className="accent-[color:var(--brand-700)]" />
              Auto top-up 2,500 credits when balance drops below 500
            </label>
          </div>
        </div>

        {/* Cost table + invoices */}
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <div className="text-sm font-medium text-ink-900">Action cost</div>
              <div className="text-xs text-muted-foreground">In credits — not raw tokens. ToS-safe.</div>
            </div>
            <ul className="divide-y divide-line text-sm">
              {costs.map((c) => (
                <li key={c.action} className="flex items-center justify-between px-4 py-2">
                  <span className="text-ink-700">{c.action}</span>
                  <span className="font-mono-num text-ink-900">{c.credits}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Receipt className="size-4 text-muted-foreground" strokeWidth={1.5} /> Invoices
              </div>
              <button className="text-xs text-brand-700 hover:underline">View all</button>
            </div>
            <ul className="divide-y divide-line text-sm">
              {[
                ["Jun 2025", "$189.00", "Paid"],
                ["May 2025", "$189.00", "Paid"],
                ["Apr 2025", "$189.00", "Paid"],
              ].map(([m, amt, st]) => (
                <li key={m} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-ink-700">{m}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono-num text-ink-900">{amt}</span>
                    <span className="text-[11px] text-[color:var(--success)]">{st}</span>
                    <button className="text-muted-foreground hover:text-ink-700">
                      <Download className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// silence unused-imports if a state is not rendered
void Plug; void RefreshCw;
