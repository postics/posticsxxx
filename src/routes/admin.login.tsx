import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAdmin, type AdminRole } from "@/features/admin/AdminContext";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { session, signIn } = useAdmin();
  const navigate = useNavigate();
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<AdminRole>("platform");

  useEffect(() => {
    if (session) navigate({ to: "/admin" });
  }, [session, navigate]);

  function submitCreds(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email & password required");
      return;
    }
    setStep("mfa");
  }
  function submitMfa(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter your 6-digit code");
      return;
    }
    signIn({
      email,
      role,
      agencyName: role === "agency" ? "Acme Studio" : undefined,
      mfa: true,
    });
    toast.success("Signed in");
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-paper text-ink-700">
      <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-ink-900 text-paper">
            <span className="font-display text-[13px] leading-none">P</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm text-ink-900">Postics.io</div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="grid place-items-center px-4 py-16">
        <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
          <div className="font-mono-num mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Step {step === "creds" ? "1" : "2"} of 2
          </div>
          <h1 className="font-display text-xl text-ink-900">
            {step === "creds" ? "Sign in to Admin" : "Two-factor code"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Postics staff &amp; agency admins only.
          </p>

          {step === "creds" ? (
            <form onSubmit={submitCreds} className="mt-5 space-y-3">
              <label className="block">
                <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Email
                </span>
                <div className="mt-1 flex items-center gap-2 rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 focus-within:border-brand-500">
                  <Mail className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <input
                    type="email"
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@postics.io"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Password
                </span>
                <div className="mt-1 flex items-center gap-2 rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 focus-within:border-brand-500">
                  <Lock className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <fieldset className="rounded-md border border-line bg-surface-sunken/40 p-2 text-xs">
                <legend className="font-mono-num px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Mock role (preview only)
                </legend>
                <div className="grid grid-cols-2 gap-1">
                  {(["platform", "agency"] as AdminRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={
                        role === r
                          ? "rounded bg-brand-700 px-2 py-1 text-[11px] font-medium text-paper"
                          : "rounded border border-line bg-surface px-2 py-1 text-[11px] text-ink-700 hover:bg-surface-sunken"
                      }
                    >
                      {r === "platform" ? "Platform-admin" : "Agency-admin"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="w-full rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-paper transition active:scale-[0.99] hover:bg-brand-500"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={submitMfa} className="mt-5 space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2">
                <ShieldCheck className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123 456"
                  className="font-mono-num w-full bg-transparent text-center text-lg tracking-[0.4em] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-paper transition active:scale-[0.99] hover:bg-brand-500"
              >
                Verify &amp; sign in
              </button>
              <button
                type="button"
                onClick={() => setStep("creds")}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs text-muted-foreground hover:bg-surface-sunken"
              >
                Back
              </button>
            </form>
          )}

          <p className="font-mono-num mt-5 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Service-role enforcement wired by backend team
          </p>
        </div>
      </main>
    </div>
  );
}