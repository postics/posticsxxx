import { createFileRoute } from "@tanstack/react-router";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { Placeholder } from "@/features/shell/Placeholder";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Postics" }] }),
  component: Page,
});

function Page() {
  return (
    <ProjectShell active="settings" breadcrumb={["Settings"]}>
      <Placeholder eyebrow="Settings" title="Project settings" hint="Connector, cadence, brand voice, and channels live here." />
    </ProjectShell>
  );
}
