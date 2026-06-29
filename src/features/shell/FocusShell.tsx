import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";

type FocusShellProps = {
  step?: number;
  totalSteps?: number;
  children: ReactNode;
};

/**
 * FocusShell — sticky-banner + mini-footer layout used by /onboarding,
 * /login and /signup. NO marketing nav, NO sitemap footer.
 * Reads global theme + language via shared controls.
 */
export function FocusShell({ step, totalSteps, children }: FocusShellProps) {
  const [confirm, setConfirm] = useState(false);
  const hasStepper = typeof step === "number" && typeof totalSteps === "number";

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#focus-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper focus:shadow"
      >
        Skip to content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur"
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          {/* Brand anchor — NOT a link out to marketing */}
          <span
            aria-label="Postics.io"
            className="flex select-none items-center gap-1 text-sm tracking-tight text-ink"
          >
            <span className="font-semibold">Postics</span>
            <span className="font-mono text-[11px] text-ink-mute">.io</span>
          </span>

          {hasStepper && (
            <div
              role="group"
              aria-label={`Step ${step} of ${totalSteps}`}
              className="ml-3 hidden items-center gap-1.5 border-l border-line/70 pl-3 sm:flex"
            >
              {Array.from({ length: totalSteps! }).map((_, i) => {
                const n = i + 1;
                const done = n < step!;
                const active = n === step!;
                return (
                  <span
                    key={n}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "size-2 rounded-full border transition-colors",
                      done
                        ? "border-brand bg-brand"
                        : active
                          ? "border-brand bg-paper ring-2 ring-brand/30"
                          : "border-line bg-transparent",
                    )}
                  />
                );
              })}
              <span className="ml-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                Step {step} / {totalSteps}
              </span>
            </div>
          )}

          {hasStepper && (
            <span className="ml-2 font-mono text-[11px] text-ink-mute sm:hidden">
              Step {step}/{totalSteps}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <a
              href="mailto:support@postics.io"
              className="hidden h-9 items-center rounded-lg border border-line bg-surface px-3 text-xs text-ink-700 transition-all hover:border-ink-700/30 hover:text-ink-900 active:scale-[0.97] active:bg-surface-sunken sm:inline-flex"
            >
              Need help?
            </a>
            <LanguageButton compact />
            <ThemeToggle />
            {hasStepper && (
              <button
                onClick={() => setConfirm(true)}
                className="ml-1 hidden h-9 items-center rounded-lg border border-line bg-surface px-3 text-xs text-ink-700 transition-all hover:border-ink-700/30 hover:text-ink-900 active:scale-[0.97] active:bg-surface-sunken sm:inline-flex"
              >
                Save &amp; exit
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="focus-main" className="flex-1 outline-none" tabIndex={-1}>
        {children}
      </main>

      <footer
        role="contentinfo"
        className="border-t border-line/70 bg-paper"
      >
        <div className="mx-auto flex min-h-12 w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-mute sm:px-6">
          <span>© Postics</span>
          <div className="flex items-center gap-4">
            <a href="mailto:support@postics.io" className="hover:text-ink">
              Support
            </a>
            <a href="mailto:legal@postics.io" className="hover:text-ink">
              Terms
            </a>
            <a href="mailto:legal@postics.io" className="hover:text-ink">
              Privacy
            </a>
          </div>
        </div>
      </footer>

      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Save and exit"
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/50 px-4"
          onClick={() => setConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
          >
            <h2 className="text-lg font-semibold text-ink">Your progress is saved</h2>
            <p className="mt-2 text-sm text-ink-mute">
              Come back any time — you'll pick up right where you left off.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg border border-line px-4 py-2 text-sm text-ink transition-all hover:bg-surface-sunken active:scale-[0.97]"
              >
                Stay
              </button>
              <Link
                to="/"
                className="rounded-lg bg-brand px-4 py-2 text-sm text-paper transition-all hover:bg-brand/90 active:scale-[0.97] active:bg-brand-500"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}