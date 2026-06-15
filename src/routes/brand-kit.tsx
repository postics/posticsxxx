import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Sparkle,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import {
  BrowserFrame,
  Card,
  SectionTitle,
  StatusChip,
} from "@/features/shared/primitives";
import { useScope } from "@/features/shell/scope";

export const Route = createFileRoute("/brand-kit")({
  head: () => ({ meta: [{ title: "Brand kit / White-label — Postics" }] }),
  component: Page,
});

type ThemePreset = {
  id: string;
  name: string;
  primary: string;
  primarySoft: string;
  ink: string;
};

const PRESETS: ThemePreset[] = [
  { id: "ember", name: "Ember", primary: "#B0432A", primarySoft: "#F4E3DD", ink: "#1E1A17" },
  { id: "moss", name: "Moss", primary: "#3F6B4E", primarySoft: "#E4ECE5", ink: "#161B17" },
  { id: "indigo", name: "Indigo", primary: "#3D52A0", primarySoft: "#E2E6F2", ink: "#161A24" },
  { id: "graphite", name: "Graphite", primary: "#2A2D33", primarySoft: "#E4E5E8", ink: "#0F1115" },
];

function Page() {
  const { projects } = useScope();
  const [preset, setPreset] = useState<ThemePreset>(PRESETS[0]);
  const [domain, setDomain] = useState("reports.acmestudio.co");
  const [agencyName, setAgencyName] = useState("Acme Studio");

  return (
    <WorkspaceShell active="brand" breadcrumb={["Brand kit / White-label"]}>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-8 py-8">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Workspace"
            title="Brand kit & white-label"
            hint="Your agency's identity applied to client-facing reports and shared preview links."
          />
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink-700/30">
              Reset to Postics
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-paper hover:bg-ink-700">
              <Check className="size-3.5" strokeWidth={1.75} /> Apply to all client reports
            </button>
          </div>
        </div>

        {/* Tokens row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
          {/* Controls */}
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-900">
                  <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.5} /> Logo
                </div>
                <StatusChip tone="live">Synced</StatusChip>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="grid size-14 place-items-center rounded-lg font-display text-lg text-paper"
                  style={{ background: preset.ink }}
                >
                  {agencyName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
                  />
                  <button className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink-900">
                    <Upload className="size-3" strokeWidth={1.75} /> Upload SVG / PNG
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-ink-900">
                <Palette className="size-4 text-muted-foreground" strokeWidth={1.5} /> Theme tokens
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                White-label swaps theme tokens — every report instantly rebrands.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      preset.id === p.id
                        ? "border-ink-700/30 bg-surface-sunken"
                        : "border-line bg-surface hover:border-ink-700/30",
                    )}
                  >
                    <div className="flex gap-1">
                      <span className="size-5 rounded" style={{ background: p.primary }} />
                      <span className="size-5 rounded" style={{ background: p.primarySoft }} />
                      <span className="size-5 rounded" style={{ background: p.ink }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-ink-900">{p.name}</div>
                      <div className="font-mono-num text-[10px] text-muted-foreground">
                        {p.primary}
                      </div>
                    </div>
                    {preset.id === p.id ? (
                      <Check className="size-4 text-brand-700" strokeWidth={2} />
                    ) : null}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-ink-900">
                <Globe className="size-4 text-muted-foreground" strokeWidth={1.5} /> Custom domain
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Used for client-facing reports and shared preview links.
              </div>
              <div className="mt-4 space-y-2">
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="font-mono-num w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    CNAME → <span className="font-mono-num">edge.postics.app</span>
                  </span>
                  <StatusChip tone="live">DNS verified</StatusChip>
                </div>
              </div>
            </Card>
          </div>

          {/* Live previews */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Live preview
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkle className="size-3 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
                Token-driven — no rebuild needed
              </div>
            </div>

            <ReportPreview preset={preset} agency={agencyName} domain={domain} />
            <SharedLinkPreview preset={preset} agency={agencyName} domain={domain} />
          </div>
        </div>

        {/* Per-client overrides */}
        <div className="space-y-3">
          <SectionTitle
            eyebrow="Overrides"
            title="Per-client brand"
            hint="Most agencies apply one kit across the board. Override only when a client insists."
          />
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-4 border-b border-line bg-surface-sunken px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <div>Client</div>
              <div>Active kit</div>
              <div>Report domain</div>
              <div className="text-right">Action</div>
            </div>
            {projects.map((p, i) => {
              const override = i === 2;
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-line px-5 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-md bg-brand-100 font-display text-xs text-brand-700">
                      {p.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-ink-900">{p.name}</div>
                      <div className="font-mono-num truncate text-[11px] text-muted-foreground">
                        {p.domain}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {override ? (
                      <>
                        <span className="size-3 rounded" style={{ background: "#7A3CC4" }} />
                        <span className="text-ink-900">Client custom</span>
                      </>
                    ) : (
                      <>
                        <span className="size-3 rounded" style={{ background: preset.primary }} />
                        <span className="text-muted-foreground">{agencyName} · {preset.name}</span>
                      </>
                    )}
                  </div>
                  <div className="font-mono-num truncate text-[11px] text-muted-foreground">
                    {override ? `reports.${p.domain}` : domain}
                  </div>
                  <div className="text-right">
                    <button className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-700 hover:border-ink-700/30">
                      {override ? "Edit override" : "Override"}
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function ReportPreview({
  preset,
  agency,
  domain,
}: {
  preset: ThemePreset;
  agency: string;
  domain: string;
}) {
  return (
    <BrowserFrame url={`https://${domain}/vellum-bean/october`}>
      <div className="bg-surface p-5" style={{ ["--brand" as any]: preset.primary }}>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="grid size-7 place-items-center rounded-md font-display text-[11px] text-paper"
              style={{ background: preset.ink }}
            >
              {agency.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-medium text-ink-900">{agency}</div>
              <div className="text-[10px] text-muted-foreground">Client report · October</div>
            </div>
          </div>
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{ background: preset.primarySoft, color: preset.primary }}
          >
            Vellum & Bean
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { l: "Organic traffic", v: "12.4k", d: "+18%" },
            { l: "Indexed pages", v: "184" },
            { l: "GEO mentions", v: "37", d: "+9" },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-line bg-surface p-3">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono-num text-base" style={{ color: preset.ink }}>
                  {k.v}
                </span>
                {k.d ? (
                  <span className="text-[10px]" style={{ color: preset.primary }}>
                    {k.d}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-line p-3">
          <div className="flex items-end gap-1.5">
            {[24, 32, 28, 42, 38, 56, 64, 58, 70, 76, 82, 88].map((h, i) => (
              <span
                key={i}
                className="w-3 rounded-sm"
                style={{
                  height: h,
                  background: i > 7 ? preset.primary : preset.primarySoft,
                }}
              />
            ))}
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Traffic, last 12 weeks</div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function SharedLinkPreview({
  preset,
  agency,
  domain,
}: {
  preset: ThemePreset;
  agency: string;
  domain: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <LinkIcon className="size-3.5" strokeWidth={1.5} />
          Shared preview link
        </div>
        <span className="font-mono-num text-[11px] text-muted-foreground">
          {domain}/p/v3-cold-brew-guide
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <div
            className="grid size-7 place-items-center rounded-md font-display text-[11px] text-paper"
            style={{ background: preset.ink }}
          >
            {agency.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {agency} shared a draft for your review
          </div>
        </div>
        <h3 className="mt-3 font-display text-lg" style={{ color: preset.ink }}>
          A field guide to slow-extracted cold brew
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          1,420 words · Article · Ready for approval
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            className="rounded-md px-3 py-1.5 text-xs font-medium text-paper"
            style={{ background: preset.primary }}
          >
            Approve
          </button>
          <button
            className="rounded-md border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: preset.primarySoft,
              color: preset.primary,
              background: preset.primarySoft,
            }}
          >
            Request changes
          </button>
        </div>
      </div>
    </Card>
  );
}
