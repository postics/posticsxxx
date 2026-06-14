import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Sparkle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrowserFrame, Card, StatusChip } from "@/features/shared/primitives";

type Step = 1 | 2 | 3 | 4;

const SAMPLE = {
  name: "Vellum & Bean",
  niche: "Specialty coffee roastery",
  audience:
    "Independent cafés, wholesale buyers, and home brewers in the Pacific Northwest who care about provenance and craft.",
  tone: "Editorial, warm, quietly confident",
  url: "vellumandbean.com",
};

const TEMPLATES = [
  {
    id: "editorial",
    name: "Editorial Quarterly",
    blurb: "Long-form first. Generous serif headlines, slow rhythm.",
    accent: "bg-[color:var(--surface-sunken)]",
  },
  {
    id: "atelier",
    name: "Atelier",
    blurb: "Studio-style. Asymmetric grid, large product moments.",
    accent: "bg-brand-100",
  },
  {
    id: "ledger",
    name: "Ledger",
    blurb: "Operator-led. Dense above the fold, mono details.",
    accent: "bg-[color:var(--accent-gold-soft)]",
  },
  {
    id: "harbor",
    name: "Harbor",
    blurb: "Service-business clarity. Trust-forward, calm.",
    accent: "bg-[#E2ECF3]",
  },
];

const TOPIC_SUGGESTIONS = [
  "The case for single-origin in wholesale espresso programs",
  "How we cup: a working roaster's tasting protocol",
  "Decaf, reconsidered: choosing process over apology",
  "What a roast curve actually tells your barista",
  "Pacific Northwest harvest notes — autumn 2026",
  "Building a wholesale price sheet that respects farmers",
  "Filter vs. pressure: a café equipment buyer's guide",
  "Subscriptions without the gimmick: a quiet retention model",
];

const GOALS = ["Traffic", "Leads", "Authority", "Wholesale enquiries"] as const;
const TONES = ["Editorial", "Warm", "Operator", "Playful", "Technical"] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: "",
    niche: "",
    audience: "",
    tone: "Editorial",
    url: "",
    goals: ["Authority"] as string[],
    language: "English (US)",
    template: "editorial",
    topics: [] as string[],
  });

  const useSample = () =>
    setForm((f) => ({
      ...f,
      name: SAMPLE.name,
      niche: SAMPLE.niche,
      audience: SAMPLE.audience,
      tone: "Editorial",
      url: SAMPLE.url,
    }));

  const slug = useMemo(
    () =>
      (form.name || "your-business")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 28) || "your-business",
    [form.name],
  );

  return (
    <div className="min-h-screen bg-paper">
      <TopBar step={step} />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
        {step === 1 && (
          <StepDescribe
            form={form}
            setForm={setForm}
            useSample={useSample}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepLookAndContent
            form={form}
            setForm={setForm}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepGenerating
            slug={slug}
            form={form}
            onDone={() => setStep(4)}
          />
        )}
        {step === 4 && <StepDemoReady slug={slug} form={form} />}
      </main>
    </div>
  );
}

function TopBar({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Describe" },
    { n: 2, label: "Look & content" },
    { n: 3, label: "Generate" },
    { n: 4, label: "Demo ready" },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
            <span className="font-display text-sm leading-none">P</span>
          </div>
          <span className="font-display text-lg text-ink-900">Postics</span>
          <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
            Full-cycle content engine
          </span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {steps.map((s, i) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <div key={s.n} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active && "bg-brand-100 text-brand-700",
                    done && "text-ink-700",
                    !active && !done && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border text-[11px] font-mono-num",
                      active && "border-brand-700 bg-brand-700 text-[color:var(--primary-foreground)]",
                      done && "border-brand-700/30 bg-brand-100 text-brand-700",
                      !active && !done && "border-line bg-surface text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3" strokeWidth={2} /> : s.n}
                  </span>
                  {s.label}
                </div>
                {i < steps.length - 1 && <div className="mx-1 h-px w-6 bg-line" />}
              </div>
            );
          })}
        </nav>
        <div className="text-xs text-muted-foreground">
          <Link to="/dashboard" className="hover:text-ink-900">
            Skip to dashboard →
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── STEP 1 ─────────────── */

function StepDescribe({
  form,
  setForm,
  useSample,
  onNext,
}: {
  form: any;
  setForm: any;
  useSample: () => void;
  onNext: () => void;
}) {
  const canContinue = form.name.trim().length >= 2 && form.niche.trim().length >= 3;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8 animate-rise">
        <div className="space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Step 1 · Describe your business
          </div>
          <h1 className="font-display text-4xl leading-[1.1] text-ink-900 sm:text-5xl">
            Tell us about your business.
            <br />
            <span className="text-ink-700/70">We'll do the rest.</span>
          </h1>
          <p className="max-w-prose text-base text-muted-foreground">
            A few honest sentences are better than a brief. You can refine voice and topics later.
          </p>
        </div>

        <div className="space-y-5">
          <Field label="Business name" hint="Used for your preview domain.">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Vellum & Bean"
              className="postics-input"
            />
          </Field>

          <Field label="What you do · who it's for">
            <textarea
              value={form.niche ? `${form.niche}${form.audience ? "\n\n" + form.audience : ""}` : ""}
              onChange={(e) => {
                const v = e.target.value;
                const [niche, ...rest] = v.split(/\n{2,}/);
                setForm({ ...form, niche: niche ?? "", audience: rest.join("\n\n") });
              }}
              rows={6}
              placeholder={
                "Specialty coffee roastery — single-origin and small-batch blends.\n\nWe sell to independent cafés, wholesale buyers, and home brewers in the Pacific Northwest who care about provenance."
              }
              className="postics-input resize-none font-sans leading-relaxed"
            />
          </Field>

          <Field
            label="Existing website or social URL"
            hint="Optional — we'll pull tone and basic info."
          >
            <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <Globe2 className="ml-3 size-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="vellumandbean.com"
                className="flex-1 bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary goal">
              <ChipRow
                options={GOALS as unknown as string[]}
                value={form.goals}
                multi
                onChange={(v) => setForm({ ...form, goals: v })}
              />
            </Field>
            <Field label="Brand tone">
              <ChipRow
                options={TONES as unknown as string[]}
                value={[form.tone]}
                onChange={(v) => setForm({ ...form, tone: v[0] })}
              />
            </Field>
          </div>

          <Field label="Language & market">
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="postics-input"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Deutsch</option>
              <option>Español</option>
              <option>Français</option>
              <option>Русский</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={useSample}
            className="postics-btn-ghost"
          >
            <Coffee className="size-4" strokeWidth={1.5} /> Use sample business
          </button>
          <button
            type="button"
            disabled={!canContinue}
            onClick={onNext}
            className="postics-btn-primary"
          >
            Continue <ArrowRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <Card className="p-6 animate-rise">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            What happens next
          </div>
          <ol className="mt-4 space-y-4">
            {[
              ["Pick a look and topics", "Premium templates and AI-suggested article ideas."],
              ["Watch Postics build your site", "Provisioning, layout, articles, SEO — live."],
              ["Decide how to keep it", "Subscribe, connect your domain, or buy the site."],
            ].map(([t, d], i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 font-mono-num text-[11px] text-brand-700">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-medium text-ink-900">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="flex items-start gap-3 p-5">
          <ShieldCheck className="mt-0.5 size-4 text-[color:var(--success)]" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Your preview launches on a private subdomain with{" "}
            <span className="font-mono-num text-ink-700">noindex</span>. Nothing is published until
            you say so.
          </p>
        </Card>
      </aside>
    </div>
  );
}

/* ─────────────── STEP 2 ─────────────── */

function StepLookAndContent({
  form,
  setForm,
  onBack,
  onNext,
}: {
  form: any;
  setForm: any;
  onBack: () => void;
  onNext: () => void;
}) {
  const [topicsLoading, setTopicsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTopicsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const toggleTopic = (t: string) =>
    setForm((f: any) => ({
      ...f,
      topics: f.topics.includes(t)
        ? f.topics.filter((x: string) => x !== t)
        : [...f.topics, t],
    }));

  return (
    <div className="space-y-10 animate-rise">
      <div className="space-y-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Step 2 · Choose look & content
        </div>
        <h1 className="font-display text-4xl leading-[1.1] text-ink-900">
          Pick a starting point.
        </h1>
        <p className="text-muted-foreground">
          Templates and topics are a draft — you can swap, rewrite, or regenerate anything later.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-medium text-ink-900">Template</h2>
          <span className="text-xs text-muted-foreground">4 premium starting points</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => {
            const active = form.template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, template: t.id })}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-surface text-left transition-all",
                  active
                    ? "border-brand-700 ring-2 ring-brand-100"
                    : "border-line hover:border-ink-700/30",
                )}
              >
                <div className={cn("relative h-36 border-b border-line", t.accent)}>
                  <MockThumb id={t.id} />
                  {active && (
                    <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-brand-700 text-[color:var(--primary-foreground)]">
                      <Check className="size-3.5" strokeWidth={2} />
                    </span>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <div className="font-display text-base text-ink-900">{t.name}</div>
                  <div className="text-xs leading-relaxed text-muted-foreground">{t.blurb}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-medium text-ink-900">Suggested topics</h2>
            <span className="text-xs text-muted-foreground">
              {form.topics.length} selected · we'll write the top 3 first
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {topicsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[64px] animate-pulse rounded-xl border border-line bg-surface-sunken/60"
                  />
                ))
              : TOPIC_SUGGESTIONS.map((t) => {
                  const active = form.topics.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border bg-surface px-4 py-3.5 text-left transition-colors",
                        active
                          ? "border-brand-700 bg-brand-100/40"
                          : "border-line hover:border-ink-700/30",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                          active
                            ? "border-brand-700 bg-brand-700 text-[color:var(--primary-foreground)]"
                            : "border-line bg-surface",
                        )}
                      >
                        {active && <Check className="size-3" strokeWidth={2.25} />}
                      </span>
                      <span className="text-sm leading-snug text-ink-900">{t}</span>
                    </button>
                  );
                })}
          </div>
        </div>

        <aside className="space-y-3">
          <Card className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Palette
            </div>
            <div className="mt-3 flex gap-1.5">
              {["#1E3A34", "#2F5B50", "#E4EDE8", "#B98A3E", "#FAF8F4"].map((c) => (
                <span
                  key={c}
                  className="size-7 rounded-md border border-line"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Auto-extracted. Tweakable in Site → Theme.
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Logo
            </div>
            <div className="mt-3 grid h-16 place-items-center rounded-lg border border-dashed border-line bg-surface-sunken text-sm text-muted-foreground">
              Auto placeholder · upload later
            </div>
          </Card>
        </aside>
      </section>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <button onClick={onBack} className="postics-btn-ghost">
          <ArrowLeft className="size-4" strokeWidth={1.75} /> Back
        </button>
        <button onClick={onNext} className="postics-btn-primary">
          Generate my site <Sparkle className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── STEP 3 — WOW ─────────────── */

const PIPELINE_STEPS = [
  { id: "provision", label: "Provisioning your site", ms: 900 },
  { id: "design", label: "Designing layout", ms: 1100 },
  { id: "write", label: "Writing 3 articles", ms: 2600 },
  { id: "seo", label: "Optimizing SEO", ms: 900 },
  { id: "ship", label: "Going live", ms: 900 },
];

function StepGenerating({
  slug,
  form,
  onDone,
}: {
  slug: string;
  form: any;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [hiccup, setHiccup] = useState(false);
  const hiccupShown = useRef(false);

  useEffect(() => {
    if (phase >= PIPELINE_STEPS.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    // graceful hiccup once during 'write'
    if (PIPELINE_STEPS[phase].id === "write" && !hiccupShown.current) {
      hiccupShown.current = true;
      setHiccup(true);
      const t1 = setTimeout(() => setHiccup(false), 1100);
      const t2 = setTimeout(() => setPhase((p) => p + 1), PIPELINE_STEPS[phase].ms + 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    const t = setTimeout(() => setPhase((p) => p + 1), PIPELINE_STEPS[phase].ms);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const headlines = form.topics.length ? form.topics : TOPIC_SUGGESTIONS;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-7 animate-rise">
        <div className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Step 3 · Generating
          </div>
          <h1 className="font-display text-4xl leading-[1.1] text-ink-900">
            Building <span className="font-mono-num text-2xl text-ink-700/80">{slug}.postics.site</span>
          </h1>
          <p className="text-muted-foreground">
            This usually takes about 40 seconds. Stay if you'd like — your progress is saved either way.
          </p>
        </div>

        <Card className="divide-y divide-line p-1">
          {PIPELINE_STEPS.map((s, i) => {
            const done = i < phase;
            const active = i === phase;
            return (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border",
                    done && "border-brand-700 bg-brand-700 text-[color:var(--primary-foreground)]",
                    active && "border-brand-500 bg-brand-100 text-brand-700",
                    !done && !active && "border-line bg-surface text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={2} />
                  ) : active ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "text-sm",
                      done ? "text-ink-700" : active ? "text-ink-900" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                    {s.id === "write" && active && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        — drafting headlines
                      </span>
                    )}
                    {s.id === "ship" && active && (
                      <span className="font-mono-num ml-2 text-xs text-muted-foreground">
                        on {slug}.postics.site
                      </span>
                    )}
                  </div>
                  {s.id === "write" && (active || done) && (
                    <div className="mt-2 space-y-1.5">
                      {headlines.slice(0, 3).map((h: string, idx: number) => (
                        <Typewriter
                          key={h}
                          text={h}
                          delay={300 + idx * 600}
                          done={done}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {done && (
                  <span className="text-xs text-[color:var(--success)]">Done</span>
                )}
              </div>
            );
          })}
        </Card>

        {hiccup && (
          <Card className="flex items-center gap-3 border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 p-4 animate-rise">
            <RefreshCw className="size-4 animate-spin text-[color:var(--warning)]" strokeWidth={1.75} />
            <div className="text-sm text-ink-700">
              Generation hiccup — retrying…{" "}
              <span className="font-mono-num text-muted-foreground">2/3</span>. Your progress is
              preserved.
            </div>
          </Card>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <BrowserFrame url={`https://${slug}.postics.site`}>
          <MiniSitePreview phase={phase} form={form} />
        </BrowserFrame>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Live preview · assembling in real time</span>
          <StatusChip tone="preview">Preview · noindex</StatusChip>
        </div>
      </div>
    </div>
  );
}

function Typewriter({
  text,
  delay,
  done,
}: {
  text: string;
  delay: number;
  done?: boolean;
}) {
  const [out, setOut] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (done) {
      setOut(text);
      return;
    }
    const start = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(start);
  }, [delay, done, text]);
  useEffect(() => {
    if (!started || done) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [started, text, done]);
  return (
    <div className="text-sm text-ink-900">
      <span className={cn(!done && out.length < text.length && "caret-blink")}>{out}</span>
    </div>
  );
}

function MiniSitePreview({ phase, form }: { phase: number; form: any }) {
  // phase: 0 prov, 1 design, 2 write, 3 seo, 4 ship, 5 done
  const showLayout = phase >= 1;
  const showArticles = phase >= 2;
  const showSeo = phase >= 3;
  const headlines =
    (form.topics.length ? form.topics : TOPIC_SUGGESTIONS).slice(0, 3);

  return (
    <div className="min-h-[520px] bg-surface p-6">
      {!showLayout ? (
        <div className="space-y-3">
          {[80, 60, 100, 70, 90].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-surface-sunken"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-rise">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="font-display text-base text-ink-900">
              {form.name || "Vellum & Bean"}
            </div>
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span>Journal</span>
              <span>Wholesale</span>
              <span>Shop</span>
              <span>About</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Quarterly journal
            </div>
            <h3 className="mt-1 font-display text-2xl leading-tight text-ink-900">
              On provenance, patience, and the quiet economics of small-batch coffee.
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/3] rounded-md border border-line bg-surface-sunken" />
                {showArticles ? (
                  <>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Essay · 4 min
                    </div>
                    <div className="font-display text-sm leading-snug text-ink-900">
                      {headlines[i] ?? "Working title"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-3/4 animate-pulse rounded bg-surface-sunken" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-surface-sunken" />
                  </>
                )}
              </div>
            ))}
          </div>

          {showSeo && (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-sunken/60 px-3 py-2 text-[11px] text-muted-foreground animate-rise">
              <ShieldCheck className="size-3.5 text-[color:var(--success)]" strokeWidth={1.5} />
              Schema, meta, sitemap & internal links — generated.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── STEP 4 ─────────────── */

function StepDemoReady({ slug, form }: { slug: string; form: any }) {
  return (
    <div className="space-y-10 animate-rise">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="space-y-5">
          <StatusChip tone="live">Live · private preview</StatusChip>
          <h1 className="font-display text-5xl leading-[1.05] text-ink-900">
            Your site is live.
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            <span className="font-mono-num text-ink-700">{slug}.postics.site</span> is up with 3
            published articles. It's private — search engines can't see it until you say so.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://${slug}.postics.site`}
              target="_blank"
              rel="noreferrer"
              className="postics-btn-primary"
            >
              Open live site <ExternalLink className="size-4" strokeWidth={1.5} />
            </a>
            <Link to="/dashboard" className="postics-btn-secondary">
              View dashboard <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
          <div className="font-mono-num text-xs text-muted-foreground">
            1 site · 3 published articles · SEO-ready · noindex
          </div>
        </div>

        <BrowserFrame url={`https://${slug}.postics.site`} className="lg:ml-auto">
          <MiniSitePreview phase={5} form={form} />
        </BrowserFrame>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink-900">How would you like to keep it?</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" strokeWidth={1.5} />
            Your draft is safe — choose any time.
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ConvCard
            title="Keep & subscribe"
            price="$39/mo"
            blurb="Postics hosts the site, runs the pipeline, and ships content for you every week."
            cta="Start subscription"
          />
          <ConvCard
            title="Connect my own domain"
            price="From $29/mo"
            blurb="Point an existing domain. We handle SSL, redirects, and email-safe DNS."
            cta="Connect domain"
          />
          <ConvCard
            gold
            title="Buy this site"
            price="One-time · $1,200"
            blurb="Take the codebase, content, and SEO foundation. You own everything."
            cta="Acquire the site"
          />
        </div>
      </div>
    </div>
  );
}

function ConvCard({
  title,
  price,
  blurb,
  cta,
  gold,
}: {
  title: string;
  price: string;
  blurb: string;
  cta: string;
  gold?: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 p-6",
        gold && "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-xl text-ink-900">{title}</div>
          <div className="font-mono-num mt-1 text-sm text-ink-700">{price}</div>
        </div>
        {gold && <StatusChip tone="gold">Premium</StatusChip>}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      <button
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors",
          gold
            ? "bg-[color:var(--accent-gold)] text-white hover:brightness-95"
            : "bg-brand-700 text-[color:var(--primary-foreground)] hover:bg-brand-500",
        )}
      >
        {cta} <ArrowRight className="size-4" strokeWidth={1.75} />
      </button>
    </Card>
  );
}

/* ─────────────── helpers ─────────────── */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-900">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ChipRow({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
}) {
  const toggle = (o: string) => {
    if (multi) {
      onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
    } else {
      onChange([o]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => toggle(o)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-brand-700 bg-brand-100 text-brand-700"
                : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MockThumb({ id }: { id: string }) {
  if (id === "editorial")
    return (
      <div className="absolute inset-0 flex flex-col gap-1.5 p-4">
        <div className="h-2 w-1/3 rounded bg-ink-900/70" />
        <div className="mt-auto space-y-1">
          <div className="h-2 w-4/5 rounded bg-ink-900/70" />
          <div className="h-2 w-3/5 rounded bg-ink-900/40" />
        </div>
      </div>
    );
  if (id === "atelier")
    return (
      <div className="absolute inset-0 grid grid-cols-3 gap-1.5 p-4">
        <div className="col-span-2 rounded bg-brand-700/80" />
        <div className="space-y-1.5">
          <div className="h-2 rounded bg-ink-900/60" />
          <div className="h-2 w-2/3 rounded bg-ink-900/30" />
        </div>
      </div>
    );
  if (id === "ledger")
    return (
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-sm",
              i % 5 === 0 ? "bg-[color:var(--accent-gold)]/70" : "bg-ink-900/30",
            )}
          />
        ))}
      </div>
    );
  return (
    <div className="absolute inset-0 flex items-stretch p-4">
      <div className="flex-1 space-y-1.5">
        <div className="h-2 w-1/2 rounded bg-ink-900/70" />
        <div className="h-2 w-3/4 rounded bg-ink-900/30" />
        <div className="h-2 w-2/3 rounded bg-ink-900/30" />
      </div>
      <div className="ml-3 w-16 rounded bg-info/30" />
    </div>
  );
}