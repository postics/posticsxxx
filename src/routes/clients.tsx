import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card } from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — Postics" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { projects, setCurrentProjectId } = useScope();
  return (
    <WorkspaceShell active="clients" breadcrumb={["Clients"]}>
      <div className="mx-auto max-w-6xl space-y-6 px-8 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink-900">Clients</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a client to drop into their project shell.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-medium text-paper hover:bg-brand-700/90">
            <Plus className="size-4" strokeWidth={1.75} /> New client
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/dashboard"
              onClick={() => setCurrentProjectId(p.id)}
            >
              <Card className="group flex items-center gap-3 p-4 hover:border-ink-700/30">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-100 font-display text-brand-700">
                  {p.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink-900">{p.name}</div>
                  <div className="font-mono-num truncate text-xs text-muted-foreground">
                    {p.domain}
                  </div>
                </div>
                <ArrowRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}