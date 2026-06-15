import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Globe2,
  PenLine,
  CalendarDays,
  BarChart3,
  LayoutDashboard,
  Coffee,
  Quote,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Search,
  Camera,
  Video,
  Megaphone,
  Rocket,
  FileText,
  ShoppingBag,
  Plug,
  Cpu,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrowserFrame, Card, StatusChip } from "@/features/shared/primitives";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";

type Audience = "business" | "agency";

export function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <Hero />
      <Reveal><ProofStrip /></Reveal>
      <Reveal><LogoStrip /></Reveal>
      <Reveal><Pillars /></Reveal>
      <Reveal><Workflow /></Reveal>
      <Reveal><Differentiation /></Reveal>
      <Reveal><Results /></Reveal>
      <Reveal><Pricing /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal><CtaBand /></Reveal>
      <Footer />
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}

/* ─────────────── Nav ─────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-scrolled={scrolled || undefined}
      className={cn(
        "sticky top-0 z-30 glass transition-[box-shadow] duration-200",
        scrolled && "shadow-elev-sm",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
            <span className="font-display text-sm leading-none">P</span>
          </div>
          <span className="font-display text-lg text-ink-900">Postics</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-700 md:flex">
          <a href="#how" className="hover:text-ink-900">How it works</a>
          <a href="#pillars" className="hover:text-ink-900">Platform</a>
          <a href="#pricing" className="hover:text-ink-900">Pricing</a>
          <a href="#faq" className="hover:text-ink-900">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open command menu"
            className="hidden items-center gap-2 rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-ink-700/30 md:inline-flex"
          >
            <span>Search</span>
            <kbd className="font-mono-num rounded bg-surface-sunken px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <LanguageButton />
          <ThemeToggle />
          <Link to="/dashboard" className="postics-btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link to="/onboarding" className="postics-btn-primary">
            Start free <ArrowRight className="size-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── Hero ─────────────── */

function Hero() {
  const [audience, setAudience] = useState<Audience>("business");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("postics:audience") as Audience | null;
    if (saved === "business" || saved === "agency") setAudience(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("postics:audience", audience);
  }, [audience]);

  const copy = audience === "business"
    ? {
        eyebrow: "New · Plan + first content in 3 min",
        h1a: "Your content, planned and published —",
        h1b: "on autopilot.",
        sub: "Postics analyzes your site and competitors, builds a content plan, then generates articles, product photos & videos and social posts — and publishes them to your site and socials on your schedule. Add a human expert for quality whenever you want.",
        cta: "Analyze my site & get a content plan",
        sec: "See how it works",
        ctaHref: "/onboarding",
        ctaHint: "Opens your single-project dashboard",
        ctaHintIcon: Briefcase,
      }
    : {
        eyebrow: "For agencies · White-label, multi-project",
        h1a: "Run content for every client",
        h1b: "from one console.",
        sub: "White-label, multi-project, margin — one engine for all your clients' sites and socials.",
        cta: "Analyze my site & get a content plan",
        sec: "See how it works",
        ctaHref: "/clients",
        ctaHint: "Opens your multi-client workspace console",
        ctaHintIcon: Users,
      };

  return (
    <section className="relative overflow-hidden">
      {/* warm paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(1200px 500px at 50% -10%, color-mix(in oklab, var(--color-brand-100) 70%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-16 lg:pt-20">
        <AudienceSegmented value={audience} onChange={setAudience} />
      </div>
      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pt-8 pb-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div key={audience} className="space-y-7 animate-rise">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--accent-gold)] transition-colors hover:bg-[color:var(--accent-gold-soft)]/70"
          >
            <span className="rounded-full bg-[color:var(--accent-gold)] px-1.5 py-0.5 text-[9px] text-white">New</span>
            Freelancer marketplace
            <ArrowRight className="size-3" strokeWidth={2} />
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-700">
            <span className="size-1.5 rounded-full bg-[color:var(--success)]" />
            {copy.eyebrow}
          </div>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-tight text-ink-900 sm:text-[64px]">
            {copy.h1a}
            <br />
            <span className="italic text-brand-700">{copy.h1b}</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={copy.ctaHref} className="postics-btn-primary">
              {copy.cta} <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <a href="#how" className="postics-btn-secondary">
              {copy.sec}
            </a>
          </div>
          <div className="-mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <copy.ctaHintIcon className="size-3 text-brand-700" strokeWidth={1.75} />
            {copy.ctaHint}
          </div>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            {(audience === "business"
              ? ["Connect your existing site", "Auto-publish on your schedule", "Optional human expert"]
              : ["White-label dashboard", "Per-client billing", "Bulk content ops"]
            ).map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-[color:var(--success)]" strokeWidth={2} /> {t}
              </li>
            ))}
          </ul>
          <div className="pt-1 text-xs text-muted-foreground">
            No website yet?{" "}
            <Link to="/marketplace" className="underline decoration-dotted underline-offset-4 hover:text-ink-900">
              Our team can build you a simple one
            </Link>
            .
          </div>
        </div>

        <div className="relative">
          {/* Desktop & tablet: single full preview */}
          <BrowserFrame
            key={audience}
            url={audience === "business" ? "app.postics.io/plan · yourstore.com" : "app.postics.io/agency"}
            className="hidden sm:block lg:ml-auto animate-rise"
          >
            {audience === "business" ? <HeroPlanPreview /> : <HeroAgencyPreview />}
          </BrowserFrame>

          {/* Mobile: small swipeable carousel */}
          <div className="sm:hidden">
            <HeroMobileCarousel audience={audience} />
          </div>

          {/* Floating callouts */}
          <div className="absolute -left-4 top-10 hidden rounded-xl border border-line bg-surface p-3 shadow-[0_24px_60px_-30px_rgba(20,24,31,0.25)] sm:flex sm:items-center sm:gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-brand-100 text-brand-700">
              <CalendarDays className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="text-xs">
              <div className="text-ink-900">{audience === "business" ? "Plan approved" : "Client onboarded"}</div>
              <div className="font-mono-num text-muted-foreground">{audience === "business" ? "24 items · Nov" : "Northwind Co."}</div>
            </div>
          </div>
          <div className="absolute -right-3 bottom-10 hidden rounded-xl border border-line bg-surface p-3 shadow-[0_24px_60px_-30px_rgba(20,24,31,0.25)] sm:flex sm:items-center sm:gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
              <Rocket className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="text-xs">
              <div className="text-ink-900">{audience === "business" ? "Auto-published" : "Margin / retainer"}</div>
              <div className="font-mono-num text-[color:var(--success)]">{audience === "business" ? "Tue 10:00" : "+62%"}</div>
            </div>
          </div>
        </div>
      </div>
      <FeatureRow />
    </section>
  );
}

function FeatureRow() {
  const items = [
    { icon: Search, label: "Analyze" },
    { icon: CalendarDays, label: "Plan" },
    { icon: FileText, label: "Articles" },
    { icon: ShoppingBag, label: "Product descriptions" },
    { icon: Camera, label: "Product photos" },
    { icon: Video, label: "Product videos" },
    { icon: Megaphone, label: "Social posts" },
    { icon: Rocket, label: "Auto-publish on your cadence" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-surface/60 px-5 py-4 text-xs text-ink-700 shadow-elev-sm">
        {items.map((it, i) => (
          <span key={it.label} className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <it.icon className="size-3.5 text-brand-700" strokeWidth={1.5} />
              {it.label}
            </span>
            {i < items.length - 1 && (
              <span aria-hidden className="text-muted-foreground/60">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroPlanPreview() {
  // 5x4 calendar with scheduled content chips
  const items: Record<number, { tone: "art" | "soc" | "prod"; label: string }> = {
    3: { tone: "art", label: "Article" },
    5: { tone: "soc", label: "IG post" },
    8: { tone: "prod", label: "Product" },
    11: { tone: "art", label: "Article" },
    14: { tone: "soc", label: "TikTok" },
    17: { tone: "art", label: "Article" },
    19: { tone: "prod", label: "Product" },
  };
  const toneClass = (t: "art" | "soc" | "prod") =>
    t === "art"
      ? "bg-brand-100 text-brand-700"
      : t === "soc"
      ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
      : "bg-ink-900/8 text-ink-900";
  return (
    <div className="grid gap-4 bg-surface p-5 lg:grid-cols-[1.35fr_1fr]">
      {/* Calendar */}
      <div className="rounded-lg border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-brand-700" strokeWidth={1.75} />
            <span className="font-display text-sm text-ink-900">November · content plan</span>
          </div>
          <span className="font-mono-num text-[10px] text-muted-foreground">24 items</span>
        </div>
        <div className="grid grid-cols-5 gap-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {["Mon","Tue","Wed","Thu","Fri"].map((d) => (
            <div key={d} className="px-1">{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1">
          {Array.from({ length: 20 }).map((_, i) => {
            const day = i + 1;
            const it = items[day];
            return (
              <div key={day} className="aspect-[1.1/1] rounded-md border border-line bg-surface-sunken/40 p-1.5">
                <div className="font-mono-num text-[9px] text-muted-foreground">{day}</div>
                {it && (
                  <div className={cn("mt-1 truncate rounded px-1 py-0.5 text-[8.5px] font-medium leading-tight", toneClass(it.tone))}>
                    {it.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-center gap-3 border-t border-line pt-2 text-[9px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-brand-100" />Article</span>
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-[color:var(--accent-gold-soft)]" />Social</span>
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-ink-900/8" />Product</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[color:var(--success)]">
            <span className="size-1.5 rounded-full bg-[color:var(--success)]" /> auto-publish on
          </span>
        </div>
      </div>
      {/* Product card */}
      <div className="rounded-lg border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Generated product</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--primary-foreground)]">
            <Video className="size-2.5" strokeWidth={2} /> video
          </span>
        </div>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-md border border-line"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 30% 20%, color-mix(in oklab, var(--color-brand-100) 70%, white) 0%, transparent 60%), linear-gradient(160deg, color-mix(in oklab, var(--color-accent-gold) 22%, white) 0%, color-mix(in oklab, var(--color-brand-700) 12%, white) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, color-mix(in oklab, var(--color-brand-700) 65%, white), color-mix(in oklab, var(--color-brand-700) 95%, black))",
              boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--color-brand-700) 60%, transparent)",
            }}
          />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-medium text-ink-900 backdrop-blur">
            <Camera className="size-2.5" strokeWidth={2} /> AI photo
          </span>
        </div>
        <div className="mt-2.5 space-y-1">
          <div className="font-display text-[13px] leading-tight text-ink-900">Single-Origin Roast · 250g</div>
          <div className="text-[10px] leading-snug text-muted-foreground">
            Bright citrus, cocoa finish. Description &amp; photo generated, ready to publish.
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono-num text-[11px] text-ink-900">$18.00</span>
            <span className="text-[9px] text-[color:var(--success)]">queued · Tue</span>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface-sunken/60 px-2.5 py-1 text-[10px] text-muted-foreground w-fit">
        <span className="size-1.5 rounded-full bg-[color:var(--accent-gold)]" />
        Plan + first content in 3 min
      </div>
    </div>
  );
}

function AudienceSegmented({ value, onChange }: { value: Audience; onChange: (a: Audience) => void }) {
  return (
    <div className="flex justify-center">
      <div role="tablist" aria-label="Audience" className="relative inline-flex items-center rounded-full border border-line bg-surface p-1 shadow-[0_1px_0_rgba(20,24,31,0.04)]">
        {([
          { id: "business" as Audience, label: "For Businesses" },
          { id: "agency" as Audience, label: "For Agencies" },
        ]).map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.id)}
              className={cn(
                "relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                active ? "text-[color:var(--primary-foreground)]" : "text-ink-700 hover:text-ink-900",
              )}
            >
              {active && (
                <span className="absolute inset-0 -z-10 rounded-full bg-brand-700 transition-transform" />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroAgencyPreview() {
  const clients = [
    { name: "Northwind Co.", status: "Live", credits: 64, tone: "live" as const },
    { name: "Atelier Rouge", status: "Drafting", credits: 28, tone: "info" as const },
    { name: "Harbor Studio", status: "Review", credits: 41, tone: "warn" as const },
    { name: "Field Notes", status: "Live", credits: 82, tone: "live" as const },
  ];
  return (
    <div className="space-y-4 bg-surface p-5">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded bg-brand-700 text-[10px] text-[color:var(--primary-foreground)] font-display">A</div>
          <div className="font-display text-sm text-ink-900">Acme Studio · agency console</div>
        </div>
        <span className="font-mono-num text-[10px] text-muted-foreground">12 clients</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {clients.map((c) => (
          <div key={c.name} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <div className="font-display text-xs text-ink-900">{c.name}</div>
              <StatusChip tone={c.tone} className="!px-1.5 !py-0 !text-[9px]">{c.status}</StatusChip>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-brand-700" style={{ width: `${c.credits}%` }} />
            </div>
            <div className="font-mono-num mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>credits</span><span>{c.credits}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-surface-sunken/50 px-3 py-2 text-[10px] text-muted-foreground">
        <span>This month · 47 articles published</span>
        <span className="font-mono-num text-[color:var(--success)]">+62% margin</span>
      </div>
    </div>
  );
}

function HeroMobileCarousel({ audience }: { audience: Audience }) {
  const slides = audience === "business"
    ? [
        { id: "plan", label: "Plan", node: <HeroPlanPreview /> },
        { id: "console", label: "Console", node: <HeroAgencyPreview /> },
      ]
    : [
        { id: "console", label: "Console", node: <HeroAgencyPreview /> },
        { id: "plan", label: "Plan", node: <HeroPlanPreview /> },
      ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [audience]);
  return (
    <div className="space-y-3">
      <BrowserFrame
        url={slides[idx].id === "plan" ? "app.postics.io/plan" : "app.postics.io/agency"}
        className="animate-rise"
      >
        {slides[idx].node}
      </BrowserFrame>
      <div className="flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Show ${s.label}`}
            onClick={() => setIdx(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-brand-700" : "w-1.5 bg-line",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function HeroSitePreview() {
  return (
    <div className="space-y-5 bg-surface p-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="font-display text-base text-ink-900">Vellum & Bean</div>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>Journal</span><span>Wholesale</span><span>Shop</span><span>About</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Quarterly journal · Autumn 2026
        </div>
        <h3 className="mt-1 font-display text-2xl leading-tight text-ink-900">
          On provenance, patience, and the quiet economics of small-batch coffee.
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          "Roast curves explained",
          "Decaf, reconsidered",
          "A working cupping protocol",
        ].map((t) => (
          <div key={t} className="space-y-1.5">
            <div className="aspect-[4/3] rounded-md border border-line bg-surface-sunken" />
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Essay · 4 min
            </div>
            <div className="font-display text-sm leading-snug text-ink-900">{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Logo strip ─────────────── */

function LogoStrip() {
  const logos = ["Field Notes", "Atelier Co.", "North Light", "Harbor Studio", "Ledger & Co."];
  return (
    <section className="border-y border-line bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Trusted by operators & agencies
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-display text-base text-ink-700/70">
          {logos.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Pillars ─────────────── */

const PILLARS = [
  {
    icon: Search,
    title: "Analyze · you + competitors",
    blurb:
      "We crawl your existing site and your top competitors to surface gaps, intents and angles worth winning.",
  },
  {
    icon: CalendarDays,
    title: "Plans, not posts",
    blurb:
      "A monthly content plan you approve once: articles, product copy, photos, videos and social posts.",
  },
  {
    icon: PenLine,
    title: "Production with a voice",
    blurb:
      "Articles, product descriptions, AI-generated product photos and short videos — in your tone, with human review on tap.",
  },
  {
    icon: Rocket,
    title: "Auto-publish, your cadence",
    blurb:
      "Pushed straight to your site (WordPress, Shopify, Webflow, custom) and your socials on the schedule you set. Pause or rollback anytime.",
  },
];

function Pillars() {
  return (
    <section id="pillars" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            The platform
          </div>
          <h2 className="font-display text-4xl leading-[1.1] text-ink-900">
            One workspace for the full content cycle.
          </h2>
          <p className="text-muted-foreground">
            Postics replaces a stack of brittle tools with a single editorial control panel — built
            so a small team can publish like a studio of ten.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <Card key={p.title} className="p-6 hover-lift shadow-elev-sm">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <p.icon className="size-4" strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 font-display text-lg text-ink-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Workflow ─────────────── */

const STEPS = [
  {
    icon: Plug,
    title: "Connect your site",
    blurb:
      "You keep your own WordPress. Install the Postics connector — no migration, no rebuild.",
  },
  {
    icon: Cpu,
    title: "AI plans & creates",
    blurb:
      "Analyzes your site + competitors → builds a content plan → generates articles, product photos & videos, and social posts.",
  },
  {
    icon: Rocket,
    title: "Auto-publish on your cadence",
    blurb:
      "Set N posts per month, plan up to a year ahead. Publishes automatically to your site (guaranteed) and socials (best-effort).",
  },
];

function Workflow() {
  return (
    <section id="how" className="border-y border-line bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            How it works
          </div>
          <h2 className="font-display text-4xl leading-[1.1] text-ink-900">
            From your URL to a full content engine — in one afternoon.
          </h2>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.title} className="bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <s.icon className="size-5" strokeWidth={1.5} />
              </span>
              <div className="mt-4 font-display text-lg text-ink-900">{s.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LayoutDashboard className="size-3.5" strokeWidth={1.5} />
                Project dashboard
              </div>
              <StatusChip tone="live">Live</StatusChip>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xl text-ink-900">Vellum & Bean</div>
                  <div className="font-mono-num text-xs text-muted-foreground">
                    vellumandbean.com · connected
                  </div>
                </div>
                <StatusChip tone="gold">Pro</StatusChip>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  ["Idea", 8],
                  ["Draft", 4],
                  ["Review", 2],
                  ["Approved", 3],
                  ["Live", 11],
                ].map(([l, n], i) => (
                  <div key={l as string} className="rounded-md border border-line bg-surface-sunken/40 p-2.5">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {l}
                    </div>
                    <div className="font-mono-num mt-1 text-base text-ink-900">{n}</div>
                    <div className={cn("mt-1.5 h-1 rounded", i === 4 ? "bg-brand-700/70" : "bg-ink-900/15")} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-muted-foreground">
                <span>Next publish · Tue 10:00</span>
                <Link to="/dashboard" className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-500">
                  Open dashboard <ChevronRight className="size-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <h3 className="font-display text-2xl text-ink-900">
              A control panel, not a chatbox.
            </h3>
            <p className="text-muted-foreground">
              Every project gets a real pipeline — idea, draft, review, approved, published — with
              human checkpoints where they matter. Approvals, retries, and rollbacks are first-class.
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                "Per-project credits & roles",
                "Inline editor with revision history",
                "Scheduled publishing with rollback",
                "Agency mode: clients, white-label, billing",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-ink-700">
                  <Check className="mt-0.5 size-4 text-[color:var(--success)]" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Pricing ─────────────── */

const PLANS = [
  {
    name: "Starter",
    price: "$199",
    cadence: "per month",
    blurb: "Solo operators getting their first cadence to ship.",
    features: ["1 project", "4 articles / month", "Custom domain", "Email support"],
    cta: "Start Starter",
    href: "/onboarding",
    tone: "default" as const,
  },
  {
    name: "Growth",
    price: "$449",
    cadence: "per month",
    blurb: "For operators publishing weekly with real SEO ambition.",
    features: [
      "10 articles / month",
      "Scheduled publishing",
      "SEO clusters & internal linking",
      "Inline editor & roles",
    ],
    cta: "Start Growth",
    href: "/onboarding",
    tone: "featured" as const,
  },
  {
    name: "Advanced",
    price: "$899",
    cadence: "per month",
    blurb: "Multi-channel publishing with expert checkpoints.",
    features: [
      "20 articles / month",
      "Human expert review",
      "Social drafts (when unlocked)",
      "Priority generation",
    ],
    cta: "Start Advanced",
    href: "/onboarding",
    tone: "default" as const,
  },
  {
    name: "Premium",
    price: "$999",
    cadence: "per month",
    blurb: "Verified LetoLab editors, hands-on across the cycle.",
    features: [
      "Unlimited drafts",
      "Named senior editor",
      "GEO-ready structured data",
      "First-line support",
    ],
    cta: "Apply for Premium",
    href: "/onboarding",
    tone: "premium" as const,
  },
];

function Pricing() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const yearlyFactor = 0.8; // -20%
  const fmtPrice = (p: string) => {
    if (cycle === "monthly") return p;
    const n = parseInt(p.replace(/\D/g, ""), 10);
    if (!n) return p;
    return `$${Math.round((n * yearlyFactor))}`;
  };
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pricing
          </div>
          <h2 className="font-display text-4xl leading-[1.1] text-ink-900">
            Honest pricing. No per-seat tax.
          </h2>
          <p className="text-muted-foreground">
            Try the engine free on your own site. Upgrade when you're ready to publish — cancel
            anytime, your content stays with you.
          </p>
        </div>
        <div role="tablist" aria-label="Billing cycle" className="inline-flex rounded-lg border border-line bg-surface p-1 text-sm shadow-elev-sm">
          <button
            role="tab"
            aria-selected={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              cycle === "monthly" ? "bg-brand-700 text-[color:var(--primary-foreground)]" : "text-ink-700 hover:text-ink-900",
            )}
          >
            Monthly
          </button>
          <button
            role="tab"
            aria-selected={cycle === "yearly"}
            onClick={() => setCycle("yearly")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              cycle === "yearly" ? "bg-brand-700 text-[color:var(--primary-foreground)]" : "text-ink-700 hover:text-ink-900",
            )}
          >
            Yearly
            <span className={cn(
              "font-mono-num rounded px-1.5 py-0.5 text-[10px]",
              cycle === "yearly"
                ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
                : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
            )}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        {PLANS.map((p) => {
          const featured = p.tone === "featured";
          const premium = p.tone === "premium";
          return (
            <Card
              key={p.name}
              className={cn(
                "flex flex-col p-7 hover-lift shadow-elev-sm",
                featured && "border-brand-700 ring-2 ring-brand-100 shadow-elev-pop xl:-translate-y-2 xl:scale-[1.02]",
                premium && "border-[color:var(--accent-gold)] ring-2 ring-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/15",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="font-display text-xl text-ink-900">{p.name}</div>
                {featured && <StatusChip tone="live">Most chosen</StatusChip>}
                {premium && <StatusChip tone="gold">Premium</StatusChip>}
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl text-ink-900">{fmtPrice(p.price)}</span>
                <span className="text-sm text-muted-foreground">
                  / {cycle === "yearly" ? "mo · billed yearly" : p.cadence}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-ink-700">
                    <Check className={cn("mt-0.5 size-4", premium ? "text-[color:var(--accent-gold)]" : "text-[color:var(--success)]")} strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={p.href}
                className={cn(
                  "mt-8 inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors",
                  featured
                    ? "bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-500"
                    : premium
                    ? "bg-[color:var(--accent-gold)] text-white hover:brightness-95"
                    : "border border-line bg-surface text-ink-900 hover:border-ink-700/30",
                )}
              >
                {p.cta} <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <AgencyBlock />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" strokeWidth={1.5} /> Cancel anytime
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coffee className="size-3.5" strokeWidth={1.5} /> No setup fees
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ExternalLink className="size-3.5" strokeWidth={1.5} /> Export your content at any time
        </span>
      </div>
    </section>
  );
}

/* ─────────────── FAQ ─────────────── */

const FAQ = [
  {
    q: "Do I need my own website?",
    a: "Yes — Postics connects to the site you already own (WordPress, Shopify, Webflow, or custom). We do not build or host websites. If you don't have one yet, our team can build you a simple one as a separate, optional service.",
  },
  {
    q: "What gets published?",
    a: "Articles, product descriptions, AI-generated product photos & videos, and social posts — all planned in a monthly calendar and published automatically to your site and socials on the cadence you set.",
  },
  {
    q: "Are credits tokens?",
    a: "No. Credits are billed per action (article, image, video, social post) — not tokens. That means predictable costs, no surprise overruns, and full Terms-of-Service safety with content platforms.",
  },
  {
    q: "What if I want to leave?",
    a: "Pause or cancel anytime. Everything we've published lives on your site and your socials — you keep it. No lock-in.",
  },
];

function Faq() {
  return (
    <section id="faq" className="border-y border-line bg-surface/50">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <div className="mb-10 space-y-3 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Frequently asked
          </div>
          <h2 className="font-display text-4xl leading-[1.1] text-ink-900">
            The honest questions.
          </h2>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left">
                <span className="font-display text-lg text-ink-900">{f.q}</span>
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-line text-muted-foreground transition-transform group-open:rotate-45">
                  <Plus />
                </span>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
            </details>
          ))}
        </div>

        <figure className="mt-12 rounded-xl border border-line bg-surface p-7">
          <Quote className="size-5 text-[color:var(--accent-gold)]" strokeWidth={1.5} />
          <blockquote className="mt-3 font-display text-xl leading-snug text-ink-900">
            “Postics replaced three tools and half a freelancer. Our journal ships on Tuesdays — and
            actually reads like us.”
          </blockquote>
          <figcaption className="mt-4 text-sm text-muted-foreground">
            Eliza M. — Founder, Vellum & Bean
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

/* ─────────────── Proof strip ─────────────── */

function ProofStrip() {
  return (
    <section id="proof" className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-md space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Example · generated by Postics
          </div>
          <h2 className="font-display text-2xl leading-tight text-ink-900">
            A content plan, pushed to your site and socials — on the cadence you set.
          </h2>
        </div>
        <Link to="/onboarding" className="postics-btn-ghost text-sm">
          Analyze my site <ArrowRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="relative mt-6">
        <BrowserFrame url="app.postics.io/plan · vellumandbean.com">
          <HeroPlanPreview />
        </BrowserFrame>
        <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] shadow-[0_4px_14px_-6px_rgba(20,24,31,0.18)]">
          <span className="size-1.5 rounded-full bg-[color:var(--success)]" />
          Plan + first content <span className="font-mono-num text-muted-foreground">in 3 min</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Differentiation ─────────────── */

function Differentiation() {
  const rows = [
    { label: "Editorial voice", postics: "Trained on your brand, edited by senior writers", others: "Generic AI tone" },
    { label: "Quality control", postics: "Verified experts review when it matters", others: "Trust the model" },
    { label: "Publishing", postics: "Pushed to your site via RankMath endpoint", others: "Copy-paste workflow" },
    { label: "SEO foundation", postics: "Schema, internal links, GEO-ready", others: "Add-ons, plugins" },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-10 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
        <div className="space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Why Postics
          </div>
          <h2 className="font-display text-4xl leading-[1.1] text-ink-900">
            AI <span className="italic text-brand-700">plus</span> real experts.
          </h2>
          <p className="text-muted-foreground">
            We pair production-grade AI with the LetoLab editor network and a vetted bench of
            freelancers. The result reads like a studio shipped it — because one did.
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-3 border-b border-line bg-surface-sunken/60 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span></span>
            <span className="text-brand-700">Postics</span>
            <span>Plain AI tools</span>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.label} className="grid grid-cols-3 items-start gap-3 px-5 py-4 text-sm">
                <span className="text-ink-700">{r.label}</span>
                <span className="flex items-start gap-2 text-ink-900">
                  <Check className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" strokeWidth={2} />
                  {r.postics}
                </span>
                <span className="text-muted-foreground">{r.others}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────── Agency block ─────────────── */

function AgencyBlock() {
  return (
    <Card className="grid gap-6 border-brand-700/30 bg-brand-100/30 p-7 lg:grid-cols-[1.4fr_1fr] lg:items-center">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-700">
          For agencies
        </div>
        <h3 className="mt-2 font-display text-2xl text-ink-900">
          Run content for every client from one console.
        </h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          White-label dashboard, per-tenant billing, bulk content ops, and the margin profile of a
          retainer practice. Onboard a new client in an afternoon.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
          {["Unlimited client workspaces", "White-label reports", "Per-tenant billing", "Priority generation queue"].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 text-[color:var(--success)]" strokeWidth={2} /> {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-start gap-3 lg:items-end">
        <div className="font-display text-3xl text-ink-900">Agency</div>
        <div className="text-xs text-muted-foreground">from $999 / month</div>
        <Link to="/onboarding" className="postics-btn-primary text-sm">
          Talk to the team <ArrowRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </Card>
  );
}

/* ─────────────── CTA band ─────────────── */

function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-brand-700 px-8 py-16 text-[color:var(--primary-foreground)] sm:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(600px 240px at 90% 0%, color-mix(in oklab, var(--color-accent-gold) 50%, transparent), transparent 70%)",
          }}
        />
        <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent-gold-soft)]">
              Ready when you are
            </div>
            <h2 className="mt-3 font-display text-4xl leading-[1.1] sm:text-5xl">
              See your first content plan in 3 minutes.
            </h2>
            <p className="mt-3 max-w-xl text-base text-[color:var(--primary-foreground)]/75">
              Drop in your URL — we'll analyze your site and competitors and return a content plan
              you can publish today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--accent-gold)] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
            >
              Analyze my site & get a content plan <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 px-5 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:bg-white/5"
            >
              See how it works <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */

function Footer() {
  const [open, setOpen] = useState(false);

  const pages = [
    { label: "Home", to: "/", icon: LayoutDashboard },
    { label: "Dashboard", to: "/dashboard", icon: BarChart3 },
    { label: "Content Plan", to: "/plan", icon: CalendarDays },
    { label: "Editor", to: "/editor", icon: PenLine },
    { label: "Human Review", to: "/review", icon: ChevronRight },
    { label: "Marketplace", to: "/marketplace", icon: ChevronRight },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "Billing & Credits", to: "/billing", icon: ArrowRight },
    { label: "Agency Console", to: "/agency", icon: Globe2 },
    { label: "Onboarding", to: "/onboarding", icon: ArrowRight },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
              <span className="font-display text-sm leading-none">P</span>
            </div>
            <span className="font-display text-lg text-ink-900">Postics</span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Editorial studio meets engineering control panel. Built for operators and agencies who
            care about craft.
          </p>
          <div className="font-mono-num text-xs text-muted-foreground">
            © {new Date().getFullYear()} Postics Labs
          </div>
        </div>
        <FooterCol title="Product" links={["Onboarding", "Dashboard", "Editor", "Pricing"]} />
        <FooterCol title="Company" links={["About", "Studio mode", "Careers", "Contact"]} />
        <FooterCol title="Resources" links={["Changelog", "Status", "Privacy", "Terms"]} />
      </div>

      {/* Quick page navigator */}
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-xl border border-line bg-paper">
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className="size-4 text-brand-700" strokeWidth={1.5} />
              <span className="text-sm font-medium text-ink-900">Quick page navigator</span>
              <span className="font-mono-num rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-line">
                {pages.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
              strokeWidth={1.5}
            />
          </button>
          <div
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.2,.6,.2,1)]",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0">
              <div className="border-t border-line px-5 py-4">
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {pages.map((p) => (
                    <Link
                      key={p.to}
                      to={p.to}
                      className="group flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-700 transition-colors hover:border-brand-700/30 hover:text-brand-700"
                    >
                      <p.icon className="size-3.5 text-muted-foreground group-hover:text-brand-700" strokeWidth={1.5} />
                      <span>{p.label}</span>
                      <ArrowRight className="ml-auto size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-ink-700 hover:text-ink-900">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}