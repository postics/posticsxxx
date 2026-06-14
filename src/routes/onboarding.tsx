import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Postics" },
      { name: "description", content: "Spin up a premium content site in under a minute." },
    ],
  }),
  component: () => <OnboardingWizard />,
});