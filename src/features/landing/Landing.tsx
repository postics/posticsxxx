import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Search,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  Send,
  LineChart,
  Globe2,
  Store,
  Users,
  Lock,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/features/shared/primitives";
import { ThemeToggle, LanguageButton } from "@/features/shared/PreferencesControls";

export function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <Hero />
      <Reveal><TheMachine /></Reveal>
      <Reveal><ProofByProduct /></Reveal>
      <Reveal><ForAgencies /></Reveal>
      <Reveal><Numbers /></Reveal>
      <Reveal><Pricing /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal><HeroEcho /></Reveal>
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
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.revealed = "true";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal">{children}</div>;
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
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">Postics.io</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-700 md:flex">
          <a href="#machine" className="hover:text-ink-900">Product</a>
          <a href="#agencies" className="hover:text-ink-900">Agencies</a>
          <a href="#pricing" className="hover:text-ink-900">Pricing</a>
          <a href="#faq" className="hover:text-ink-900">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageButton />
          <ThemeToggle />
          <Link to="/dashboard" className="postics-btn-ghost hidden sm:inline-flex">
            Log in
          </Link>
          <a href="#hero-run" className="postics-btn-primary">
            Run it <ArrowRight className="size-4" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── Hero ─────────────── */

function UrlRunForm({ id }: { id?: string }) {
  const [url, setUrl] = useState("");
  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        // route into onboarding with the URL
        const q = url.trim() ? `?store=${encodeURIComponent(url.trim())}` : "";
        window.location.href = `/onboarding${q}`;
      }}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-stretch"
    >
      <label className="relative flex-1">
        <Globe2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourstore.com"
          className="postics-input h-12 w-full pl-9 pr-3 text-base"
          autoComplete="url"
          spellCheck={false}
        />
      </label>
      <button type="submit" className="postics-btn-primary h-12 px-5 text-base">
        Run it <ArrowRight className="size-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(1200px 500px at 50% -10%, color-mix(in oklab, var(--color-brand-100) 70%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-4xl px-6 pt-20 pb-16 text-center lg:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          / content marketing, automated
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-[64px]">
          Marketing on autopilot <span className="text-brand-700">for your store.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Paste your store URL. Postics writes the copy, makes the photos and video, and publishes —
          to your site and your socials, on a schedule.
        </p>
        <div id="hero-run" className="mt-8 flex justify-center">
          <UrlRunForm />
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[color:var(--success)]" strokeWidth={2} /> WooCommerce</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[color:var(--success)]" strokeWidth={2} /> WordPress</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[color:var(--success)]" strokeWidth={2} /> 10+ languages</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── The Machine ─────────────── */

const MACHINE_NODES = [
  { key: "analyze", label: "Analyze", icon: Search },
  { key: "plan", label: "Plan", icon: CalendarDays },
  { key: "generate", label: "Generate", icon: Sparkles },
  { key: "review", label: "Review", icon: ShieldCheck },
  { key: "publish", label: "Publish", icon: Send },
  { key: "measure", label: "Measure", icon: LineChart },
] as const;

function TheMachine() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % MACHINE_NODES.length), 2200);
    return () => clearInterval(t);
  }, []);
  const current = MACHINE_NODES[active];
  return (
    <section id="machine" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          / paste a url. watch it run.
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-surface p-6 shadow-elev-sm sm:p-10">
        {/* Pipeline */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {MACHINE_NODES.map((n, i) => {
              const isActive = i === active;
              const Icon = n.icon;
              return (
                <button
                  key={n.key}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all duration-200",
                    isActive
                      ? "border-brand-700/30 bg-brand-100 shadow-elev-sm"
                      : "border-line bg-surface-sunken/40 hover:border-ink-700/20",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full transition-colors",
                      isActive ? "bg-brand-700 text-[color:var(--primary-foreground)]" : "bg-surface text-ink-700",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className={cn("text-xs", isActive ? "text-ink-900 font-medium" : "text-muted-foreground")}>
                    {n.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* loop arrow Measure → Plan */}
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px w-16 bg-line" />
            <span>loop · measure → plan</span>
            <ArrowRight className="size-3" strokeWidth={2} />
          </div>
        </div>

        {/* Active node mock */}
        <div className="mt-8 min-h-[300px]">
          <MachineMock node={current.key} />
        </div>

        <p className="mt-6 text-center font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          connected · northbound coffee roasters · woocommerce
        </p>
      </div>
    </section>
  );
}

function MachineMock({ node }: { node: typeof MACHINE_NODES[number]["key"] }) {
  if (node === "analyze") {
    return <AnalyzeMock />;
  }
  if (node === "plan") {
    return <PlanMock />;
  }
  if (node === "generate") {
    return <GenerateMock />;
  }
  if (node === "review") {
    const checks = [
      { label: "Brand voice match", ok: true },
      { label: "SEO meta complete", ok: true },
      { label: "No hallucinated facts", ok: true },
      { label: "Image rights cleared", ok: true },
      { label: "Localized for market", ok: true },
    ];
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 text-sm">
          <div className="flex items-center gap-2 text-ink-900">
            <ShieldCheck className="size-4 text-brand-700" strokeWidth={1.75} /> Quality gate
          </div>
          <span className="font-mono-num text-xs text-[color:var(--success)]">5 / 5 passed</span>
        </div>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
              <span className="text-ink-900">{c.label}</span>
              <Check className="size-4 text-[color:var(--success)]" strokeWidth={2} />
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  if (node === "publish") {
    return <PublishMock />;
  }
  return <MeasureMock />;
}

/* ─── Machine sub-mocks ─── */

function AnalyzeMock() {
  const TARGET = 1418;
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * TARGET));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">Content-gap scan · northboundcoffee.com</span>
        <span className="font-mono-num text-muted-foreground">2,000 SKUs indexed</span>
      </div>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">missed commercial pages</div>
          <div className="mt-1 font-display text-5xl font-semibold tabular-nums text-ink-900">
            {n.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">category, comparison and how-to pages with buyer intent</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]">
            high revenue gap
          </span>
          <span className="font-mono-num text-[10px] text-muted-foreground">est. recoverable / 12mo</span>
        </div>
      </div>
    </Card>
  );
}

function PlanMock() {
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % 13;
      setFilled(i);
    }, 140);
    return () => clearInterval(t);
  }, []);
  // dial
  const target = 24;
  const max = 60;
  const angle = (target / max) * 270 - 135; // -135deg → +135deg sweep
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2 text-sm text-ink-900">
          <CalendarDays className="size-4 text-brand-700" strokeWidth={1.75} /> 12-month plan
        </div>
        <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          auto-filling
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid grid-cols-12 gap-1.5">
          {months.map((m, i) => {
            const isOn = i < filled;
            const h = 14 + ((i * 7) % 32);
            return (
              <div key={m + i} className="flex flex-col items-center gap-1">
                <div className="flex h-12 items-end">
                  <div
                    className={cn(
                      "w-3 rounded-sm transition-colors duration-300",
                      isOn ? "bg-brand-700" : "bg-line",
                    )}
                    style={{ height: `${h * 1.6}px` }}
                  />
                </div>
                <span className="font-mono-num text-[9px] text-muted-foreground">{m}</span>
              </div>
            );
          })}
        </div>
        {/* posts / month dial */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 100" className="size-24">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-line)" strokeWidth="6" strokeDasharray={`${(270/360)*Math.PI*2*40} ${Math.PI*2*40}`} transform="rotate(135 50 50)" strokeLinecap="round" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-brand-700)" strokeWidth="6" strokeDasharray={`${(target/max)*(270/360)*Math.PI*2*40} ${Math.PI*2*40}`} transform="rotate(135 50 50)" strokeLinecap="round" />
            <g transform={`rotate(${angle} 50 50)`}>
              <line x1="50" y1="50" x2="50" y2="22" stroke="var(--color-ink-900)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="50" r="3" fill="var(--color-ink-900)" />
            </g>
          </svg>
          <div className="-mt-1 text-center">
            <div className="font-display text-lg font-semibold tabular-nums text-ink-900">{target}</div>
            <div className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">posts / month</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PublishMock() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 pb-3 text-sm text-ink-900">
        <Send className="size-4 text-brand-700" strokeWidth={1.75} /> Publishing
      </div>
      {/* Site = guaranteed (green toast) */}
      <div className="rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/8 px-3 py-2.5 text-sm text-ink-900">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
          <span className="font-medium">Published to your site</span>
          <span className="font-mono-num ml-auto text-[11px] text-muted-foreground">just now</span>
        </div>
        <div className="mt-1 pl-7 text-xs text-muted-foreground">
          WordPress / WooCommerce · publishing is guaranteed
        </div>
      </div>
      {/* Socials = best-effort, locked */}
      <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface-sunken/40 px-3 py-2.5 text-sm text-muted-foreground">
        <span className="grid size-5 place-items-center rounded-full bg-surface-sunken text-muted-foreground">
          <Lock className="size-3" strokeWidth={2} />
        </span>
        <span>Socials · best-effort, pending platform audit</span>
        <span className="font-mono-num ml-auto text-[10px] uppercase tracking-[0.12em] text-muted-foreground">queued</span>
      </div>
    </Card>
  );
}

function MeasureMock() {
  const indexation = [4, 9, 14, 22, 31, 38, 47, 58, 64, 71, 78, 84];
  const conversions = [2, 3, 3, 5, 6, 8, 10, 13, 17, 21, 24, 28];
  const max = Math.max(...indexation, ...conversions);
  const w = 320;
  const h = 84;
  const step = w / (indexation.length - 1);
  const path = (pts: number[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-2 text-sm">
        <div className="flex items-center gap-2 text-ink-900">
          <LineChart className="size-4 text-brand-700" strokeWidth={1.75} /> Indexation · conversions
        </div>
        <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          illustrative · sample
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <path d={`${path(indexation)} L ${w} ${h} L 0 ${h} Z`} fill="color-mix(in oklab, var(--color-brand-700) 10%, transparent)" />
        <path d={path(indexation)} stroke="var(--color-brand-700)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(conversions)} stroke="var(--color-accent-gold)" strokeWidth={2} fill="none" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-700" /> indexed pages
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[color:var(--accent-gold)]" /> conversions
        </span>
        <span className="font-mono-num">loop → plan</span>
      </div>
    </Card>
  );
}

function GenerateMock() {
  const langs = ["EN", "DE", "ES"] as const;
  const [lang, setLang] = useState<typeof langs[number]>("EN");
  const copy: Record<typeof langs[number], { title: string; body: string }> = {
      EN: { title: "Single-Origin Roast · 250g", body: "Bright citrus, cocoa finish. Hand-roasted in small batches." },
      DE: { title: "Single-Origin Röstung · 250g", body: "Helle Zitrusnoten, Kakao-Abgang. Schonend in kleinen Chargen geröstet." },
      ES: { title: "Tueste de Origen · 250g", body: "Cítricos brillantes, final a cacao. Tostado a mano en lotes pequeños." },
    };
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Generated product</span>
          <div className="flex items-center gap-1 rounded-full bg-surface-sunken p-0.5">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  lang === l ? "bg-surface text-ink-900 shadow-elev-sm" : "text-muted-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div
            className="aspect-[4/5] rounded-lg border border-line"
            style={{
              backgroundImage:
                "radial-gradient(120% 80% at 30% 20%, color-mix(in oklab, var(--color-brand-100) 70%, white), transparent 60%), linear-gradient(160deg, color-mix(in oklab, var(--color-accent-gold) 22%, white), color-mix(in oklab, var(--color-brand-700) 12%, white))",
            }}
          />
          <div className="flex flex-col justify-center gap-2">
            <div className="font-display text-lg font-semibold text-ink-900">{copy[lang].title}</div>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy[lang].body}</p>
            <div className="font-mono-num text-sm text-ink-900">€18.00</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-sunken px-2 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-900">
                <span className="grid size-3.5 place-items-center rounded-full bg-brand-700 text-[color:var(--primary-foreground)]">
                  <Play className="size-2" strokeWidth={2.5} fill="currentColor" />
                </span>
                video · 0:08
              </span>
              <span className="font-mono-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                title · description · photo
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
}

/* ─────────────── Proof by product ─────────────── */

function ProofByProduct() {
  const items = [
    {
      title: "every product",
      mock: <ProofEveryProduct />,
    },
    {
      title: "site + socials, one schedule",
      mock: <ProofSchedule />,
    },
    {
      title: "any language",
      mock: <ProofLanguage />,
    },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title} className="p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{it.title}</div>
            <div className="mt-4">{it.mock}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ProofEveryProduct() {
  return (
    <div className="space-y-2">
      {["Single-Origin Roast · 250g", "House Blend · 1kg", "Cold Brew Concentrate", "Decaf Swiss Water · 250g"].map((p, i) => (
        <div key={p} className="flex items-center justify-between rounded-lg border border-line bg-surface-sunken/40 px-3 py-2">
          <span className="truncate text-sm text-ink-900">{p}</span>
          <span className={cn(
            "rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            i < 3 ? "bg-[color:var(--success)]/12 text-[color:var(--success)]" : "bg-surface-sunken text-muted-foreground",
          )}>{i < 3 ? "generated" : "queued"}</span>
        </div>
      ))}
    </div>
  );
}

function ProofSchedule() {
  const rows = [
    { day: "Mon", site: 1, ig: 1, tt: 0 },
    { day: "Tue", site: 0, ig: 1, tt: 1 },
    { day: "Wed", site: 1, ig: 1, tt: 0 },
    { day: "Thu", site: 0, ig: 0, tt: 1 },
    { day: "Fri", site: 1, ig: 1, tt: 1 },
  ];
  const Dot = ({ on }: { on: number }) => (
    <span className={cn("size-2 rounded-full", on ? "bg-brand-700" : "bg-line")} />
  );
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span></span><span>Site</span><span>IG</span><span>TT</span>
      </div>
      {rows.map((r) => (
        <div key={r.day} className="grid grid-cols-[40px_1fr_1fr_1fr] items-center gap-2 rounded-md border border-line bg-surface-sunken/40 px-2 py-1.5">
          <span className="font-mono-num text-[11px] text-muted-foreground">{r.day}</span>
          <Dot on={r.site} /><Dot on={r.ig} /><Dot on={r.tt} />
        </div>
      ))}
    </div>
  );
}

function ProofLanguage() {
  const langs = [
    { code: "EN", label: "English" },
    { code: "DE", label: "Deutsch" },
    { code: "ES", label: "Español" },
    { code: "FR", label: "Français" },
    { code: "IT", label: "Italiano" },
    { code: "NL", label: "Nederlands" },
    { code: "PT", label: "Português" },
    { code: "PL", label: "Polski" },
    { code: "RU", label: "Русский" },
    { code: "JA", label: "日本語" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {langs.map((l) => (
        <span key={l.code} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-sunken/60 px-2 py-1 text-[11px] text-ink-900">
          <span className="font-mono-num text-[10px] text-muted-foreground">{l.code}</span>
          {l.label}
        </span>
      ))}
    </div>
  );
}

/* ─────────────── For agencies ─────────────── */

function ForAgencies() {
  const rows = [
    { name: "Northbound Coffee Roasters", plan: "Premium", items: 24, status: "on schedule" },
    { name: "Atlas Outdoor Gear", plan: "Growth", items: 18, status: "on schedule" },
    { name: "Maison Verde", plan: "Premium", items: 32, status: "review" },
    { name: "Harbor & Hide", plan: "Starter", items: 8, status: "on schedule" },
  ];
  return (
    <section id="agencies" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">/ for agencies</div>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-4xl">
            Run 20–100 stores from one white-label cabinet.
          </h2>
          <a href="#pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-ink-900">
            For agencies <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </a>
        </div>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-sunken/60 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-ink-900">
              <Users className="size-3.5 text-brand-700" strokeWidth={1.75} /> Multi-store console
            </div>
            <span className="font-mono-num text-muted-foreground">4 clients</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-2 font-normal">Client</th>
                <th className="px-4 py-2 font-normal">Plan</th>
                <th className="px-4 py-2 font-normal text-right">Items/mo</th>
                <th className="px-4 py-2 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-line">
                  <td className="px-4 py-2.5 text-ink-900">
                    <span className="inline-flex items-center gap-2">
                      <Store className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                      {r.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.plan}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-ink-900">{r.items}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      r.status === "on schedule"
                        ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
                        : "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]",
                    )}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────── Numbers ─────────────── */

function Numbers() {
  const tiles = [
    { v: "10+", label: "languages" },
    { v: "1,000s", label: "of SKUs per run" },
    { v: "1 cadence", label: "site + socials" },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="p-6 text-center">
            <div className="font-display text-4xl font-semibold tracking-tight text-ink-900">{t.v}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t.label}</div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[color:var(--accent-gold)]">
          <Sparkles className="size-3" strokeWidth={2} /> We run Postics on Postics
        </span>
      </div>
    </section>
  );
}

/* ─────────────── Pricing ─────────────── */

type BillingCycle = "monthly" | "annual";

const PLANS = [
  { name: "Starter", price: 199, blurb: "AI-only, quality-gated.", features: ["Connects to WordPress / WooCommerce", "Auto content plan", "Auto-publish on your schedule"] },
  { name: "Growth", price: 449, blurb: "More volume.", features: ["Everything in Starter", "Higher monthly content volume", "Priority generation"] },
  { name: "Premium", price: 999, blurb: "AI + human review.", features: ["Everything in Growth", "Human editor in the loop", "Brand-voice tuning"], popular: true },
];

function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const factor = cycle === "annual" ? 0.8 : 1;
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">/ pricing</div>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
          Simple plans. <span className="text-brand-700">No setup fees.</span>
        </h2>
        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 text-xs">
          {(["monthly","annual"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                cycle === c ? "bg-brand-700 text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-ink-900",
              )}
            >
              {c === "monthly" ? "Monthly" : "Annual −20%"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-4">
        {PLANS.map((p) => (
          <Card key={p.name} className={cn("relative p-6", p.popular && "ring-1 ring-[color:var(--accent-gold)]")}>
            {p.popular && (
              <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-[color:var(--accent-gold)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                Popular
              </span>
            )}
            <div className="font-display text-xl font-semibold text-ink-900">{p.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{p.blurb}</div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold text-ink-900">${Math.round(p.price * factor)}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <a href="#hero-run" className="postics-btn-primary mt-5 w-full justify-center">
              Run it <ArrowRight className="size-4" strokeWidth={1.75} />
            </a>
            <ul className="mt-5 space-y-2 text-sm text-ink-900">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 text-[color:var(--success)]" strokeWidth={2} /> {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
        {/* Agency */}
        <Card className="relative bg-ink-900 p-6 text-[color:var(--paper)]">
          <div className="font-display text-xl font-semibold">Agency</div>
          <div className="mt-1 text-sm opacity-70">White-label, 10+ stores.</div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xs opacity-70">from</span>
            <span className="font-display text-4xl font-semibold">${Math.round(999 * factor)}</span>
            <span className="text-sm opacity-70">/mo</span>
          </div>
          <a href="#agencies" className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5">
            Talk to us <ArrowRight className="size-4" strokeWidth={1.75} />
          </a>
          <ul className="mt-5 space-y-2 text-sm">
            {["Multi-store console", "White-label dashboards & reports", "Partner revenue share"].map((f) => (
              <li key={f} className="flex items-start gap-2 opacity-90">
                <Check className="mt-0.5 size-4 text-[color:var(--accent-gold)]" strokeWidth={2} /> {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────── FAQ ─────────────── */

const FAQ = [
  { q: "Do you build my site?", a: "No. We connect to your existing WordPress / WooCommerce." },
  { q: "Is auto-publishing safe for SEO?", a: "Quality-gated by default; human review on premium." },
  { q: "Which languages?", a: "We publish in your market's language — 10+ supported." },
  { q: "For agencies?", a: "Yes — a white-label cabinet to run all your clients." },
];

function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-24">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">/ faq</div>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900">
          Quick answers.
        </h2>
      </div>
      <ul className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
        {FAQ.map((f) => (
          <li key={f.q} className="px-5 py-4">
            <div className="font-display text-base font-medium text-ink-900">{f.q}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.a}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HeroEcho() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 pb-24 text-center">
      <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-4xl">
        Paste your store URL. <span className="text-brand-700">Run it.</span>
      </h2>
      <div className="mt-6 flex justify-center">
        <UrlRunForm />
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */

function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="grid size-6 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
            <span className="font-display text-xs leading-none">P</span>
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-ink-900">Postics.io</span>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <a href="#machine" className="hover:text-ink-900">Product</a>
          <a href="#pricing" className="hover:text-ink-900">Pricing</a>
          <a href="#faq" className="hover:text-ink-900">FAQ</a>
          <a href="#agencies" className="hover:text-ink-900">For agencies</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="postics-btn-ghost">Log in</Link>
          <a href="#hero-run" className="postics-btn-primary">
            Run it <ArrowRight className="size-4" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  );
}
