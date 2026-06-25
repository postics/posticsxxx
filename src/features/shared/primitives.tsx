import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatusChip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "live" | "preview" | "warn" | "danger" | "gold" | "info";
  children: ReactNode;
  className?: string;
}) {
  const map: Record<string, string> = {
    neutral: "bg-surface-sunken text-ink-700 border-line",
    live: "bg-brand-100 text-brand-700 border-brand-100",
    preview: "bg-[color:var(--surface-sunken)] text-ink-700 border-line",
    warn: "bg-[color:var(--accent-gold-soft)] text-[color:var(--warning)] border-[color:var(--accent-gold-soft)]",
    danger: "bg-[#F7E2DF] text-[color:var(--danger)] border-[#F1D2CE]",
    gold: "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)] border-[color:var(--accent-gold-soft)]",
    info: "bg-[#E2ECF3] text-[color:var(--info)] border-[#D2DFE9]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        map[tone],
        className,
      )}
    >
      <span className="inline-block size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function CreditMeter({
  used,
  total,
  compact = false,
}: {
  used: number;
  total: number;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <div className={cn("flex items-center gap-2.5", compact ? "" : "min-w-[180px]")}>
      <span className="font-mono-num text-xs text-ink-700">
        {fmt(used)}
        <span className="text-muted-foreground">/{fmt(total)}</span>
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-brand-700 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_0_rgba(20,24,31,0.04),0_24px_60px_-24px_rgba(20,24,31,0.18)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#E4C9C5]" />
        <span className="size-2.5 rounded-full bg-[#E8DCC0]" />
        <span className="size-2.5 rounded-full bg-[#C9DCCE]" />
        <div className="ml-3 flex-1">
          <div className="font-mono-num text-[11px] text-muted-foreground">{url}</div>
        </div>
      </div>
      <div className="bg-surface">{children}</div>
    </div>
  );
}

export function Card({
  children,
  className,
  as: As = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  id?: string;
}) {
  return (
    <As
      id={id}
      className={cn(
        "rounded-xl border border-line bg-surface",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  hint,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow ? (
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-2xl font-medium text-ink-900">{title}</h2>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}