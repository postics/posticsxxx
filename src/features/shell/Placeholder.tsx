import { type ReactNode } from "react";
import { Card, SectionTitle } from "@/features/shared/primitives";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Default empty / loading / success / error states for any not-yet-built screen.
 * Every shell route should always render one of these four states.
 */
export function Placeholder({
  eyebrow,
  title,
  hint,
  children,
  state = "empty",
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  children?: ReactNode;
  state?: "empty" | "loading" | "success" | "error";
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-8 py-8">
      <SectionTitle eyebrow={eyebrow} title={title} hint={hint} />
      {state === "loading" ? (
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ) : state === "error" ? (
        <Card className="border-[color:var(--danger)]/30 bg-[#F7E2DF]/40 p-6 text-sm text-[color:var(--danger)]">
          Something went wrong loading this screen.
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          {children ?? "This screen is part of the shell architecture and will be built next."}
        </Card>
      )}
    </div>
  );
}