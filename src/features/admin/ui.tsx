import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "./AdminContext";

export type Tone = "success" | "warning" | "danger" | "info" | "muted";

const TONE_VAR: Record<Tone, string> = {
  success: "var(--success, #3C7D5C)",
  warning: "var(--warning, #B07B2C)",
  danger: "var(--danger, #A6453C)",
  info: "var(--info, #3A6079)",
  muted: "var(--muted-foreground, #6B6F78)",
};

export function Dot({ tone = "muted", className }: { tone?: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 rounded-full", className)}
      style={{ backgroundColor: TONE_VAR[tone] }}
    />
  );
}

export function TrafficLight({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="font-mono-num inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
      <Dot tone={tone} />
      {label}
    </span>
  );
}

export function DataPanel({
  title,
  hint,
  state = "live",
  pendingNote,
  actions,
  children,
  className,
}: {
  title: string;
  hint?: string;
  /** LIVE renders children. EMPTY shows a calm placeholder. PENDING shows a "not yet instrumented" chip. */
  state?: "live" | "empty" | "pending";
  pendingNote?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-line bg-surface p-4",
        className,
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-display text-[13px] font-medium text-ink-900">
            <span className="truncate">{title}</span>
            {hint ? (
              <span title={hint} className="text-muted-foreground">
                <HelpCircle className="size-3.5" strokeWidth={1.75} />
              </span>
            ) : null}
          </h3>
          {state === "pending" ? (
            <span
              title={pendingNote ?? "Not yet instrumented."}
              className="font-mono-num mt-1 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
            >
              <Info className="size-3" strokeWidth={1.75} />
              Pending instrumentation
            </span>
          ) : null}
        </div>
        {actions}
      </header>
      {state === "empty" ? (
        <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-8 text-center text-xs text-muted-foreground">
          No data yet.
        </div>
      ) : state === "pending" ? (
        <div className="rounded-md border border-dashed border-line bg-surface-sunken/40 px-4 py-6 text-center text-[11px] text-muted-foreground">
          {pendingNote ?? "Wiring this panel to real data is queued for the backend team."}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export function KPI({
  label,
  value,
  delta,
  tone = "muted",
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <div className="flex items-center gap-1.5">
        <span className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {hint ? (
          <span title={hint} className="text-muted-foreground">
            <HelpCircle className="size-3" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 font-mono-num text-2xl tabular-nums text-ink-900">{value}</div>
      {delta ? (
        <div className="font-mono-num mt-1 inline-flex items-center gap-1.5 text-[11px]">
          <Dot tone={tone} />
          <span className="text-muted-foreground">{delta}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Confirm dialog for destructive / cross-tenant actions. */
export function ConfirmReasonDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const { impersonation } = useAdmin();
  const blocked = !!impersonation;
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-line bg-surface p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        <h3 className="font-display text-base text-ink-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}

        <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Reason (required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Why are you doing this?"
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-sunken/40 px-2.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <p className="font-mono-num mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          This action is recorded in the audit log.
        </p>

        {blocked ? (
          <p className="mt-2 rounded-md border border-line bg-surface-sunken px-2 py-1.5 text-[11px] text-[color:var(--danger,#A6453C)]">
            Disabled while impersonating an org (read-only).
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            disabled={blocked || reason.trim().length < 3}
            onClick={() => {
              onConfirm(reason.trim());
              setReason("");
              toast.success(`${title} — logged`);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium text-paper transition disabled:opacity-50",
              destructive ? "bg-[color:var(--danger,#A6453C)] hover:opacity-90" : "bg-brand-700 hover:bg-brand-500",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Generic disabled-while-impersonating wrapper for buttons. */
export function useReadOnlyGuard() {
  const { impersonation } = useAdmin();
  return {
    readOnly: !!impersonation,
    guardProps: impersonation
      ? {
          disabled: true,
          title: "Disabled while impersonating an org (read-only).",
        }
      : {},
  };
}