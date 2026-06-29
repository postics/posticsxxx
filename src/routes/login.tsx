import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { FocusShell } from "@/features/shell/FocusShell";
import { Card } from "@/features/shared/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Postics" },
      { name: "description", content: "Sign in to your Postics workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <FocusShell>
      <AuthCard
        eyebrow="welcome back"
        title="Sign in to Postics"
        sub="Pick up your site & business where you left off."
        cta="Sign in"
        alt={{ q: "New here?", to: "/signup", label: "Create an account" }}
      />
    </FocusShell>
  );
}

export function AuthCard({
  eyebrow,
  title,
  sub,
  cta,
  alt,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  alt: { q: string; to: "/login" | "/signup" | "/onboarding"; label: string };
}) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const valid = /.+@.+\..+/.test(email) && pwd.length >= 6;

  return (
    <section className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
          {eyebrow}
        </p>
        <h1
          tabIndex={-1}
          className="mt-3 text-3xl font-semibold tracking-tight text-ink motion-safe:animate-rise"
        >
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-mute">{sub}</p>
      </div>

      <Card className="mt-8 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            window.location.href = "/onboarding";
          }}
          className="space-y-4"
        >
          <Field
            id="email"
            label="Email"
            icon={<Mail className="h-4 w-4 text-ink-mute" />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@yoursite.com"
            autoComplete="email"
          />
          <Field
            id="password"
            label="Password"
            icon={<Lock className="h-4 w-4 text-ink-mute" />}
            type="password"
            value={pwd}
            onChange={setPwd}
            placeholder="At least 6 characters"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={!valid}
            className={cn(
              "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium transition-all",
              valid
                ? "bg-brand text-paper hover:bg-brand/90 active:scale-[0.98] active:bg-brand-500"
                : "cursor-not-allowed bg-surface-sunken text-ink-mute",
            )}
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-mute">
        {alt.q}{" "}
        <Link
          to={alt.to}
          className="text-ink underline-offset-4 hover:text-brand hover:underline"
        >
          {alt.label}
        </Link>
      </p>
    </section>
  );
}

function Field({
  id,
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-[10px] border border-line bg-paper px-3 py-2.5 focus-within:border-brand">
        {icon}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute/60"
        />
      </div>
    </label>
  );
}