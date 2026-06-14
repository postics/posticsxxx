import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkle,
  Wand2,
  Type as TypeIcon,
  Link2,
  Eye,
  History,
  ChevronDown,
  Send,
  UserCheck,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Save,
  Loader2,
  Target,
  Globe2,
  Lock,
  X,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/features/shell/AppShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Decaf, reconsidered — Editor — Postics" },
      { name: "description", content: "Edit, review, and publish content." },
    ],
  }),
  component: EditorPage,
});

type Fork = "ai" | "human";
type Status = "draft" | "review" | "with-expert" | "approved" | "publishing" | "published";

function EditorPage() {
  const [fork, setFork] = useState<Fork>("human");
  const [status, setStatus] = useState<Status>("with-expert");
  const [showPublish, setShowPublish] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  return (
    <AppShell
      active="editor"
      breadcrumb={["Projects", "Vellum & Bean", "Editor", "Decaf, reconsidered"]}
    >
      <EditorHeader fork={fork} setFork={setFork} status={status} onPublish={() => setShowPublish(true)} />
      <Toolbar />

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_360px]">
        <EditorPane status={status} showDiff={showDiff && fork === "human"} onCloseDiff={() => setShowDiff(false)} />
        <ContextPanel fork={fork} status={status} setStatus={setStatus} />
      </div>

      {showPublish && <PublishModal onClose={() => setShowPublish(false)} onPublish={() => { setShowPublish(false); setStatus("publishing"); setTimeout(() => setStatus("published"), 1800); }} />}
    </AppShell>
  );
}

/* ───── Header ───── */

function EditorHeader({ fork, setFork, status, onPublish }: { fork: Fork; setFork: (f: Fork) => void; status: Status; onPublish: () => void }) {
  const steps: { id: Status; label: string }[] = fork === "ai"
    ? [{ id: "draft", label: "Draft" }, { id: "review", label: "Review" }, { id: "approved", label: "Approve & publish" }]
    : [{ id: "draft", label: "Draft" }, { id: "review", label: "Review" }, { id: "with-expert", label: "With expert" }, { id: "approved", label: "Approve & publish" }];
  const activeIndex = steps.findIndex((s) => s.id === status);

  return (
    <header className="sticky top-16 z-[5] border-b border-line bg-paper/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4 px-8 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Article</span>
            <span>·</span>
            <span className="font-mono-num">/journal/decaf-reconsidered</span>
            <span className="inline-flex items-center gap-1 text-[color:var(--success)]">
              <Save className="size-3" strokeWidth={1.5} /> Saved 12s ago
            </span>
          </div>
          <h1 className="font-display text-2xl text-ink-900">Decaf, reconsidered</h1>
        </div>

        <div className="flex items-center gap-2">
          <ForkToggle fork={fork} setFork={setFork} />
          <button className="postics-btn-secondary text-sm">
            <Eye className="size-4" strokeWidth={1.5} /> Preview
          </button>
          {fork === "human" && status !== "with-expert" && status !== "approved" && status !== "published" && (
            <button className="postics-btn-secondary text-sm">
              <UserCheck className="size-4" strokeWidth={1.5} /> Send to expert
            </button>
          )}
          <button
            onClick={onPublish}
            disabled={status === "publishing" || status === "published"}
            className="postics-btn-primary text-sm"
          >
            {status === "publishing" ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : status === "published" ? <CheckCircle2 className="size-4" strokeWidth={1.5} /> : <Send className="size-4" strokeWidth={1.5} />}
            {status === "publishing" ? "Publishing…" : status === "published" ? "Published" : "Approve & publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-8 pb-4">
        <Stepper steps={steps} active={activeIndex} />
        {status === "with-expert" && (
          <StatusChip tone="gold">
            With Maya R. · ETA 4h
          </StatusChip>
        )}
        {status === "published" && (
          <a href="#" className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline">
            View live <ArrowRight className="size-3" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </header>
  );
}

function ForkToggle({ fork, setFork }: { fork: Fork; setFork: (f: Fork) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5">
      <button
        onClick={() => setFork("ai")}
        className={cn("rounded-md px-2.5 py-1 text-xs", fork === "ai" ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken")}
      >
        AI only
      </button>
      <button
        onClick={() => setFork("human")}
        className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs", fork === "human" ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]" : "text-ink-700 hover:bg-surface-sunken")}
      >
        AI + expert
      </button>
    </div>
  );
}

function Stepper({ steps, active }: { steps: { id: string; label: string }[]; active: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1",
              i < active && "bg-brand-100 text-brand-700",
              i === active && "bg-ink-900 text-[color:var(--primary-foreground)]",
              i > active && "bg-surface text-muted-foreground border border-line",
            )}
          >
            <span className="font-mono-num text-[10px] opacity-70">{i + 1}</span>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground">→</span>}
        </li>
      ))}
    </ol>
  );
}

/* ───── Toolbar ───── */

function Toolbar() {
  const tools = [
    { icon: Sparkle, label: "Regenerate section", cost: 18 },
    { icon: Wand2, label: "Expand", cost: 12 },
    { icon: TypeIcon, label: "Rewrite tone", cost: 8 },
    { icon: Link2, label: "Insert internal links", cost: 5 },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-sunken/40 px-8 py-2">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">AI tools</span>
      <div className="h-4 w-px bg-line" />
      {tools.map((t) => (
        <button
          key={t.label}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-700 transition-colors hover:border-ink-700/30"
        >
          <t.icon className="size-3.5 text-brand-700" strokeWidth={1.5} />
          {t.label}
          <span className="font-mono-num rounded bg-surface-sunken px-1 py-px text-[10px] text-muted-foreground">
            −{t.cost}
          </span>
        </button>
      ))}
      <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-mono-num">3,240</span> credits left
      </div>
    </div>
  );
}

/* ───── Editor pane ───── */

function EditorPane({ status, showDiff, onCloseDiff }: { status: Status; showDiff: boolean; onCloseDiff: () => void }) {
  const locked = status === "with-expert";
  return (
    <div className="min-h-[640px] border-r border-line bg-paper">
      {locked && (
        <div className="flex items-center gap-2 border-b border-line bg-[color:var(--accent-gold-soft)]/40 px-8 py-2 text-xs text-ink-700">
          <Lock className="size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
          Heavy edits are locked while Maya R. is reviewing. Use the thread to leave notes.
        </div>
      )}

      {status === "publishing" && (
        <div className="flex items-center gap-2 border-b border-line bg-[#E2ECF3]/40 px-8 py-2 text-xs text-[color:var(--info)]">
          <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> Pushing to site via RankMath…
        </div>
      )}
      {status === "published" && (
        <div className="flex items-center gap-2 border-b border-line bg-brand-100 px-8 py-2 text-xs text-brand-700">
          <CheckCircle2 className="size-3.5" strokeWidth={1.5} /> Published to vellumandbean.postics.site · 11s ago
        </div>
      )}

      <article className="mx-auto max-w-[720px] px-8 py-10">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Journal · Sourcing</div>
        <h1 className="mt-2 font-display text-4xl leading-tight text-ink-900">
          Decaf, reconsidered
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          A short defense of a coffee category that deserves more shelf space — and what
          process choice actually means for the cup.
        </p>

        <div className="mt-8 space-y-5 text-[15px] leading-[1.75] text-ink-900">
          <p>
            For most of its modern life, decaf has carried the quiet stigma of a
            compromise. {showDiff ? (
              <>
                <span className="rounded bg-[color:var(--danger)]/10 px-1 line-through decoration-[color:var(--danger)]/60">
                  But that's about to change.
                </span>{" "}
                <span className="rounded bg-brand-100 px-1 text-brand-700">
                  That assumption hasn't kept up with the past decade of processing work.
                </span>
              </>
            ) : (
              "That assumption hasn't kept up with the past decade of processing work."
            )}
          </p>
          <p>
            The Swiss Water method, sugarcane EA, and the newer enzymatic
            approaches all preserve substantially more of the original cup than the
            solvent-heavy techniques that defined the 1980s.{" "}
            {showDiff && (
              <span className="rounded bg-brand-100 px-1 text-brand-700">
                In side-by-side cuppings at our lab, the gap to a comparable
                caffeinated lot is now measured in single points, not full grades.
              </span>
            )}
          </p>

          <h2 className="!font-display !mt-8 text-2xl text-ink-900">Why we're offering more of it</h2>
          <p>
            Roughly one in five of our wholesale partners now asks for a serious
            decaf option — not a token SKU, but a single-origin lot they're proud
            to brew. The volume isn't huge. The intent is.
          </p>

          <h2 className="!font-display !mt-8 text-2xl text-ink-900">A note on process</h2>
          <p>
            We default to Swiss Water for transparency; sugarcane EA shows up when
            the origin profile rewards a softer, sweeter expression. We label
            both, always.
          </p>
        </div>

        {showDiff && (
          <div className="mt-8 flex items-start gap-3 rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 p-4">
            <Pencil className="mt-0.5 size-4 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
            <div className="flex-1 text-sm text-ink-700">
              <div className="font-medium text-ink-900">Maya's edits (2 changes)</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Softened the opening claim, added a concrete data point from your lab.
              </div>
            </div>
            <button onClick={onCloseDiff} className="grid size-7 place-items-center rounded-md hover:bg-surface">
              <X className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </article>
    </div>
  );
}

/* ───── Right context panel ───── */

function ContextPanel({ fork, status, setStatus }: { fork: Fork; status: Status; setStatus: (s: Status) => void }) {
  return (
    <aside className="space-y-4 bg-surface-sunken/30 p-5">
      <SeoCard />
      <KeywordsCard />
      <MetaCard />
      <GeoCard />
      {fork === "human" && <ExpertThread status={status} setStatus={setStatus} />}
      <PreviewCard />
      <HistoryCard />
    </aside>
  );
}

function SeoCard() {
  const score = 78;
  const checks = [
    { label: "Keyword in title", ok: true },
    { label: "Meta description 142/160", ok: true },
    { label: "Internal links (3)", ok: true },
    { label: "FAQ schema present", ok: false },
    { label: "Image alt text", ok: false },
  ];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">RankMath SEO</div>
        <div className="flex items-center gap-2">
          <span className="font-mono-num text-lg text-ink-900">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full rounded-full bg-brand-700" style={{ width: `${score}%` }} />
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            {c.ok ? <CheckCircle2 className="size-3.5 text-[color:var(--success)]" strokeWidth={1.5} /> : <AlertTriangle className="size-3.5 text-[color:var(--warning)]" strokeWidth={1.5} />}
            <span className={cn(c.ok ? "text-ink-700" : "text-muted-foreground")}>{c.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function KeywordsCard() {
  const kws = [
    { word: "decaf coffee process", primary: true, vol: "1.9k" },
    { word: "swiss water decaf", primary: false, vol: "720" },
    { word: "sugarcane ea decaf", primary: false, vol: "210" },
  ];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <Target className="size-3.5" strokeWidth={1.5} /> Target keywords
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {kws.map((k) => (
          <li key={k.word} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {k.primary && <span className="size-1.5 rounded-full bg-brand-700" />}
              <span className="text-ink-900">{k.word}</span>
            </span>
            <span className="font-mono-num text-muted-foreground">{k.vol}/mo</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MetaCard() {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Meta</div>
      <div className="mt-2 space-y-2">
        <input className="postics-input text-xs" defaultValue="Decaf, reconsidered — Vellum & Bean" />
        <textarea className="postics-input min-h-[64px] text-xs" defaultValue="Why modern decaf processing earns shelf space in any specialty lineup — and how we pick lots." />
        <div className="font-mono-num text-[10px] text-muted-foreground">142/160 chars</div>
      </div>
    </Card>
  );
}

function GeoCard() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">GEO readiness</div>
        <StatusChip tone="live">Ready</StatusChip>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Structured data, citable claims, and clear authorship — content is indexable by AI overviews.
      </p>
    </Card>
  );
}

function ExpertThread({ status, setStatus }: { status: Status; setStatus: (s: Status) => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-gold-soft)] font-display text-[11px] text-[color:var(--accent-gold)]">
            MR
          </div>
          <div>
            <div className="text-xs font-medium text-ink-900">Maya Reyes</div>
            <div className="text-[10px] text-muted-foreground">Coffee editor · verified</div>
          </div>
        </div>
        <span className="font-mono-num text-[10px] text-muted-foreground">ETA 4h</span>
      </div>
      <ul className="mt-3 space-y-2 text-xs">
        <li className="rounded-md bg-surface-sunken/60 p-2 text-ink-700">
          Softened the lede — the original felt a bit advert-y. Added the cupping data point you mentioned in the brief.
        </li>
        <li className="rounded-md border border-line p-2 text-ink-700">
          Should we mention the EA partner by name? Or keep it generic for now?
        </li>
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input className="postics-input text-xs" placeholder="Reply to Maya…" />
        <button className="grid size-9 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-500">
          <MessageSquare className="size-4" strokeWidth={1.5} />
        </button>
      </div>
      {status === "with-expert" && (
        <button onClick={() => setStatus("approved")} className="postics-btn-secondary mt-3 w-full justify-center text-xs">
          Accept edits & take back control
        </button>
      )}
    </Card>
  );
}

function PreviewCard() {
  const [device, setDevice] = useState<"d" | "m">("d");
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">As on site</div>
        <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
          <button onClick={() => setDevice("d")} className={cn("grid size-6 place-items-center rounded", device === "d" && "bg-brand-100 text-brand-700")}>
            <Monitor className="size-3.5" strokeWidth={1.5} />
          </button>
          <button onClick={() => setDevice("m")} className={cn("grid size-6 place-items-center rounded", device === "m" && "bg-brand-100 text-brand-700")}>
            <Smartphone className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className={cn("mt-3 mx-auto rounded-md border border-line bg-paper p-3", device === "m" ? "w-[140px]" : "w-full")}>
        <div className="font-display text-[10px] leading-tight text-ink-900">Decaf, reconsidered</div>
        <div className="mt-1 space-y-1">
          <div className="h-1 w-full rounded bg-ink-900/15" />
          <div className="h-1 w-5/6 rounded bg-ink-900/10" />
          <div className="h-1 w-2/3 rounded bg-ink-900/10" />
        </div>
      </div>
    </Card>
  );
}

function HistoryCard() {
  const entries = [
    { who: "Maya R.", what: "edited intro", when: "1h 24m" },
    { who: "AI", what: "regenerated section 2", when: "3h" },
    { who: "Eliza M.", what: "created draft", when: "Yesterday" },
  ];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <History className="size-3.5" strokeWidth={1.5} /> Version history
      </div>
      <ul className="mt-3 space-y-2 text-xs">
        {entries.map((e, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="text-ink-700"><span className="font-medium text-ink-900">{e.who}</span> {e.what}</span>
            <span className="font-mono-num text-muted-foreground">{e.when}</span>
          </li>
        ))}
      </ul>
      <button className="mt-3 inline-flex items-center gap-1 text-xs text-brand-700 hover:underline">
        <RefreshCw className="size-3" strokeWidth={1.5} /> Restore previous
      </button>
    </Card>
  );
}

/* ───── Publish modal ───── */

function PublishModal({ onClose, onPublish }: { onClose: () => void; onPublish: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-2xl animate-rise">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Publish</div>
            <h3 className="font-display text-xl text-ink-900">Decaf, reconsidered</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-surface-sunken">
            <X className="size-4 text-ink-700" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Channels</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-md border border-brand-700/30 bg-brand-100 px-3 py-2 text-sm text-brand-700">
                <input type="checkbox" defaultChecked className="accent-[color:var(--brand-700)]" />
                <Globe2 className="size-4" strokeWidth={1.5} /> Site · vellumandbean.postics.site
              </label>
              <label className="flex cursor-not-allowed items-center gap-2 rounded-md border border-dashed border-line bg-surface-sunken/60 px-3 py-2 text-sm text-muted-foreground">
                <Lock className="size-3.5" strokeWidth={1.5} /> Social (queue best-effort)
                <span className="ml-auto text-[10px]">Awaiting audit</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">When</div>
              <select className="postics-input text-sm">
                <option>Publish now</option>
                <option>Tomorrow, 10:00</option>
                <option>Schedule…</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Slug</div>
              <input className="postics-input text-sm font-mono-num" defaultValue="/journal/decaf-reconsidered" />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-700">Publish cost</span>
              <span className="font-mono-num text-ink-900">−24 credits</span>
            </div>
            <div className="font-mono-num mt-1 text-xs text-muted-foreground">3,216 remaining after publish</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="postics-btn-ghost text-sm">Cancel</button>
          <button onClick={onPublish} className="postics-btn-primary text-sm">
            <Send className="size-4" strokeWidth={1.5} /> Confirm & publish
          </button>
        </div>
      </div>
    </div>
  );
}