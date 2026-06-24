import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/features/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Postics — Marketing on autopilot for your store" },
      {
        name: "description",
        content:
          "Paste your store URL. Postics writes the copy, makes the photos and video, and publishes — to your site and your socials, on a schedule. WooCommerce · WordPress · 10+ languages.",
      },
      { property: "og:title", content: "Postics — Marketing on autopilot for your store" },
      {
        property: "og:description",
        content:
          "Connects to your WooCommerce / WordPress. Writes, generates and publishes content to your site and socials on a schedule.",
      },
    ],
  }),
  component: Landing,
});
