import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy alias — the agency console now lives at `/clients` inside WorkspaceShell.
 * Any old link to `/agency` lands users on the right place.
 */
export const Route = createFileRoute("/agency")({
  beforeLoad: () => {
    throw redirect({ to: "/clients" });
  },
});