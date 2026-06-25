import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Postics" },
      { name: "description", content: "Paste your site. Get a content strategy and the first generated pieces in minutes." },
    ],
  }),
  component: () => <OnboardingWizard />,
});