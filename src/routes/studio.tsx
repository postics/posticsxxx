import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Cpu,
  FileText,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  Globe2,
  Send,
  RefreshCw,
  ArrowLeftRight,
  ChevronRight,
  CheckSquare,
  Square,
  Wallet,
  Zap,
  Sliders,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectShell } from "@/features/shell/ProjectShell";
import { useScope } from "@/features/shell/scope";
import { Card, SectionTitle } from "@/features/shared/primitives";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Product Studio — Postics" },
      { name: "description", content: "Turn your catalog into ready-to-publish descriptions, photos, and short videos." },
    ],
  }),
  component: StudioPage,
});

type AssetState = "done" | "draft" | "missing";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  thumb: string;
  description: AssetState;
  photo: AssetState;
  video: AssetState;
  imported: "synced" | "syncing" | "stale";
};

const PRODUCTS: Product[] = [
  { id: "p1", name: "Single-origin Yirgacheffe, 250g", sku: "VB-YRG-250", price: "$19.00", thumb: "from-[#C9B79A] to-[#8E7D5E]", description: "done", photo: "done", video: "missing", imported: "synced" },
  { id: "p2", name: "House blend espresso, 1kg", sku: "VB-HBE-1K", price: "$36.00", thumb: "from-[#7A5A3E] to-[#3E2A18]", description: "done", photo: "draft", video: "missing", imported: "synced" },
  { id: "p3", name: "Cold brew concentrate, 1L", sku: "VB-CBC-1L", price: "$22.00", thumb: "from-[#5C463A] to-[#231916]", description: "draft", photo: "missing", video: "missing", imported: "synced" },
  { id: "p4", name: "Decaf Colombia, 250g", sku: "VB-DCC-250", price: "$18.00", thumb: "from-[#B8A88E] to-[#73624A]", description: "draft", photo: "missing", video: "missing", imported: "stale" },
  { id: "p5", name: "Filter paper, 100 ct", sku: "VB-FPP-100", price: "$8.00", thumb: "from-[#EDE6D6] to-[#C8BFA9]", description: "missing", photo: "missing", video: "missing", imported: "synced" },
  { id: "p6", name: "Hand grinder, brass", sku: "VB-HGB-001", price: "$129.00", thumb: "from-[#C9A361] to-[#6D4D1F]", description: "done", photo: "done", video: "draft", imported: "synced" },
  { id: "p7", name: "Wholesale starter kit", sku: "VB-WSK-001", price: "$220.00", thumb: "from-[#9CA89A] to-[#3F4B3E]", description: "draft", photo: "draft", video: "missing", imported: "synced" },
  { id: "p8", name: "Cupping bowls, set of 6", sku: "VB-CBS-006", price: "$48.00", thumb: "from-[#D8C9AE] to-[#9E8C67]", description: "missing", photo: "missing", video: "missing", imported: "syncing" },
];

const COST = {
  description: 60,
  photo: 140,
  videoBudget: 1200,
  videoPremium: 3400,
};

function StudioPage() {
  const { credits, currentProject } = useScope();
  const [products] = useState<Product[]>(PRODUCTS);
  const [open, setOpen] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "missing_desc" | "missing_photo" | "missing_video">("all");
  const [query, setQuery] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState<null | { kind: "description" | "photo" | "video"; ids: string[] }>(null);

  const empty = products.length === 0;
  const creditsLow = credits.used / credits.total > 0.75;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.sku.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "missing_desc" && p.description === "done") return false;
      if (filter === "missing_photo" && p.photo === "done") return false;
      if (filter === "missing_video" && p.video === "done") return false;
      return true;
    });
  }, [products, filter, query]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  }

  function requestBulk(kind: "description" | "photo" | "video") {
    const ids = Array.from(selected.size > 0 ? selected : new Set(filtered.map((p) => p.id)));
    setBulkConfirm({ kind, ids });
  }

  return (
    <ProjectShell active="studio" breadcrumb={["Product Studio"]}>
      <div className="mx-auto max-w-[1400px] space-y-6 px-8 py-8 animate-rise">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Catalog content"
            title={`Product Studio · ${currentProject.name}`}
            hint="Generate descriptions, photos, and short videos for every product — on brand."
          />
          <div className="flex flex-wrap items-center gap-2">
            <CreditPools />
            <button className="postics-btn-ghost text-sm">
              <RefreshCw className="size-4" strokeWidth={1.5} /> Re-sync catalog
            </button>
          </div>
        </div>

        {creditsLow && <CreditsBanner />}

        <Toolbar
          query={query} setQuery={setQuery}
          filter={filter} setFilter={setFilter}
          total={products.length}
          selectedCount={selected.size}
          onSelectAll={selectAll}
          onBulk={requestBulk}
        />

        {empty ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                selected={selected.has(p.id)}
                onSelect={() => toggleSelect(p.id)}
                onOpen={() => setOpen(p)}
              />
            ))}
          </div>
        )}
      </div>

      {open && <ProductDrawer product={open} onClose={() => setOpen(null)} />}
      {bulkConfirm && (
        <BulkConfirmDialog
          kind={bulkConfirm.kind}
          ids={bulkConfirm.ids}
          onClose={() => setBulkConfirm(null)}
          onConfirm={() => setBulkConfirm(null)}
        />
      )}
    </ProjectShell>
  );
}

function CreditPools() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
      <Wallet className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
      <span className="font-mono-num text-ink-700">6,760 <span className="text-muted-foreground">text</span></span>
      <span className="h-3 w-px bg-line" />
      <span className="font-mono-num text-ink-700">14 <span className="text-muted-foreground">video</span></span>
    </div>
  );
}

function CreditsBanner() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-ink-900">
        <AlertTriangle className="size-4 text-[color:var(--warning)]" strokeWidth={1.5} />
        <span>Text credits low. Video credits are a separate pool — top up either independently.</span>
      </div>
      <button className="postics-btn-secondary text-xs">Add credits</button>
    </div>
  );
}

function Toolbar({
  query, setQuery,
  filter, setFilter,
  total,
  selectedCount,
  onSelectAll,
  onBulk,
}: {
  query: string;
  setQuery: (v: string) => void;
  filter: "all" | "missing_desc" | "missing_photo" | "missing_video";
  setFilter: (v: "all" | "missing_desc" | "missing_photo" | "missing_video") => void;
  total: number;
  selectedCount: number;
  onSelectAll: () => void;
  onBulk: (k: "description" | "photo" | "video") => void;
}) {
  const chips: { v: typeof filter; l: string }[] = [
    { v: "all", l: `All (${total})` },
    { v: "missing_desc", l: "Missing description" },
    { v: "missing_photo", l: "Missing photo" },
    { v: "missing_video", l: "Missing video" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <button
          onClick={onSelectAll}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-700 hover:bg-surface-sunken"
        >
          {selectedCount > 0 ? <CheckSquare className="size-3.5 text-brand-700" strokeWidth={1.5} /> : <Square className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
          {selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or SKU…"
            className="w-56 rounded-md border border-line bg-surface py-1.5 pl-7 pr-2 text-xs text-ink-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-700/30"
          />
        </div>
        {chips.map((c) => (
          <button
            key={c.v}
            onClick={() => setFilter(c.v)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs",
              filter === c.v ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
            )}
          >
            {c.l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onBulk("description")} className="postics-btn-secondary text-xs">
          <FileText className="size-3.5" strokeWidth={1.5} /> Generate descriptions
          <span className="font-mono-num ml-1 text-[10px] text-muted-foreground">{COST.description}/ea</span>
        </button>
        <button onClick={() => onBulk("photo")} className="postics-btn-secondary text-xs">
          <ImageIcon className="size-3.5" strokeWidth={1.5} /> Generate photos
          <span className="font-mono-num ml-1 text-[10px] text-muted-foreground">{COST.photo}/ea</span>
        </button>
        <button onClick={() => onBulk("video")} className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--accent-gold)] hover:brightness-95">
          <Video className="size-3.5" strokeWidth={1.5} /> Generate videos
          <span className="font-mono-num ml-1 text-[10px] opacity-80">{COST.videoBudget}+ /ea</span>
        </button>
      </div>
    </div>
  );
}

function ProductCard({
  p,
  selected,
  onSelect,
  onOpen,
}: {
  p: Product;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <Card className={cn("group relative overflow-hidden transition-shadow hover:shadow-sm", selected && "ring-2 ring-brand-700/40")}>
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={cn(
          "absolute left-2 top-2 z-10 grid size-5 place-items-center rounded-sm border bg-surface/90 backdrop-blur",
          selected ? "border-brand-700 opacity-100" : "border-line opacity-0 group-hover:opacity-100",
        )}
        aria-label="Select"
      >
        {selected ? <CheckSquare className="size-3.5 text-brand-700" strokeWidth={1.5} /> : <Square className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
      </button>
      <button onClick={onOpen} className="block w-full text-left">
        <div className={cn("relative aspect-[4/3] w-full bg-gradient-to-br", p.thumb)}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18),transparent_60%)]" />
          <span className="absolute right-2 top-2 rounded-md bg-surface/90 px-1.5 py-0.5 font-mono-num text-[10px] text-ink-700 backdrop-blur">
            {p.sku}
          </span>
          {p.imported !== "synced" && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-surface/90 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur">
              {p.imported === "syncing" ? <Loader2 className="size-2.5 animate-spin" strokeWidth={1.5} /> : <RefreshCw className="size-2.5" strokeWidth={1.5} />}
              {p.imported}
            </span>
          )}
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[15px] leading-snug text-ink-900">{p.name}</h3>
            <span className="font-mono-num shrink-0 text-xs text-ink-700">{p.price}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <AssetPill icon={FileText} label="Desc" state={p.description} />
            <AssetPill icon={ImageIcon} label="Photo" state={p.photo} />
            <AssetPill icon={Video} label="Video" state={p.video} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Open product</span>
            <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </div>
        </div>
      </button>
    </Card>
  );
}

function AssetPill({ icon: Icon, label, state }: { icon: typeof FileText; label: string; state: AssetState }) {
  const tone: Record<AssetState, string> = {
    done: "bg-brand-100 text-brand-700 border-brand-100",
    draft: "bg-[#E2ECF3] text-[color:var(--info)] border-[#D2DFE9]",
    missing: "bg-surface-sunken text-muted-foreground border-line",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider", tone[state])}>
      <Icon className="size-2.5" strokeWidth={1.5} />
      {label}
      <span className="opacity-70">· {state}</span>
    </span>
  );
}

function EmptyState() {
  return (
    <Card className="grid place-items-center p-16 text-center">
      <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1.25} />
      <h3 className="mt-4 font-display text-2xl text-ink-900">No catalog connected yet</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Connect your WordPress / WooCommerce store to import products. We'll generate descriptions, photos, and short videos for every SKU.
      </p>
      <div className="mt-6 flex gap-2">
        <button className="postics-btn-primary">
          <Globe2 className="size-4" strokeWidth={1.5} /> Connect your store
        </button>
        <button className="postics-btn-ghost">
          <Plus className="size-4" strokeWidth={1.5} /> Add product manually
        </button>
      </div>
    </Card>
  );
}

type Tab = "description" | "photos" | "video";

function ProductDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("description");
  return (
    <div className="fixed inset-0 z-50 flex">
      <button onClick={onClose} className="flex-1 bg-ink-900/40 backdrop-blur-sm" aria-label="Close" />
      <aside className="flex h-full w-full max-w-[860px] flex-col border-l border-line bg-paper shadow-2xl animate-rise">
        <header className="border-b border-line px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("size-12 rounded-md bg-gradient-to-br", product.thumb)} />
              <div>
                <div className="font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground">{product.sku} · {product.price}</div>
                <h2 className="font-display text-xl text-ink-900">{product.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-surface-sunken">
              <X className="size-4 text-ink-700" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mt-4 flex items-center gap-1">
            {([
              { id: "description" as const, label: "Description", icon: FileText, badge: product.description },
              { id: "photos" as const, label: "Photos", icon: ImageIcon, badge: product.photo },
              { id: "video" as const, label: "Video", icon: Video, badge: product.video },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  tab === t.id ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
                )}
              >
                <t.icon className="size-3.5" strokeWidth={1.5} /> {t.label}
                <span className={cn("ml-1 size-1.5 rounded-full", t.badge === "done" ? "bg-brand-700" : t.badge === "draft" ? "bg-[color:var(--info)]" : "bg-line")} />
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "description" && <DescriptionTab product={product} />}
          {tab === "photos" && <PhotosTab product={product} />}
          {tab === "video" && <VideoTab product={product} />}
        </div>

        <footer className="flex items-center justify-between border-t border-line px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Publishes to <span className="text-ink-900">vellumbean.co/products/{product.sku.toLowerCase()}</span>
          </div>
          <div className="flex gap-2">
            <button className="postics-btn-ghost text-sm">Queue social post</button>
            <button className="postics-btn-primary text-sm">
              <Send className="size-4" strokeWidth={1.5} /> Publish to site
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function DescriptionTab({ product }: { product: Product }) {
  const [stage, setStage] = useState<"idle" | "loading" | "ready" | "error">(product.description === "missing" ? "idle" : "ready");
  const [copy, setCopy] = useState(
    product.description === "missing"
      ? ""
      : `Bright and floral, our ${product.name.split(",")[0]} carries notes of bergamot, jasmine, and stone fruit. Hand-sorted at origin, roasted in small batches at our Brooklyn lab.`,
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SeoField label="SEO title" defaultValue={`${product.name} — Vellum & Bean`} max={60} />
        <SeoField label="Meta description" defaultValue="Bright, floral single-origin with notes of bergamot and jasmine. Free shipping over $40." max={160} />
        <SeoField label="Slug" defaultValue={product.sku.toLowerCase()} max={40} />
        <SeoField label="Primary keyword" defaultValue="single-origin coffee" max={40} />
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="text-sm font-medium text-ink-900">Product copy</div>
          <div className="flex items-center gap-2">
            <span className="font-mono-num text-[11px] text-muted-foreground">cost · {COST.description} credits</span>
            <button
              onClick={() => { setStage("loading"); setTimeout(() => { setStage("ready"); setCopy("Bright, floral, and unmistakably structured. This Yirgacheffe opens with bergamot, settles into jasmine, and finishes on a clean stone-fruit sweetness. Hand-sorted at origin and roasted in small batches three days before it ships."); }, 1100); }}
              className="postics-btn-secondary text-xs"
            >
              {stage === "loading" ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <Cpu className="size-3.5" strokeWidth={1.5} />}
              {copy ? "Regenerate" : "Generate"}
            </button>
          </div>
        </div>
        {stage === "loading" ? (
          <div className="space-y-2 p-4">
            <div className="h-3 w-full animate-pulse rounded bg-surface-sunken" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-surface-sunken" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-surface-sunken" />
          </div>
        ) : (
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            placeholder="Click Generate to draft product copy on brand…"
            rows={6}
            className="block w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed text-ink-900 placeholder:text-muted-foreground focus:outline-none"
          />
        )}
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-mono-num">{copy.length} chars · ~{Math.max(1, Math.round(copy.split(/\s+/).filter(Boolean).length))} words</span>
          <button className="postics-btn-primary text-xs">
            <Check className="size-3.5" strokeWidth={1.5} /> Approve description
          </button>
        </div>
      </div>
    </div>
  );
}

function SeoField({ label, defaultValue, max }: { label: string; defaultValue: string; max: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <span className={cn("font-mono-num text-[10px]", v.length > max ? "text-[color:var(--danger)]" : "text-muted-foreground")}>{v.length}/{max}</span>
      </div>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-700/30"
      />
    </label>
  );
}

type PhotoStyle = "studio" | "lifestyle" | "flatlay";
const PHOTO_STYLES: { id: PhotoStyle; label: string; hint: string }[] = [
  { id: "studio", label: "Studio", hint: "Soft seamless backdrop · neutral light" },
  { id: "lifestyle", label: "Lifestyle", hint: "In context · warm ambient light" },
  { id: "flatlay", label: "Flat-lay", hint: "Top-down · curated props" },
];

function PhotosTab({ product }: { product: Product }) {
  const [style, setStyle] = useState<PhotoStyle>("studio");
  const [stage, setStage] = useState<"idle" | "loading" | "ready" | "error">("ready");
  const [compare, setCompare] = useState(false);

  const shots = [
    { id: "s1", grad: "from-[#EFE7D6] to-[#C4B79C]" },
    { id: "s2", grad: "from-[#E1D6BD] to-[#9F8E68]" },
    { id: "s3", grad: "from-[#F1ECDE] to-[#B6A988]" },
    { id: "s4", grad: "from-[#D6C7A5] to-[#7C6A45]" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Style preset</span>
          {PHOTO_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs",
                style === s.id ? "border-brand-700/30 bg-brand-100 text-brand-700" : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
              )}
              title={s.hint}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCompare((c) => !c)} className="postics-btn-ghost text-xs">
            <ArrowLeftRight className="size-3.5" strokeWidth={1.5} /> {compare ? "Hide" : "Show"} before/after
          </button>
          <span className="font-mono-num text-[11px] text-muted-foreground">cost · {COST.photo} credits / shot</span>
          <button
            onClick={() => { setStage("loading"); setTimeout(() => setStage("ready"), 1400); }}
            className="postics-btn-primary text-xs"
          >
            {stage === "loading" ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <Cpu className="size-3.5" strokeWidth={1.5} />}
            Generate 4 shots
          </button>
        </div>
      </div>

      {compare && (
        <div className="grid grid-cols-2 gap-3">
          <Tile label="Original" grad={product.thumb} />
          <Tile label={`AI · ${PHOTO_STYLES.find((s) => s.id === style)!.label}`} grad="from-[#EFE7D6] to-[#B6A988]" />
        </div>
      )}

      {stage === "loading" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-sunken">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-sunken to-line/50" />
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" strokeWidth={1.5} /> rendering…
              </div>
            </div>
          ))}
        </div>
      ) : stage === "error" ? (
        <ErrorBlock />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shots.map((s, i) => (
            <ShotTile key={s.id} grad={s.grad} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tile({ label, grad }: { label: string; grad: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className={cn("aspect-[4/3] w-full bg-gradient-to-br", grad)} />
      <div className="border-t border-line bg-surface px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ShotTile({ grad, index }: { grad: string; index: number }) {
  const [picked, setPicked] = useState(index === 2);
  return (
    <div className={cn("group relative aspect-square overflow-hidden rounded-lg border", picked ? "border-brand-700" : "border-line")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", grad)} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.16),transparent_60%)]" />
      <button
        onClick={() => setPicked((p) => !p)}
        className={cn(
          "absolute right-2 top-2 grid size-6 place-items-center rounded-full backdrop-blur transition",
          picked ? "bg-brand-700 text-[color:var(--primary-foreground)]" : "bg-surface/80 text-ink-700 opacity-0 group-hover:opacity-100",
        )}
        aria-label="Approve"
      >
        <Check className="size-3.5" strokeWidth={1.75} />
      </button>
      <span className="absolute bottom-2 left-2 rounded-md bg-surface/80 px-1.5 py-0.5 font-mono-num text-[10px] text-ink-700 backdrop-blur">
        v{index}
      </span>
    </div>
  );
}

function VideoTab({ product }: { product: Product }) {
  const [quality, setQuality] = useState<"budget" | "premium">("budget");
  const [duration, setDuration] = useState<10 | 20 | 30>(10);
  const [stage, setStage] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const cost = (quality === "budget" ? COST.videoBudget : COST.videoPremium) * (duration / 10);

  function start() {
    setStage("loading");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); setStage("ready"); return 100; }
        return p + 8;
      });
    }, 200);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold-soft)]/60 px-4 py-3 text-sm">
        <Zap className="mt-0.5 size-4 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
        <div className="flex-1 text-ink-900">
          Video uses <span className="font-medium">premium credits</span> — a separate pool from text & photo. We default to the budget provider; switch to premium for higher motion fidelity.
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Quality</div>
          <div className="space-y-2">
            {(["budget", "premium"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  quality === q
                    ? q === "premium"
                      ? "border-[color:var(--accent-gold)]/40 bg-[color:var(--accent-gold-soft)]/60"
                      : "border-brand-700/30 bg-brand-100"
                    : "border-line bg-surface hover:border-ink-700/30",
                )}
              >
                <div>
                  <div className="flex items-center gap-2 text-sm text-ink-900">
                    {q === "budget" ? <Sliders className="size-3.5" strokeWidth={1.5} /> : <Zap className="size-3.5 text-[color:var(--accent-gold)]" strokeWidth={1.5} />}
                    {q === "budget" ? "Budget provider" : "Premium provider"}
                    {q === "budget" && <span className="rounded-full bg-brand-700/10 px-1.5 py-px text-[9px] uppercase tracking-wider text-brand-700">default</span>}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {q === "budget" ? "720p · 24fps · stable motion" : "1080p · 30fps · higher fidelity, more credits"}
                  </div>
                </div>
                <span className="font-mono-num text-xs text-ink-700">
                  {(q === "budget" ? COST.videoBudget : COST.videoPremium).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Duration</div>
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {([10, 20, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  duration === d ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-surface-sunken",
                )}
              >
                {d}s
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-ink-700">Estimated cost</span>
            <span className="font-mono-num text-lg text-ink-900">{cost.toLocaleString()} <span className="text-xs text-muted-foreground">video credits</span></span>
          </div>
          <button
            onClick={start}
            disabled={stage === "loading"}
            className="postics-btn-primary mt-3 w-full text-sm disabled:opacity-60"
          >
            {stage === "loading" ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : <Cpu className="size-4" strokeWidth={1.5} />}
            {stage === "loading" ? "Rendering…" : `Generate ${duration}s video`}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-4 py-2.5 text-sm font-medium text-ink-900">Preview</div>
        <div className={cn("relative aspect-video w-full overflow-hidden bg-gradient-to-br", product.thumb)}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_70%)]" />
          {stage === "idle" && (
            <div className="absolute inset-0 grid place-items-center text-sm text-ink-900/80">
              <div className="rounded-lg bg-surface/80 px-3 py-2 backdrop-blur">No video yet — generate one above.</div>
            </div>
          )}
          {stage === "loading" && (
            <div className="absolute inset-x-6 bottom-6 space-y-2 text-[color:var(--primary-foreground)]">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" strokeWidth={1.5} /> rendering · {quality}</span>
                <span className="font-mono-num">{progress}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/30">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {stage === "ready" && (
            <button className="absolute inset-0 grid place-items-center text-ink-900">
              <span className="grid size-14 place-items-center rounded-full bg-surface/90 shadow-lg backdrop-blur">
                <Play className="size-6 translate-x-0.5" strokeWidth={1.5} />
              </span>
            </button>
          )}
          {stage === "error" && (
            <div className="absolute inset-0 grid place-items-center">
              <ErrorBlock compact />
            </div>
          )}
        </div>
        {stage === "ready" && (
          <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-muted-foreground">
            <span>Rendered in 21s · {quality} · {duration}s</span>
            <div className="flex gap-2">
              <button className="postics-btn-ghost text-xs">Regenerate</button>
              <button className="postics-btn-primary text-xs">
                <Check className="size-3.5" strokeWidth={1.5} /> Approve video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl border border-[#F1D2CE] bg-[#F7E2DF]/70 text-sm",
      compact ? "px-3 py-2" : "px-4 py-3",
    )}>
      <AlertTriangle className="mt-0.5 size-4 text-[color:var(--danger)]" strokeWidth={1.5} />
      <div className="flex-1">
        <div className="text-ink-900">Provider failed mid-render.</div>
        <div className="text-xs text-muted-foreground">Your draft is safe. Retry on the budget provider for a lower credit cost.</div>
      </div>
      <button className="postics-btn-secondary text-xs">
        <RefreshCw className="size-3.5" strokeWidth={1.5} /> Retry on budget
      </button>
    </div>
  );
}

function BulkConfirmDialog({
  kind, ids, onClose, onConfirm,
}: {
  kind: "description" | "photo" | "video";
  ids: string[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const perCost = kind === "description" ? COST.description : kind === "photo" ? COST.photo : COST.videoBudget;
  const total = perCost * ids.length;
  const isVideo = kind === "video";
  const [ack, setAck] = useState(!isVideo);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-line bg-paper p-5 shadow-2xl animate-rise">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Bulk action</div>
            <h3 className="font-display text-lg text-ink-900">
              Generate {ids.length} {kind === "description" ? "descriptions" : kind === "photo" ? "product photos" : "product videos"}
            </h3>
          </div>
          <button onClick={onClose} className="grid size-7 place-items-center rounded-md hover:bg-surface-sunken">
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-4 space-y-2 rounded-lg border border-line bg-surface p-3 text-sm">
          <Row label="Items" value={ids.length.toString()} />
          <Row label="Cost per item" value={`${perCost.toLocaleString()} credits`} />
          <Row label="Total" value={`${total.toLocaleString()} ${isVideo ? "video" : "text"} credits`} bold />
          {isVideo && <Row label="Provider" value="Budget (default)" tone="gold" />}
        </div>

        {isVideo && (
          <label className="mt-4 flex items-start gap-2 rounded-lg border border-[color:var(--accent-gold)]/30 bg-[color:var(--accent-gold-soft)]/60 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-0.5 accent-[color:var(--accent-gold)]"
            />
            <span className="text-ink-900">
              I understand this will spend <span className="font-mono-num">{total.toLocaleString()}</span> video credits from a separate pool.
            </span>
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="postics-btn-ghost text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!ack}
            className="postics-btn-primary text-sm disabled:opacity-50"
          >
            <Cpu className="size-4" strokeWidth={1.5} /> Start generation
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: "gold" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-mono-num",
        bold ? "text-base text-ink-900" : "text-ink-700",
        tone === "gold" && "text-[color:var(--accent-gold)]",
      )}>{value}</span>
    </div>
  );
}
