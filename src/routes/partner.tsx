import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Placeholder } from "@/features/shell/Placeholder";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Partner program — Postics" }] }),
  component: Page,
});

function Page() {
  return (
    <WorkspaceShell active="partner" breadcrumb={["Partner program"]}>
      <Placeholder eyebrow="Partner" title="Referral & revenue share" hint="Track referrals and partner payouts." />
    </WorkspaceShell>
  );
}
