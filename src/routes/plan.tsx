import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type DragEvent } from "react";
import {
  CalendarDays,
  LayoutGrid,
  Cpu,
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
  User2,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  FileText,
  ShoppingBag,
  MessageSquare,
  Layers,
  CalendarCheck,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";
import { Card, SectionTitle } from "@/features/shared/primitives";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Content Plan — Postics" },
      { name: "description", content: "Plan, schedule, and approve your full content pipeline." },
    ],
  }),
  component: PlanPage,
});

/* ───────────────────────── data model ───────────────────────── */

type Status = "idea" | "draft" | "review" | "approved" | "published";
type Channel = "site" | "x" | "ig" | "in";
type Kind =
  | "article"
  | "product_description"
  | "product_photo"
  | "product_video"
  | "social"
  | "cluster";

type Item = {
  id: string;
  title: string;
  kind: Kind;
  status: Status;
  channel: Channel;
  assignee: { name: string; type: "ai" | "expert" };
  keyword: string;
  cluster?: string;
  day: number; // 1..30
  locked?: boolean;
};

const KIND_META: Record<Kind, { label: string; icon: typeof FileText }> = {
  article: { label: "Article", icon: FileText },
  product_description: { label: "Product copy", icon: ShoppingBag },
  product_photo: { label: "Product photo", icon: ImageIcon },
  product_video: { label: "Product video", icon: Video },
  social: { label: "Social", icon: MessageSquare },
  cluster: { label: "Cluster", icon: Layers },
};

const STATUS_LABEL: Record<Status, string> = {
  idea: "Idea",
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  published: "Published",
};

const STATUS_TONE: Record<Status, string> = {
  idea: "bg-surface-sunken text-muted-foreground",
  draft: "bg-[#E2ECF3] text-[color:var(--info)]",
  review: "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)]",
  approved: "bg-surface-sunken text-ink-700",
  published: "bg-brand-100 text-brand-700",
};

const INITIAL_ITEMS: Item[] = [
  { id: "1", title: "Roast curves, explained", kind: "article", status: "review", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "roast curve guide", cluster: "Brewing", day: 3 },
  { id: "2", title: "Cupping protocol — working draft", kind: "article", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "coffee cupping", cluster: "Brewing", day: 4 },
  { id: "3", title: "Yirgacheffe, hero shot", kind: "product_photo", status: "approved", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "yirgacheffe bag", cluster: "Origins", day: 6 },
  { id: "4", title: "Decaf, reconsidered", kind: "article", status: "approved", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "decaf coffee process", cluster: "Origins", day: 9 },
  { id: "5", title: "Why we weigh shots", kind: "social", status: "idea", channel: "x", assignee: { name: "AI", type: "ai" }, keyword: "espresso ratio", cluster: "Brewing", day: 9, locked: true },
  { id: "6", title: "House blend — product copy", kind: "product_description", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "house blend", cluster: "Catalog", day: 11 },
  { id: "7", title: "Wholesale price sheet refresh", kind: "article", status: "review", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "wholesale coffee bag", cluster: "Wholesale", day: 14 },
  { id: "8", title: "Filter vs. pressure", kind: "article", status: "published", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "filter coffee", cluster: "Brewing", day: 17 },
  { id: "9", title: "Cupping at home — carousel", kind: "social", status: "idea", channel: "ig", assignee: { name: "AI", type: "ai" }, keyword: "home cupping", cluster: "Brewing", day: 18, locked: true },
  { id: "10", title: "V60 pour, 30s loop", kind: "product_video", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "v60 pour over", cluster: "Brewing", day: 19 },
  { id: "11", title: "Brewing fundamentals — cluster", kind: "cluster", status: "approved", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "brewing guide", cluster: "Brewing", day: 21 },
  { id: "12", title: "On provenance and patience", kind: "article", status: "published", channel: "site", assignee: { name: "Maya R.", type: "expert" }, keyword: "small batch coffee", cluster: "Origins", day: 23 },
  { id: "13", title: "Wholesale partner case study", kind: "article", status: "draft", channel: "site", assignee: { name: "AI", type: "ai" }, keyword: "wholesale coffee case", cluster: "Wholesale", day: 25 },
  { id: "14", title: "Hiring a head roaster", kind: "social", status: "idea", channel: "in", assignee: { name: "AI", type: "ai" }, keyword: "specialty hiring", cluster: "Brand", day: 28, locked: true },
];

/* ───────────────────────── page ───────────────────────── */

type ViewMode = "calendar" | "board";
type CalScale = "month" | "week";
type FilterKey = "status" | "channel" | "assignee" | "cluster" | "kind";

function PlanPage() {
  const { currentProject, credits } = useScope();
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [view, setView] = useState<ViewMode>("calendar");
  const [scale, setScale] = useState<CalScale>("month");
  const [showGenerate, setShowGenerate] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [conflict, setConflict] = useState<{ id: string; day: number } | null>(null);

  // Filters (light demo state)
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string | "all">>({
    status: "all",
    channel: "all",
    assignee: "all",
    cluster: "all",
    kind: "all",
  });

  const empty = items.length === 0;
  const creditsLow = credits.used / credits.total > 0.75;

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (activeFilters.status !== "all" && it.status !== activeFilters.status) return false;
      if (activeFilters.channel !== "all" && it.channel !== activeFilters.channel) return false;
      if (activeFilters.assignee !== "all" && it.assignee.type !== activeFilters.assignee) return false;
      if (activeFilters.cluster !== "all" && it.cluster !== activeFilters.cluster) return false;
      if (activeFilters.kind !== "all" && it.kind !== activeFilters.kind) return false;
      return true;
    });
  }, [items, activeFilters]);

  function moveItem(id: string, day: number) {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const taken = items.filter((i) => i.id !== id && i.day === day).length;
    // Demo conflict: more than 2 items already on that day
    if (taken >= 2) {
      setConflict({ id, day });
      return;
    }
    setConflict(null);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, day } : i)));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulk(action: "approve" | "schedule" | "assign") {
    setItems((prev) =>
      prev.map((i) => {
        if (!selected.has(i.id)) return i;
        if (action === "approve") return { ...i, status: "approved" };
        if (action === "schedule") return { ...i, status: "approved" };
        if (action === "assign") return { ...i, assignee: { name: "Maya R.", type: "expert" } };
        return i;
      }),
    );
    setSelected(new Set());
  }

  return (
    <ProjectShell active="plan" breadcrumb={["Content Plan"]}>
      <div className="mx-auto max-w-[1400px] space-y-6 px-8 py-8 animate-rise">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Editorial pipeline"
            title={`${monthLabel()} · ${currentProject.name}`}
            hint="Plan, schedule, and approve the whole content pipeline. Drag to reschedule."
          />
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            {view === "calendar" && (
              <ScaleToggle value={scale} onChange={setScale} />
            )}
            <button className="postics-btn-ghost text-sm">
              <Filter className="size-4" strokeWidth={1.5} /> Filters
            </button>
            <button className="postics-btn-secondary text-sm">
              <Plus className="size-4" strokeWidth={1.5} /> Add item
            </button>
            <button
              onClick={() => setShowGenerate(true)}
              className="postics-btn-primary text-sm"
            >
              <Cpu className="size-4" strokeWidth={1.5} /> Generate plan
            </button>
          </div>
        </div>

        {creditsLow && <CreditsBanner used={credits.used} total={credits.total} />}
        {conflict && (
          <ErrorBanner
            day={conflict.day}
            onDismiss={() => setConflict(null)}
          />
        )}

        <FiltersBar items={items} active={activeFilters} onChange={(k, v) => setActiveFilters((p) => ({ ...p, [k]: v }))} />

        {selected.size > 0 && (
          <BulkBar count={selected.size} onAction={bulk} onClear={() => setSelected(new Set())} />
        )}

        {empty ? (
          <EmptyState onGenerate={() => setShowGenerate(true)} />
        ) : view === "calendar" ? (
          <CalendarView
            items={filtered}
            scale={scale}
            onDropItem={moveItem}
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        ) : (
          <BoardView items={filtered} selected={selected} onToggleSelect={toggleSelect} />
        )}

        <Legend />
      </div>

      {showGenerate && <GeneratePanel onClose={() => setShowGenerate(false)} />}
    </ProjectShell>
  );
}

/* ───────────────────────── top controls ───────────────────────── */

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
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

function ScaleToggle({ value, onChange }: { value: CalScale; onChange: (v: CalScale) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5">
      {(["month", "week"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs uppercase tracking-wider transition-colors",
            value === s ? "bg-surface-sunken text-ink-900" : "text-muted-foreground hover:text-ink-700",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function FiltersBar({
  items,
  active,
  onChange,
}: {
  items: Item[];
  active: Record<FilterKey, string | "all">;
  onChange: (k: FilterKey, v: string | "all") => void;
}) {
  const count = (pred: (it: Item) => boolean) => items.filter(pred).length;

  const groups: { key: FilterKey; label: string; options: { v: string; l: string; n: number }[] }[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { v: "all", l: "All status", n: items.length },
        ...(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({ v: s, l: STATUS_LABEL[s], n: count((i) => i.status === s) })),
      ],
    },
    {
      key: "kind",
      label: "Type",
      options: [
        { v: "all", l: "All types", n: items.length },
        ...(Object.keys(KIND_META) as Kind[]).map((k) => ({ v: k, l: KIND_META[k].label, n: count((i) => i.kind === k) })),
      ],
    },
    {
      key: "channel",
      label: "Channel",
      options: [
        { v: "all", l: "All channels", n: items.length },
        { v: "site", l: "Site", n: count((i) => i.channel === "site") },
        { v: "x", l: "X", n: count((i) => i.channel === "x") },
        { v: "ig", l: "Instagram", n: count((i) => i.channel === "ig") },
        { v: "in", l: "LinkedIn", n: count((i) => i.channel === "in") },
      ],
    },
    {
      key: "assignee",
      label: "Assignee",
      options: [
        { v: "all", l: "Anyone", n: items.length },
        { v: "ai", l: "AI agent", n: count((i) => i.assignee.type === "ai") },
        { v: "expert", l: "Expert", n: count((i) => i.assignee.type === "expert") },
      ],
    },
    {
      key: "cluster",
      label: "Cluster",
      options: [
        { v: "all", l: "All clusters", n: items.length },
        ...Array.from(new Set(items.map((i) => i.cluster).filter(Boolean) as string[])).map((c) => ({
          v: c, l: c, n: count((i) => i.cluster === c),
        })),
      ],
    },
  ];

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {g.label}
          </span>
          {g.options.map((opt) => {
            const isActive = active[g.key] === opt.v;
            return (
              <button
                key={opt.v}
                onClick={() => onChange(g.key, opt.v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                  isActive
                    ? "border-brand-700/30 bg-brand-100 text-brand-700"
                    : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
                )}
              >
                {opt.l}
                <span className="font-mono-num text-[10px] text-muted-foreground">{opt.n}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BulkBar({
  count,
  onAction,
  onClear,
}: {
  count: number;
  onAction: (a: "approve" | "schedule" | "assign") => void;
  onClear: () => void;
}) {
  return (
    <div className="sticky top-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-brand-700/20 bg-brand-100/70 px-4 py-2.5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-brand-700">
        <CheckSquare className="size-4" strokeWidth={1.5} />
        <span className="font-mono-num">{count}</span> selected
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onAction("approve")} className="postics-btn-secondary text-xs">
          <Check className="size-3.5" strokeWidth={1.5} /> Approve
        </button>
        <button onClick={() => onAction("schedule")} className="postics-btn-secondary text-xs">
          <CalendarCheck className="size-3.5" strokeWidth={1.5} /> Schedule
        </button>
        <button onClick={() => onAction("assign")} className="postics-btn-secondary text-xs">
          <User2 className="size-3.5" strokeWidth={1.5} /> Assign to expert
        </button>
        <button onClick={onClear} className="postics-btn-ghost text-xs">
          <X className="size-3.5" strokeWidth={1.5} /> Clear
        </button>
      </div>
    </div>
  );
}

function CreditsBanner({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-ink-900">
        <AlertTriangle className="size-4 text-[color:var(--warning)]" strokeWidth={1.5} />
        <span>
          You've used <span className="font-mono-num">{pct}%</span> of this month's credits. Plan generation will keep running — top up to avoid interruption.
        </span>
      </div>
      <button className="postics-btn-secondary text-xs">Add credits</button>
    </div>
  );
}

function ErrorBanner({ day, onDismiss }: { day: number; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#F1D2CE] bg-[#F7E2DF]/60 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-[color:var(--danger)]">
        <AlertTriangle className="size-4" strokeWidth={1.5} />
        <span className="text-ink-900">
          Slot for {monthLabel()} {day} is full (max 2 / day). Pick another day or relax the cadence.
        </span>
      </div>
      <button onClick={onDismiss} className="postics-btn-ghost text-xs">
        <X className="size-3.5" strokeWidth={1.5} /> Dismiss
      </button>
    </div>
  );
}

/* ───────────────────────── calendar ───────────────────────── */

function CalendarView({
  items,
  scale,
  onDropItem,
  selected,
  onToggleSelect,
}: {
  items: Item[];
  scale: CalScale;
  onDropItem: (id: string, day: number) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  // Month view = 5 rows × 7 cols, week view = 1 row × 7 cols
  const startDay = scale === "week" ? 12 : 1; // demo week 12-18
  const total = scale === "week" ? 7 : 30;
  const padStart = scale === "week" ? 0 : 5;
  const cells: (number | null)[] = scale === "week"
    ? Array.from({ length: 7 }, (_, i) => startDay + i)
    : Array.from({ length: 35 }, (_, i) => {
        const d = i - padStart + 1;
        return d < 1 || d > total ? null : d;
      });
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
        <div className="font-display text-lg text-ink-900">{monthLabel()} 2026</div>
        <div className="font-mono-num text-xs text-muted-foreground">
          {items.length} planned · {items.filter((i) => i.status === "published").length} published
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-line bg-surface-sunken/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-3 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => (
          <DayCell
            key={idx}
            day={day}
            today={today}
            items={day ? items.filter((it) => it.day === day) : []}
            onDropItem={onDropItem}
            selected={selected}
            onToggleSelect={onToggleSelect}
            scale={scale}
          />
        ))}
      </div>
    </Card>
  );
}

function DayCell({
  day,
  today,
  items,
  onDropItem,
  selected,
  onToggleSelect,
  scale,
}: {
  day: number | null;
  today: number;
  items: Item[];
  onDropItem: (id: string, day: number) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  scale: CalScale;
}) {
  const [over, setOver] = useState(false);

  function handleDragOver(e: DragEvent) {
    if (!day) return;
    e.preventDefault();
    setOver(true);
  }
  function handleDrop(e: DragEvent) {
    if (!day) return;
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropItem(id, day);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={cn(
        "border-b border-r border-line p-2 transition-colors",
        scale === "week" ? "min-h-[420px]" : "min-h-[120px]",
        !day && "bg-surface-sunken/30",
        day === today && "bg-brand-100/30",
        over && "bg-brand-100/60 outline outline-2 -outline-offset-2 outline-brand-700/40",
      )}
    >
      {day && (
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className={cn(
              "font-mono-num text-xs",
              day === today
                ? "rounded-md bg-brand-700 px-1.5 py-0.5 text-[color:var(--primary-foreground)]"
                : "text-muted-foreground",
            )}
          >
            {day}
          </span>
          {items.length > 0 && (
            <span className="font-mono-num text-[10px] text-muted-foreground">{items.length}</span>
          )}
        </div>
      )}
      <div className="space-y-1">
        {items.map((it) => (
          <ContentChip
            key={it.id}
            item={it}
            isSelected={selected.has(it.id)}
            onToggleSelect={() => onToggleSelect(it.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ContentChip({
  item,
  isSelected,
  onToggleSelect,
}: {
  item: Item;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const KindIcon = KIND_META[item.kind].icon;
  const ChannelIcon =
    item.channel === "site" ? Globe2 :
    item.channel === "x" ? Twitter :
    item.channel === "ig" ? Instagram : Linkedin;

  function handleDragStart(e: DragEvent) {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable={!item.locked}
      onDragStart={handleDragStart}
      title={item.locked ? "Pending platform audit — site publishing works now" : item.title}
      className={cn(
        "group relative rounded-md border bg-surface p-1.5 text-[11px] leading-tight transition-shadow",
        "hover:shadow-sm",
        item.locked ? "border-dashed border-line bg-surface-sunken/60 opacity-80 cursor-not-allowed" : "border-line cursor-grab active:cursor-grabbing",
        isSelected && "ring-2 ring-brand-700/40 ring-offset-1 ring-offset-paper",
      )}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={cn(
          "absolute -left-1 -top-1 grid size-4 place-items-center rounded-sm border bg-surface opacity-0 transition-opacity group-hover:opacity-100",
          isSelected ? "border-brand-700 opacity-100" : "border-line",
        )}
        aria-label="Select"
      >
        {isSelected ? <CheckSquare className="size-3 text-brand-700" strokeWidth={1.5} /> : <Square className="size-3 text-muted-foreground" strokeWidth={1.5} />}
      </button>
      <div className="flex items-center gap-1.5">
        {item.locked ? (
          <Lock className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <KindIcon className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        )}
        <span className="truncate font-display text-[12px] text-ink-900">{item.title}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={cn("rounded px-1 py-px text-[9px] uppercase tracking-wider", STATUS_TONE[item.status])}>
          {item.status}
        </span>
        <div className="flex items-center gap-1">
          <ChannelIcon className="size-3 text-muted-foreground" strokeWidth={1.5} />
          <AssigneeAvatar a={item.assignee} />
        </div>
      </div>
    </div>
  );
}

function AssigneeAvatar({ a }: { a: Item["assignee"] }) {
  return (
    <span
      title={a.name}
      className={cn(
        "grid size-4 place-items-center rounded-full text-[8px] font-medium",
        a.type === "ai"
          ? "bg-brand-100 text-brand-700"
          : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
      )}
    >
      {a.type === "ai" ? "AI" : a.name[0]}
    </span>
  );
}

/* ───────────────────────── board ───────────────────────── */

function BoardView({
  items,
  selected,
  onToggleSelect,
}: {
  items: Item[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
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
        const cards = items.filter((i) => i.status === col.id);
        return (
          <div key={col.id} className="rounded-xl border border-line bg-surface-sunken/40 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-700">
                {col.label}
              </span>
              <span className="font-mono-num text-xs text-muted-foreground">{cards.length}</span>
            </div>
            <div className="space-y-2">
              {cards.map((it) => (
                <BoardCard
                  key={it.id}
                  item={it}
                  isSelected={selected.has(it.id)}
                  onToggleSelect={() => onToggleSelect(it.id)}
                />
              ))}
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

function BoardCard({
  item,
  isSelected,
  onToggleSelect,
}: {
  item: Item;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const KindIcon = KIND_META[item.kind].icon;
  const ChannelIcon =
    item.channel === "site" ? Globe2 :
    item.channel === "x" ? Twitter :
    item.channel === "ig" ? Instagram : Linkedin;
  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-surface p-3 transition-shadow hover:shadow-sm",
        item.locked ? "border-dashed border-line opacity-80" : "border-line",
        isSelected && "ring-2 ring-brand-700/40",
      )}
    >
      <button
        onClick={onToggleSelect}
        className={cn(
          "absolute right-2 top-2 grid size-4 place-items-center rounded-sm border bg-surface opacity-0 transition-opacity group-hover:opacity-100",
          isSelected ? "border-brand-700 opacity-100" : "border-line",
        )}
        aria-label="Select"
      >
        {isSelected ? <CheckSquare className="size-3 text-brand-700" strokeWidth={1.5} /> : <Square className="size-3 text-muted-foreground" strokeWidth={1.5} />}
      </button>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <KindIcon className="size-3" strokeWidth={1.5} />
        <span>{KIND_META[item.kind].label}</span>
        <span className="ml-auto">
          {item.locked ? <Lock className="size-3" strokeWidth={1.5} /> : <ChannelIcon className="size-3" strokeWidth={1.5} />}
        </span>
      </div>
      <div className="font-display text-sm leading-snug text-ink-900">{item.title}</div>
      <div className="font-mono-num mt-1 text-[10px] text-muted-foreground">/ {item.keyword}</div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className={cn("rounded px-1.5 py-0.5 uppercase tracking-wider", STATUS_TONE[item.status])}>
          {STATUS_LABEL[item.status]}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Jun {item.day}</span>
          <AssigneeAvatar a={item.assignee} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── empty / generate panel ───────────────────────── */

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <Card className="grid place-items-center p-16 text-center">
      <CalendarDays className="size-10 text-muted-foreground" strokeWidth={1.25} />
      <h3 className="mt-4 font-display text-2xl text-ink-900">No content planned yet</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Generate a full month in one pass. We'll group topics by pillar, balance channels, and respect your publishing cadence.
      </p>
      <button onClick={onGenerate} className="postics-btn-primary mt-6">
        <Cpu className="size-4" strokeWidth={1.5} /> Generate monthly plan
      </button>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <span>Templates:</span>
        {["Specialty coffee · 12 / mo", "B2B SaaS · 8 / mo", "Local services · 6 / mo"].map((t) => (
          <span key={t} className="rounded-md border border-line bg-surface px-2 py-1">{t}</span>
        ))}
      </div>
    </Card>
  );
}

function GeneratePanel({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"config" | "loading" | "review">("config");
  const [postsPerMonth, setPostsPerMonth] = useState(12);
  const [horizon, setHorizon] = useState<1 | 3 | 12>(1);

  const totalItems = postsPerMonth * horizon;
  const credits = Math.round(totalItems * 150);

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
            <div className="space-y-6">
              <Field label="Cadence">
                <div className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink-700">Posts per month</span>
                    <span className="font-mono-num text-2xl text-ink-900">{postsPerMonth}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    value={postsPerMonth}
                    onChange={(e) => setPostsPerMonth(Number(e.target.value))}
                    className="mt-2 w-full accent-[color:var(--brand-700)]"
                  />
                  <div className="mt-1 flex justify-between font-mono-num text-[10px] text-muted-foreground">
                    <span>2</span><span>15</span><span>30</span>
                  </div>
                </div>
              </Field>

              <Field label="Horizon">
                <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                  {([1, 3, 12] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm transition-colors",
                        horizon === h ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
                      )}
                    >
                      {h === 1 ? "1 month" : h === 3 ? "3 months" : "12 months"}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Plan up to a year ahead. Auto-publish runs on the cadence above.
                </p>
              </Field>

              <Field label="Goals">
                <div className="flex flex-wrap gap-2">
                  {["Organic traffic", "Wholesale leads", "Brand depth", "Local SEO"].map((g, i) => (
                    <label
                      key={g}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                        i < 2 ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700",
                      )}
                    >
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only" /> {g}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Content mix">
                <div className="flex flex-wrap gap-2">
                  {(["article", "product_description", "product_photo", "product_video", "social"] as Kind[]).map((k) => {
                    const I = KIND_META[k].icon;
                    return (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink-700"
                      >
                        <I className="size-3.5" strokeWidth={1.5} /> {KIND_META[k].label}
                      </span>
                    );
                  })}
                </div>
              </Field>

              <Field label="Channels">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-700/30 bg-brand-100 px-3 py-1.5 text-sm text-brand-700">
                    <Globe2 className="size-3.5" strokeWidth={1.5} /> Site <span className="font-mono-num text-[10px]">guaranteed</span>
                  </span>
                  {[Twitter, Instagram, Linkedin].map((I, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line bg-surface-sunken/60 px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      <Lock className="size-3" strokeWidth={1.5} /> <I className="size-3.5" strokeWidth={1.5} />
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Social channels are awaiting platform audit. We'll prepare drafts; you can publish once unlocked.
                </p>
              </Field>

              <Field label="Estimated cost">
                <div className="rounded-lg border border-line bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-700">
                      <span className="font-mono-num">{totalItems}</span> items across <span className="font-mono-num">{horizon}</span> mo
                    </span>
                    <span className="font-mono-num text-ink-900">≈ {credits.toLocaleString()} credits</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, credits / 30)}%` }} />
                  </div>
                </div>
              </Field>
            </div>
          )}

          {stage === "loading" && (
            <div className="grid place-items-center gap-3 py-20 text-center">
              <Loader2 className="size-8 animate-spin text-brand-700" strokeWidth={1.5} />
              <div className="font-display text-lg text-ink-900">Drafting your plan…</div>
              <div className="font-mono-num text-xs text-muted-foreground">
                clustering keywords · balancing pillars · checking calendar
              </div>
              <ProgressSteps />
            </div>
          )}

          {stage === "review" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                We grouped <span className="font-mono-num">{totalItems}</span> topics into {pillars.length} pillars. Edit any line, then approve to drop them on the calendar.
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
            {stage === "config" && `Cost: ≈ ${credits.toLocaleString()} credits`}
            {stage === "loading" && "Hang tight…"}
            {stage === "review" && `${totalItems} items ready`}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="postics-btn-ghost text-sm">Cancel</button>
            {stage === "config" && (
              <button
                onClick={() => { setStage("loading"); setTimeout(() => setStage("review"), 1400); }}
                className="postics-btn-primary text-sm"
              >
                <Cpu className="size-4" strokeWidth={1.5} /> Generate
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

function ProgressSteps() {
  const steps = ["Analyzing site", "Studying competitors", "Clustering keywords", "Drafting topics", "Slotting calendar"];
  return (
    <ul className="mt-4 space-y-1.5 text-left text-xs text-muted-foreground">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={cn("size-1.5 rounded-full", i < 3 ? "bg-brand-700" : "bg-line")} />
          <span className={cn(i < 3 && "text-ink-900")}>{s}</span>
        </li>
      ))}
    </ul>
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
      <span>Dashed slots are social posts awaiting platform audit — site publishing is guaranteed.</span>
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

function monthLabel() {
  return "June";
}