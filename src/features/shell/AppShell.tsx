import type { ReactNode } from "react";
import { ProjectShell, type ProjectNavId } from "./ProjectShell";
import { WorkspaceShell, type WorkspaceNavId } from "./WorkspaceShell";

/**
 * Back-compat adapter. Prefer importing ProjectShell or WorkspaceShell directly
 * in new code. This dispatches based on the legacy `active` id so existing route
 * files keep working during the architecture migration.
 */
type LegacyNavId = ProjectNavId | WorkspaceNavId | "site" | "agency";

const WORKSPACE_IDS = new Set<string>([
  "clients",
  "team",
  "brand",
  "marketplace",
  "billing",
  "partner",
  "agency",
]);

export function AppShell({
  active,
  breadcrumb,
  children,
}: {
  active: LegacyNavId;
  breadcrumb: string[];
  children: ReactNode;
  topRight?: ReactNode;
}) {
  if (WORKSPACE_IDS.has(active)) {
    const mapped: WorkspaceNavId = active === "agency" ? "clients" : (active as WorkspaceNavId);
    const tail = breadcrumb[0] === "Workspace" ? breadcrumb.slice(1) : breadcrumb;
    return (
      <WorkspaceShell active={mapped} breadcrumb={tail}>
        {children}
      </WorkspaceShell>
    );
  }
  const mapped: ProjectNavId = active === "site" ? "overview" : (active as ProjectNavId);
  let tail = breadcrumb;
  if (tail[0] === "Projects") tail = tail.slice(2);
  return (
    <ProjectShell active={mapped} breadcrumb={tail}>
      {children}
    </ProjectShell>
  );
}
