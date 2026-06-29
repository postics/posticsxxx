import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Clock,
  ShieldCheck,
  Pencil,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronRight,
  Globe2,
  Coffee,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, StatusChip } from "@/features/shared/primitives";
import { FocusShell } from "@/features/shell/FocusShell";

type Step = 1 | 2 | 3 | 4;

type Detected = {
  domain: string;
  brand: string;
  archetype: "ecom" | "services" | "saas";
  typeLabel: string; // "retail" / "agency" / "SaaS"
  scaleLine: string; // "1,240 products · 3 languages"
  languages: string[];
  topItems: string[];
  planLabel: string; // archetype-shaped plan label
  pillars: { id: string; title: string; note: string }[];
  gap: string; // content gap insight line
  confidence: "high" | "low";
};

const SAMPLE: Detected = {
  domain: "northboundcoffee.com",
  brand: "Northbound Coffee Roasters",
  archetype: "ecom",
  typeLabel: "retail",
  scaleLine: "1,240 products · 3 languages",
  languages: ["English", "Français", "Deutsch"],
  topItems: ["Single-origin subscriptions", "Wholesale espresso", "Brewing kits"],
  planLabel: "International wholesale wedge",
  gap: "~1,418 missed commercial pages vs. competitors",
  pillars: [
    { id: "p1", title: "Wholesale espresso programs", note: "Commercial · category + cluster pages" },
    { id: "p2", title: "Single-origin storytelling", note: "Editorial · origin, farm, harvest" },
    { id: "p3", title: "Brew guides by method", note: "How-to · capture long-tail search" },
    { id: "p4", title: "Subscription comparisons", note: "Conversion · landing variants" },
    { id: "p5", title: "International shipping & duty", note: "Trust · localized FAQ pages" },
  ],
  confidence: "high",
};

const GOALS = [
  { id: "traffic", label: "More traffic" },
  { id: "convert", label: "Better-converting pages" },
  { id: "brand", label: "Brand & trust" },
  { id: "leads", label: "Leads" },
] as const;

const FACE_OPTIONS = ["Yes", "No", "Partly"] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [url, setUrl] = useState("");
  const [detected, setDetected] = useState<Detected | null>(null);
  const navigate = useNavigate();

  // Prefill from ?site=… (fallback ?store=… for backwards-compat).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const seed = params.get("site") ?? params.get("store");
    if (seed) setUrl(seed);
  }, []);

  return (
    <FocusShell step={step} totalSteps={4}>
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-10">
        {step === 1 && (
          <StepAnalyze
            url={url}
            setUrl={setUrl}
            onAnalyzed={(d) => {
              setDetected(d);
              setStep(2);
            }}
          />
        )}
        {step === 2 && detected && (
          <StepDiagnosis
            detected={detected}
            setDetected={setDetected}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && detected && (
          <StepStrategy
            detected={detected}
            setDetected={setDetected}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && detected && (
          <StepReady
            detected={detected}
            onBack={() => setStep(3)}
            onGenerate={() => {
              try {
                localStorage.setItem(
                  "postics.onboarding",
                  JSON.stringify({
                    brand: detected.brand,
                    domain: detected.domain,
                    archetype: detected.archetype,
                    planLabel: detected.planLabel,
                    pillars: detected.pillars,
                    firstBatch: [
                      { type: "Article", title: `${detected.pillars[0]?.title ?? "Pillar"} — cornerstone` },
                      { type: "Article", title: `${detected.pillars[1]?.title ?? "Pillar"} — guide` },
                      { type: "Landing", title: `${detected.planLabel} — landing` },
                      { type: "Product copy", title: detected.topItems[0] ?? "Hero product" },
                      { type: "Social", title: `${detected.brand} — launch thread` },
                    ],
                    generatedAt: new Date().toISOString(),
                  }),
                );
              } catch {
                /* storage unavailable — non-blocking */
              }
              navigate({ to: "/plan" });
            }}
          />
        )}
      </div>
    </FocusShell>
  );
}

/* ──────────────────────────── Step 1 — Analyze ──────────────────────────── */

function isProbablyUrl(v: string) {
  return /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v.trim());
}

function StepAnalyze({
  url,
  setUrl,
  onAnalyzed,
}: {
  url: string;
  setUrl: (v: string) => void;
  onAnalyzed: (d: Detected) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "validating" | "analyzing">("idle");
  const valid = isProbablyUrl(url);
  const looksBiz =
    valid && !/(facebook|instagram|tiktok|x\.com|youtube)\./i.test(url);

  useEffect(() => {
    if (phase !== "validating") return;
    const t = setTimeout(() => setPhase("idle"), 250);
    return () => clearTimeout(t);
  }, [phase, url]);

  function run(sample?: boolean) {
    setPhase("analyzing");
    setTimeout(() => {
      if (sample) {
        setUrl(SAMPLE.domain);
        onAnalyzed(SAMPLE);
      } else {
        const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        onAnalyzed({
          ...SAMPLE,
          domain: host || "yoursite.com",
          brand: host.split(".")[0] || "Your brand",
        });
      }
    }, 1100);
  }

  return (
    <section className="mx-auto max-w-2xl pt-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        step 1 — analyze your site
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-ink">
        Paste your site. We'll do the rest.
      </h1>
      <p className="mt-3 text-ink-mute">
        Works for any business on any site or CMS. No signup, no site connection required.
      </p>

      <Card className="mt-8 p-5 text-left">
        <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-mute">
          your site
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-line bg-paper px-3 py-3 focus-within:border-brand">
          <Globe2 className="h-4 w-4 text-ink-mute" />
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPhase("validating");
            }}
            placeholder="yoursite.com"
            spellCheck={false}
            autoFocus
            className="flex-1 bg-transparent font-mono text-base text-ink outline-none placeholder:text-ink-mute/60"
          />
          {valid && looksBiz && (
            <span className="flex items-center gap-1 text-xs text-brand">
              <Check className="h-3.5 w-3.5" /> looks good
            </span>
          )}
        </div>
        {valid && !looksBiz && (
          <p className="mt-2 text-xs text-ink-mute">
            That doesn't look like a business site — we can still try.
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => run(true)}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line px-4 py-2.5 text-sm text-ink hover:bg-surface-sunken"
          >
            <Coffee className="h-4 w-4 text-ink-mute" />
            Use sample · Northbound Coffee Roasters
          </button>
          <button
            disabled={!valid || phase === "analyzing"}
            onClick={() => run(false)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium transition",
              !valid || phase === "analyzing"
                ? "cursor-not-allowed bg-surface-sunken text-ink-mute"
                : "bg-brand text-paper hover:bg-brand/90",
            )}
          >
            {phase === "analyzing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                Analyze <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </Card>

      <p className="mt-6 text-xs text-ink-mute">
        Platform-neutral · Shopify, WooCommerce, Webflow, WordPress, custom — all fine.
      </p>
    </section>
  );
}

/* ──────────────────────────── Step 2 — Diagnosis (overlay) ──────────────────────────── */

function StepDiagnosis({
  detected,
  setDetected,
  onBack,
  onNext,
}: {
  detected: Detected;
  setDetected: (d: Detected) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [bizOk, setBizOk] = useState(true);
  const [face, setFace] = useState<(typeof FACE_OPTIONS)[number] | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [push, setPush] = useState("");
  const [pushTags, setPushTags] = useState<string[]>(detected.topItems.slice(0, 2));
  const [langs, setLangs] = useState<string[]>(detected.languages);
  const [advanced, setAdvanced] = useState(false);

  const canContinue = bizOk !== null && face && goal;

  function toggleLang(l: string) {
    setLangs((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    );
  }
  function togglePush(t: string) {
    setPushTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  return (
    <section>
      <Header
        eyebrow="step 2 — business diagnosis"
        title="Confirm a few things — about 60 seconds."
        sub="We pre-filled what we could detect. Tap to confirm or correct."
      />

      <div className="mt-8 grid gap-4">
        {/* Q1 confirm */}
        <Card className="p-5">
          <Row label="Q1 · Confirm" hint="Is this your business?">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-50 px-3 py-1.5 text-sm text-brand">
                <Check className="h-3.5 w-3.5" />
                {detected.brand} — {detected.typeLabel} · {detected.scaleLine}
              </span>
              <button
                onClick={() => setBizOk(!bizOk)}
                className="text-xs text-ink-mute underline-offset-2 hover:underline"
              >
                {bizOk ? "Correct" : "Confirmed — undo"}
              </button>
            </div>
          </Row>
        </Card>

        {/* Q2 ask – face */}
        <Card className="p-5">
          <Row label="Q2 · Ask" hint="Is the owner willing to be the face? (video / personal brand)">
            <div className="flex flex-wrap gap-2">
              {FACE_OPTIONS.map((o) => (
                <Chip key={o} active={face === o} onClick={() => setFace(o)}>
                  {o}
                </Chip>
              ))}
            </div>
          </Row>
        </Card>

        {/* Q3 ask – goal */}
        <Card className="p-5">
          <Row label="Q3 · Ask" hint="Main goal right now?">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>
                  {g.label}
                </Chip>
              ))}
            </div>
          </Row>
        </Card>

        {/* Q4 ask – push */}
        <Card className="p-5">
          <Row label="Q4 · Ask" hint="What's strongest / what to push?">
            <div className="space-y-3">
              <input
                value={push}
                onChange={(e) => setPush(e.target.value)}
                placeholder="One line — e.g. wholesale espresso programs"
                className="w-full rounded-[10px] border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <div className="flex flex-wrap gap-2">
                {detected.topItems.map((t) => (
                  <Chip
                    key={t}
                    active={pushTags.includes(t)}
                    onClick={() => togglePush(t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </Row>
        </Card>

        {/* Q5 confirm – markets */}
        <Card className="p-5">
          <Row label="Q5 · Confirm" hint="Priority markets / languages?">
            <div className="flex flex-wrap gap-2">
              {detected.languages.concat(["Español", "中文"]).map((l) => (
                <Chip key={l} active={langs.includes(l)} onClick={() => toggleLang(l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </Row>
        </Card>

        {/* Advanced */}
        <button
          onClick={() => setAdvanced((v) => !v)}
          className="inline-flex items-center gap-1.5 self-start text-xs text-ink-mute hover:text-ink"
        >
          {advanced ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Advanced — tone, cadence, content mix, model
        </button>
        {advanced && (
          <Card className="p-5 text-sm text-ink-mute">
            <p>
              Tone, cadence and content mix are smart-defaulted for your archetype. You can tune
              them per project after onboarding in <span className="text-ink">Settings → Brand & Cadence</span>.
            </p>
          </Card>
        )}
      </div>

      <FooterNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="See my strategy"
        nextDisabled={!canContinue}
      />
    </section>
  );
}

/* ──────────────────────────── Step 3 — Strategy ──────────────────────────── */

function StepStrategy({
  detected,
  setDetected,
  onBack,
  onNext,
}: {
  detected: Detected;
  setDetected: (d: Detected) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ pages: 0, comps: 0, gaps: 0 });
  const [units, setUnits] = useState(12);
  const [horizon, setHorizon] = useState<1 | 3 | 12>(3);
  const [pillars, setPillars] = useState(detected.pillars);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setCounts({
        pages: Math.round(t * 184),
        comps: Math.round(t * 12),
        gaps: Math.round(t * 1418),
      });
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setLoading(false), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  if (loading) {
    return (
      <section>
        <Header
          eyebrow="step 3 — your strategy"
          title="Analyzing your site + competitors…"
          sub="Reading pages, mapping clusters, finding gaps."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatTile label="Pages read" value={counts.pages.toLocaleString()} />
          <StatTile label="Competitors mapped" value={counts.comps.toLocaleString()} />
          <StatTile label="Content gaps" value={counts.gaps.toLocaleString()} />
        </div>
        <div className="mt-6 grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[12px] border border-line bg-surface-sunken/60"
            />
          ))}
        </div>
      </section>
    );
  }

  const horizonOptions: { v: 1 | 3 | 12; label: string; locked?: boolean }[] = [
    { v: 1, label: "1 mo" },
    { v: 3, label: "3 mo" },
    { v: 12, label: "12 mo", locked: true },
  ];

  return (
    <section>
      <Header
        eyebrow="step 3 — your strategy"
        title="Here's your plan."
        sub={
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
              plan
            </span>
            <span className="text-ink">{detected.planLabel}</span>
          </span>
        }
      />

      {detected.confidence === "low" && (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-line bg-surface-sunken px-4 py-3 text-sm text-ink-mute">
          <AlertCircle className="h-4 w-4" />
          Confirm your business type to sharpen the plan.
        </div>
      )}

      {/* Insight */}
      <div className="mt-6 rounded-[12px] border border-line bg-brand-50/60 px-4 py-3 text-sm text-ink">
        <span className="font-medium">Content gap insight · </span>
        <span className="text-ink-mute">{detected.gap}</span>
      </div>

      {/* Cadence */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
              cadence
            </p>
            <h3 className="mt-1 text-lg text-ink">Units per month</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnits((u) => Math.max(2, u - 2))}
              className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-surface-sunken"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="min-w-16 text-center font-mono text-2xl text-ink">{units}</div>
            <button
              onClick={() => setUnits((u) => Math.min(60, u + 2))}
              className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-surface-sunken"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            horizon
          </span>
          {horizonOptions.map((h) => (
            <button
              key={h.v}
              disabled={h.locked}
              onClick={() => setHorizon(h.v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                horizon === h.v
                  ? "border-brand bg-brand text-paper"
                  : "border-line text-ink hover:bg-surface-sunken",
                h.locked && "cursor-not-allowed opacity-60",
              )}
              title={h.locked ? "Upgrade for a longer horizon" : undefined}
            >
              {h.label}
              {h.locked && <Lock className="ml-1 inline h-3 w-3" />}
            </button>
          ))}
          <span className="ml-1 text-xs text-ink-mute">upgrade for a longer horizon</span>
        </div>

        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            content mix
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <MixChip icon={<Check className="h-3.5 w-3.5" />} tone="ready">
              Articles
            </MixChip>
            <MixChip icon={<Check className="h-3.5 w-3.5" />} tone="ready">
              Product / landing copy
            </MixChip>
            <MixChip icon={<Lock className="h-3.5 w-3.5" />} tone="locked">
              Social posts · best-effort · pending audit
            </MixChip>
            <MixChip icon={<Clock className="h-3.5 w-3.5" />} tone="soon">
              Product photos · soon
            </MixChip>
            <MixChip icon={<Clock className="h-3.5 w-3.5" />} tone="soon">
              Product videos · soon
            </MixChip>
          </div>
        </div>
      </Card>

      {/* Pillars */}
      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
          pillars · {pillars.length}
        </p>
        <div className="mt-2 grid gap-3">
          {pillars.map((p) => (
            <div
              key={p.id}
              className="group flex items-start justify-between gap-4 rounded-[12px] border border-line bg-paper px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                {editing === p.id ? (
                  <input
                    autoFocus
                    defaultValue={p.title}
                    onBlur={(e) => {
                      setPillars((arr) =>
                        arr.map((x) =>
                          x.id === p.id ? { ...x, title: e.target.value } : x,
                        ),
                      );
                      setEditing(null);
                    }}
                    className="w-full rounded-[8px] border border-line bg-paper px-2 py-1 text-sm text-ink outline-none focus:border-brand"
                  />
                ) : (
                  <p className="truncate text-sm text-ink">{p.title}</p>
                )}
                <p className="mt-0.5 text-xs text-ink-mute">{p.note}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => setEditing(p.id)}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-sunken"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5 text-ink-mute" />
                </button>
                <button
                  onClick={() =>
                    setPillars((arr) => arr.filter((x) => x.id !== p.id))
                  }
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-sunken"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5 text-ink-mute" />
                </button>
              </div>
            </div>
          ))}
          {pillars.length < 7 && (
            <button
              onClick={() =>
                setPillars((arr) => [
                  ...arr,
                  {
                    id: `p${arr.length + 1}`,
                    title: "New pillar",
                    note: "Click to edit",
                  },
                ])
              }
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-line px-3 py-2 text-sm text-ink-mute hover:bg-surface-sunken"
            >
              <Plus className="h-4 w-4" /> Add pillar
            </button>
          )}
        </div>
      </div>

      <FooterNav onBack={onBack} onNext={onNext} nextLabel="Looks right →" />
    </section>
  );
}

/* ──────────────────────────── Step 4 — Ready ──────────────────────────── */

function StepReady({
  detected,
  onBack,
  onGenerate,
}: {
  detected: Detected;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [retry, setRetry] = useState<null | string>(null);

  function go() {
    setGenerating(true);
    setTimeout(() => {
      // simulate one retry sometimes
      setRetry("Generation hiccup — retrying 2/3");
      setTimeout(() => {
        setRetry(null);
        onGenerate();
      }, 900);
    }, 700);
  }

  return (
    <section className="animate-in fade-in-50 duration-500">
      <Header
        eyebrow="step 4 — ready"
        title="Your strategy is ready."
        sub={`Strategy for 12 months · first 5 pieces ready to generate · quality-gated`}
      />

      <Card className="mt-8 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat label="Brand" value={detected.brand} />
          <SummaryStat label="Plan shape" value={detected.planLabel} />
          <SummaryStat label="First batch" value="5 pieces · articles + landing copy" />
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-ink-mute">
          <ShieldCheck className="h-4 w-4 text-brand" />
          Quality-gated · AI-only by default. Human review available later on Premium.
        </div>

        {retry && (
          <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-line bg-surface-sunken px-3 py-2 text-xs text-ink-mute">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {retry}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={go}
            disabled={generating}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-sm font-medium",
              generating
                ? "cursor-wait bg-brand/80 text-paper"
                : "bg-brand text-paper hover:bg-brand/90",
            )}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating first pieces…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> Generate my first pieces
              </>
            )}
          </button>

          <button className="text-sm text-ink-mute hover:text-ink">
            Connect your site or store to auto-publish <span className="opacity-70">(optional)</span>
          </button>
          <button className="text-xs text-ink-mute hover:text-ink">
            Talk to the team
          </button>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-mute">
        Can't connect right now? No problem — generate and export, we'll help you connect later.
      </p>

      <FooterNav onBack={onBack} hideNext />
    </section>
  );
}

/* ──────────────────────────── Shared bits ──────────────────────────── */

function Header({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {sub && <p className="mt-2 text-ink-mute">{sub}</p>}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-start">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
          {label}
        </p>
        <p className="mt-1 text-sm text-ink">{hint}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-brand bg-brand text-paper"
          : "border-line text-ink hover:bg-surface-sunken",
      )}
    >
      {children}
    </button>
  );
}

function MixChip({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode;
  tone: "ready" | "locked" | "soon";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
        tone === "ready" && "border-brand/30 bg-brand-50 text-brand",
        tone === "locked" && "border-line bg-surface-sunken text-ink-mute",
        tone === "soon" && "border-line bg-paper text-ink-mute",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-paper px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl text-ink">{value}</p>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}

function FooterNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  hideNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideNext?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {!hideNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium",
            nextDisabled
              ? "cursor-not-allowed bg-surface-sunken text-ink-mute"
              : "bg-brand text-paper hover:bg-brand/90",
          )}
        >
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}