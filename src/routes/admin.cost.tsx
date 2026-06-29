import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, TrafficLight } from "@/features/admin/ui";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin/cost")({
  component: CostPage,
});

function CostPage() {
  const { session } = useAdmin();
  if (session?.role !== "platform") return <Navigate to="/admin" />;

  const rows = [
    { plan: "Starter", price: 199, cost: 24, margin: 0.88, orgs: 64 },
    { plan: "Growth", price: 449, cost: 71, margin: 0.84, orgs: 42 },
    { plan: "Premium", price: 999, cost: 218, margin: 0.78, orgs: 24 },
    { plan: "Agency", price: 1299, cost: 312, margin: 0.76, orgs: 8 },
  ];

  return (
    <AdminShell
      title="Unit-economics & cost"
      breadcrumb={["Admin", "Money", "Unit-economics"]}
      actions={<TrafficLight tone="warning" label="Stub data" />}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Avg cost / org / mo" value="$84" tone="muted" hint="AI + storage + bandwidth, blended." />
        <KPI label="Blended margin" value="83%" delta="Target ≥ 75%" tone="success" />
        <KPI label="Cost / article" value="$0.04" delta="Stub — real key pending" tone="warning" />
        <KPI label="Cost / video sec" value="$0.31" delta="Watch this when key flips" tone="warning" />
      </div>

      <DataPanel className="mt-6" title="Per-plan unit economics" hint="Monthly per-org averages over last 30 days.">
        <table className="w-full text-[12px]">
          <thead className="border-b border-line text-left">
            <tr className="text-muted-foreground">
              <th className="font-mono-num py-1.5 text-[10px] uppercase tracking-[0.14em]">Plan</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Price</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Cost / org</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Margin</th>
              <th className="font-mono-num py-1.5 text-right text-[10px] uppercase tracking-[0.14em]">Orgs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.plan}>
                <td className="py-2 text-ink-900">{r.plan}</td>
                <td className="font-mono-num py-2 text-right text-ink-900">${r.price}</td>
                <td className="font-mono-num py-2 text-right text-muted-foreground">${r.cost}</td>
                <td className="font-mono-num py-2 text-right text-ink-900">{Math.round(r.margin * 100)}%</td>
                <td className="font-mono-num py-2 text-right text-muted-foreground">{r.orgs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DataPanel title="Cost trend (90d)" hint="Daily blended cost per active org." state="pending" pendingNote="Sparkline goes live once the AI Gateway emits real cost events." />
        <DataPanel title="Top cost drivers" hint="Largest dollar lines in the last 7 days.">
          <ul className="divide-y divide-line text-[12px]">
            {[
              ["Anthropic · Claude 3.7 Sonnet (drafts)", "$1,840"],
              ["Image model · product photos", "$612"],
              ["Video model · product videos", "$498"],
              ["R2 storage · generated assets", "$184"],
              ["Egress · publish to client sites", "$96"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2">
                <span className="text-ink-700">{k}</span>
                <span className="font-mono-num text-ink-900">{v}</span>
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </AdminShell>
  );
}