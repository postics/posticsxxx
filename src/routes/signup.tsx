import { createFileRoute } from "@tanstack/react-router";
import { FocusShell } from "@/features/shell/FocusShell";
import { AuthCard } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Postics account" },
      { name: "description", content: "Create a Postics account to plan and publish content for your site." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <FocusShell>
      <AuthCard
        eyebrow="get started"
        title="Create your Postics account"
        sub="Connect your site and let the machine do the rest."
        cta="Create account"
        alt={{ q: "Already have an account?", to: "/login", label: "Sign in" }}
      />
    </FocusShell>
  );
}