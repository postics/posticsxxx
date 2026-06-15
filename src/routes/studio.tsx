import { createFileRoute } from "@tanstack/react-router";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { Placeholder } from "@/features/shell/Placeholder";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Product Studio — Postics" }] }),
  component: Page,
});

function Page() {
  return (
    <ProjectShell active="studio" breadcrumb={["Product Studio"]}>
      <Placeholder eyebrow="Studio" title="Project Studio" hint="AI-generated product photos & videos will be planned and reviewed here." />
    </ProjectShell>
  );
}
