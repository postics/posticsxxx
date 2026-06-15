import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Placeholder } from "@/features/shell/Placeholder";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team & roles — Postics" }] }),
  component: Page,
});

function Page() {
  return (
    <WorkspaceShell active="team" breadcrumb={["Team & roles"]}>
      <Placeholder eyebrow="Team" title="Team & roles" hint="Invite teammates, assign client access, manage roles." />
    </WorkspaceShell>
  );
}
