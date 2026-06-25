import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  Share2,
  FileText,
  Lock,
  RotateCcw,
  Pause,
  Play,
  Info,
  CircleDot,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { Card, StatusChip } from "@/features/shared/primitives";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Product Studio — Postics" },
      {
        name: "description",
        content:
          "Generate descriptions, photos, video, and social variants for every product in your catalog.",
      },
    ],
  }),
  component: StudioPage,
});

/* ============================== seed data ============================== */

type DescState = "done" | "missing" | "generating";
type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  tone: string; // bg color token
  desc: DescState;
  category: string;
};

const PALETTE = [
  "bg-[#E8DCC0]",
  "bg-[#D6CEB6]",
  "bg-[#C9DCCE]",
  "bg-[#E4C9C5]",
  "bg-[#D2DFE9]",
  "bg-[#E2ECF3]",
  "bg-[#EADDC6]",
  "bg-[#C6D5C9]",
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "Yirgacheffe Konga — natural", sku: "NB-YIR-250", price: "$22.00", tone: PALETTE[0], desc: "done", category: "Single origin" },
  { id: "p2", name: "Espresso Tuesday blend", sku: "NB-ESP-250", price: "$18.50", tone: PALETTE[1], desc: "done", category: "House blend" },
  { id: "p3", name: "Honduras Marcala — washed", sku: "NB-HON-250", price: "$19.00", tone: PALETTE[2], desc: "missing", category: "Single origin" },
  { id: "p4", name: "Decaf Brazil Sul — SWP", sku: "NB-DEC-250", price: "$20.00", tone: PALETTE[3], desc: "missing", category: "Decaf" },
  { id: "p5", name: "Cold brew concentrate · 1L", sku: "NB-CLD-1L", price: "$14.00", tone: PALETTE[4], desc: "generating", category: "RTD" },
  { id: "p6", name: "House mug · stoneware 12oz", sku: "NB-MUG-12", price: "$24.00", tone: PALETTE[5], desc: "missing", category: "Gear" },
  { id: "p7", name: "Subscription · 250g monthly", sku: "NB-SUB-M1", price: "from $18", tone: PALETTE[6], desc: "done", category: "Subscription" },
  { id: "p8", name: "Holiday bundle — Three Origins", sku: "NB-BDL-HOL", price: "$58.00", tone: PALETTE[7], desc: "missing", category: "Bundle" },
  { id: "p9", name: "Filter papers · V60 size 02", sku: "NB-FLT-V60", price: "$9.00", tone: PALETTE[0], desc: "done", category: "Gear" },
  { id: "p10", name: "Travel tumbler · 16oz", sku: "NB-TMB-16", price: "$32.00", tone: PALETTE[1], desc: "missing", category: "Gear" },
  { id: "p11", name: "Ethiopia Sidamo — natural", sku: "NB-SID-250", price: "$21.00", tone: PALETTE[2], desc: "done", category: "Single origin" },
  { id: "p12", name: "Cafetiere · French press 1L", sku: "NB-FRP-1L", price: "$48.00", tone: PALETTE[3], desc: "missing", category: "Gear" },
];

type Locale = "EN" | "DE" | "ES" | "FR";

const SHORT: Record<Locale, string> = {
  EN: "Floral and bright, with citrus zest and a clean honey finish. A Konga co-op natural that drinks like a cold lemonade on a stone bench.",
  DE: "Floral und hell, mit Zitruszesten und einem klaren Honig-Abgang. Eine Konga-Natural, die schmeckt wie Limonade auf einer Steinbank.",
  ES: "Floral y luminoso, con ralladura cítrica y un final limpio a miel. Un Konga natural que se bebe como limonada fría en un banco de piedra.",
  FR: "Floral et lumineux, avec un zeste d'agrumes et une finale miel nette. Un Konga nature qui se boit comme une limonade fraîche.",
};
const LONG: Record<Locale, string[]> = {
  EN: [
    "Sourced from the Konga co-op in Yirgacheffe, this lot rests at 1,950m and is dry-processed on raised beds for twelve days.",
    "Cup notes lean jasmine and Meyer lemon, with a tea-like body and a long, clean finish. Best as pour-over or AeroPress at 1:16.",
  ],
  DE: [
    "Aus der Konga-Kooperative in Yirgacheffe, in 1.950 m Höhe, zwölf Tage auf erhöhten Beeten trocken aufbereitet.",
    "Im Becher Jasmin und Meyer-Zitrone, teeartiger Körper, langer sauberer Abgang. Filter oder AeroPress, 1:16.",
  ],
  ES: [
    "De la cooperativa Konga en Yirgacheffe, a 1.950 m, secado natural sobre camas elevadas durante doce días.",
    "En taza: jazmín y limón Meyer, cuerpo tipo té, final largo y limpio. Filtro o AeroPress, 1:16.",
  ],
  FR: [
    "De la coopérative Konga à Yirgacheffe, 1 950 m, séchage nature sur lits surélevés pendant douze jours.",
    "En tasse : jasmin et citron Meyer, corps thé, finale longue et nette. Filtre ou AeroPress, 1:16.",
  ],
};
const BULLETS: Record<Locale, string[]> = {
  EN: ["1,950m altitude · Konga co-op", "Natural process · 12-day raised bed", "Jasmine · Meyer lemon · honey", "Roast: light · filter / AeroPress"],
  DE: ["1.950 m Höhe · Konga", "Natural · 12 Tage", "Jasmin · Zitrone · Honig", "Helle Röstung · Filter"],
  ES: ["1.950 m · Konga", "Natural · 12 días", "Jazmín · limón · miel", "Tueste claro · filtro"],
  FR: ["1 950 m · Konga", "Nature · 12 jours", "Jasmin · citron · miel", "Torréfaction claire · filtre"],
};

const PHOTO_PRESETS = [
  { id: "white", label: "White background", swatch: "bg-[#F4F1EA]" },
  { id: "lifestyle", label: "Lifestyle", swatch: "bg-[#C9DCCE]" },
  { id: "angle", label: "Angle · 3/4 view", swatch: "bg-[#EADDC6]" },
];

type Tab = "desc" | "photos" | "video" | "social";

/* ================================ page ================================ */

function StudioPage() {
  const [selectedId, setSelectedId] = useState<string>(PRODUCTS[0].id);
  const [tab, setTab] = useState<Tab>("desc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | DescState>("all");
  const [bulkLocales, setBulkLocales] = useState<Locale[]>(["EN"]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(412);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(
      (p) =>
        (filter === "all" || p.desc === filter) &&
        (search === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search, filter]);

  const selected = PRODUCTS.find((p) => p.id === selectedId) ?? PRODUCTS[0];

  const missingCount = PRODUCTS.filter((p) => p.desc === "missing").length;

  return (
    <ProjectShell active="studio" breadcrumb={["Product Studio"]}>
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
        {/* page header */}
        <header className="border-b border-line bg-paper px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-medium tracking-tight text-ink-900">Product Studio</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-0.5 text-ink-700">
                  <span className="size-1.5 rounded-full bg-brand-700" />
                  Northbound Coffee Roasters
                </span>
                <span>·</span>
                <span className="font-mono-num">
                  248 products · 1,418 missing descriptions
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-700">
                <ShieldCheck className="size-3.5 text-brand-700" strokeWidth={1.5} />
                Quality-gate · auto
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-700">
                <Wallet className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="font-mono-num">3,240 / 10,000</span>
                <span className="text-muted-foreground">action credits</span>
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-2.5 py-1 text-xs text-[color:var(--accent-gold)]"
                title="Video uses a separate pool"
              >
                <Video className="size-3.5" strokeWidth={1.5} />
                <span className="font-mono-num">86 / 200</span>
                <span>video credits</span>
              </span>
            </div>
          </div>

          {/* low-credit soft banner only when needed; here just informational platform availability */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-700">
            <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <span className="text-ink-900">CMS-agnostic.</span> Connected to your store.
              WordPress / WooCommerce available now · Shopify and custom API · coming.
              Postics never builds or hosts your site.
            </div>
          </div>
        </header>

        {/* two-pane */}
        <div className="flex min-h-0 flex-1">
          {/* LEFT — catalog */}
          <aside className="flex w-[360px] shrink-0 flex-col border-r border-line bg-surface">
            <div className="border-b border-line p-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU or product…"
                  className="w-full rounded-md border border-line bg-paper py-1.5 pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ink-700/30"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(["all", "missing", "done", "generating"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] capitalize transition-colors",
                      filter === f
                        ? "border-ink-900 bg-ink-900 text-paper"
                        : "border-line bg-paper text-ink-700 hover:bg-surface-sunken",
                    )}
                  >
                    {f === "all"
                      ? "All"
                      : f === "missing"
                        ? "Missing description"
                        : f === "done"
                          ? "Has description"
                          : "Generating"}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-5 py-10 text-center text-xs text-muted-foreground">
                  No products match your filters.
                </div>
              ) : (
                filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    active={p.id === selectedId}
                    onSelect={() => setSelectedId(p.id)}
                  />
                ))
              )}
            </div>
            <div className="border-t border-line bg-paper px-3 py-2 text-[11px] font-mono-num text-muted-foreground">
              showing {filtered.length} of 248 · {missingCount} missing
            </div>
          </aside>

          {/* CENTER — product workspace */}
          <section className="flex min-w-0 flex-1 flex-col bg-paper">
            <ProductHeader product={selected} />
            <Tabs tab={tab} setTab={setTab} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "desc" ? <DescriptionTab product={selected} /> : null}
              {tab === "photos" ? <PhotosTab product={selected} /> : null}
              {tab === "video" ? <VideoTab /> : null}
              {tab === "social" ? <SocialTab /> : null}
            </div>
            {/* Bulk bar */}
            <BulkBar
              locales={bulkLocales}
              toggle={(l) =>
                setBulkLocales((xs) =>
                  xs.includes(l) ? xs.filter((x) => x !== l) : [...xs, l],
                )
              }
              running={bulkRunning}
              progress={bulkProgress}
              onStart={() => {
                if (bulkLocales.length === 0) return;
                setBulkRunning(true);
                toast.success("Bulk generation started", {
                  description: `1,000 × ${bulkLocales.length} × 2 cr = ${(
                    1000 * bulkLocales.length * 2
                  ).toLocaleString()} action credits`,
                });
                const iv = setInterval(() => {
                  setBulkProgress((n) => {
                    if (n >= 1000) {
                      clearInterval(iv);
                      setBulkRunning(false);
                      return 1000;
                    }
                    return Math.min(1000, n + 23);
                  });
                }, 600);
              }}
              onPause={() => {
                setBulkRunning(false);
                toast("Bulk paused", { description: `${bulkProgress} / 1,000 generated` });
              }}
            />
          </section>
        </div>
      </div>
    </ProjectShell>
  );
}

/* =============================== left ================================ */

function ProductRow({
  product,
  active,
  onSelect,
}: {
  product: Product;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left transition-colors",
        active ? "bg-paper" : "hover:bg-surface-sunken/60",
      )}
    >
      {active ? (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-700" />
      ) : null}
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-md", product.tone)}>
        <span className="font-mono-num text-[10px] uppercase tracking-wider text-ink-900/40">
          {product.sku.split("-")[1]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-ink-900">{product.name}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-mono-num">{product.sku}</span>
          <span>·</span>
          <span>{product.price}</span>
        </div>
      </div>
      <DescStatusChip state={product.desc} />
    </button>
  );
}

function DescStatusChip({ state }: { state: DescState }) {
  if (state === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded border border-brand-100 bg-brand-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-brand-700">
        <Check className="size-2.5" strokeWidth={2} />
        Has
      </span>
    );
  if (state === "generating")
    return (
      <span className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <RotateCcw className="size-2.5 animate-spin" strokeWidth={2} />
        Gen…
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--accent-gold)]">
      Missing
    </span>
  );
}

/* =============================== center =============================== */

function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-7 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("grid size-12 place-items-center rounded-lg", product.tone)}>
          <span className="font-mono-num text-[10px] uppercase tracking-wider text-ink-900/40">
            {product.sku.split("-")[1]}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-wider text-muted-foreground">
            <span>{product.sku}</span>
            <span>·</span>
            <span>{product.category}</span>
          </div>
          <h2 className="mt-0.5 text-xl font-medium tracking-tight text-ink-900">
            {product.name}
          </h2>
          <div className="mt-0.5 text-xs text-muted-foreground">{product.price}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-100 px-2 py-1 text-xs text-brand-700">
          <CircleDot className="size-3" strokeWidth={1.5} />
          Site · Publishing now
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken px-2 py-1 text-xs text-muted-foreground">
          <Lock className="size-3" strokeWidth={1.5} />
          Social · pending audit
        </span>
      </div>
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "desc", label: "Description", icon: FileText },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "video", label: "Video", icon: Video },
    { id: "social", label: "Social", icon: Share2 },
  ];
  return (
    <div className="flex gap-1 border-b border-line bg-paper px-7">
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
              active ? "text-ink-900" : "text-muted-foreground hover:text-ink-700",
            )}
          >
            <t.icon className="size-4" strokeWidth={1.5} />
            {t.label}
            {active ? (
              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand-700" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- Description ----------------------------- */

function DescriptionTab({ product }: { product: Product }) {
  const [locale, setLocale] = useState<Locale>("EN");
  const [tone, setTone] = useState<"fast" | "flagship">("fast");

  return (
    <div className="grid grid-cols-1 gap-6 px-7 py-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* locale tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-md border border-line bg-surface p-0.5">
            {(["EN", "DE", "ES", "FR"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-mono-num uppercase tracking-wider transition-colors",
                  locale === l ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-surface-sunken",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Draft</span>
            <button
              onClick={() => setTone((t) => (t === "fast" ? "flagship" : "fast"))}
              className="relative h-5 w-10 rounded-full border border-line bg-surface"
            >
              <span
                className={cn(
                  "absolute top-[1px] grid size-4 place-items-center rounded-full bg-brand-700 transition-transform",
                  tone === "fast" ? "translate-x-[1px]" : "translate-x-[21px]",
                )}
              />
            </button>
            <span className={cn(tone === "flagship" ? "text-[color:var(--accent-gold)]" : "")}>
              {tone === "fast" ? "Fast" : "Flagship"}
            </span>
          </div>
        </div>

        <Field label="Short description">
          <textarea
            key={`${product.id}-${locale}-short`}
            defaultValue={SHORT[locale]}
            className="h-20 w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
          />
        </Field>

        <Field label="Long description">
          <textarea
            key={`${product.id}-${locale}-long`}
            defaultValue={LONG[locale].join("\n\n")}
            className="h-44 w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink-700/30"
          />
        </Field>

        <Field label="Bullets">
          <div className="space-y-1.5">
            {BULLETS[locale].map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink-700"
              >
                <Check className="size-3.5 text-brand-700" strokeWidth={2} />
                {b}
              </div>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Meta title">
            <input
              defaultValue={`${product.name} · Northbound Coffee`}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
            />
          </Field>
          <Field label="Meta description">
            <input
              defaultValue={SHORT[locale].slice(0, 150)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink-700/30"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <CostBtn label="Regenerate" cost={2} onClick={() => toast("Regenerating…")} />
            <CostBtn label="Rewrite tone" cost={1} onClick={() => toast("Rewriting tone…")} />
            <CostBtn label="Humanize" cost={1} onClick={() => toast("Humanizing…")} />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] uppercase tracking-wider text-muted-foreground sm:inline">
              Human review on Advanced / Premium
            </span>
            <button
              onClick={() => toast.success("Description saved")}
              className="rounded-md bg-brand-700 px-4 py-2 text-sm text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
            >
              Save description
            </button>
          </div>
        </div>
      </div>

      {/* right — quality-gate */}
      <aside className="space-y-3">
        <Card className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Quality-gate
          </div>
          <div className="mt-3 space-y-3">
            <Meter label="Originality" value={96} tone="brand" />
            <div className="flex items-center justify-between rounded-md border border-line bg-surface px-2.5 py-2 text-xs">
              <span className="text-ink-700">E-E-A-T</span>
              <StatusChip tone="live">Pass</StatusChip>
            </div>
            <div className="rounded-md border border-brand-100 bg-brand-100 px-2.5 py-2 text-[11px] text-brand-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" strokeWidth={1.5} />
                Verified against your catalog data
              </div>
              <div className="mt-1 leading-relaxed text-brand-700/80">
                No invented attributes · weights, origin, process pulled from your SKU record.
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Add-ons
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-2 py-1 text-[11px] text-[color:var(--accent-gold)]">
            <Lock className="size-3" strokeWidth={1.5} />
            Human review · Advanced / Premium
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Meter({ label, value, tone = "brand" }: { label: string; value: number; tone?: "brand" | "gold" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-700">{label}</span>
        <span className="font-mono-num text-ink-900">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "brand" ? "bg-brand-700" : "bg-[color:var(--accent-gold)]",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CostBtn({
  label,
  cost,
  onClick,
}: {
  label: string;
  cost: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-700 transition-colors hover:border-ink-700/30 hover:bg-paper"
    >
      <span>{label}</span>
      <span className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono-num text-[10px] text-muted-foreground">
        {cost} cr
      </span>
    </button>
  );
}

/* ------------------------------- Photos ------------------------------- */

function PhotosTab({ product }: { product: Product }) {
  const [preset, setPreset] = useState("white");
  return (
    <div className="space-y-5 px-7 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PHOTO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition-colors",
                preset === p.id
                  ? "border-ink-900 bg-ink-900 text-paper"
                  : "border-line bg-surface text-ink-700 hover:bg-surface-sunken",
              )}
            >
              <span className={cn("size-3 rounded-sm", p.swatch)} />
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-num text-xs text-muted-foreground">
            Cost: 2 credits / image
          </span>
          <button
            onClick={() => toast.success("Photo generation queued")}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-900 hover:bg-paper"
          >
            Generate 4 photos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <PhotoCard key={i} product={product} variant={i} preset={preset} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  product,
  variant,
  preset,
}: {
  product: Product;
  variant: number;
  preset: string;
}) {
  const captions: Record<string, string> = {
    white: "studio · 1024² · white sweep",
    lifestyle: "wooden bench · morning light",
    angle: "3/4 view · 35mm look",
  };
  return (
    <Card className="overflow-hidden">
      <div className={cn("relative grid aspect-square place-items-center", product.tone)}>
        {/* mock product silhouette */}
        <div className="grid h-3/5 w-1/3 grid-rows-[1fr_3fr] gap-1.5">
          <div className="rounded-sm bg-ink-900/20" />
          <div className="rounded-md border border-ink-900/15 bg-paper/40" />
        </div>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-brand-100 bg-brand-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-brand-700">
          <Check className="size-2.5" strokeWidth={2} />
          Generated
        </span>
        <span className="absolute right-2 top-2 rounded border border-line bg-paper px-1.5 py-0.5 font-mono-num text-[10px] text-muted-foreground">
          v{variant + 1}
        </span>
      </div>
      <div className="border-t border-line bg-surface px-2.5 py-2 text-[11px] text-muted-foreground">
        {captions[preset] ?? captions.white}
      </div>
    </Card>
  );
}

/* -------------------------------- Video ------------------------------- */

function VideoTab() {
  const [quality, setQuality] = useState<"budget" | "flagship">("budget");
  const [confirm, setConfirm] = useState(false);

  const cost = quality === "budget" ? 8 : 160;

  return (
    <div className="space-y-5 px-7 py-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-[#1E3A34]">
            {/* abstract motion lines */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid size-14 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
                <Play className="size-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-0.5 px-4 pb-3 opacity-60">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full bg-white/70"
                  style={{ height: `${10 + ((i * 7) % 24)}px` }}
                />
              ))}
            </div>
            <span className="absolute right-3 top-3 rounded border border-white/30 bg-black/30 px-1.5 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-white">
              16:9 · 0:08 / max 0:12
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">
              Pour-over routine · Konga natural · stoneware mug
            </span>
            <span className="font-mono-num text-muted-foreground">v1 · draft</span>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Generate
          </div>
          <div className="space-y-2">
            <QualityOpt
              id="budget"
              active={quality === "budget"}
              onSelect={() => setQuality("budget")}
              title="Budget · default"
              meta="~8 credits · 0:08"
              hint="House model. Crisp product loops, fixed camera."
            />
            <QualityOpt
              id="flagship"
              active={quality === "flagship"}
              onSelect={() => setQuality("flagship")}
              title="Flagship"
              meta="~160 credits · confirm"
              hint="Cinematic motion. Confirm before generating."
              warn
            />
          </div>

          {quality === "flagship" ? (
            <label className="flex items-start gap-2 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-3 py-2 text-[11px] text-[color:var(--accent-gold)]">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm spending <span className="font-mono-num">~160 video credits</span> on
                this render.
              </span>
            </label>
          ) : null}

          <div className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-xs">
            <span className="text-muted-foreground">Video credits</span>
            <span className="font-mono-num text-ink-900">86 / 200</span>
          </div>

          <button
            disabled={quality === "flagship" && !confirm}
            onClick={() =>
              toast.success("Render queued", {
                description: `${cost} video credits reserved`,
              })
            }
            className={cn(
              "w-full rounded-md px-3 py-2 text-sm",
              quality === "flagship" && !confirm
                ? "cursor-not-allowed bg-surface-sunken text-muted-foreground"
                : "bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-700/90",
            )}
          >
            Generate · {cost} cr
          </button>

          <div className="text-[11px] leading-relaxed text-muted-foreground">
            Video uses a separate pool from action credits. Hard cap 0:12.
          </div>
        </Card>
      </div>
    </div>
  );
}

function QualityOpt({
  active,
  onSelect,
  title,
  meta,
  hint,
  warn,
}: {
  id: string;
  active: boolean;
  onSelect: () => void;
  title: string;
  meta: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "block w-full rounded-md border px-3 py-2.5 text-left transition-colors",
        active
          ? warn
            ? "border-[color:var(--accent-gold)] bg-[color:var(--accent-gold-soft)]"
            : "border-brand-700 bg-brand-100"
          : "border-line bg-surface hover:bg-paper",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm",
            active && warn
              ? "text-[color:var(--accent-gold)]"
              : active
                ? "text-brand-700"
                : "text-ink-900",
          )}
        >
          {title}
        </span>
        <span className="font-mono-num text-[11px] text-muted-foreground">{meta}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </button>
  );
}

/* -------------------------------- Social ------------------------------ */

const PLATFORMS: { id: string; label: string; ratio: string; w: string }[] = [
  { id: "ig", label: "Instagram", ratio: "1:1", w: "Carousel · 6 slides" },
  { id: "fb", label: "Facebook", ratio: "4:5", w: "Image + caption" },
  { id: "th", label: "Threads", ratio: "4:5", w: "Reply-bait post" },
  { id: "li", label: "LinkedIn", ratio: "1.91:1", w: "Founder note" },
  { id: "x", label: "X", ratio: "16:9", w: "Single post + alt" },
  { id: "tt", label: "TikTok", ratio: "9:16", w: "Hook · 12s" },
  { id: "yt", label: "YouTube Shorts", ratio: "9:16", w: "Vertical · 30s" },
];

function SocialTab() {
  return (
    <div className="space-y-5 px-7 py-6">
      <div className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)] px-3.5 py-2.5 text-xs text-[color:var(--accent-gold)]">
        <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
        <div>
          <span className="font-medium">Best-effort · pending platform audit.</span>{" "}
          Social variants are previewable now; auto-publish to platforms unlocks after each
          channel passes its audit. Site stays your guaranteed channel.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PLATFORMS.map((p) => (
          <SocialCard key={p.id} platform={p} />
        ))}
      </div>
    </div>
  );
}

function SocialCard({
  platform,
}: {
  platform: { id: string; label: string; ratio: string; w: string };
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-surface px-3 py-2 text-xs">
        <span className="text-ink-900">{platform.label}</span>
        <span className="font-mono-num text-muted-foreground">{platform.ratio}</span>
      </div>
      <div
        className={cn(
          "relative grid place-items-center",
          platform.ratio === "9:16"
            ? "aspect-[9/16]"
            : platform.ratio === "16:9"
              ? "aspect-video"
              : platform.ratio === "4:5"
                ? "aspect-[4/5]"
                : platform.ratio === "1.91:1"
                  ? "aspect-[1.91/1]"
                  : "aspect-square",
          "bg-[#E8DCC0]",
        )}
      >
        <div className="grid h-2/5 w-1/4 grid-rows-[1fr_3fr] gap-1">
          <div className="rounded-sm bg-ink-900/20" />
          <div className="rounded-md border border-ink-900/15 bg-paper/50" />
        </div>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-line bg-paper px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Lock className="size-2.5" strokeWidth={1.5} />
          Pending audit
        </span>
      </div>
      <div className="space-y-1.5 border-t border-line bg-surface px-3 py-2.5 text-[11px]">
        <div className="text-ink-700">{platform.w}</div>
        <div className="text-muted-foreground">
          "A Tuesday roast worth pouring slow — Konga natural, jasmine and honey."
        </div>
      </div>
    </Card>
  );
}

/* ============================== bulk bar ============================== */

function BulkBar({
  locales,
  toggle,
  running,
  progress,
  onStart,
  onPause,
}: {
  locales: Locale[];
  toggle: (l: Locale) => void;
  running: boolean;
  progress: number;
  onStart: () => void;
  onPause: () => void;
}) {
  const total = 1000;
  const cost = total * 2 * locales.length;
  const flagged = 3;

  return (
    <div className="border-t border-line bg-surface/80 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-ink-900">
            Generate descriptions for <span className="font-mono-num">1,000 SKUs</span>
          </div>
          <div className="flex items-center gap-1">
            {(["EN", "DE", "ES", "FR"] as Locale[]).map((l) => {
              const on = locales.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggle(l)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-mono-num uppercase tracking-wider transition-colors",
                    on
                      ? "border-brand-700 bg-brand-100 text-brand-700"
                      : "border-line bg-paper text-muted-foreground hover:bg-surface-sunken",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <div className="font-mono-num text-xs text-muted-foreground">
            1,000 × {locales.length || 0} × 2 cr ={" "}
            <span className="text-ink-900">{cost.toLocaleString()}</span> action credits
          </div>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button
              onClick={onPause}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink-900 hover:bg-surface-sunken"
            >
              <Pause className="size-3.5" strokeWidth={1.5} />
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={locales.length === 0}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs",
                locales.length === 0
                  ? "cursor-not-allowed bg-surface-sunken text-muted-foreground"
                  : "bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-700/90",
              )}
            >
              Start bulk generate
            </button>
          )}
        </div>
      </div>
      {(running || progress > 0) && progress < total ? (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between font-mono-num text-[11px] text-muted-foreground">
            <span>
              {progress.toLocaleString()} / {total.toLocaleString()} generated ·{" "}
              <span className="text-[color:var(--accent-gold)]">
                {flagged} flagged for review
              </span>
            </span>
            <span>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-brand-700 transition-all"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      {progress >= total ? (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-100 px-2 py-1 text-[11px] text-brand-700">
          <Check className="size-3" strokeWidth={2} />
          Bulk complete · {total.toLocaleString()} descriptions ready
        </div>
      ) : null}
    </div>
  );
}

// silence unused
void AlertTriangle;
