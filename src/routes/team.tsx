import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, MoreHorizontal, Plus, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, SectionTitle, StatusChip } from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team & roles — Postics" }] }),
  component: Page,
});

type Role = "manager" | "editor" | "viewer";

type Member = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  access: Record<string, boolean>; // projectId -> can touch
};

const ROLE_LABEL: Record<Role, string> = {
  manager: "Manager",
  editor: "Editor",
  viewer: "Viewer",
};

const MEMBERS: Member[] = [
  {
    id: "eliza",
    name: "Eliza Marsden",
    initials: "EM",
    email: "eliza@acmestudio.co",
    role: "manager",
    status: "active",
    access: { "vellum-bean": true, "northwind-tea": true, "linden-mercantile": true, "old-mill-roasters": true },
  },
  {
    id: "raf",
    name: "Rafael Ortiz",
    initials: "RO",
    email: "rafael@acmestudio.co",
    role: "editor",
    status: "active",
    access: { "vellum-bean": true, "northwind-tea": false, "linden-mercantile": true, "old-mill-roasters": false },
  },
  {
    id: "hana",
    name: "Hana Brooks",
    initials: "HB",
    email: "hana@acmestudio.co",
    role: "editor",
    status: "active",
    access: { "vellum-bean": false, "northwind-tea": true, "linden-mercantile": true, "old-mill-roasters": true },
  },
  {
    id: "leo",
    name: "Leo Tanaka",
    initials: "LT",
    email: "leo@acmestudio.co",
    role: "viewer",
    status: "invited",
    access: { "vellum-bean": true, "northwind-tea": false, "linden-mercantile": false, "old-mill-roasters": false },
  },
];

function Page() {
  const { projects } = useScope();
  return (
    <WorkspaceShell active="team" breadcrumb={["Team & roles"]}>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-8 py-8">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Workspace"
            title="Team & roles"
            hint="Invite teammates, assign per-client access, and keep workspace permissions tight."
          />
          <button className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700">
            <Plus className="size-3.5" strokeWidth={1.75} /> Invite member
          </button>
        </div>

        {/* Members table */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.6fr_40px] gap-4 border-b border-line bg-surface-sunken px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <div>Member</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div />
          </div>
          {MEMBERS.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_0.6fr_40px] items-center gap-4 border-b border-line px-5 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-100 font-display text-sm text-brand-700">
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink-900">{m.name}</div>
                  <div className="font-mono-num truncate text-[11px] text-muted-foreground">
                    {m.id === "eliza" ? "Workspace owner" : "Agency team"}
                  </div>
                </div>
              </div>
              <div className="font-mono-num truncate text-xs text-muted-foreground">{m.email}</div>
              <div>
                <RolePill role={m.role} />
              </div>
              <div>
                {m.status === "active" ? (
                  <StatusChip tone="live">Active</StatusChip>
                ) : (
                  <StatusChip tone="info">Invited</StatusChip>
                )}
              </div>
              <button
                aria-label="More"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface-sunken"
              >
                <MoreHorizontal className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </Card>

        {/* Access matrix */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <SectionTitle
              eyebrow="Permissions"
              title="Per-client access matrix"
              hint="Who can touch which client. Manager always sees everything."
            />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Shield className="size-3.5" strokeWidth={1.5} /> Updates apply on save
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-sunken text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-5 py-3 text-left font-medium">Member</th>
                    {projects.map((p) => (
                      <th key={p.id} className="px-3 py-3 text-center font-medium">
                        <div className="text-ink-900">{p.initials}</div>
                        <div className="font-mono-num normal-case tracking-normal text-muted-foreground">
                          {p.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map((m) => (
                    <tr key={m.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 place-items-center rounded-md bg-brand-100 font-display text-[11px] text-brand-700">
                            {m.initials}
                          </span>
                          <div>
                            <div className="text-ink-900">{m.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {ROLE_LABEL[m.role]}
                            </div>
                          </div>
                        </div>
                      </td>
                      {projects.map((p) => {
                        const granted = m.role === "manager" || m.access[p.id];
                        return (
                          <td key={p.id} className="px-3 py-3 text-center">
                            <AccessDot granted={granted} locked={m.role === "manager"} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Invite flow */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="grid size-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <Mail className="size-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-sm font-medium text-ink-900">Invite a teammate</div>
                <div className="text-xs text-muted-foreground">
                  They'll get a magic-link email scoped to the clients you select below.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_auto]">
                <input
                  placeholder="teammate@agency.co"
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ink-700/30"
                />
                <select className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30">
                  <option>Editor</option>
                  <option>Manager</option>
                  <option>Viewer</option>
                </select>
                <button className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm text-paper hover:bg-ink-700">
                  Send invite
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Client access
                </span>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-700 hover:border-ink-700/30"
                  >
                    <span className="grid size-4 place-items-center rounded bg-brand-100 font-display text-[9px] text-brand-700">
                      {p.initials}
                    </span>
                    {p.name}
                  </button>
                ))}
                <button className="rounded-md border border-dashed border-line px-2 py-1 text-xs text-muted-foreground hover:border-ink-700/30">
                  + All clients
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

function RolePill({ role }: { role: Role }) {
  const cls =
    role === "manager"
      ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
      : role === "editor"
        ? "bg-brand-100 text-brand-700"
        : "bg-surface-sunken text-ink-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        cls,
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function AccessDot({ granted, locked }: { granted: boolean; locked?: boolean }) {
  return (
    <span
      className={cn(
        "mx-auto grid size-7 place-items-center rounded-md border transition-colors",
        granted
          ? "border-brand-100 bg-brand-100 text-brand-700"
          : "border-line bg-surface text-muted-foreground hover:border-ink-700/30",
        locked && "opacity-70",
      )}
      title={locked ? "Manager — always granted" : granted ? "Granted" : "No access"}
    >
      {granted ? (
        <Check className="size-3.5" strokeWidth={2} />
      ) : (
        <X className="size-3.5" strokeWidth={1.5} />
      )}
    </span>
  );
}
