import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  X,
  Star,
  MessageSquare,
  Paperclip,
  Filter,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/features/shell/AppShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/review")({ component: ReviewPage });

type Status = "Unassigned" | "In progress" | "In QA" | "Returned";
type Priority = "P0" | "P1" | "P2";

type Item = {
  id: string;
  title: string;
  project: string;
  type: string;
  assignee: { name: string; initials: string; rating: number } | null;
  sla: string;
  overdue?: boolean;
  priority: Priority;
  status: Status;
  cost: number;
  takeRate: number;
};

const ITEMS: Item[] = [
  {
    id: "ITM-241",
    title: "Why we batch-roast on Tuesdays — long-form",
    project: "Vellum & Bean",
    type: "Article · 1,800w",
    assignee: null,
    sla: "P1 · first review in 42h",
    priority: "P1",
    status: "Unassigned",
    cost: 84,
    takeRate: 22,
  },
  {
    id: "ITM-238",
    title: "Origin spotlight: Yirgacheffe Konga Co-op",
    project: "Vellum & Bean",
    type: "Article · 1,200w",
    assignee: { name: "Marta L.", initials: "ML", rating: 4.9 },
    sla: "due in 6h",
    priority: "P0",
    overdue: true,
    status: "In progress",
    cost: 64,
    takeRate: 22,
  },
  {
    id: "ITM-236",
    title: "Espresso machine maintenance checklist",
    project: "Northwall Roasters",
    type: "Guide · 900w",
    assignee: { name: "Daniel R.", initials: "DR", rating: 4.7 },
    sla: "due in 31h",
    priority: "P2",
    status: "In QA",
    cost: 48,
    takeRate: 25,
  },
  {
    id: "ITM-230",
    title: "Pour-over vs immersion — buyer's guide",
    project: "Vellum & Bean",
    type: "Article · 1,500w",
    assignee: { name: "Iris K.", initials: "IK", rating: 5.0 },
    sla: "returned · client edits requested",
    priority: "P1",
    status: "Returned",
    cost: 72,
    takeRate: 22,
  },
  {
    id: "ITM-228",
    title: "Holiday gift bundles — landing copy",
    project: "Cedar & Sumac",
    type: "Landing · 600w",
    assignee: null,
    sla: "P2 · 72h",
    priority: "P2",
    status: "Unassigned",
    cost: 36,
    takeRate: 22,
  },
];

function ReviewPage() {
  const [open, setOpen] = useState<Item | null>(null);
  const [role, setRole] = useState<"client" | "manager">("manager");

  return (
    <AppShell active="review" breadcrumb={["Projects", "Vellum & Bean", "Human Review"]}>
      <div className="mx-auto w-full max-w-7xl px-8 py-8">
        <header className="flex items-end justify-between gap-6 pb-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Option Б · Human-in-the-loop
            </div>
            <h1 className="font-display text-3xl text-ink-900">Review queue</h1>
            <p className="text-sm text-muted-foreground">
              Real editors, calm pace. SLA targets: P0 &lt; 24h · P1 first review 48h · full 48–72h.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line bg-surface p-0.5 text-xs">
              {(["client", "manager"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-md px-3 py-1.5 capitalize transition-colors",
                    role === r ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-surface-sunken",
                  )}
                >
                  {r === "client" ? "Client view" : "Manager view"}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
              <Filter className="size-3.5" strokeWidth={1.5} /> Filter
            </button>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 pb-6">
          <Kpi label="Unassigned" value="2" tone="warn" />
          <Kpi label="In progress" value="1" tone="info" />
          <Kpi label="In QA" value="1" />
          <Kpi label="Avg first-review" value="38h" hint="SLA target 48h" />
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_1fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-line bg-surface-sunken px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Item</div>
            <div>Project</div>
            <div>Type</div>
            <div>Assignee</div>
            <div>SLA</div>
            <div>Status</div>
            <div className="text-right">{role === "manager" ? "Cost" : ""}</div>
          </div>
          {ITEMS.map((i) => (
            <button
              key={i.id}
              onClick={() => setOpen(i)}
              className="grid w-full grid-cols-[1.6fr_1fr_0.8fr_1fr_0.8fr_0.8fr_0.6fr] items-center gap-4 border-b border-line px-5 py-4 text-left text-sm transition-colors last:border-b-0 hover:bg-surface-sunken/60"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-num text-[10px] text-muted-foreground">{i.id}</span>
                  <PriorityChip p={i.priority} />
                </div>
                <div className="truncate text-ink-900">{i.title}</div>
              </div>
              <div className="text-ink-700">{i.project}</div>
              <div className="text-muted-foreground">{i.type}</div>
              <div>
                {i.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-full bg-brand-100 font-display text-[11px] text-brand-700">
                      {i.assignee.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs text-ink-900">{i.assignee.name}</div>
                      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Star className="size-2.5 fill-current text-[color:var(--accent-gold)]" strokeWidth={0} />
                        {i.assignee.rating}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">— auto-match pending</span>
                )}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  i.overdue ? "text-[color:var(--danger)]" : "text-ink-700",
                )}
              >
                {i.overdue ? <AlertTriangle className="size-3.5" strokeWidth={1.5} /> : <Clock className="size-3.5" strokeWidth={1.5} />}
                {i.sla}
              </div>
              <div>
                <StatusChip
                  tone={
                    i.status === "Unassigned"
                      ? "warn"
                      : i.status === "In progress"
                        ? "info"
                        : i.status === "In QA"
                          ? "preview"
                          : "danger"
                  }
                >
                  {i.status}
                </StatusChip>
              </div>
              <div className="text-right">
                {role === "manager" ? (
                  <div className="space-y-0.5">
                    <div className="font-mono-num text-xs text-ink-900">${i.cost}</div>
                    <div className="font-mono-num text-[10px] text-muted-foreground">
                      take {i.takeRate}%
                    </div>
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </Card>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 text-sm">
          <div className="flex items-center gap-3 text-ink-700">
            <Inbox className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span>
              No freelancers available for P0 spike?{" "}
              <span className="text-ink-900">Auto-routes to LetoLab in-house experts.</span>
            </span>
          </div>
          <StatusChip tone="gold">Fallback ready</StatusChip>
        </div>
      </div>

      {open ? <Drawer item={open} onClose={() => setOpen(null)} /> : null}
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "warn" | "info";
}) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono-num text-2xl text-ink-900">{value}</span>
        {tone !== "neutral" ? <StatusChip tone={tone}>now</StatusChip> : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </Card>
  );
}

function PriorityChip({ p }: { p: Priority }) {
  const tone = p === "P0" ? "danger" : p === "P1" ? "warn" : "neutral";
  return <StatusChip tone={tone as any}>{p}</StatusChip>;
}

function Drawer({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-[560px] flex-col border-l border-line bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono-num text-[10px] text-muted-foreground">{item.id}</span>
              <PriorityChip p={item.priority} />
              <StatusChip tone="info">{item.status}</StatusChip>
            </div>
            <div className="mt-1 truncate font-display text-lg text-ink-900">{item.title}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-surface-sunken">
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <Section title="Brief">
            <p className="text-sm leading-relaxed text-ink-700">
              Long-form on batch-roasting cadence. Tone: warm, expert, no jargon. Reader: café
              owners shopping wholesale. Include 2 internal links to /shop and /process.
            </p>
          </Section>

          <Section title="AI draft">
            <div className="rounded-lg border border-line bg-surface p-4 text-sm leading-relaxed text-ink-700">
              <p>
                Tuesdays are a deliberate choice. Green coffee arrives Friday, rests through the
                weekend, and by Tuesday morning the beans have settled into their best window for
                heat development…
              </p>
              <p className="mt-2 text-muted-foreground">— 1,742 / 1,800 words generated</p>
            </div>
          </Section>

          <Section title="Requirements checklist">
            <ul className="space-y-2 text-sm">
              {["Brand voice (warm, expert)", "2 internal links", "1 primary keyword cluster", "Schema: Article"].map(
                (r) => (
                  <li key={r} className="flex items-center gap-2 text-ink-700">
                    <CheckCircle2 className="size-4 text-brand-700" strokeWidth={1.5} />
                    {r}
                  </li>
                ),
              )}
            </ul>
          </Section>

          <Section title="Thread">
            <div className="space-y-3">
              <Msg who="Marta L." text="Pulled the green-coffee timeline from the Friday log — adding a 2-line callout." />
              <Msg who="Eliza M." mine text="Perfect. Keep the photo caption playful, please." />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                placeholder="Reply…"
                className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
              />
              <button className="rounded-lg border border-line bg-surface p-2 hover:bg-surface-sunken">
                <Paperclip className="size-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-6 py-4">
          <div className="text-xs text-muted-foreground">
            QA checklist runs before client return
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
              Return
            </button>
            <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-ink-700/30">
              Claim
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm text-paper hover:bg-ink-700">
              Submit to QA
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>
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

function Msg({ who, text, mine }: { who: string; text: string; mine?: boolean }) {
  return (
    <div className={cn("flex gap-2", mine && "flex-row-reverse")}>
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-[11px] text-brand-700">
        {who.split(" ").map((p) => p[0]).join("")}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
          mine ? "bg-ink-900 text-paper" : "bg-surface ring-1 ring-line text-ink-700",
        )}
      >
        <div className={cn("mb-0.5 text-[10px]", mine ? "text-paper/60" : "text-muted-foreground")}>
          {who}
        </div>
        {text}
      </div>
    </div>
  );
}

// silence MessageSquare unused warning
void MessageSquare;