import { toast } from "sonner";

/**
 * "No dead ends" guard: any control whose destination doesn't exist yet calls
 * this so the user sees acknowledgement instead of a silent click.
 */
export function comingSoon(what?: string) {
  toast(what ?? "Coming soon", {
    description: "This destination isn't wired in this preview.",
    duration: 2400,
  });
}