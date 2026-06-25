import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  LayoutGrid,
  Filter,
  Lock,
  Globe2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  FileText,
  ShoppingBag,
  MessageSquare,
  CheckSquare,
  Square,
  Download,
  Copy,
  Clock,
  ShieldCheck,
  Plug,
  Cpu,
  RefreshCw,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";
import { Card } from "@/features/shared/primitives";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Content Plan — Postics" },
      { name: "description", content: "Plan, generate and export your content. Auto-publish optional." },
    ],
  }),
  component: PlanPage,
});

/* ───────────────────────── model ───────────────────────── */

type Status = "draft" | "generating" | "ready" | "published" | "failed";
type Kind = "article" | "page" | "social";
type Channel = "site" | "social";

type Item = {
  id: string;
  title: string;
  kind: Kind;
  status: Status;
  channel: Channel;
  cluster: string;
  keyword: string;
  day: number; // day of month 1..28
};

const CLUSTERS = [
  "Wholesale espresso",
  "Single-origin storytelling",
  "Brew guides",
  "Subscriptions",
  "International shipping",
];

function seed(): Item[] {
  const titles: Array<Omit<Item, "id" | "day">> = [
    { title: "How to spec a café espresso program in 2026", kind: "article", status: "ready", channel: "site", cluster: "Wholesale espresso", keyword: "wholesale espresso program" },
    { title: "Single-origin Ethiopia Yirgacheffe — origin notes", kind: "article", status: "draft", channel: "site", cluster: "Single-origin storytelling", keyword: "yirgacheffe origin" },
    { title: "V60 vs. Kalita — a working brewer's comparison", kind: "article", status: "generating", channel: "site", cluster: "Brew guides", keyword: "v60 vs kalita" },
    { title: "Subscription landing — quarterly tier", kind: "page", status: "ready", channel: "site", cluster: "Subscriptions", keyword: "quarterly coffee subscription" },
    { title: "Shipping to the EU — duties FAQ", kind: "page", status: "draft", channel: "site", cluster: "International shipping", keyword: "coffee shipping eu duty" },
    { title: "Cupping protocol for new wholesale buyers", kind: "article", status: "ready", channel: "site", cluster: "Wholesale espresso", keyword: "coffee cupping protocol" },
    { title: "Behind the bag — Honduras lot 042", kind: "social", status: "draft", channel: "social", cluster: "Single-origin storytelling", keyword: "honduras single origin" },
    { title: "Decaf, reconsidered — process over apology", kind: "article", status: "failed", channel: "site", cluster: "Brew guides", keyword: "swiss water decaf" },
    { title: "Quarterly box reveal — winter edition", kind: "social", status: "draft", channel: "social", cluster: "Subscriptions", keyword: "winter coffee box" },
    { title: "Wholesale price sheet — the honest version", kind: "page", status: "ready", channel: "site", cluster: "Wholesale espresso", keyword: "wholesale coffee price sheet" },
    { title: "Why we cup blind", kind: "social", status: "draft", channel: "social", cluster: "Single-origin storytelling", keyword: "blind cupping" },
    { title: "Filter water for espresso — the boring truth", kind: "article", status: "draft", channel: "site", cluster: "Brew guides", keyword: "espresso water hardness" },
  ];
  const days = [3, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25];
  return titles.map((t, i) => ({ ...t, id: `i${i}`, day: days[i] }));
}

const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  published: "Published",
  failed: "Failed",
};

const KIND_LABEL: Record<Kind, string> = {
  article: "Article",
  page: "Product / page",
  social: "Social",
};

/* ───────────────────────── page ───────────────────────── */

function PlanPage() {
  const { currentProject } = useScope();
  const [storeConnected, setStoreConnected] = useState(false); // mock — Settings owns this
  const [view, setView] = useState<"calendar" | "board">("calendar");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [items, setItems] = useState<Item[]>(seed());
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    status: Status | "all";
    channel: Channel | "all";
    kind: Kind | "all";
    cluster: string | "all";
  }>({ status: "all", channel: "all", kind: "all", cluster: "all" });
  const [exporting, setExporting] = useState<Item | null>(null);
  const [credits] = useState({ used: 820, total: 1000 });
  const lowCredits = credits.total - credits.used < 200;
  const horizonOverTier = period === "year"; // mock: tier caps at quarter

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (filters.status === "all" || i.status === filters.status) &&
          (filters.channel === "all" || i.channel === filters.channel) &&
          (filters.kind === "all" || i.kind === filters.kind) &&
          (filters.cluster === "all" || i.cluster === filters.cluster),
      ),
    [items, filters],
  );

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function generate(ids: string[]) {
    setItems((arr) =>
      arr.map((it) => (ids.includes(it.id) ? { ...it, status: "generating" } : it)),
    );
    setTimeout(() => {
      setItems((arr) =>
        arr.map((it) =>
          ids.includes(it.id) && it.status !== "ready"
            ? { ...it, status: "ready" }
            : it,
        ),
      );
    }, 1400);
  }

  function publish(ids: string[]) {
    if (!storeConnected) return;
    setItems((arr) =>
      arr.map((it) => (ids.includes(it.id) && it.channel === "site" ? { ...it, status: "published" } : it)),
    );
  }

  return (
    <ProjectShell breadcrumb={[{ label: "Content Plan", to: "/plan" }]}>
      <div className="space-y-5">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              {currentProject.name} · content plan
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Plan, generate, export.
            </h1>
            <p className="mt-1 text-sm text-ink-mute">
              Auto quality-gated · AI-only. Publishing is optional.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStoreConnected((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                storeConnected
                  ? "border-brand/30 bg-brand-50 text-brand"
                  : "border-line text-ink-mute hover:bg-surface-sunken",
              )}
              title="Mock toggle — store connection lives in Settings"
            >
              <Plug className="h-3.5 w-3.5" />
              {storeConnected ? "Site connected" : "No site connected"}
            </button>
            <button
              onClick={() => generate(items.filter((i) => i.status === "draft").map((i) => i.id))}
              className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-paper px-3 py-2 text-sm text-ink hover:bg-surface-sunken"
            >
              <RefreshCw className="h-4 w-4" /> Generate next month's plan
            </button>
          </div>
        </header>

        {/* Banners */}
        {lowCredits && (
          <Banner tone="warn" icon={<AlertTriangle className="h-4 w-4" />}>
            Credits running low — {credits.total - credits.used} left.{" "}
            <a href="/settings" className="underline-offset-2 hover:underline">Top up</a>.
          </Banner>
        )}
        {horizonOverTier && (
          <Banner tone="info" icon={<Lock className="h-4 w-4" />}>
            12-month horizon needs a longer plan — quietly upgrade for a full year view.
          </Banner>
        )}

        {/* Controls */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-[10px] border border-line bg-paper p-1">
              <ToggleBtn active={view === "calendar"} onClick={() => setView("calendar")}>
                <CalendarDays className="h-4 w-4" /> Calendar
              </ToggleBtn>
              <ToggleBtn active={view === "board"} onClick={() => setView("board")}>
                <LayoutGrid className="h-4 w-4" /> Board
              </ToggleBtn>
            </div>

            {view === "calendar" && (
              <div className="flex items-center gap-1 rounded-[10px] border border-line bg-paper p-1">
                {(["month", "quarter", "year"] as const).map((p) => (
                  <ToggleBtn key={p} active={period === p} onClick={() => setPeriod(p)}>
                    <span className="capitalize">{p}</span>
                  </ToggleBtn>
                ))}
              </div>
            )}

            <FiltersBar filters={filters} setFilters={setFilters} />
          </div>
        </Card>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <BulkBar
            count={selected.length}
            onClear={() => setSelected([])}
            onGenerate={() => generate(selected)}
            onExport={() => setExporting(items.find((i) => i.id === selected[0]) ?? null)}
            onPublish={() => publish(selected)}
            storeConnected={storeConnected}
          />
        )}

        {/* Body */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : view === "calendar" ? (
          <CalendarView
            items={filtered}
            period={period}
            selected={selected}
            toggleSelect={toggleSelect}
            onGenerate={(id) => generate([id])}
            onExport={(it) => setExporting(it)}
            onPublish={(id) => publish([id])}
            storeConnected={storeConnected}
          />
        ) : (
          <BoardView
            items={filtered}
            selected={selected}
            toggleSelect={toggleSelect}
            onGenerate={(id) => generate([id])}
            onExport={(it) => setExporting(it)}
            onPublish={(id) => publish([id])}
            storeConnected={storeConnected}
          />
        )}
      </div>

      {exporting && <ExportSheet item={exporting} onClose={() => setExporting(null)} />}
    </ProjectShell>
  );
}

/* ───────────────────────── controls ───────────────────────── */

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-xs",
        active ? "bg-brand text-paper" : "text-ink hover:bg-surface-sunken",
      )}
    >
      {children}
    </button>
  );
}

function FiltersBar({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: (v: any) => void;
}) {
  const wrap = (label: string, value: string, options: string[], key: string) => (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
        className="appearance-none rounded-[8px] border border-line bg-paper px-3 py-1.5 pr-7 text-xs text-ink outline-none hover:bg-surface-sunken"
      >
        <option value="all">{label}: all</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" />
    </label>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-ink-mute" />
      {wrap("Status", filters.status, ["draft", "generating", "ready", "published", "failed"], "status")}
      {wrap("Channel", filters.channel, ["site", "social"], "channel")}
      {wrap("Type", filters.kind, ["article", "page", "social"], "kind")}
      {wrap("Cluster", filters.cluster, CLUSTERS, "cluster")}
    </div>
  );
}

function BulkBar({
  count,
  onClear,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
}: {
  count: number;
  onClear: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onPublish: () => void;
  storeConnected: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand/30 bg-brand-50/60 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-ink">
        <CheckSquare className="h-4 w-4 text-brand" />
        {count} selected
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <BulkBtn onClick={onGenerate} icon={<Wand2 className="h-3.5 w-3.5" />}>
          Generate
        </BulkBtn>
        <BulkBtn onClick={onExport} icon={<Download className="h-3.5 w-3.5" />} primary>
          Export ready pieces
        </BulkBtn>
        <BulkBtn
          onClick={onPublish}
          icon={<Globe2 className="h-3.5 w-3.5" />}
          disabled={!storeConnected}
          title={storeConnected ? undefined : "Connect your site to publish"}
        >
          Publish
        </BulkBtn>
        <BulkBtn
          disabled
          icon={<Clock className="h-3.5 w-3.5" />}
          title="Scheduling — coming soon"
        >
          Schedule (coming soon)
        </BulkBtn>
        <button onClick={onClear} className="ml-1 text-xs text-ink-mute hover:text-ink">
          Clear
        </button>
      </div>
    </div>
  );
}

function BulkBtn({
  children,
  icon,
  onClick,
  primary,
  disabled,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
        disabled
          ? "cursor-not-allowed border border-line text-ink-mute opacity-70"
          : primary
            ? "bg-brand text-paper hover:bg-brand/90"
            : "border border-line bg-paper text-ink hover:bg-surface-sunken",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ───────────────────────── calendar ───────────────────────── */

function CalendarView({
  items,
  period,
  selected,
  toggleSelect,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
}: {
  items: Item[];
  period: "month" | "quarter" | "year";
  selected: string[];
  toggleSelect: (id: string) => void;
  onGenerate: (id: string) => void;
  onExport: (it: Item) => void;
  onPublish: (id: string) => void;
  storeConnected: boolean;
}) {
  if (period !== "month") {
    return (
      <Card className="p-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
          {period}
        </p>
        <h3 className="mt-2 text-lg text-ink">
          {period === "quarter" ? "Quarter" : "Year"} view
        </h3>
        <p className="mt-1 text-sm text-ink-mute">
          {items.length} pieces across the period — distribution preview below.
        </p>
        <div className="mt-4 grid grid-cols-12 gap-1">
          {Array.from({ length: period === "quarter" ? 12 : 52 }).map((_, w) => {
            const fill = items[w % items.length];
            return (
              <div
                key={w}
                className={cn(
                  "h-8 rounded-[6px] border",
                  fill ? statusBg(fill.status) : "border-line bg-paper",
                )}
                title={`Week ${w + 1}`}
              />
            );
          })}
        </div>
      </Card>
    );
  }

  // Month grid: 5×7
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // start offset
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-7 border-b border-line bg-surface-sunken/60">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-mute">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const dayNum = d + 1;
          const inMonth = dayNum >= 1 && dayNum <= 30;
          const dayItems = items.filter((i) => i.day === dayNum);
          return (
            <div
              key={d}
              className={cn(
                "min-h-28 border-b border-r border-line p-2",
                !inMonth && "bg-surface-sunken/40",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] text-ink-mute">
                  {inMonth ? dayNum : ""}
                </span>
                {inMonth && (
                  <Lock
                    className="h-3 w-3 text-ink-mute opacity-50"
                    aria-label="Scheduling — coming soon"
                  />
                )}
              </div>
              <div className="space-y-1">
                {dayItems.map((i) => (
                  <CalCard
                    key={i.id}
                    item={i}
                    selected={selected.includes(i.id)}
                    onSelect={() => toggleSelect(i.id)}
                    onGenerate={() => onGenerate(i.id)}
                    onExport={() => onExport(i)}
                    onPublish={() => onPublish(i.id)}
                    storeConnected={storeConnected}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-line bg-surface-sunken/40 px-3 py-2 text-[11px] text-ink-mute">
        <Lock className="mr-1 inline h-3 w-3" /> Scheduling — coming soon · slots are read-only for now.
      </div>
    </Card>
  );
}

function CalCard({
  item,
  selected,
  onSelect,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
}: {
  item: Item;
  selected: boolean;
  onSelect: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onPublish: () => void;
  storeConnected: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border bg-paper px-2 py-1.5 text-[11px] text-ink",
        statusBorder(item.status),
        selected && "ring-2 ring-brand",
      )}
    >
      <button onClick={onSelect} className="flex w-full items-start gap-1.5 text-left">
        {selected ? (
          <CheckSquare className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
        ) : (
          <Square className="mt-0.5 h-3 w-3 shrink-0 text-ink-mute" />
        )}
        <span className="line-clamp-2">{item.title}</span>
      </button>
      <div className="mt-1 flex items-center justify-between">
        <StatusPill status={item.status} compact />
        <CardActions
          item={item}
          onGenerate={onGenerate}
          onExport={onExport}
          onPublish={onPublish}
          storeConnected={storeConnected}
          compact
        />
      </div>
    </div>
  );
}

/* ───────────────────────── board ───────────────────────── */

const COLUMNS: Status[] = ["draft", "generating", "ready", "published", "failed"];

function BoardView({
  items,
  selected,
  toggleSelect,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
}: {
  items: Item[];
  selected: string[];
  toggleSelect: (id: string) => void;
  onGenerate: (id: string) => void;
  onExport: (it: Item) => void;
  onPublish: (id: string) => void;
  storeConnected: boolean;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {COLUMNS.map((col) => {
        const list = items.filter((i) => i.status === col);
        return (
          <Card key={col} className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusDot status={col} />
                <h3 className="text-sm font-medium text-ink">{STATUS_LABEL[col]}</h3>
                <span className="font-mono text-[10px] text-ink-mute">{list.length}</span>
              </div>
            </div>
            {col === "published" && !storeConnected && (
              <p className="rounded-[6px] border border-dashed border-line bg-surface-sunken/40 px-2 py-1.5 text-[10px] text-ink-mute">
                <Lock className="mr-1 inline h-3 w-3" />
                Publish needs a connected site. Ready pieces can still export.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {list.length === 0 && (
                <p className="rounded-[8px] border border-dashed border-line px-2 py-3 text-center text-[11px] text-ink-mute">
                  Empty
                </p>
              )}
              {list.map((i) => (
                <BoardCard
                  key={i.id}
                  item={i}
                  selected={selected.includes(i.id)}
                  onSelect={() => toggleSelect(i.id)}
                  onGenerate={() => onGenerate(i.id)}
                  onExport={() => onExport(i)}
                  onPublish={() => onPublish(i.id)}
                  storeConnected={storeConnected}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function BoardCard({
  item,
  selected,
  onSelect,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
}: {
  item: Item;
  selected: boolean;
  onSelect: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onPublish: () => void;
  storeConnected: boolean;
}) {
  return (
    <div
      className={cn(
        "group rounded-[10px] border bg-paper p-3 text-sm",
        statusBorder(item.status),
        selected && "ring-2 ring-brand",
      )}
    >
      <div className="flex items-start gap-2">
        <button onClick={onSelect} className="mt-0.5 shrink-0" aria-label="select">
          {selected ? (
            <CheckSquare className="h-3.5 w-3.5 text-brand" />
          ) : (
            <Square className="h-3.5 w-3.5 text-ink-mute" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight text-ink">{item.title}</p>
          <p className="mt-1 font-mono text-[10px] text-ink-mute">{item.keyword}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TypeChip kind={item.kind} />
            <ChannelChip channel={item.channel} />
            <AiChip />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StatusPill status={item.status} />
            <CardActions
              item={item}
              onGenerate={onGenerate}
              onExport={onExport}
              onPublish={onPublish}
              storeConnected={storeConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── chips ───────────────────────── */

function TypeChip({ kind }: { kind: Kind }) {
  const map = {
    article: { i: <FileText className="h-3 w-3" />, c: "text-ink" },
    page: { i: <ShoppingBag className="h-3 w-3" />, c: "text-ink" },
    social: { i: <MessageSquare className="h-3 w-3" />, c: "text-ink-mute" },
  } as const;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-0.5 text-[10px]">
      <span className={map[kind].c}>{map[kind].i}</span>
      {KIND_LABEL[kind]}
    </span>
  );
}

function ChannelChip({ channel }: { channel: Channel }) {
  if (channel === "site") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-50 px-2 py-0.5 text-[10px] text-brand">
        <Globe2 className="h-3 w-3" /> Site
      </span>
    );
  }
  return (
    <span
      title="Social — best-effort · pending platform audit"
      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-sunken px-2 py-0.5 text-[10px] text-ink-mute"
    >
      <Lock className="h-3 w-3" /> Social · pending audit
    </span>
  );
}

function AiChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink-mute">
      <Cpu className="h-3 w-3" /> AI · quality-gated
    </span>
  );
}

function StatusPill({ status, compact }: { status: Status; compact?: boolean }) {
  const map: Record<Status, { label: string; cls: string; icon?: React.ReactNode }> = {
    draft: { label: "Draft", cls: "border-line bg-paper text-ink-mute" },
    generating: {
      label: "Generating",
      cls: "border-brand/30 bg-brand-50 text-brand",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    ready: {
      label: "Ready",
      cls: "border-brand/30 bg-brand text-paper",
      icon: <Check className="h-3 w-3" />,
    },
    published: {
      label: "Published",
      cls: "border-line bg-surface-sunken text-ink",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    failed: {
      label: "Failed",
      cls: "border-red-300 bg-red-50 text-red-700",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };
  const v = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        compact ? "text-[10px]" : "text-[11px]",
        v.cls,
      )}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

function StatusDot({ status }: { status: Status }) {
  const cls: Record<Status, string> = {
    draft: "bg-ink-mute/40",
    generating: "bg-brand animate-pulse",
    ready: "bg-brand",
    published: "bg-ink",
    failed: "bg-red-500",
  };
  return <span className={cn("h-2 w-2 rounded-full", cls[status])} />;
}

function statusBorder(s: Status) {
  return {
    draft: "border-line",
    generating: "border-brand/30",
    ready: "border-brand/40",
    published: "border-ink/20",
    failed: "border-red-300",
  }[s];
}
function statusBg(s: Status) {
  return {
    draft: "border-line bg-paper",
    generating: "border-brand/30 bg-brand-50",
    ready: "border-brand/40 bg-brand-50",
    published: "border-ink/20 bg-surface-sunken",
    failed: "border-red-300 bg-red-50",
  }[s];
}

/* ───────────────────────── card actions ───────────────────────── */

function CardActions({
  item,
  onGenerate,
  onExport,
  onPublish,
  storeConnected,
  compact,
}: {
  item: Item;
  onGenerate: () => void;
  onExport: () => void;
  onPublish: () => void;
  storeConnected: boolean;
  compact?: boolean;
}) {
  const size = compact ? "h-6 px-2 text-[10px]" : "h-7 px-2.5 text-[11px]";
  if (item.status === "draft") {
    return (
      <button
        onClick={onGenerate}
        className={cn("inline-flex items-center gap-1 rounded-full bg-brand text-paper hover:bg-brand/90", size)}
      >
        <Wand2 className="h-3 w-3" /> Generate
      </button>
    );
  }
  if (item.status === "ready") {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className={cn("inline-flex items-center gap-1 rounded-full bg-brand text-paper hover:bg-brand/90", size)}
        >
          <Download className="h-3 w-3" /> Export
        </button>
        {storeConnected && (
          <button
            onClick={onPublish}
            className={cn("inline-flex items-center gap-1 rounded-full border border-line bg-paper text-ink hover:bg-surface-sunken", size)}
          >
            <Globe2 className="h-3 w-3" /> Publish
          </button>
        )}
      </div>
    );
  }
  if (item.status === "failed") {
    return (
      <button
        onClick={onGenerate}
        className={cn("inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 text-red-700 hover:bg-red-100", size)}
      >
        <RefreshCw className="h-3 w-3" /> Retry
      </button>
    );
  }
  if (item.status === "generating") {
    return <span className="font-mono text-[10px] text-ink-mute">working…</span>;
  }
  if (item.status === "published") {
    return (
      <button
        onClick={onExport}
        className={cn("inline-flex items-center gap-1 rounded-full border border-line bg-paper text-ink hover:bg-surface-sunken", size)}
      >
        <Download className="h-3 w-3" /> Export
      </button>
    );
  }
  return null;
}

/* ───────────────────────── export sheet ───────────────────────── */

function ExportSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  const [format, setFormat] = useState<"copy" | "markdown" | "html" | "cms" | "download">("markdown");
  const formats = [
    { id: "copy", label: "Copy", icon: <Copy className="h-3.5 w-3.5" /> },
    { id: "markdown", label: "Markdown", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "html", label: "HTML", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "cms", label: "Copy for your CMS", icon: <Copy className="h-3.5 w-3.5" /> },
    { id: "download", label: "Download", icon: <Download className="h-3.5 w-3.5" /> },
  ] as const;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-t-[16px] border border-line bg-paper p-5 sm:rounded-[16px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">Export</p>
            <h3 className="mt-1 text-base text-ink">{item.title}</h3>
          </div>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-sunken">
            <X className="h-4 w-4 text-ink-mute" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs",
                format === f.id
                  ? "border-brand bg-brand-50 text-brand"
                  : "border-line text-ink hover:bg-surface-sunken",
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-4 max-h-48 overflow-auto rounded-[10px] border border-line bg-surface-sunken/60 p-3 font-mono text-[11px] text-ink-mute">
          {format === "markdown" && `# ${item.title}\n\nKeyword: \`${item.keyword}\`\n\n(Ready piece — exported as Markdown.)`}
          {format === "html" && `<article>\n  <h1>${item.title}</h1>\n  <!-- keyword: ${item.keyword} -->\n</article>`}
          {format === "copy" && `${item.title}\n\nKeyword: ${item.keyword}`}
          {format === "cms" && `Title: ${item.title}\nSlug: ${item.keyword.replace(/\s+/g, "-")}\nBody: (rich HTML ready for your CMS)`}
          {format === "download" && `${item.keyword.replace(/\s+/g, "-")}.zip — bundle of HTML + assets`}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled
            title="Scheduling — coming soon"
            className="inline-flex items-center gap-2 rounded-[10px] border border-line px-3 py-2 text-xs text-ink-mute opacity-70"
          >
            <Clock className="h-3.5 w-3.5" /> Schedule (coming soon)
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-4 py-2 text-xs font-medium text-paper hover:bg-brand/90"
          >
            <Download className="h-3.5 w-3.5" /> Export now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── empty / banner ───────────────────────── */

function EmptyState() {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand">
        <Wand2 className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg text-ink">Your strategy is ready — generate your first piece.</h3>
      <p className="mt-1 text-sm text-ink-mute">
        Tap Generate on any draft, or run a whole batch from the bulk bar.
      </p>
    </Card>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "warn" | "info";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm",
        tone === "warn"
          ? "border-amber-300/60 bg-amber-50 text-amber-900"
          : "border-line bg-surface-sunken text-ink-mute",
      )}
    >
      {icon}
      {children}
    </div>
  );
}