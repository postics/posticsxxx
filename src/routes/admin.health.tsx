import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, TrafficLight, Dot } from "@/features/admin/ui";

export const Route = createFileRoute("/admin/health")({
  component: Health,
});

const SYSTEMS = [
  { name: "AI Gateway", status: "stub", note: "Stub mode — see banner.", tone: "warning" as const },
  { name: "Stripe webhooks", status: "live", note: "Last event 4s ago.", tone: "success" as const },
  { name: "Connector (WordPress)", status: "live", note: "12 paired sites.", tone: "success" as const },
  { name: "Connector (WooCommerce)", status: "live", note: "Product sync 38 / min.", tone: "success" as const },
  { name: "R2 storage", status: "live", note: "p99 write 84ms.", tone: "success" as const },
  { name: "Cloudflare queues", status: "live", note: "Depth 12 · drain 9s.", tone: "success" as const },
  { name: "Site publisher", status: "live", note: "0 failures last hour.", tone: "success" as const },
  { name: "Email sender", status: "warning", note: "SPF soft-fail 1 org.", tone: "warning" as const },
];

export function Health() {
  return (
    <AdminShell
      title="Healthcheck"
      breadcrumb={["Admin", "Operations", "Healthcheck"]}
      actions={<TrafficLight tone="warning" label="1 advisory" />}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Uptime (30d)" value="99.97%" tone="success" />
        <KPI label="Open incidents" value="0" tone="success" />
        <KPI label="Error budget" value="73%" tone="info" hint="Remaining for the month." />
        <KPI label="P95 API latency" value="184 ms" tone="info" />
      </div>

      <DataPanel className="mt-6" title="Systems" hint="One row per critical subsystem.">
        <ul className="divide-y divide-line text-[12px]">
          {SYSTEMS.map((s) => (
            <li key={s.name} className="flex items-center gap-3 py-2">
              <Dot tone={s.tone} />
              <span className="w-[200px] truncate text-ink-900">{s.name}</span>
              <span className="font-mono-num w-[68px] truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {s.status}
              </span>
              <span className="flex-1 truncate text-muted-foreground">{s.note}</span>
            </li>
          ))}
        </ul>
      </DataPanel>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DataPanel
          title="Latency timeline (24h)"
          state="pending"
          pendingNote="Will plot p50/p95/p99 once edge logs are streamed in."
        />
        <DataPanel
          title="Recent incidents"
          state="empty"
        />
      </div>
    </AdminShell>
  );
}