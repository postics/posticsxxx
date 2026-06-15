import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Placeholder } from "@/features/shell/Placeholder";

export const Route = createFileRoute("/brand-kit")({
  head: () => ({ meta: [{ title: "Brand kit / White-label — Postics" }] }),
  component: Page,
});

function Page() {
  return (
    <WorkspaceShell active="brand" breadcrumb={["Brand kit / White-label"]}>
      <Placeholder eyebrow="Brand kit" title="White-label" hint="Logos, palette, custom domain, and email sender lives here." />
    </WorkspaceShell>
  );
}
