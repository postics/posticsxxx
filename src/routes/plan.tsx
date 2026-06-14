import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  LayoutGrid,
  Sparkle,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Globe2,
  Twitter,
  Instagram,
  Linkedin,
  X,
  Check,
  Loader2,
  Wand2,
  User2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/features/shell/AppShell";
import { Card, SectionTitle, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Content Plan — Vellum & Bean" },
      { name: "description", content: "Plan and orchestrate the content pipeline." },
    ],
  }),
  component: PlanPage,
});

type Status = "idea" | "draft" | "review" | "approved" | "published";
type Channel = "site" | "x" | "ig" | "in";
type Kind = "article" | "social" | "cluster";

interface Item {
  id: string;
  title: string;
  kind: Kind;
  status: Status;
  channel: Channel;
  assignee: { name: string; type: "ai" | "expert" };
  keyword: string;
  day: number; // 1..30
  locked?: boolean;
}

const ITEMS: Item[] = [
  { id: "1", title: "Roast curves explained", kind: "article", status: "review", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "roast curve guide", day: 3 },
  { id: "2", title: "Cupping protocol, working draft", kind: "article", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "coffee cupping", day: 4 },
  { id: "3", title: "Decaf, reconsidered", kind: "article", status: "approved", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "decaf coffee process", day: 9 },
  { id: "4", title: "Thread: why we weigh shots", kind: "social", status: "idea", channel: "x", assignee: { name: "AI", type: "ai" }, keyword: "espresso ratio", day: 9, locked: true },
  { id: "5", title: "Origin spotlight: Yirgacheffe", kind: "article", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "yirgacheffe coffee", day: 11 },
  { id: "6", title: "Wholesale price sheet update", kind: "article", status: "review", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "wholesale coffee bag", day: 14 },
  { id: "7", title: "Filter vs. pressure", kind: "article", status: "published", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "filter coffee", day: 17 },
  { id: "8", title: "Carousel: cupping at home", kind: "social", status: "idea", channel: "ig", assignee: { name: "AI", type: "ai" }, keyword: "home cupping", day: 18, locked: true },
  { id: "9", title: "Cluster: brewing fundamentals", kind: "cluster", status: "approved", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "brewing guide", day: 21 },
  { id: "10", title: "On provenance and patience", kind: "article", status: "published", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "small batch coffee", day: 23 },
  { id: "11", title: "Wholesale partner case", kind: "article", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "coffee wholesale case", day: 25 },
  { id: "12", title: "LinkedIn: hiring a head roaster", kind: "social", status: "idea", channel: "in", assignee: { name: "AI", type: "ai" }, keyword: "specialty hiring", day: 28, locked: true },
];

function PlanPage() {
  const [view, setView] = useState<"calendar" | "board">("calendar");
  const [showGenerate, setShowGenerate] = useState(false);
  const empty = false;

  return (
    <AppShell active="plan" breadcrumb={["Projects", "Vellum & Bean", "Content Plan"]}>
      <div className="mx-auto max-w-[1400px] space-y-6 px-8 py-8 animate-rise">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Editorial pipeline"
            title="June 2026"
            hint="Plan, schedule, and approve the next four weeks of content."
          />
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <button className="postics-btn-ghost text-sm">
              <Filter className="size-4" strokeWidth={1.5} /> Filters
            </button>
            <button className="postics-btn-secondary text-sm">
              <Plus className="size-4" strokeWidth={1.5} /> Add item
            </button>
            <button onClick={() => setShowGenerate(true)} className="postics-btn-primary text-sm">
              <Sparkle className="size-4" strokeWidth={1.5} /> Generate monthly plan
            </button>
          </div>
        </div>

        <FiltersBar />

        {empty ? <EmptyState onGenerate={() => setShowGenerate(true)} /> : view === "calendar" ? <CalendarView /> : <BoardView />}

        <Legend />
      </div>

      {showGenerate && <GeneratePanel onClose={() => setShowGenerate(false)} />}
    </AppShell>
  );
}

function ViewToggle({ value, onChange }: { value: "calendar" | "board"; onChange: (v: "calendar" | "board") => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5">
      {[
        { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
        { id: "board" as const, label: "Board", icon: LayoutGrid },
      ].map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            value === o.id ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
          )}
        >
          <o.icon className="size-3.5" strokeWidth={1.5} /> {o.label}
        </button>
      ))}
    </div>
  );
}

function FiltersBar() {
  const chips = [
    { label: "All status", n: 12 },
    { label: "Site", n: 9 },
    { label: "Social", n: 3 },
    { label: "AI", n: 9 },
    { label: "Experts", n: 3 },
    { label: "Cluster: brewing", n: 4 },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <button
          key={c.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
            i === 0 ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
          )}
        >
          {c.label}
          <span className="font-mono-num text-[10px] text-muted-foreground">{c.n}</span>
        </button>
      ))}
    </div>
  );
}

/* ───── Calendar view ───── */

function CalendarView() {
  const days = Array.from({ length: 35 }, (_, i) => i - 5 + 1); // pad start with 5
  const monthDays = days.map((d) => (d < 1 || d > 30 ? null : d));
  const today = 14;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-1">
          <button className="grid size-8 place-items-center rounded-md hover:bg-surface-sunken">
            <ChevronLeft className="size-4 text-ink-700" strokeWidth={1.5} />
          </button>
          <button className="grid size-8 place-items-center rounded-md hover:bg-surface-sunken">
            <ChevronRight className="size-4 text-ink-700" strokeWidth={1.5} />
          </button>
          <button className="postics-btn-ghost text-xs ml-1">Today</button>
        </div>
        <div className="font-display text-lg text-ink-900">June 2026</div>
        <div className="text-xs text-muted-foreground font-mono-num">12 planned · 2 published</div>
      </div>
      <div className="grid grid-cols-7 border-b border-line bg-surface-sunken/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-3 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day, idx) => {
          const items = day ? ITEMS.filter((it) => it.day === day) : [];
          return (
            <div
              key={idx}
              className={cn(
                "min-h-[120px] border-b border-r border-line p-2",
                !day && "bg-surface-sunken/30",
                day === today && "bg-brand-100/30",
              )}
            >
              {day && (
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono-num text-xs",
                      day === today ? "rounded-md bg-brand-700 px-1.5 py-0.5 text-[color:var(--primary-foreground)]" : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {items.map((it) => (
                  <ContentChip key={it.id} item={it} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ContentChip({ item }: { item: Item }) {
  const StatusTone: Record<Status, "neutral" | "info" | "warn" | "live" | "preview"> = {
    idea: "neutral",
    draft: "info",
    review: "warn",
    approved: "preview",
    published: "live",
  };
  const ChannelIcon = item.channel === "site" ? Globe2 : item.channel === "x" ? Twitter : item.channel === "ig" ? Instagram : Linkedin;
  return (
    <div
      className={cn(
        "group cursor-grab rounded-md border border-line bg-surface p-1.5 text-[11px] leading-tight transition-shadow hover:shadow-sm",
        item.locked && "border-dashed bg-surface-sunken/60 opacity-80",
      )}
      title={item.locked ? "Pending platform audit — site publishing works now" : item.title}
    >
      <div className="flex items-center gap-1.5">
        {item.locked ? (
          <Lock className="size-3 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <ChannelIcon className="size-3 text-muted-foreground" strokeWidth={1.5} />
        )}
        <span className="truncate font-medium text-ink-900">{item.title}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span
          className={cn(
            "rounded px-1 py-px text-[9px] uppercase tracking-wider",
            StatusTone[item.status] === "live" && "bg-brand-100 text-brand-700",
            StatusTone[item.status] === "warn" && "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)]",
            StatusTone[item.status] === "info" && "bg-[#E2ECF3] text-[color:var(--info)]",
            StatusTone[item.status] === "preview" && "bg-surface-sunken text-ink-700",
            StatusTone[item.status] === "neutral" && "bg-surface-sunken text-muted-foreground",
          )}
        >
          {item.status}
        </span>
        <span
          className={cn(
            "grid size-4 place-items-center rounded-full text-[8px] font-medium",
            item.assignee.type === "ai" ? "bg-brand-100 text-brand-700" : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
          )}
          title={item.assignee.name}
        >
          {item.assignee.type === "ai" ? "AI" : item.assignee.name[0]}
        </span>
      </div>
    </div>
  );
}

/* ───── Board view ───── */

function BoardView() {
  const columns: { id: Status; label: string }[] = [
    { id: "idea", label: "Idea" },
    { id: "draft", label: "Draft" },
    { id: "review", label: "Review" },
    { id: "approved", label: "Approved" },
    { id: "published", label: "Published" },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {columns.map((col) => {
        const items = ITEMS.filter((i) => i.status === col.id);
        return (
          <div key={col.id} className="rounded-xl border border-line bg-surface-sunken/40 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-700">
                {col.label}
              </span>
              <span className="font-mono-num text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((it) => <BoardCard key={it.id} item={it} />)}
              <button className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-xs text-muted-foreground hover:bg-surface">
                <Plus className="size-3" strokeWidth={1.5} /> Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({ item }: { item: Item }) {
  const ChannelIcon = item.channel === "site" ? Globe2 : item.channel === "x" ? Twitter : item.channel === "ig" ? Instagram : Linkedin;
  return (
    <div className={cn("rounded-lg border border-line bg-surface p-3 transition-shadow hover:shadow-sm", item.locked && "border-dashed opacity-80")}>
      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{item.kind}</span>
        {item.locked ? <Lock className="size-3" strokeWidth={1.5} /> : <ChannelIcon className="size-3" strokeWidth={1.5} />}
      </div>
      <div className="font-display text-sm leading-snug text-ink-900">{item.title}</div>
      <div className="font-mono-num mt-1 text-[10px] text-muted-foreground">/ {item.keyword}</div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Jun {item.day}</span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full text-[9px] font-medium",
            item.assignee.type === "ai" ? "bg-brand-100 text-brand-700" : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
          )}
        >
          {item.assignee.type === "ai" ? "AI" : item.assignee.name[0]}
        </span>
      </div>
    </div>
  );
}

/* ───── Empty + Generate panel ───── */

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <Card className="grid place-items-center p-16 text-center">
      <CalendarDays className="size-10 text-muted-foreground" strokeWidth={1.25} />
      <h3 className="mt-4 font-display text-2xl text-ink-900">No content planned yet</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Generate a full month in one pass. We'll group topics by pillar, balance channels, and respect your publishing cadence.
      </p>
      <button onClick={onGenerate} className="postics-btn-primary mt-6">
        <Sparkle className="size-4" strokeWidth={1.5} /> Generate monthly plan
      </button>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <span>Templates:</span>
        {["Specialty coffee · 12/mo", "B2B SaaS · 8/mo", "Local services · 6/mo"].map((t) => (
          <span key={t} className="rounded-md border border-line bg-surface px-2 py-1">{t}</span>
        ))}
      </div>
    </Card>
  );
}

function GeneratePanel({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"config" | "loading" | "review">("config");
  const pillars = [
    { name: "Brewing fundamentals", count: 4, items: ["The bloom, explained", "Grind size matrix", "Water temp ranges", "Pressure vs immersion"] },
    { name: "Origins & sourcing", count: 3, items: ["Yirgacheffe spotlight", "Why we buy direct", "What 'natural process' really means"] },
    { name: "Wholesale & B2B", count: 3, items: ["Picking a wholesale partner", "Bag sizing for cafés", "Roast schedule for restaurants"] },
    { name: "Brand & culture", count: 2, items: ["Hiring a head roaster", "Inside our cupping lab"] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <button onClick={onClose} className="flex-1 bg-ink-900/40 backdrop-blur-sm" aria-label="Close" />
      <aside className="flex h-full w-full max-w-[640px] flex-col border-l border-line bg-paper shadow-2xl animate-rise">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">AI plan generator</div>
            <h3 className="font-display text-xl text-ink-900">Monthly plan · July 2026</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-surface-sunken">
            <X className="size-4 text-ink-700" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {stage === "config" && (
            <div className="space-y-5">
              <Field label="Cadence">
                <div className="flex gap-2">
                  {["3/week", "2/week", "1/week"].map((c, i) => (
                    <button key={c} className={cn("rounded-md border px-3 py-1.5 text-sm", i === 0 ? "border-brand-700/40 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700")}>{c}</button>
                  ))}
                </div>
              </Field>
              <Field label="Goals">
                <div className="flex flex-wrap gap-2">
                  {["Organic traffic", "Wholesale leads", "Brand depth", "Local SEO"].map((g, i) => (
                    <label key={g} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm", i < 2 ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700")}>
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only" /> {g}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Channels">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-700/30 bg-brand-100 px-3 py-1.5 text-sm text-brand-700">
                    <Globe2 className="size-3.5" strokeWidth={1.5} /> Site
                  </span>
                  {[Twitter, Instagram, Linkedin].map((I, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line bg-surface-sunken/60 px-3 py-1.5 text-sm text-muted-foreground">
                      <Lock className="size-3" strokeWidth={1.5} /> <I className="size-3.5" strokeWidth={1.5} />
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Social channels are awaiting platform audit. We'll prepare drafts; you can publish once unlocked.</p>
              </Field>
              <Field label="Estimated cost">
                <div className="rounded-lg border border-line bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-700">12 articles + 4 social drafts</span>
                    <span className="font-mono-num text-ink-900">≈ 1,840 credits</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full w-[55%] rounded-full bg-brand-700" />
                  </div>
                  <div className="font-mono-num mt-2 text-xs text-muted-foreground">After: 1,400 of 10,000 remaining this month</div>
                </div>
              </Field>
            </div>
          )}

          {stage === "loading" && (
            <div className="grid place-items-center gap-3 py-20 text-center">
              <Loader2 className="size-8 animate-spin text-brand-700" strokeWidth={1.5} />
              <div className="font-display text-lg text-ink-900">Drafting your July plan…</div>
              <div className="font-mono-num text-xs text-muted-foreground">clustering keywords · balancing pillars · checking calendar</div>
            </div>
          )}

          {stage === "review" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                We grouped 12 topics into 4 pillars. Edit any line, then approve to drop them on the calendar.
              </p>
              {pillars.map((p) => (
                <div key={p.name} className="rounded-xl border border-line bg-surface">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <div className="font-display text-sm text-ink-900">{p.name}</div>
                    <span className="font-mono-num text-xs text-muted-foreground">{p.count} items</span>
                  </div>
                  <ul className="divide-y divide-line">
                    {p.items.map((t) => (
                      <li key={t} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <Check className="size-4 text-brand-700" strokeWidth={1.5} />
                        <span className="flex-1 text-ink-900">{t}</span>
                        <button className="text-xs text-muted-foreground hover:text-ink-900">edit</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-line px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {stage === "config" && "Cost: ≈ 1,840 credits"}
            {stage === "loading" && "Hang tight…"}
            {stage === "review" && "12 items ready"}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="postics-btn-ghost text-sm">Cancel</button>
            {stage === "config" && (
              <button onClick={() => { setStage("loading"); setTimeout(() => setStage("review"), 1400); }} className="postics-btn-primary text-sm">
                <Wand2 className="size-4" strokeWidth={1.5} /> Generate
              </button>
            )}
            {stage === "review" && (
              <button onClick={onClose} className="postics-btn-primary text-sm">
                <Check className="size-4" strokeWidth={1.5} /> Approve & schedule
              </button>
            )}
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line bg-surface-sunken/40 px-4 py-3 text-xs text-muted-foreground">
      <Lock className="size-3.5" strokeWidth={1.5} />
      <span>Dashed slots are social posts awaiting platform audit — site publishing works now.</span>
      <span className="ml-auto inline-flex items-center gap-2">
        <span className="grid size-4 place-items-center rounded-full bg-brand-100 text-[8px] font-medium text-brand-700">AI</span>
        AI agent
        <span className="grid size-4 place-items-center rounded-full bg-[color:var(--accent-gold-soft)] text-[8px] font-medium text-[color:var(--accent-gold)]">
          <User2 className="size-2.5" strokeWidth={2} />
        </span>
        Human expert
      </span>
    </div>
  );
}