import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, Dot, TrafficLight } from "@/features/admin/ui";
import { ConfirmReasonDialog, useReadOnlyGuard } from "@/features/admin/ui";
import { PIPELINE_JOBS } from "@/features/admin/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/admin/pipeline")({
  component: Pipeline,
});

function Pipeline() {
  const { guardProps } = useReadOnlyGuard();
  const [retry, setRetry] = useState<string | null>(null);

  return (
    <AdminShell
      title="Pipeline & quality"
      breadcrumb={["Admin", "Operations", "Pipeline"]}
      actions={<TrafficLight tone="success" label="All stages green" />}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="In-flight jobs" value="42" tone="info" />
        <KPI label="Failed (1h)" value="3" tone="warning" />
        <KPI label="QA pass-rate" value="91%" delta="Target ≥ 90%" tone="success" />
        <KPI label="Avg time-to-publish" value="2m 41s" tone="info" />
      </div>

      <DataPanel
        className="mt-6"
        title="Live job feed"
        hint="Cross-tenant view of every running pipeline."
      >
        <table className="w-full text-[12px]">
          <thead className="border-b border-line text-left">
            <tr className="text-muted-foreground">
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Job</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Org</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Type</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Stage</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Cost</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Started</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PIPELINE_JOBS.map((j) => (
              <tr key={j.id}>
                <td className="font-mono-num py-2 text-muted-foreground">{j.id}</td>
                <td className="py-2 text-ink-900">{j.org}</td>
                <td className="font-mono-num py-2 text-muted-foreground">{j.type}</td>
                <td className="py-2">
                  <span className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]">
                    <Dot
                      tone={
                        j.stage === "failed"
                          ? "danger"
                          : j.stage === "qa"
                            ? "warning"
                            : j.stage === "done" || j.stage === "publishing"
                              ? "success"
                              : "info"
                      }
                    />
                    {j.stage}
                  </span>
                </td>
                <td className="font-mono-num py-2 text-right text-ink-900">${j.costUSD.toFixed(2)}</td>
                <td className="font-mono-num py-2 text-right text-muted-foreground">{j.startedAt}</td>
                <td className="py-2 text-right">
                  {j.stage === "failed" ? (
                    <button
                      {...guardProps}
                      onClick={() => setRetry(j.id)}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken disabled:opacity-50"
                    >
                      Retry
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <ConfirmReasonDialog
        open={!!retry}
        title={`Retry job ${retry ?? ""}`}
        description="Will re-run the job from the failed stage, billed to the same org."
        destructive={false}
        confirmLabel="Retry job"
        onCancel={() => setRetry(null)}
        onConfirm={() => setRetry(null)}
      />
    </AdminShell>
  );
}