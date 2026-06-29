import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/AdminShell";
import { DataPanel, KPI, TrafficLight, Dot } from "@/features/admin/ui";
import { PIPELINE_JOBS, ADMIN_ORGS } from "@/features/admin/mock-data";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin/")({
  component: Cockpit,
});

function Cockpit() {
  const { session } = useAdmin();
  const isPlatform = session?.role === "platform";

  return (
    <AdminShell title="Cockpit" breadcrumb={["Admin", "Overview"]}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Active orgs" value="138" delta="+6 this week" tone="success" hint="Orgs with ≥ 1 publish in last 14 days." />
        <KPI label="MRR" value="$54,210" delta="+$1,820 mo/mo" tone="success" hint="Sum of plan MRR, ex. add-ons." />
        {isPlatform ? (
          <KPI label="Gross margin (est.)" value="—" delta="Unverifiable while STUB is on" tone="warning" hint="Margin thesis requires real AI key." />
        ) : (
          <KPI label="Your sub-clients" value="12" delta="+2 onboarding" tone="info" />
        )}
        <KPI label="Pipeline jobs / hr" value="84" delta="P50 38s · P95 2m 14s" tone="info" />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <DataPanel
          title="Live pipeline"
          hint="Jobs across every org in the last 5 minutes."
          actions={<TrafficLight tone="success" label="Healthy" />}
        >
          <ul className="divide-y divide-line">
            {PIPELINE_JOBS.slice(0, 5).map((j) => (
              <li key={j.id} className="flex items-center gap-3 py-2 text-[12px]">
                <Dot
                  tone={
                    j.stage === "failed"
                      ? "danger"
                      : j.stage === "publishing" || j.stage === "done"
                        ? "success"
                        : j.stage === "qa"
                          ? "warning"
                          : "info"
                  }
                />
                <span className="font-mono-num w-[68px] truncate text-muted-foreground">{j.id}</span>
                <span className="flex-1 truncate text-ink-700">{j.org}</span>
                <span className="font-mono-num w-[88px] truncate text-right text-muted-foreground">{j.type}</span>
                <span className="font-mono-num w-[64px] text-right text-ink-900">${j.costUSD.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </DataPanel>

        <DataPanel
          title="Attention queue"
          hint="Orgs the system thinks you should look at first."
        >
          <ul className="divide-y divide-line">
            {ADMIN_ORGS.filter((o) => o.status !== "healthy")
              .slice(0, 5)
              .map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <Dot
                    tone={
                      o.status === "churned" ? "danger" : o.status === "at-risk" ? "warning" : "info"
                    }
                  />
                  <span className="flex-1 truncate text-ink-700">{o.name}</span>
                  <span className="font-mono-num w-[110px] truncate text-right text-muted-foreground">
                    {o.domain}
                  </span>
                  <span className="font-mono-num w-[60px] text-right text-ink-900">${o.mrr}</span>
                </li>
              ))}
          </ul>
        </DataPanel>

        {isPlatform ? (
          <DataPanel
            title="Cost vs revenue (7d)"
            hint="Sum of generation cost from AI Gateway vs MRR-attributed revenue."
            state="pending"
            pendingNote="Will go LIVE once the AI Gateway is on a real key — currently every cost reads ~$0."
          />
        ) : null}

        <DataPanel
          title="Recent staff actions"
          hint="Every cross-tenant action carries a mandatory reason."
        >
          <ul className="space-y-2 text-[12px]">
            <li className="flex items-start gap-2">
              <Dot tone="info" />
              <div className="min-w-0 flex-1">
                <div className="text-ink-900">Impersonated <em className="font-mono-num not-italic">Velourie Atelier</em> · 20 min</div>
                <div className="text-muted-foreground">eliza@postics.io · "investigating stalled WooCommerce sync"</div>
              </div>
              <span className="font-mono-num text-[10px] text-muted-foreground">19:24</span>
            </li>
            <li className="flex items-start gap-2">
              <Dot tone="warning" />
              <div className="min-w-0 flex-1">
                <div className="text-ink-900">Flagged <em className="font-mono-num not-italic">Solstice Soap Co.</em> for refund review</div>
                <div className="text-muted-foreground">matt@postics.io · "duplicate Stripe charge"</div>
              </div>
              <span className="font-mono-num text-[10px] text-muted-foreground">18:51</span>
            </li>
            <li className="flex items-start gap-2">
              <Dot tone="success" />
              <div className="min-w-0 flex-1">
                <div className="text-ink-900">Raised video margin guard to 18%</div>
                <div className="text-muted-foreground">eliza@postics.io · "renegotiated model rate"</div>
              </div>
              <span className="font-mono-num text-[10px] text-muted-foreground">17:02</span>
            </li>
          </ul>
        </DataPanel>
      </div>
    </AdminShell>
  );
}