// Project Build-Status — platform-admin (founder/eng) build/deploy/flag console.
// NOT customer data. Mock UI only — most widgets are honestly 🔴 PendingChip.
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminPage } from "@/features/admin/AdminPage";
import { useAdmin } from "@/features/admin/AdminContext";
import { DataPanel, Dot, TrafficLight, type Tone } from "@/features/admin/ui";

export const Route = createFileRoute("/admin/build")({
  component: BuildPage,
});

/* =============================== mock data ============================== */

type Mode = "REAL" | "STUB" | "PARTIAL" | "CONTRACT-ONLY";
const MODE_TONE: Record<Mode, Tone> = {
  REAL: "success",
  STUB: "warning",
  PARTIAL: "muted",
  "CONTRACT-ONLY": "info",
};

type Component = {
  id: string;
  name: string;
  mode: Mode;
  backing: string;
  impact: string;
  action?: string;
};

const COMPONENTS: Component[] = [
  { id: "ai_gateway", name: "AI Gateway (text LLM)", mode: "STUB", backing: "ANTHROPIC_API_KEY: unset", impact: "generations ~$0, content placeholder; margin unverifiable", action: "Flip to real →" },
  { id: "auth", name: "Auth / RLS isolation", mode: "PARTIAL", backing: "RlsInterceptor: active?", impact: "cross-tenant safety — verify before launch" },
  { id: "orchestrator", name: "Orchestrator", mode: "STUB", backing: "ORCHESTRATOR=Local (echo only)", impact: "jobs table not written → queue health blind" },
  { id: "connector", name: "WP Connector", mode: "CONTRACT-ONLY", backing: "plugin v0.1.0", impact: "publish path not live (connector task)" },
  { id: "segmentation", name: "Segmentation classifier", mode: "STUB", backing: "classifier=heuristic-stub", impact: "archetype suggestion not persisted → override-rate blind" },
  { id: "frontend", name: "Frontend (this SPA)", mode: "REAL", backing: "Vercel prod · a1f3c9d", impact: "live to pre-launch users behind basic-auth gate" },
];

type Deploy = {
  id: string;
  name: string;
  env: string;
  envTone: "info" | "muted" | "danger" | "success";
  health: Tone;
  healthLabel: string;
  lastProbe: string;
  commit: string;
};

const DEPLOYS: Deploy[] = [
  { id: "fe", name: "Frontend", env: "Vercel prod", envTone: "success", health: "success", healthLabel: "live", lastProbe: "2026-06-29 10:42 UTC", commit: "a1f3c9d" },
  { id: "be", name: "Backend (NestJS)", env: "local only", envTone: "muted", health: "muted", healthLabel: "not deployed", lastProbe: "—", commit: "9c2e810" },
  { id: "conn", name: "WP Connector", env: "contract-only", envTone: "info", health: "danger", healthLabel: "n/a", lastProbe: "—", commit: "0.1.0" },
  { id: "sb", name: "Supabase", env: "live (local-first)", envTone: "success", health: "success", healthLabel: "live", lastProbe: "2026-06-29 10:41 UTC", commit: "—" },
];

type SocialStatus = "self-only" | "pending review" | "approved";
const SOCIAL_TONE: Record<SocialStatus, Tone> = {
  "self-only": "muted",
  "pending review": "warning",
  approved: "success",
};
const SOCIALS: { name: string; status: SocialStatus; submitted: string; note: string }[] = [
  { name: "Instagram", status: "pending review", submitted: "2026-05-12", note: "app review in progress" },
  { name: "TikTok", status: "self-only", submitted: "—", note: "no business API access yet" },
  { name: "LinkedIn", status: "approved", submitted: "2026-04-18", note: "share API approved (single account)" },
  { name: "X", status: "pending review", submitted: "2026-06-02", note: "Basic tier — write quota pending" },
  { name: "Facebook", status: "pending review", submitted: "2026-05-12", note: "bundled with IG review" },
  { name: "Pinterest", status: "self-only", submitted: "—", note: "Business API not requested" },
];

const UNCOVERED_ARTIFACTS: { key: string; createdAt: string }[] = [
  { key: "art_8f2a · brief.draft", createdAt: "2026-06-28 09:14" },
  { key: "art_3b71 · strategy.json", createdAt: "2026-06-28 14:02" },
  { key: "art_a40c · analysis.summary", createdAt: "2026-06-29 02:38" },
];

type Flag = {
  key: string;
  scope: "global" | "per-tier" | "per-org";
  state: boolean;
  lastChanged: { actor: string; at: string };
  note: string;
  kill?: boolean;
  blockOn?: "ai_key_unset";
};

const BUILD_FLAGS: Flag[] = [
  { key: "ai_gateway.real_key", scope: "global", state: false, lastChanged: { actor: "—", at: "—" }, note: "Flipping requires a live ANTHROPIC_API_KEY", blockOn: "ai_key_unset" },
  { key: "connector.publish", scope: "global", state: false, lastChanged: { actor: "—", at: "—" }, note: "Off until WP plugin ships" },
  { key: "segmentation.classifier", scope: "global", state: false, lastChanged: { actor: "—", at: "—" }, note: "Heuristic-only until classifier is wired" },
  { key: "basic_auth.prelaunch_gate", scope: "global", state: true, lastChanged: { actor: "founder@postics.io", at: "2026-06-20 11:00" }, note: "Gates the whole pre-launch site" },
];

const KILL_SWITCHES: Flag[] = [
  { key: "video.generation", scope: "global", state: true, lastChanged: { actor: "founder@postics.io", at: "2026-06-26 18:11" }, note: "Flip OFF instantly to stop spend on flagship video", kill: true },
  { key: "image.generation", scope: "global", state: true, lastChanged: { actor: "founder@postics.io", at: "2026-06-26 18:11" }, note: "Stops all image jobs across orgs", kill: true },
  { key: "flagship.routing", scope: "per-tier", state: true, lastChanged: { actor: "—", at: "—" }, note: "Route Premium video to flagship model", kill: true },
  { key: "autopublish.wp_social", scope: "global", state: true, lastChanged: { actor: "—", at: "—" }, note: "Disable to halt all auto-publish to site + socials", kill: true },
  { key: "signups.new", scope: "global", state: true, lastChanged: { actor: "—", at: "—" }, note: "Pause new signups across plans", kill: true },
];

/* =============================== page =================================== */

function BuildPage() {
  const { session } = useAdmin();
  if (session?.role !== "platform") return <Navigate to="/admin" />;

  const [smokeOpen, setSmokeOpen] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);

  return (
    <AdminPage
      title="Build Status"
      breadcrumb={["Admin", "Platform", "Build Status"]}
      actions={
        <>
          <span
            className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-brand-700/30 bg-brand-100 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-brand-700"
            title="Founder / engineering only — build-control plane, not tenant data."
          >
            <span className="inline-block size-1.5 rounded-full bg-brand-700" />
            Platform-only · founder/eng
          </span>
          <button
            onClick={() => setSmokeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            <Play className="size-3.5" strokeWidth={1.75} />
            Run smoke test
          </button>
        </>
      }
    >
      <p className="-mt-2 max-w-3xl text-[13px] text-muted-foreground">
        Stub-vs-real, milestones, deploy &amp; flags. Build-control plane, not tenant data.
      </p>

      <SummaryCards />

      <div className="mt-5 space-y-5">
        <ComponentMatrix />
        <MilestoneAndExit onEdit={() => setMilestoneOpen(true)} />
        <DeployStatus />
        <SocialApprovals />
        <SpendCoverage />
        <FlagRegistry />
      </div>

      {smokeOpen ? <SmokeTestDialog onClose={() => setSmokeOpen(false)} /> : null}
      {milestoneOpen ? <MilestoneEditor onClose={() => setMilestoneOpen(false)} /> : null}
    </AdminPage>
  );
}

/* ============================ small shared ============================== */

function PendingChip({ note, className }: { note: string; className?: string }) {
  return (
    <span
      title={note}
      className={cn(
        "font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className="inline-block size-1.5 rounded-full" style={{ backgroundColor: "var(--danger)" }} />
      Pending instrumentation
      <Info className="size-3" strokeWidth={1.75} />
    </span>
  );
}

function PendingFrame({ children }: { children: ReactNode }) {
  return <div className="relative opacity-80">{children}</div>;
}

function ModeBadge({ mode }: { mode: Mode }) {
  return <TrafficLight tone={MODE_TONE[mode]} label={mode} />;
}

/* ============================ summary cards ============================= */

function SummaryCards() {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Components real"
        value="1 / 5"
        unit="real"
        pending="registry of component build-state (env flags + ROADMAP) — pending backend registry"
      >
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: i === 0 ? "var(--success)" : "var(--surface-sunken)" }}
            />
          ))}
        </div>
      </SummaryCard>

      <SummaryCard
        label="Milestone"
        value="M0"
        unit="sprint S2 of S3"
        pending="parse ROADMAP.md → milestone/sprint registry (pending backend registry)"
      >
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full bg-brand-700" style={{ width: "66%" }} />
        </div>
      </SummaryCard>

      <SummaryCard
        label="MVP-core exit"
        value="3 / 5"
        unit="gates passed"
        pending="exit-checklist not instrumented (pending backend registry)"
      >
        <div className="font-mono-num mt-2 flex gap-1 text-[10px] text-muted-foreground">
          {["analyze", "plan", "generate", "QA", "export"].map((g, i) => (
            <span key={g} className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-line py-0.5">
              {i < 3 ? (
                <CheckCircle2 className="size-2.5" strokeWidth={2} style={{ color: "var(--success)" }} />
              ) : (
                <Circle className="size-2.5" strokeWidth={2} />
              )}
              {g}
            </span>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard
        label="Spend-coverage"
        value="98.2%"
        unit="artifacts ledger-linked"
        live
        tone="success"
      >
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full" style={{ width: "98.2%", backgroundColor: "var(--success)" }} />
          </div>
          <span className="font-mono-num text-[10px]" style={{ color: "var(--danger)" }}>1.8%</span>
        </div>
      </SummaryCard>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  pending,
  live,
  tone = "muted",
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  pending?: string;
  live?: boolean;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {live ? (
          <span className="font-mono-num inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--success)" }}>
            <Dot tone={tone} /> live
          </span>
        ) : pending ? (
          <PendingChip note={pending} />
        ) : null}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="font-mono-num text-2xl tabular-nums text-ink-900">{value}</div>
        {unit ? <div className="text-[11px] text-muted-foreground">{unit}</div> : null}
      </div>
      {children}
    </div>
  );
}

/* ============== Section 1 — Stub-vs-Real Component Matrix ============== */

function ComponentMatrix() {
  const [flagOpen, setFlagOpen] = useState<Flag | null>(null);
  const aiFlag = BUILD_FLAGS.find((f) => f.key === "ai_gateway.real_key")!;
  return (
    <DataPanel
      title="Component matrix · stub vs real"
      hint="What the platform actually runs vs what is still a placeholder."
      actions={
        <PendingChip note="needs build-status registry: read env (ANTHROPIC_API_KEY?, RlsInterceptor active?, ORCHESTRATOR=Local|Inngest) + ROADMAP — pending backend registry" />
      }
    >
      <PendingFrame>
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-sunken/60 text-left">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Backing</th>
                <th className="px-3 py-2">Cost / quality impact</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMPONENTS.map((c) => (
                <tr key={c.id} className="hover:bg-surface-sunken/30">
                  <td className="px-3 py-2 text-ink-900">{c.name}</td>
                  <td className="px-3 py-2"><ModeBadge mode={c.mode} /></td>
                  <td className="px-3 py-2 font-mono-num text-[11px] text-muted-foreground">{c.backing}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.impact}</td>
                  <td className="px-3 py-2 text-right">
                    {c.id === "ai_gateway" ? (
                      <button
                        onClick={() => setFlagOpen(aiFlag)}
                        className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                      >
                        Flip to real →
                      </button>
                    ) : (
                      <span className="font-mono-num text-[10px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PendingFrame>

      {flagOpen ? (
        <FlagToggleDialog flag={flagOpen} onClose={() => setFlagOpen(null)} />
      ) : null}
    </DataPanel>
  );
}

/* ============== Section 2 — Milestone + MVP-core exit ================== */

const MILESTONES = [
  {
    id: "M0",
    label: "M0 · MVP-core",
    state: "active" as const,
    sprints: [
      { id: "S0", label: "S0 · scaffolding", state: "done" as const },
      { id: "S1", label: "S1 · pipeline contract", state: "done" as const },
      { id: "S2", label: "S2 · stub adapters", state: "active" as const },
      { id: "S3", label: "S3 · ledger + audit", state: "planned" as const },
    ],
  },
  { id: "M1", label: "M1 · Connector live", state: "planned" as const },
  { id: "M2", label: "M2 · Real AI Gateway", state: "planned" as const },
  { id: "M3", label: "M3 · Public launch", state: "planned" as const },
];

const EXIT_GATES = [
  { id: "analyze", label: "analyze", pass: true, evidence: "smoke run #142 · 2026-06-25" },
  { id: "plan", label: "plan", pass: true, evidence: "smoke run #142 · 2026-06-25" },
  { id: "generate", label: "generate", pass: true, evidence: "smoke run #144 · 2026-06-27" },
  { id: "qa", label: "QA (G0)", pass: false, evidence: "G0 checker pending — pipeline & quality tab" },
  { id: "export", label: "export", pass: false, evidence: "connector publish path not live" },
];

function MilestoneAndExit({ onEdit }: { onEdit: () => void }) {
  return (
    <DataPanel
      title="Milestones &amp; MVP-core exit"
      hint="MVP-core = analyze → plan → generate → QA → export."
      actions={
        <div className="flex items-center gap-2">
          <PendingChip note="milestone/exit state not instrumented (pending backend registry)" />
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
          >
            <Pencil className="size-3" strokeWidth={1.75} /> Edit
          </button>
        </div>
      }
    >
      <PendingFrame>
        <div className="grid gap-4 md:grid-cols-2">
          {/* milestone rail */}
          <div className="rounded-md border border-line bg-surface-sunken/30 p-3">
            <div className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Roadmap rail
            </div>
            <ol className="mt-3 flex items-center gap-2">
              {MILESTONES.map((m, i) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono-num rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                      m.state === "active"
                        ? "border-brand-700/40 bg-brand-100 text-brand-700"
                        : "border-line bg-surface text-muted-foreground",
                    )}
                  >
                    {m.id}
                  </span>
                  {i < MILESTONES.length - 1 ? (
                    <span className="h-px w-4 bg-line" />
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="font-mono-num mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              M0 sprints
            </div>
            <ol className="mt-1.5 space-y-1.5">
              {MILESTONES[0].sprints!.map((s) => {
                const tone: Tone = s.state === "done" ? "success" : s.state === "active" ? "info" : "muted";
                return (
                  <li key={s.id} className="flex items-center justify-between rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px]">
                    <span className="font-mono-num text-ink-900">{s.label}</span>
                    {s.state === "active" ? (
                      <span className="font-mono-num inline-flex items-center gap-1 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-brand-700">
                        <span className="inline-block size-1.5 rounded-full bg-brand-700" /> active
                      </span>
                    ) : (
                      <TrafficLight tone={tone} label={s.state} />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* exit checklist */}
          <div className="rounded-md border border-line">
            <div className="border-b border-line bg-surface-sunken/60 px-3 py-1.5">
              <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                MVP-core exit checklist · 3 / 5
              </span>
            </div>
            <ul className="divide-y divide-line">
              {EXIT_GATES.map((g) => (
                <li key={g.id} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                  {g.pass ? (
                    <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} style={{ color: "var(--success)" }} />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-mono-num text-ink-900">{g.label}</div>
                    <div className="text-[10px] text-muted-foreground">{g.evidence}</div>
                  </div>
                  <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {g.pass ? "pass" : "pending"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PendingFrame>
    </DataPanel>
  );
}

/* ============== Section 3 — Deploy / env status ======================== */

function DeployStatus() {
  return (
    <DataPanel
      title="Deploy &amp; env status"
      hint="Per-component environment + last health probe."
      actions={<PendingChip note="needs per-component GET /v1/health endpoints (pending backend registry)" />}
    >
      <PendingFrame>
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-sunken/60 text-left">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2">Environment</th>
                <th className="px-3 py-2">Health</th>
                <th className="px-3 py-2">Last probe</th>
                <th className="px-3 py-2">Commit</th>
                <th className="px-3 py-2 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {DEPLOYS.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-2 text-ink-900">{d.name}</td>
                  <td className="px-3 py-2">
                    <TrafficLight tone={d.envTone} label={d.env} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono-num inline-flex items-center gap-1.5 text-[11px]">
                      <Dot tone={d.health} /> {d.healthLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono-num text-[11px] text-muted-foreground">{d.lastProbe}</td>
                  <td className="px-3 py-2 font-mono-num text-[11px] text-ink-700">{d.commit}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => toast("Probe queued · logged")}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                    >
                      Probe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PendingFrame>
    </DataPanel>
  );
}

/* ============== Section 4 — Social-platform approvals ================== */

function SocialApprovals() {
  return (
    <DataPanel
      title="Social-platform approvals"
      hint="The honesty wall — socials are best-effort pending platform audit."
      actions={<PendingChip note="external platform approval status not tracked (best-effort, later)" />}
    >
      <PendingFrame>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIALS.map((s) => (
            <div key={s.name} className="rounded-md border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-[12px] text-ink-900">{s.name}</span>
                <TrafficLight tone={SOCIAL_TONE[s.status]} label={s.status} />
              </div>
              <div className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Submitted · {s.submitted}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </PendingFrame>
    </DataPanel>
  );
}

/* ============== Section 5 — Spend-coverage integrity =================== */

function SpendCoverage() {
  return (
    <DataPanel
      title="Spend-coverage integrity"
      hint="DoD invariant: every artifact links back to a credit_ledger entry."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* LIVE — coverage */}
        <div className="rounded-md border border-line bg-surface-sunken/30 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Artifacts with a ledger ref
            </span>
            <span className="font-mono-num inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--success)" }}>
              <Dot tone="success" /> live
            </span>
          </div>
          <div className="font-mono-num mt-1 text-3xl text-ink-900">98.2%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full" style={{ width: "98.2%", backgroundColor: "var(--success)" }} />
          </div>
          <div className="font-mono-num mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Last 3 uncovered artifacts
          </div>
          <ul className="mt-1.5 divide-y divide-line overflow-hidden rounded border border-line bg-surface">
            {UNCOVERED_ARTIFACTS.map((a) => (
              <li key={a.key} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]">
                <span className="font-mono-num text-ink-700">{a.key}</span>
                <span className="font-mono-num text-[10px] text-muted-foreground">{a.createdAt}</span>
                <span className="font-mono-num text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--danger)" }}>
                  no ledger ref
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PENDING — unbilled spend */}
        <div
          className="rounded-md border p-4"
          style={{ borderColor: "color-mix(in oklab, var(--warning) 35%, var(--line))", backgroundColor: "color-mix(in oklab, var(--warning) 6%, transparent)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-900">
              <AlertTriangle className="size-3" strokeWidth={1.75} style={{ color: "var(--warning)" }} />
              Unbilled analysis / strategy spend
            </span>
            <PendingChip note="bill + log analysis/strategy/brief spend (pending backend)" />
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            <span className="font-mono-num text-ink-900">generateJSON</span> computes but does NOT debit the ledger →
            blind-spot, not in COGS. Frame this as a DoD invariant before launch.
          </p>
          <ul className="font-mono-num mt-3 space-y-1 text-[11px] text-muted-foreground">
            <li>· analysis.summarize — unbilled</li>
            <li>· strategy.compose — unbilled</li>
            <li>· brief.assemble — unbilled</li>
          </ul>
        </div>
      </div>
    </DataPanel>
  );
}

/* ============== Section 6 — Flag / kill-switch registry ================ */

function FlagRegistry() {
  return (
    <DataPanel
      title="Feature-flag &amp; kill-switch registry"
      hint="The control surface. Every toggle is a privileged mutation."
      actions={<PendingChip note="needs a flags table (simple, not LaunchDarkly) — pending backend registry" />}
    >
      <div className="space-y-4">
        <FlagTable label="Build flags · enable real components" flags={BUILD_FLAGS} />
        <FlagTable label="Kill-switches · instant OFF for safety / margin" flags={KILL_SWITCHES} danger />
      </div>
    </DataPanel>
  );
}

function FlagTable({ label, flags, danger }: { label: string; flags: Flag[]; danger?: boolean }) {
  const [target, setTarget] = useState<Flag | null>(null);
  return (
    <div className={cn("overflow-hidden rounded-md border", danger ? "border-[color:var(--danger)]/30" : "border-line")}>
      <div
        className={cn(
          "border-b px-3 py-1.5",
          danger ? "border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5" : "border-line bg-surface-sunken/60",
        )}
      >
        <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      <table className="w-full text-[12px]">
        <thead className="text-left">
          <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-3 py-2">Flag</th>
            <th className="px-3 py-2">Scope</th>
            <th className="px-3 py-2">State</th>
            <th className="px-3 py-2">Last changed</th>
            <th className="px-3 py-2">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {flags.map((f) => (
            <tr key={f.key} id={f.key === "ai_gateway.real_key" ? "flag-ai_gateway-real_key" : undefined}>
              <td className="px-3 py-2 font-mono-num text-ink-900">{f.key}</td>
              <td className="px-3 py-2">
                <span className="font-mono-num rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {f.scope}
                </span>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => setTarget(f)}
                  role="switch"
                  aria-checked={f.state}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                    f.state
                      ? danger
                        ? "border-[color:var(--danger)]/40 bg-[color:var(--danger)]/15"
                        : "border-brand-700/40 bg-brand-100"
                      : "border-line bg-surface-sunken",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-3.5 translate-x-0.5 rounded-full transition-transform",
                      f.state ? "translate-x-[18px]" : "",
                    )}
                    style={{ backgroundColor: f.state ? (danger ? "var(--danger)" : "var(--brand-700)") : "var(--muted-foreground)" }}
                  />
                </button>
                <span className="font-mono-num ml-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {f.state ? "ON" : "OFF"}
                </span>
              </td>
              <td className="px-3 py-2 font-mono-num text-[11px] text-muted-foreground">
                {f.lastChanged.actor === "—" ? "—" : `${f.lastChanged.actor} · ${f.lastChanged.at}`}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{f.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {target ? <FlagToggleDialog flag={target} onClose={() => setTarget(null)} /> : null}
    </div>
  );
}

/* ============================= dialogs ================================== */

function FlagToggleDialog({ flag, onClose }: { flag: Flag; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const nextState = !flag.state;
  const blocked = flag.blockOn === "ai_key_unset" && nextState === true;
  const disabled = reason.trim().length < 3 || blocked;

  const blastRadius = useMemo(() => {
    if (flag.key === "ai_gateway.real_key") {
      return "Real Anthropic calls will start incurring USD COGS; placeholder content ends.";
    }
    if (flag.kill) {
      return nextState
        ? "Re-enables the capability across ALL orgs."
        : "Instantly halts the capability across ALL orgs — break-glass control.";
    }
    return nextState
      ? "Turns the feature ON globally."
      : "Turns the feature OFF globally — dependent paths will fail closed.";
  }, [flag, nextState]);

  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-line bg-surface p-5"
      >
        <h3 className="font-display text-base text-ink-900">
          Flip <span className="font-mono-num">{flag.key}</span> → {nextState ? "ON" : "OFF"}?
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{blastRadius}</p>

        {blocked ? (
          <div
            className="mt-3 rounded-md border px-2.5 py-2 text-[11px]"
            style={{ borderColor: "color-mix(in oklab, var(--danger) 30%, var(--line))", backgroundColor: "color-mix(in oklab, var(--danger) 6%, transparent)", color: "var(--danger)" }}
          >
            Blocked: a valid <span className="font-mono-num">ANTHROPIC_API_KEY</span> must be present (pending backend).
          </div>
        ) : null}

        <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Reason (required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Why are you flipping this?"
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Writes audit-log. Mutations are blocked during impersonation.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() => {
              toast.success(`Flag ${flag.key} → ${nextState ? "ON" : "OFF"} · logged`);
              onClose();
            }}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-paper hover:bg-brand-500 disabled:opacity-50"
          >
            Confirm flip
          </button>
        </div>
      </div>
    </div>
  );
}

function SmokeTestDialog({ onClose }: { onClose: () => void }) {
  type Step = { id: string; label: string; status: "queued" | "running" | "pass" | "fail"; ms?: number };
  const initial: Step[] = [
    { id: "echo", label: "POST /v1/jobs/echo · round-trip", status: "queued" },
    { id: "analyze", label: "pipeline · analyze", status: "queued" },
    { id: "plan", label: "pipeline · plan", status: "queued" },
    { id: "generate", label: "pipeline · generate", status: "queued" },
    { id: "qa", label: "pipeline · QA (G0)", status: "queued" },
    { id: "export", label: "pipeline · export", status: "queued" },
  ];
  const [steps, setSteps] = useState<Step[]>(initial);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const run = () => {
    setSteps(initial);
    setDone(false);
    setRunning(true);
    let i = 0;
    const tick = () => {
      setSteps((prev) => {
        const next = [...prev];
        if (i > 0) {
          // close previous
          const prevStep = next[i - 1];
          const fail = prevStep.id === "qa" || prevStep.id === "export";
          next[i - 1] = { ...prevStep, status: fail ? "fail" : "pass", ms: 120 + i * 80 };
        }
        if (i < next.length) {
          next[i] = { ...next[i], status: "running" };
        }
        return next;
      });
      i++;
      if (i <= initial.length) {
        setTimeout(tick, 450);
      } else {
        setRunning(false);
        setDone(true);
      }
    };
    setTimeout(tick, 200);
  };

  const verdict = useMemo(() => {
    if (!done) return null;
    const failed = steps.some((s) => s.status === "fail");
    return failed ? { tone: "danger" as const, label: "partial · QA + export failing (expected at M0·S2)" } : { tone: "success" as const, label: "pass" };
  }, [done, steps]);

  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-[14px] border border-line bg-surface p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base text-ink-900">Smoke test</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Read-only probe — no tenant data mutated.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PendingChip note="needs a smoke-runner endpoint (pending backend registry)" />
            <button onClick={onClose} className="rounded-md border border-line bg-surface p-1 text-muted-foreground hover:bg-surface-sunken">
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line">
          {steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2.5 px-3 py-2 text-[12px]">
              {s.status === "running" ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" strokeWidth={1.75} />
              ) : s.status === "pass" ? (
                <CheckCircle2 className="size-3.5" strokeWidth={2} style={{ color: "var(--success)" }} />
              ) : s.status === "fail" ? (
                <X className="size-3.5" strokeWidth={2} style={{ color: "var(--danger)" }} />
              ) : (
                <Circle className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              )}
              <span className="font-mono-num flex-1 text-ink-700">{s.label}</span>
              <span className="font-mono-num w-14 text-right text-[10px] text-muted-foreground">
                {s.ms ? `${s.ms} ms` : s.status === "running" ? "…" : "—"}
              </span>
            </li>
          ))}
        </ul>

        {verdict ? (
          <div className="mt-3">
            <TrafficLight tone={verdict.tone} label={`verdict · ${verdict.label}`} />
          </div>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            disabled={running}
            onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(steps, null, 2));
              toast("Result copied to clipboard");
            }}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken disabled:opacity-50"
          >
            Copy result
          </button>
          <button
            onClick={run}
            disabled={running}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-paper hover:bg-brand-500 disabled:opacity-50"
          >
            {done ? "Re-run" : running ? "Running…" : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneEditor({ onClose }: { onClose: () => void }) {
  type Row = { id: string; name: string; target: string; state: "planned" | "active" | "done" };
  const seed: Row[] = [
    { id: "M0-S0", name: "M0 · S0 · scaffolding", target: "2026-05-10", state: "done" },
    { id: "M0-S1", name: "M0 · S1 · pipeline contract", target: "2026-05-31", state: "done" },
    { id: "M0-S2", name: "M0 · S2 · stub adapters", target: "2026-06-30", state: "active" },
    { id: "M0-S3", name: "M0 · S3 · ledger + audit", target: "2026-07-21", state: "planned" },
    { id: "M1", name: "M1 · Connector live", target: "2026-08-15", state: "planned" },
    { id: "M2", name: "M2 · Real AI Gateway", target: "2026-09-01", state: "planned" },
    { id: "M3", name: "M3 · Public launch", target: "2026-10-01", state: "planned" },
  ];
  const [rows, setRows] = useState<Row[]>(seed);
  const [reason, setReason] = useState("");
  const disabled = reason.trim().length < 3;

  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[14px] border border-line bg-surface p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-base text-ink-900">Edit milestones</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Re-shape the M0–M3 rail. Writes audit-log.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md border border-line bg-surface p-1 text-muted-foreground hover:bg-surface-sunken">
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-3 max-h-[300px] overflow-y-auto rounded-md border border-line">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-sunken/60 text-left">
              <tr className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-3 py-1.5">
                    <input
                      value={r.name}
                      onChange={(e) => setRows((rs) => rs.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                      className="font-mono-num w-full rounded border border-line bg-surface-sunken/40 px-2 py-1 text-[12px] outline-none focus:border-brand-500"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="date"
                      value={r.target}
                      onChange={(e) => setRows((rs) => rs.map((x, i) => (i === idx ? { ...x, target: e.target.value } : x)))}
                      className="font-mono-num rounded border border-line bg-surface-sunken/40 px-2 py-1 text-[11px] outline-none focus:border-brand-500"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={r.state}
                      onChange={(e) => setRows((rs) => rs.map((x, i) => (i === idx ? { ...x, state: e.target.value as Row["state"] } : x)))}
                      className="font-mono-num rounded border border-line bg-surface-sunken/40 px-2 py-1 text-[11px] outline-none focus:border-brand-500"
                    >
                      <option value="planned">planned</option>
                      <option value="active">active</option>
                      <option value="done">done</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))}
                      className="rounded-md border border-line bg-surface p-1 text-muted-foreground hover:bg-surface-sunken"
                    >
                      <Trash2 className="size-3" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setRows((rs) => [...rs, { id: `new-${rs.length}`, name: "M? · new", target: "", state: "planned" }])}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
        >
          <Plus className="size-3" strokeWidth={1.75} /> Add row
        </button>

        <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Reason (required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Why are you re-shaping the rail?"
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Writes audit-log.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken">
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() => {
              toast.success("Milestones updated · logged");
              onClose();
            }}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-paper hover:bg-brand-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}