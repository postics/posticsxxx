import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, Dot, TrafficLight } from "@/features/admin/ui";
import { ConfirmReasonDialog, useReadOnlyGuard } from "@/features/admin/ui";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin/margin-guards")({
  component: MarginGuards,
});

function MarginGuards() {
  const { session } = useAdmin();
  const { guardProps } = useReadOnlyGuard();
  const [confirm, setConfirm] = useState<null | { kind: "raise" | "throttle"; org: string }>(null);

  if (session?.role !== "platform") return <Navigate to="/admin" />;

  const offenders = [
    { org: "Loomwell Linens", monthVideoCost: 412, plan: "Premium", margin: -0.04, status: "breach" as const },
    { org: "Pinegrove Pet Supply", monthVideoCost: 318, plan: "Agency", margin: 0.06, status: "watch" as const },
    { org: "Velourie Atelier", monthVideoCost: 246, plan: "Starter", margin: -0.21, status: "breach" as const },
  ];

  return (
    <AdminShell
      title="Video & margin guards"
      breadcrumb={["Admin", "Money", "Margin guards"]}
      actions={<TrafficLight tone="warning" label="2 breaches" />}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Guard floor" value="15%" hint="Per-org gross margin below this triggers a throttle." />
        <KPI label="Orgs in breach" value="2" tone="danger" />
        <KPI label="Orgs on watch" value="6" tone="warning" />
        <KPI label="Video cost / sec" value="$0.31" tone="warning" />
      </div>

      <DataPanel
        className="mt-6"
        title="Video-cost offenders"
        hint="Per-org video spend relative to plan price this billing cycle."
      >
        <table className="w-full text-[12px]">
          <thead className="border-b border-line text-left">
            <tr className="text-muted-foreground">
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Org</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Plan</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Video cost / mo</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Margin</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Status</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {offenders.map((r) => (
              <tr key={r.org}>
                <td className="py-2 text-ink-900">{r.org}</td>
                <td className="font-mono-num py-2 text-muted-foreground">{r.plan}</td>
                <td className="font-mono-num py-2 text-right text-ink-900">${r.monthVideoCost}</td>
                <td className="font-mono-num py-2 text-right">
                  <span className={r.margin < 0 ? "text-[color:var(--danger,#A6453C)]" : "text-ink-900"}>
                    {Math.round(r.margin * 100)}%
                  </span>
                </td>
                <td className="py-2">
                  <span className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]">
                    <Dot tone={r.status === "breach" ? "danger" : "warning"} />
                    {r.status}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    {...guardProps}
                    onClick={() => setConfirm({ kind: "throttle", org: r.org })}
                    className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken disabled:opacity-50"
                  >
                    Throttle video
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DataPanel
          title="Global guard floor"
          hint="Cross-tenant policy. Changes affect every org immediately."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-muted-foreground">
              Current floor is <span className="font-mono-num text-ink-900">15%</span>.
              Orgs falling below auto-throttle video generation until the next cycle.
            </div>
            <button
              {...guardProps}
              onClick={() => setConfirm({ kind: "raise", org: "ALL ORGS" })}
              className="rounded-md bg-brand-700 px-3 py-1.5 text-xs text-paper hover:bg-brand-500 disabled:opacity-50"
            >
              Raise to 20%
            </button>
          </div>
        </DataPanel>
        <DataPanel
          title="Throttle history"
          state="pending"
          pendingNote="Will list every throttle/reset once the policy engine ships events."
        />
      </div>

      <ConfirmReasonDialog
        open={!!confirm}
        title={confirm?.kind === "raise" ? "Raise margin guard floor" : `Throttle video for ${confirm?.org}`}
        description={
          confirm?.kind === "raise"
            ? "Every org will be checked against the new floor on the next pipeline tick."
            : "Video generation will queue but not execute until margin returns above the floor."
        }
        confirmLabel={confirm?.kind === "raise" ? "Raise floor" : "Throttle"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => setConfirm(null)}
      />
    </AdminShell>
  );
}