import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye } from "lucide-react";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, Dot, ConfirmReasonDialog } from "@/features/admin/ui";
import { ADMIN_ORGS } from "@/features/admin/mock-data";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin/orgs")({
  component: OrgsPage,
});

function OrgsPage() {
  const { impersonation, startImpersonation, session } = useAdmin();
  const [pending, setPending] = useState<null | { id: string; name: string }>(null);
  const [q, setQ] = useState("");
  const filter = q.trim().toLowerCase();

  const rows = ADMIN_ORGS.filter((o) =>
    !filter ? true : [o.name, o.domain, o.ownerEmail, o.id].join(" ").toLowerCase().includes(filter),
  );

  return (
    <AdminShell
      title="Orgs & activation"
      breadcrumb={["Admin", "Customers", "Orgs"]}
      actions={
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter orgs…"
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Total orgs" value={String(ADMIN_ORGS.length)} />
        <KPI label="Activated" value="4" tone="success" hint="Connector linked + first publish." />
        <KPI label="At-risk" value="1" tone="warning" />
        <KPI label="Churned (30d)" value="1" tone="danger" />
      </div>

      <DataPanel className="mt-6" title="All orgs" hint="Cross-tenant — your changes are audited.">
        <table className="w-full text-[12px]">
          <thead className="border-b border-line text-left">
            <tr className="text-muted-foreground">
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Org</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Domain</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Plan</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">MRR</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Status</th>
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Activity</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="py-2">
                  <div className="text-ink-900">{o.name}</div>
                  <div className="font-mono-num text-[10px] text-muted-foreground">{o.id}</div>
                </td>
                <td className="font-mono-num py-2 text-muted-foreground">{o.domain}</td>
                <td className="font-mono-num py-2 text-muted-foreground">{o.plan}</td>
                <td className="font-mono-num py-2 text-right text-ink-900">${o.mrr}</td>
                <td className="py-2">
                  <span className="font-mono-num inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]">
                    <Dot
                      tone={
                        o.status === "healthy"
                          ? "success"
                          : o.status === "at-risk"
                            ? "warning"
                            : o.status === "trial"
                              ? "info"
                              : "danger"
                      }
                    />
                    {o.status}
                  </span>
                </td>
                <td className="font-mono-num py-2 text-muted-foreground">{o.lastActivity}</td>
                <td className="py-2 text-right">
                  <button
                    disabled={!!impersonation}
                    title={impersonation ? "Exit current impersonation first" : "View as this org (read-only)"}
                    onClick={() => setPending({ id: o.id, name: o.name })}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken disabled:opacity-50"
                  >
                    <Eye className="size-3" strokeWidth={1.75} />
                    View as
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <ConfirmReasonDialog
        open={!!pending}
        title={`View as ${pending?.name}`}
        description="You'll see this org's data exactly as their owner does, for the next 20 minutes. All controls are disabled (read-only)."
        confirmLabel="Start impersonation"
        destructive={false}
        onCancel={() => setPending(null)}
        onConfirm={(reason) => {
          if (pending) {
            startImpersonation({ orgId: pending.id, orgName: pending.name, reason, minutes: 20 });
          }
          setPending(null);
        }}
      />

      {session?.role === "agency" ? (
        <p className="font-mono-num mt-4 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Scoped to {session.agencyName ?? "your agency"} — only your sub-clients are visible.
        </p>
      ) : null}
    </AdminShell>
  );
}