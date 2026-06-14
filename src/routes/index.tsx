import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/features/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Postics — Full-cycle content engine" },
      {
        name: "description",
        content:
          "Premium content engine for businesses and agencies. Provision a site, plan a quarter, publish in minutes.",
      },
      { property: "og:title", content: "Postics" },
      {
        property: "og:description",
        content: "Editorial studio meets engineering control panel.",
      },
    ],
  }),
  component: Landing,
});
