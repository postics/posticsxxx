import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, Dot, KPI, TrafficLight, ConfirmReasonDialog, useReadOnlyGuard } from "@/features/admin/ui";
import { BUILD_SURFACES } from "@/features/admin/mock-data";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin/build")({
  component: Build,
});

function Build() {
  const { session, stubMode, setStubMode } = useAdmin();
  const { guardProps } = useReadOnlyGuard();
  const [flip, setFlip] = useState(false);
  if (session?.role !== "platform") return <Navigate to="/admin" />;

  const live = BUILD_SURFACES.filter((s) => s.status === "live").length;
  const stub = BUILD_SURFACES.filter((s) => s.status === "stub").length;
  const missing = BUILD_SURFACES.filter((s) => s.status === "missing").length;

  return (
    <AdminShell
      title="Project build-status"
      breadcrumb={["Admin", "Platform", "Build-status"]}
      actions={
        <TrafficLight
          tone={stubMode ? "warning" : "success"}
          label={stubMode ? "STUB mode" : "Real keys"}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Surfaces live" value={String(live)} tone="success" />
        <KPI label="Stubbed" value={String(stub)} tone="warning" />
        <KPI label="Missing" value={String(missing)} tone="danger" />
        <KPI label="AI Gateway mode" value={stubMode ? "STUB" : "REAL"} tone={stubMode ? "warning" : "success"} />
      </div>

      <DataPanel
        className="mt-6"
        title="Backend surfaces"
        hint="What the backend team has actually wired vs what is still placeholder."
        actions={
          <button
            {...guardProps}
            onClick={() => setFlip(true)}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs text-paper hover:bg-brand-500 disabled:opacity-50"
          >
            {stubMode ? "Flip stub → real" : "Reset to STUB"}
          </button>
        }
      >
        <table className="w-full text-[12px]">
          <thead className="border-b border-line text-left">
            <tr className="text-muted-foreground">
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Area</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Surface</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Status</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {BUILD_SURFACES.map((s) => (
              <tr key={s.id}>
                <td className="font-mono-num py-2 text-muted-foreground">{s.area}</td>
                <td className="py-2 text-ink-900">{s.surface}</td>
                <td className="py-2">
                  <span className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]">
                    <Dot
                      tone={
                        s.status === "live" ? "success" : s.status === "stub" ? "warning" : "danger"
                      }
                    />
                    {s.status}
                  </span>
                </td>
                <td className="py-2 text-muted-foreground">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <ConfirmReasonDialog
        open={flip}
        title={stubMode ? "Flip AI Gateway to REAL" : "Reset AI Gateway to STUB"}
        description={
          stubMode
            ? "Real Anthropic key will start charging every generation. Margin guards will begin to enforce."
            : "All generations will return placeholder content and cost ~$0."
        }
        confirmLabel={stubMode ? "Flip to REAL" : "Reset to STUB"}
        destructive={false}
        onCancel={() => setFlip(false)}
        onConfirm={() => {
          setStubMode(!stubMode);
          setFlip(false);
        }}
      />
    </AdminShell>
  );
}