import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, Dot } from "@/features/admin/ui";
import { SEGMENTS } from "@/features/admin/mock-data";

export const Route = createFileRoute("/admin/segments")({
  component: Segments,
});

function Segments() {
  return (
    <AdminShell title="Segmentation" breadcrumb={["Admin", "Customers", "Segments"]}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Active segments" value={String(SEGMENTS.length)} />
        <KPI label="Orgs in ≥ 1 segment" value="24" tone="info" />
        <KPI label="At-risk segments" value="2" tone="warning" />
        <KPI label="New since last week" value="1" tone="success" />
      </div>

      <DataPanel className="mt-6" title="Segments" hint="Each row is a saved query you can target with an action.">
        <ul className="divide-y divide-line">
          {SEGMENTS.map((s) => (
            <li key={s.id} className="flex items-start gap-3 py-3 text-[12px]">
              <Dot tone={s.trend === "up" ? "success" : s.trend === "down" ? "warning" : "muted"} />
              <div className="min-w-0 flex-1">
                <div className="text-ink-900">{s.name}</div>
                <div className="text-muted-foreground">{s.description}</div>
                <div className="font-mono-num mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {s.id}
                </div>
              </div>
              <div className="font-mono-num w-[80px] text-right text-ink-900">{s.orgs} orgs</div>
              <button className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken">
                Open
              </button>
            </li>
          ))}
        </ul>
      </DataPanel>

      <DataPanel
        className="mt-3"
        title="Cohort retention"
        state="pending"
        pendingNote="Will compute retention curves once activation events stream in."
      />
    </AdminShell>
  );
}