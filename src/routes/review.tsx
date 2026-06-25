import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Lock,
  Filter,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Scissors,
  Wand,
  Hash,
  Globe2,
  Send,
  XCircle,
  UserPlus,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/review")({ component: ReviewPage });

type ItemState =
  | "unassigned"
  | "in_progress"
  | "returned"
  | "approved"
  | "rejected"
  | "overdue";
type ItemType = "Article" | "Product or page" | "Social";
type Reviewer = { id: string; name: string; initials: string; role: "Expert" | "Freelancer" };

type Item = {
  id: string;
  title: string;
  type: ItemType;
  keyword: string;
  locale: "EN" | "RU";
  target: "site" | "social";
  state: ItemState;
  reviewer: Reviewer | null;
  /** Hours until SLA. Negative = overdue. */
  hoursLeft: number;
  edits: number;
  takeRate: number; // 0..1, after edits
  /** Body paragraphs for the article body. */
  body: string[];
};

const REVIEWERS: Reviewer[] = [
  { id: "ml", name: "Marta L.", initials: "ML", role: "Expert" },
  { id: "dr", name: "Daniel R.", initials: "DR", role: "Freelancer" },
  { id: "ik", name: "Iris K.", initials: "IK", role: "Expert" },
  { id: "tn", name: "Tom N.", initials: "TN", role: "Freelancer" },
];

const SEED: Item[] = [
  {
    id: "NCR-241",
    title: "Why we batch-roast on Tuesdays",
    type: "Article",
    keyword: "small-batch coffee roasting",
    locale: "EN",
    target: "site",
    state: "in_progress",
    reviewer: REVIEWERS[0],
    hoursLeft: 4,
    edits: 3,
    takeRate: 0.62,
    body: [
      "Tuesdays are a deliberate choice. Green coffee arrives Friday, rests through the weekend, and by Tuesday morning the beans have settled into their best window for heat development.",
      "Roasting on a fixed weekday keeps the schedule legible — wholesale partners know exactly when their bags will land, and our team can plan calibration around a single profile per origin.",
      "It also gives us Mondays to cup the previous week's roasts against the new arrivals, so we adjust the curve before the drum is even hot.",
    ],
  },
  {
    id: "NCR-238",
    title: "Origin spotlight: Yirgacheffe Konga Co-op",
    type: "Article",
    keyword: "yirgacheffe konga",
    locale: "EN",
    target: "site",
    state: "overdue",
    reviewer: REVIEWERS[2],
    hoursLeft: -2,
    edits: 6,
    takeRate: 0.48,
    body: [
      "The Konga co-op sits at 1,950m above sea level, where cool nights stretch cherry maturation and concentrate the floral notes Yirgacheffe is known for.",
      "Our 2026 lot was processed natural on raised beds — twelve days of slow drying with hourly turning.",
    ],
  },
  {
    id: "NCR-236",
    title: "Espresso machine maintenance — monthly checklist",
    type: "Product or page",
    keyword: "espresso maintenance",
    locale: "EN",
    target: "site",
    state: "unassigned",
    reviewer: null,
    hoursLeft: 31,
    edits: 0,
    takeRate: 0.75,
    body: [
      "A monthly reset keeps shots sweet and your machine healthy. Pull the screens, backflush with detergent, and inspect the group gasket for hardening.",
    ],
  },
  {
    id: "NCR-230",
    title: "Pour-over vs immersion — buyer's guide",
    type: "Product or page",
    keyword: "pour over vs french press",
    locale: "EN",
    target: "site",
    state: "returned",
    reviewer: REVIEWERS[1],
    hoursLeft: 18,
    edits: 4,
    takeRate: 0.58,
    body: [
      "Pour-over rewards attention; immersion rewards patience. Both make excellent coffee — the choice is about the morning you want.",
    ],
  },
  {
    id: "NCR-228",
    title: "Holiday gift bundles — landing copy",
    type: "Product or page",
    keyword: "coffee gift bundle",
    locale: "EN",
    target: "site",
    state: "unassigned",
    reviewer: null,
    hoursLeft: 48,
    edits: 0,
    takeRate: 0.75,
    body: [
      "Three bundles, hand-packed in Northbound paper, each pairing a single-origin with a house blend and a tasting card.",
    ],
  },
  {
    id: "NCR-225",
    title: "Brewing ratios cheat-sheet — IG carousel",
    type: "Social",
    keyword: "coffee brewing ratios",
    locale: "EN",
    target: "social",
    state: "unassigned",
    reviewer: null,
    hoursLeft: 22,
    edits: 0,
    takeRate: 0.75,
    body: ["Carousel of 6 slides; ratios for V60, AeroPress, French Press, espresso, batch brew, and cold brew."],
  },
  {
    id: "NCR-219",
    title: "Subscription page — value props rewrite",
    type: "Product or page",
    keyword: "coffee subscription",
    locale: "EN",
    target: "site",
    state: "in_progress",
    reviewer: REVIEWERS[3],
    hoursLeft: 9,
    edits: 2,
    takeRate: 0.68,
    body: ["Three reasons to subscribe: freshness window, member-only lots, and a pause-anytime cadence."],
  },
];

const STATE_LABEL: Record<ItemState, string> = {
  unassigned: "Unassigned",
  in_progress: "In progress",
  returned: "Returned",
  approved: "Approved",
  rejected: "Rejected",
  overdue: "Overdue",
};

const STATE_TONE: Record<ItemState, "neutral" | "live" | "warn" | "danger" | "gold" | "info"> = {
  unassigned: "neutral",
  in_progress: "live",
  returned: "warn",
  overdue: "danger",
  approved: "live",
  rejected: "danger",
};

const ME: Reviewer = { id: "me", name: "You", initials: "YO", role: "Expert" };

function ReviewPage() {
  const [items, setItems] = useState<Item[]>(SEED);
  const [selectedId, setSelectedId] = useState<string>(SEED[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const [filter, setFilter] = useState<"all" | ItemState>("all");
  const [onBrand, setOnBrand] = useState<Record<string, boolean>>({ [SEED[0].id]: false });
  const [accurate, setAccurate] = useState<Record<string, boolean>>({ [SEED[0].id]: false });
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.state === filter)),
    [items, filter],
  );

  const counts = useMemo(() => {
    return {
      inProgress: items.filter((i) => i.state === "in_progress").length,
      returned: items.filter((i) => i.state === "returned").length,
      approvedToday: 7,
      overdue: items.filter((i) => i.state === "overdue").length,
    };
  }, [items]);

  function patch(id: string, p: Partial<Item>) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }

  function assignToMe(id: string) {
    patch(id, { reviewer: ME, state: "in_progress", hoursLeft: 24 });
    setSelectedId(id);
    toast.success("Assigned · SLA timer started", { description: "Due in 24h" });
  }

  function reassign(id: string) {
    const pool = REVIEWERS.filter((r) => r.id !== selected.reviewer?.id);
    const next = pool[Math.floor(Math.random() * pool.length)];
    patch(id, { reviewer: next, state: "in_progress", hoursLeft: 24 });
    toast.success(`Reassigned to ${next.name}`);
  }

  function bumpEdit(kind: string) {
    if (selected.edits >= 8) return;
    const nextEdits = selected.edits + 1;
    const nextTake = Math.max(0.4, 0.75 - nextEdits * 0.04);
    patch(selected.id, { edits: nextEdits, takeRate: parseFloat(nextTake.toFixed(2)) });
    toast(`${kind} applied`, { description: `Edit ${nextEdits} / 8` });
  }

  function approve() {
    if (!onBrand[selected.id] || !accurate[selected.id]) return;
    patch(selected.id, { state: "approved" });
    toast.success("Approved → Scheduled", { description: selected.title });
  }

  function requestEdit() {
    patch(selected.id, { state: "returned" });
    toast("Sent back for edits", { description: "Author notified" });
  }

  function submitReject() {
    if (!reason.trim()) return;
    patch(selected.id, { state: "rejected" });
    setReasonOpen(false);
    setReason("");
    toast.error("Rejected · regenerating", { description: "Quality-gate will retry" });
  }

  return (
    <ProjectShell active="review" breadcrumb={["Human review"]}>
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
        {/* Header */}
        <header className="border-b border-line bg-paper px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <ShieldCheck className="size-5" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-medium tracking-tight text-ink-900">Human review</h1>
                <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-ink-700">
                  <span className="size-1.5 rounded-full bg-brand-700" />
                  Northbound Coffee Roasters
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PoolTile label="In progress" value={counts.inProgress} tone="live" />
              <PoolTile label="Returned" value={counts.returned} tone="warn" />
              <PoolTile label="Approved today" value={counts.approvedToday} tone="neutral" />
              <PoolTile label="Overdue" value={counts.overdue} tone="danger" />
            </div>
          </div>

          {/* Honesty banner */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-xs text-ink-700">
            <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <span className="text-ink-900">AI-only with an automatic quality-gate is the default.</span>{" "}
              This project has human review on Advanced / Premium.
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex min-h-0 flex-1">
          {/* Queue rail */}
          <aside
            className={cn(
              "flex shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200",
              railOpen ? "w-[320px]" : "w-[44px]",
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              {railOpen ? (
                <>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Queue · {visible.length}
                  </span>
                  <button
                    onClick={() => setRailOpen(false)}
                    className="rounded p-1 text-muted-foreground hover:bg-surface-sunken"
                  >
                    <ChevronLeft className="size-4" strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setRailOpen(true)}
                  className="mx-auto rounded p-1 text-muted-foreground hover:bg-surface-sunken"
                >
                  <ChevronRight className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {railOpen ? (
              <>
                <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2">
                  {(["all", "unassigned", "in_progress", "returned", "overdue", "approved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[11px] capitalize transition-colors",
                        filter === s
                          ? "border-ink-900 bg-ink-900 text-paper"
                          : "border-line bg-paper text-ink-700 hover:bg-surface-sunken",
                      )}
                    >
                      {s === "all" ? "All" : STATE_LABEL[s]}
                    </button>
                  ))}
                  <button
                    className="ml-auto inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-surface-sunken"
                    title="Filters: State · Type · Reviewer · SLA"
                  >
                    <Filter className="size-3" strokeWidth={1.5} />
                    More
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {visible.length === 0 ? (
                    <EmptyRail />
                  ) : (
                    visible.map((i) => (
                      <QueueRow
                        key={i.id}
                        item={i}
                        active={i.id === selectedId}
                        onSelect={() => setSelectedId(i.id)}
                        onAssignMe={() => assignToMe(i.id)}
                      />
                    ))
                  )}
                </div>
              </>
            ) : null}
          </aside>

          {/* Content pane */}
          <section className="flex min-w-0 flex-1 flex-col bg-paper">
            {selected.state === "approved" || selected.state === "rejected" ? (
              <ResultBanner state={selected.state} />
            ) : null}

            {/* Context strip + toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-7 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-ink-700">
                  <Hash className="size-3 text-muted-foreground" strokeWidth={1.5} />
                  <span className="font-mono-num">{selected.keyword}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-ink-700">
                  <Globe2 className="size-3 text-muted-foreground" strokeWidth={1.5} />
                  {selected.locale}
                </span>
                {selected.target === "site" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-100 px-2 py-1 text-brand-700">
                    <CircleDot className="size-3" strokeWidth={1.5} />
                    Site · Publishing now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-muted-foreground">
                    <Lock className="size-3" strokeWidth={1.5} />
                    Social · Best-effort · pending platform audit
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <EditBtn label="Fix copy" icon={Wand} onClick={() => bumpEdit("Fix copy")} disabled={selected.edits >= 8} />
                <EditBtn label="Trim" icon={Scissors} onClick={() => bumpEdit("Trim")} disabled={selected.edits >= 8} />
                <EditBtn label="Tone tweak" icon={RotateCcw} onClick={() => bumpEdit("Tone tweak")} disabled={selected.edits >= 8} />
              </div>
            </div>

            {/* Article body */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <article className="mx-auto max-w-3xl px-8 py-10">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-wider text-muted-foreground">
                  <span>{selected.id}</span>
                  <span>·</span>
                  <span>{selected.type}</span>
                </div>
                <h2 className="text-3xl font-medium leading-[1.15] tracking-tight text-ink-900">
                  {selected.title}
                </h2>
                <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-ink-700">
                  {selected.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Draft generated by the engine · quality-gate passed · awaiting your sign-off.
                </p>
              </article>
            </div>
          </section>

          {/* Checklist rail */}
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-line bg-surface lg:flex">
            <div className="border-b border-line px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Reviewer
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {selected.reviewer ? (
                  <div className="flex items-center gap-2">
                    <Avatar initials={selected.reviewer.initials} />
                    <div className="min-w-0">
                      <div className="truncate text-sm text-ink-900">{selected.reviewer.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {selected.reviewer.role}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                )}
                <button
                  onClick={() =>
                    selected.reviewer ? reassign(selected.id) : assignToMe(selected.id)
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                >
                  <UserPlus className="size-3" strokeWidth={1.5} />
                  {selected.reviewer ? "Reassign" : "Assign me"}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-700">
                {selected.state === "overdue" ? (
                  <>
                    <AlertTriangle className="size-3.5 text-[color:var(--danger)]" strokeWidth={1.5} />
                    <span className="font-mono-num text-[color:var(--danger)]">
                      overdue by {Math.abs(selected.hoursLeft)}h
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="font-mono-num">due in {selected.hoursLeft}h</span>
                  </>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">SLA on assignment</span>
              </div>
            </div>

            <div className="border-b border-line px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Checklist
              </div>
              <div className="mt-3 space-y-2">
                <CheckRow
                  label="On-brand"
                  checked={!!onBrand[selected.id]}
                  onToggle={() =>
                    setOnBrand((s) => ({ ...s, [selected.id]: !s[selected.id] }))
                  }
                />
                <CheckRow
                  label="Accurate · no invented attributes"
                  checked={!!accurate[selected.id]}
                  onToggle={() =>
                    setAccurate((s) => ({ ...s, [selected.id]: !s[selected.id] }))
                  }
                />
                <div className="flex items-center justify-between rounded-md border border-line bg-paper px-2.5 py-2 text-xs">
                  <div className="flex items-center gap-2 text-ink-700">
                    <CheckCircle2
                      className="size-4 text-brand-700"
                      strokeWidth={1.5}
                    />
                    Quality-gate passed
                  </div>
                  <span className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
                    auto
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-line px-4 py-3">
              <div className="flex items-center justify-between text-[11px] font-mono-num uppercase tracking-wider">
                <span className="text-muted-foreground">Edits</span>
                <span className={cn("text-ink-900", selected.edits >= 8 && "text-[color:var(--danger)]")}>
                  {selected.edits} / 8
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    selected.edits >= 8 ? "bg-[color:var(--danger)]" : "bg-brand-700",
                  )}
                  style={{ width: `${(selected.edits / 8) * 100}%` }}
                />
              </div>
              <div
                className="mt-2 flex items-center justify-between text-[11px] font-mono-num text-muted-foreground"
                title="Share of pay retained after edits"
              >
                <span>take rate</span>
                <span className="text-[color:var(--accent-gold)]">
                  {selected.takeRate.toFixed(2)} / 0.75 cap
                </span>
              </div>
              {selected.edits >= 8 ? (
                <div className="mt-2 rounded-md border border-[#F1D2CE] bg-[#F7E2DF] px-2 py-1.5 text-[11px] text-[color:var(--danger)]">
                  Edit cap reached · inline edits disabled
                </div>
              ) : null}
            </div>

            <div className="mt-auto space-y-2 px-4 py-4">
              <button
                onClick={approve}
                disabled={!onBrand[selected.id] || !accurate[selected.id] || selected.state === "approved"}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  onBrand[selected.id] && accurate[selected.id] && selected.state !== "approved"
                    ? "bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
                    : "cursor-not-allowed bg-surface-sunken text-muted-foreground",
                )}
              >
                Approve → Scheduled
              </button>
              <div className="flex gap-2">
                <button
                  onClick={requestEdit}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink-700 hover:bg-surface-sunken"
                >
                  <Send className="size-3.5" strokeWidth={1.5} />
                  Request edit
                </button>
                <button
                  onClick={() => setReasonOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#F1D2CE] bg-[#F7E2DF] px-3 py-2 text-xs text-[color:var(--danger)] hover:bg-[#F1D2CE]/60"
                >
                  <XCircle className="size-3.5" strokeWidth={1.5} />
                  Reject
                </button>
              </div>
              {selected.state === "overdue" ? (
                <button
                  onClick={() => reassign(selected.id)}
                  className="w-full rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[color:var(--accent-gold)] hover:opacity-90"
                >
                  Reassign · escalate
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {reasonOpen ? (
        <RejectDialog
          reason={reason}
          setReason={setReason}
          onClose={() => setReasonOpen(false)}
          onSubmit={submitReject}
        />
      ) : null}
    </ProjectShell>
  );
}

/* ============================ subcomponents ============================ */

function PoolTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "live" | "warn" | "danger";
}) {
  const dot =
    tone === "live"
      ? "bg-brand-700"
      : tone === "warn"
        ? "bg-[color:var(--accent-gold)]"
        : tone === "danger"
          ? "bg-[color:var(--danger)]"
          : "bg-muted-foreground/40";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5">
      <span className={cn("size-1.5 rounded-full", dot)} />
      <span className="font-mono-num text-sm text-ink-900">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function QueueRow({
  item,
  active,
  onSelect,
  onAssignMe,
}: {
  item: Item;
  active: boolean;
  onSelect: () => void;
  onAssignMe: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-b border-line px-3 py-3 transition-colors",
        active ? "bg-paper" : "hover:bg-surface-sunken/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono-num text-[10px] text-muted-foreground">{item.id}</span>
            <TypeChip type={item.type} />
          </div>
          <div className="mt-1 truncate text-sm text-ink-900">{item.title}</div>
        </div>
        <StatusChip tone={STATE_TONE[item.state]}>{STATE_LABEL[item.state]}</StatusChip>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          {item.reviewer ? (
            <>
              <Avatar size="xs" initials={item.reviewer.initials} />
              <span className="text-muted-foreground">{item.reviewer.name}</span>
            </>
          ) : (
            <span className="rounded border border-dashed border-line px-1.5 py-0.5 text-muted-foreground">
              Unassigned
            </span>
          )}
        </div>
        {item.state === "overdue" ? (
          <span className="inline-flex items-center gap-1 font-mono-num text-[color:var(--danger)]">
            <AlertTriangle className="size-3" strokeWidth={1.5} />
            {Math.abs(item.hoursLeft)}h over
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-mono-num text-muted-foreground">
            <Clock className="size-3" strokeWidth={1.5} />
            due in {item.hoursLeft}h
          </span>
        )}
      </div>
      {item.state === "unassigned" ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignMe();
          }}
          className="mt-2 w-full rounded-md border border-line bg-paper px-2 py-1 text-[11px] text-ink-900 hover:bg-surface-sunken"
        >
          Assign to me
        </button>
      ) : null}
    </div>
  );
}

function TypeChip({ type }: { type: ItemType }) {
  return (
    <span className="rounded border border-line bg-surface px-1 py-0 text-[10px] uppercase tracking-wider text-muted-foreground">
      {type}
    </span>
  );
}

function Avatar({ initials, size = "sm" }: { initials: string; size?: "xs" | "sm" }) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-brand-100 text-brand-700",
        size === "xs" ? "size-5 text-[9px]" : "size-7 text-[11px]",
      )}
    >
      {initials}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-xs transition-colors",
        checked
          ? "border-brand-100 bg-brand-100 text-brand-700"
          : "border-line bg-paper text-ink-700 hover:bg-surface-sunken",
      )}
    >
      <span className="flex items-center gap-2">
        {checked ? (
          <CheckCircle2 className="size-4" strokeWidth={1.5} />
        ) : (
          <span className="size-4 rounded border border-line bg-surface" />
        )}
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-60">
        {checked ? "Pass" : "Tap"}
      </span>
    </button>
  );
}

function EditBtn({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: typeof Wand;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
        disabled
          ? "cursor-not-allowed border-line bg-surface-sunken text-muted-foreground"
          : "border-line bg-surface text-ink-700 hover:border-ink-700/30 hover:bg-paper",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} />
      {label}
    </button>
  );
}

function ResultBanner({ state }: { state: "approved" | "rejected" }) {
  if (state === "approved") {
    return (
      <div className="flex items-center gap-2 border-b border-brand-100 bg-brand-100 px-7 py-2 text-xs text-brand-700">
        <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
        Approved · moved to Scheduled
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 border-b border-[#F1D2CE] bg-[#F7E2DF] px-7 py-2 text-xs text-[color:var(--danger)]">
      <XCircle className="size-3.5" strokeWidth={1.5} />
      Rejected · queued for regeneration
    </div>
  );
}

function EmptyRail() {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-full border border-line bg-surface text-muted-foreground">
        <Inbox className="size-5" strokeWidth={1.5} />
      </div>
      <div className="mt-3 text-sm text-ink-900">No items awaiting human review</div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
        AI-only items export and publish automatically once the quality-gate passes.
      </div>
    </div>
  );
}

function RejectDialog({
  reason,
  setReason,
  onClose,
  onSubmit,
}: {
  reason: string;
  setReason: (s: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md p-5">
        <div className="flex items-center gap-2 text-ink-900">
          <XCircle className="size-4 text-[color:var(--danger)]" strokeWidth={1.5} />
          <span className="text-sm font-medium">Reject and regenerate</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Capture a short reason — the engine uses it to seed the next draft.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What's off? (tone, facts, structure…)"
          className="mt-3 h-24 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!reason.trim()}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs",
              reason.trim()
                ? "bg-[color:var(--danger)] text-white hover:opacity-90"
                : "cursor-not-allowed bg-surface-sunken text-muted-foreground",
            )}
          >
            Reject · regen
          </button>
        </div>
      </Card>
    </div>
  );
}
