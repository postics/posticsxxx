import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  X,
  Plus,
  Upload,
  ChevronDown,
  ChevronRight,
  Info,
  Globe,
  Palette,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, StatusChip } from "@/features/shared/primitives";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { toast } from "sonner";

export const Route = createFileRoute("/brand-kit")({
  head: () => ({
    meta: [
      { title: "Brand kit — Postics" },
      {
        name: "description",
        content:
          "Your business's voice, vocabulary, languages and brand assets — these guide every generated piece and the quality-gate.",
      },
    ],
  }),
  component: Page,
});

/* ---------------- types & seed ---------------- */

const SEGMENTS = [
  "Manufacturer",
  "Wholesaler",
  "E-commerce retail",
  "Local service",
  "SaaS / digital",
  "Agency",
] as const;
type Segment = (typeof SEGMENTS)[number];

const TONE_OPTIONS = [
  "Confident",
  "Warm",
  "Expert",
  "Playful",
  "Minimal",
  "Premium",
  "Friendly",
  "Direct",
] as const;

type OwnerFace = "yes" | "partial" | "no";

type Locale = { code: string; name: string; primary: boolean };

type Glossary = { id: string; term: string; preferred: string };

const SECTIONS = [
  { id: "identity", label: "Identity & segment" },
  { id: "voice", label: "Brand voice" },
  { id: "owner", label: "Owner as the face" },
  { id: "locales", label: "Languages & markets" },
  { id: "assets", label: "Brand assets / White-label" },
];

/* ---------------- page ---------------- */

function Page() {
  // Identity
  const [segment, setSegment] = useState<Segment>("E-commerce retail");
  const [scale] = useState("SMB · 6–25");

  // Voice
  const [tones, setTones] = useState<string[]>(["Warm", "Expert", "Premium"]);
  const [voiceLine, setVoiceLine] = useState(
    "Specialty coffee, calmly explained — like a knowledgeable friend at the bar.",
  );
  const [dos, setDos] = useState<string[]>([
    "Name the origin and farm",
    "Use precise brewing nouns",
    "Lead with taste, then process",
  ]);
  const [donts, setDonts] = useState<string[]>([
    "Don't oversell with superlatives",
    "Avoid jargon without a gloss",
    "Never call coffee 'magical'",
  ]);
  const [stopWords, setStopWords] = useState<string[]>([
    "world-class",
    "best-in-class",
    "game-changer",
  ]);
  const [petPhrases, setPetPhrases] = useState<string[]>([
    "delve",
    "in today's fast-paced world",
    "elevate your experience",
  ]);
  const [glossary, setGlossary] = useState<Glossary[]>([
    { id: "g1", term: "pour over", preferred: "pour-over" },
    { id: "g2", term: "v60", preferred: "Hario V60" },
    { id: "g3", term: "single origin", preferred: "single-origin" },
  ]);
  const [eeatOpen, setEeatOpen] = useState(true);
  const [eeat, setEeat] = useState({
    credentials:
      "Q-grader on staff (SCA), 9 years of roasting; member of the Roasters Guild.",
    opinions:
      "We batch-roast on Tuesdays for traceability; we don't chase the lightest possible roast.",
    stats:
      "Cupping scores 86–89 across 2025 lots; <14 days from roast to ship on 92% of orders.",
    founder:
      "Maya started Northbound after sourcing trips to Yirgacheffe in 2017.",
  });

  // Owner
  const [ownerFace, setOwnerFace] = useState<OwnerFace>("partial");

  // Locales
  const [locales, setLocales] = useState<Locale[]>([
    { code: "en", name: "English", primary: true },
    { code: "de", name: "Deutsch", primary: false },
    { code: "es", name: "Español", primary: false },
  ]);

  // Brand assets
  const [brandColor, setBrandColor] = useState("#1E3A34");
  const [agencyMode, setAgencyMode] = useState(false);

  const onSave = () => toast.success("Brand kit saved");
  const onReset = () => toast.info("Reset — last saved values restored");

  const ornament =
    segment === "Local service"
      ? "40 pages · 3 services · 2 locales"
      : segment === "SaaS / digital"
        ? "62 pages · 4 product areas · 3 locales"
        : segment === "Agency"
          ? "18 case studies · 6 services · 1 locale"
          : segment === "Wholesaler"
            ? "120 line-items · 4 categories · 1 locale"
            : segment === "Manufacturer"
              ? "85 products · 5 categories · 2 locales"
              : "248 SKUs · 6 categories · 3 locales";

  return (
    <WorkspaceShell breadcrumb={["Brand kit"]}>
      <div className="mx-auto w-full max-w-[1280px] px-8 py-8 pb-28 animate-rise">
        <Header />

        <div className="mt-6 grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_320px]">
          <SideNav />

          <div className="space-y-5">
            <IdentityCard
              segment={segment}
              setSegment={setSegment}
              scale={scale}
              ornament={ornament}
            />
            <VoiceCard
              tones={tones}
              setTones={setTones}
              voiceLine={voiceLine}
              setVoiceLine={setVoiceLine}
              dos={dos}
              setDos={setDos}
              donts={donts}
              setDonts={setDonts}
              stopWords={stopWords}
              setStopWords={setStopWords}
              petPhrases={petPhrases}
              setPetPhrases={setPetPhrases}
              glossary={glossary}
              setGlossary={setGlossary}
              eeatOpen={eeatOpen}
              setEeatOpen={setEeatOpen}
              eeat={eeat}
              setEeat={setEeat}
            />
            <OwnerFaceCard value={ownerFace} onChange={setOwnerFace} />
            <LocalesCard locales={locales} setLocales={setLocales} />
            <AssetsCard
              brandColor={brandColor}
              setBrandColor={setBrandColor}
              agencyMode={agencyMode}
              setAgencyMode={setAgencyMode}
            />
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <VoicePreview
              tones={tones}
              ownerFace={ownerFace}
              voiceLine={voiceLine}
              dos={dos}
              eeatCount={Object.values(eeat).filter((v) => v.trim().length > 12).length}
              brandColor={brandColor}
            />
          </aside>
        </div>
      </div>

      <StickyBar onSave={onSave} onReset={onReset} />
    </WorkspaceShell>
  );
}

/* ---------------- header ---------------- */

function Header() {
  return (
    <header className="space-y-2">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Northbound Coffee Roasters · northboundcoffee.com
      </div>
      <h1 className="text-3xl font-medium text-ink-900">Brand kit</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Your business's voice, vocabulary, languages and brand assets — these
        guide every generated piece and the quality-gate (brand-vocab lint +
        E-E-A-T).
      </p>
    </header>
  );
}

function SideNav() {
  return (
    <nav className="sticky top-20 hidden h-fit space-y-1 lg:block">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="block rounded-md border border-transparent px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-line hover:bg-surface-sunken hover:text-ink-700"
        >
          {s.label}
        </a>
      ))}
      <div className="mt-3 rounded-md border border-line bg-surface-sunken/50 px-2.5 py-2 text-[11px] text-muted-foreground">
        Guides every generated piece and the quality-gate.
      </div>
    </nav>
  );
}

/* ---------------- identity ---------------- */

function IdentityCard({
  segment,
  setSegment,
  scale,
  ornament,
}: {
  segment: Segment;
  setSegment: (s: Segment) => void;
  scale: string;
  ornament: string;
}) {
  return (
    <Card id="identity" className="p-5">
      <CardHead title="Identity & segment" hint="Detected from your site — confirm or adjust." />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Segment
        </label>
        <div className="relative">
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className="appearance-none rounded-md border border-line bg-surface px-3 py-1.5 pr-8 text-sm text-ink-900 hover:border-ink-700/30 focus:outline-none focus:ring-2 focus:ring-brand-700/30"
          >
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <StatusChip tone="neutral">{scale}</StatusChip>
        <span
          className="group relative inline-flex cursor-help items-center gap-1.5 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-2 py-1 text-[11px] font-medium text-[color:var(--accent-gold)]"
          title="Archetype: founder-led; voice anchored to a real face."
        >
          Founder-led{" "}
          <span className="font-mono-num text-[10px] opacity-70">B2</span>
        </span>
      </div>
      <div className="mt-3 font-mono-num text-[11px] text-muted-foreground">
        {ornament}
      </div>
    </Card>
  );
}

/* ---------------- voice ---------------- */

function VoiceCard(props: {
  tones: string[];
  setTones: (v: string[]) => void;
  voiceLine: string;
  setVoiceLine: (v: string) => void;
  dos: string[];
  setDos: (v: string[]) => void;
  donts: string[];
  setDonts: (v: string[]) => void;
  stopWords: string[];
  setStopWords: (v: string[]) => void;
  petPhrases: string[];
  setPetPhrases: (v: string[]) => void;
  glossary: Glossary[];
  setGlossary: (v: Glossary[]) => void;
  eeatOpen: boolean;
  setEeatOpen: (v: boolean) => void;
  eeat: { credentials: string; opinions: string; stats: string; founder: string };
  setEeat: (v: {
    credentials: string;
    opinions: string;
    stats: string;
    founder: string;
  }) => void;
}) {
  const {
    tones,
    setTones,
    voiceLine,
    setVoiceLine,
    dos,
    setDos,
    donts,
    setDonts,
    stopWords,
    setStopWords,
    petPhrases,
    setPetPhrases,
    glossary,
    setGlossary,
    eeatOpen,
    setEeatOpen,
    eeat,
    setEeat,
  } = props;

  const toggleTone = (t: string) =>
    setTones(tones.includes(t) ? tones.filter((x) => x !== t) : [...tones, t]);

  const addGlossary = () =>
    setGlossary([
      ...glossary,
      { id: `g${Date.now()}`, term: "", preferred: "" },
    ]);

  return (
    <Card id="voice" className="p-5">
      <CardHead
        title="Brand voice"
        hint="The centerpiece — tone, do/don't and a glossary the generator and quality-gate both read."
      />

      <div className="mt-4 space-y-5">
        <div>
          <Label>Tone</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TONE_OPTIONS.map((t) => (
              <Chip key={t} active={tones.includes(t)} onClick={() => toggleTone(t)}>
                {t}
              </Chip>
            ))}
            <Chip onClick={() => toast.info("Custom tone — opens picker")}>
              <Plus className="size-3" strokeWidth={2} /> custom
            </Chip>
          </div>
        </div>

        <div>
          <Label>Voice in one line</Label>
          <input
            value={voiceLine}
            onChange={(e) => setVoiceLine(e.target.value)}
            placeholder="One sentence anyone could repeat aloud."
            className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-brand-700/30"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChipListField
            label="Do"
            tone="brand"
            items={dos}
            setItems={setDos}
            placeholder="Add a do…"
          />
          <ChipListField
            label="Don't"
            tone="danger"
            items={donts}
            setItems={setDonts}
            placeholder="Add a don't…"
          />
        </div>

        <ChipListField
          label="Stop-words"
          tone="neutral"
          items={stopWords}
          setItems={setStopWords}
          placeholder="Add a stop-word…"
          helper="Blocked at generation."
        />
        <ChipListField
          label="Pet-phrase blocklist"
          tone="neutral"
          items={petPhrases}
          setItems={setPetPhrases}
          placeholder="Add a phrase…"
          helper="Enforced by the quality-gate."
        />

        <div>
          <Label>Brand vocabulary (glossary)</Label>
          <div className="mt-1.5 overflow-hidden rounded-md border border-line">
            <div className="grid grid-cols-[1fr_1fr_36px] gap-2 border-b border-line bg-surface-sunken px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <div>Term</div>
              <div>Preferred form</div>
              <div />
            </div>
            {glossary.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-[1fr_1fr_36px] items-center gap-2 border-b border-line px-3 py-1.5 last:border-b-0"
              >
                <input
                  value={g.term}
                  onChange={(e) =>
                    setGlossary(
                      glossary.map((x) =>
                        x.id === g.id ? { ...x, term: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="term"
                  className="rounded-sm bg-transparent px-1 py-0.5 font-mono-num text-xs text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-700/30"
                />
                <input
                  value={g.preferred}
                  onChange={(e) =>
                    setGlossary(
                      glossary.map((x) =>
                        x.id === g.id ? { ...x, preferred: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="preferred form"
                  className="rounded-sm bg-transparent px-1 py-0.5 font-mono-num text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-700/30"
                />
                <button
                  onClick={() =>
                    setGlossary(glossary.filter((x) => x.id !== g.id))
                  }
                  aria-label="Remove"
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-ink-700"
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addGlossary}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-700 hover:underline"
          >
            <Plus className="size-3" strokeWidth={2} /> Add term
          </button>
        </div>

        <div className="rounded-md border border-line bg-surface-sunken/40">
          <button
            onClick={() => setEeatOpen(!eeatOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="size-3.5 text-[color:var(--accent-gold)]"
                strokeWidth={1.75}
              />
              <span className="text-sm font-medium text-ink-900">E-E-A-T signals</span>
              <span className="text-[11px] text-muted-foreground">
                optional · strengthens trust scoring
              </span>
            </div>
            {eeatOpen ? (
              <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.75} />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.75} />
            )}
          </button>
          {eeatOpen ? (
            <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
              <Textarea
                label="Credentials"
                value={eeat.credentials}
                onChange={(v) => setEeat({ ...eeat, credentials: v })}
              />
              <Textarea
                label="Notable opinions"
                value={eeat.opinions}
                onChange={(v) => setEeat({ ...eeat, opinions: v })}
              />
              <Textarea
                label="Stats we can cite"
                value={eeat.stats}
                onChange={(v) => setEeat({ ...eeat, stats: v })}
              />
              <Textarea
                label="Founder stories"
                value={eeat.founder}
                onChange={(v) => setEeat({ ...eeat, founder: v })}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/* ---------------- owner ---------------- */

function OwnerFaceCard({
  value,
  onChange,
}: {
  value: OwnerFace;
  onChange: (v: OwnerFace) => void;
}) {
  const opts: { id: OwnerFace; label: string; hint: string }[] = [
    {
      id: "yes",
      label: "Yes",
      hint: "First-person voice. Founder bylines, photos, quotes throughout.",
    },
    {
      id: "partial",
      label: "Partial",
      hint: "Brand voice with the owner appearing on flagship pieces only.",
    },
    {
      id: "no",
      label: "No",
      hint: "Pure brand voice. No founder bylines or personal stories.",
    },
  ];
  const active = opts.find((o) => o.id === value)!;
  return (
    <Card id="owner" className="p-5">
      <CardHead
        title="Owner as the face"
        hint="Should the founder/owner appear on flagship content?"
      />
      <div className="mt-4 inline-flex rounded-md border border-line bg-surface-sunken p-0.5">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-[6px] px-4 py-1.5 text-xs font-medium transition",
              value === o.id
                ? "bg-surface text-ink-900 shadow-[0_1px_0_rgba(20,24,31,0.04)]"
                : "text-muted-foreground hover:text-ink-700",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">{active.hint}</p>
    </Card>
  );
}

/* ---------------- locales ---------------- */

function LocalesCard({
  locales,
  setLocales,
}: {
  locales: Locale[];
  setLocales: (v: Locale[]) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const add = () => {
    if (!code.trim() || !name.trim()) return;
    setLocales([
      ...locales,
      { code: code.trim().toLowerCase(), name: name.trim(), primary: false },
    ]);
    setCode("");
    setName("");
  };

  const setPrimary = (c: string) =>
    setLocales(locales.map((l) => ({ ...l, primary: l.code === c })));

  const remove = (c: string) => {
    const next = locales.filter((l) => l.code !== c);
    if (!next.some((l) => l.primary) && next.length) next[0].primary = true;
    setLocales(next);
  };

  return (
    <Card id="locales" className="p-5">
      <CardHead
        title="Languages & markets"
        hint="We generate in each market's language; the primary leads."
      />
      <div className="mt-4 overflow-hidden rounded-md border border-line">
        <div className="grid grid-cols-[24px_1fr_80px_36px] gap-2 border-b border-line bg-surface-sunken px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <div />
          <div>Language</div>
          <div>Code</div>
          <div />
        </div>
        {locales.map((l) => (
          <div
            key={l.code}
            className="grid grid-cols-[24px_1fr_80px_36px] items-center gap-2 border-b border-line px-3 py-2 last:border-b-0"
          >
            <input
              type="radio"
              name="primary-locale"
              checked={l.primary}
              onChange={() => setPrimary(l.code)}
              className="size-3.5 accent-[color:var(--brand-700)]"
              aria-label={`Set ${l.name} as primary`}
            />
            <div className="flex items-center gap-2">
              <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-sm text-ink-900">{l.name}</span>
              {l.primary ? <StatusChip tone="live">Primary</StatusChip> : null}
            </div>
            <div className="font-mono-num text-xs text-muted-foreground">{l.code}</div>
            <button
              onClick={() => remove(l.code)}
              aria-label="Remove locale"
              className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-ink-700"
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Language (e.g. Français)"
          className="flex-1 min-w-[180px] rounded-md border border-line bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="code (fr)"
          className="w-24 rounded-md border border-line bg-surface px-3 py-1.5 font-mono-num text-xs uppercase focus:outline-none focus:ring-2 focus:ring-brand-700/30"
        />
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs hover:border-ink-700/30"
        >
          <Plus className="size-3" strokeWidth={2} /> Add language
        </button>
      </div>
    </Card>
  );
}

/* ---------------- assets ---------------- */

function AssetsCard({
  brandColor,
  setBrandColor,
  agencyMode,
  setAgencyMode,
}: {
  brandColor: string;
  setBrandColor: (v: string) => void;
  agencyMode: boolean;
  setAgencyMode: (v: boolean) => void;
}) {
  return (
    <Card id="assets" className="p-5">
      <CardHead
        title="Brand assets / White-label"
        hint="Logos and palette — used in generation and in agency client-facing reports."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <LogoSlot label="Logo · light" tone="light" />
        <LogoSlot label="Logo · dark" tone="dark" />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_minmax(0,1.2fr)]">
        <div>
          <Label>Brand color</Label>
          <div className="mt-1.5 inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5">
            <label
              className="size-7 cursor-pointer rounded-md border border-line"
              style={{ background: brandColor }}
            >
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="sr-only"
              />
            </label>
            <input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-24 bg-transparent font-mono-num text-xs uppercase text-ink-900 focus:outline-none"
            />
          </div>
          <div className="mt-3 inline-flex items-center gap-2">
            <button
              role="switch"
              aria-checked={agencyMode}
              onClick={() => setAgencyMode(!agencyMode)}
              className={cn(
                "relative h-5 w-9 rounded-full border border-line transition",
                agencyMode ? "bg-brand-700" : "bg-surface-sunken",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-surface shadow-sm transition-all",
                  agencyMode ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
            <span className="text-xs text-muted-foreground">White-label (agency)</span>
          </div>
          <p className="mt-2 max-w-xs text-[11px] text-muted-foreground">
            White-label — client-facing reports rebranded with these assets.
          </p>
        </div>

        <RebrandPreview brandColor={brandColor} />
      </div>
    </Card>
  );
}

function LogoSlot({ label, tone }: { label: string; tone: "light" | "dark" }) {
  const [filename, setFilename] = useState<string | null>(null);
  return (
    <div>
      <Label>{label}</Label>
      <label
        className={cn(
          "mt-1.5 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-line transition hover:border-ink-700/40",
          tone === "dark" ? "bg-ink-900 text-paper" : "bg-surface-sunken text-ink-700",
        )}
      >
        <input
          type="file"
          accept="image/svg+xml,image/png"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFilename(f.name);
              toast.success(`${f.name} attached — saves on “Save brand kit”.`);
            }
          }}
        />
        <Upload className="size-4" strokeWidth={1.5} />
        <span className="font-mono-num text-[11px]">
          {filename ?? "Drop SVG or PNG"}
        </span>
      </label>
    </div>
  );
}

function RebrandPreview({ brandColor }: { brandColor: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div
        className="flex items-center justify-between px-3 py-2 text-[11px] font-medium uppercase tracking-wider"
        style={{ background: brandColor, color: "#FAF8F4" }}
      >
        <span>Northbound — Monthly content report</span>
        <span className="font-mono-num text-[10px] opacity-80">JUN 2026</span>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {[
          ["Units published", "184"],
          ["Indexed", "1,284"],
          ["Avg position", "14.2"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-md border border-line bg-surface-sunken/40 p-2"
          >
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {k}
            </div>
            <div className="font-mono-num text-base text-ink-900">{v}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-line bg-surface-sunken/30 px-3 py-1.5 text-[10px] text-muted-foreground">
        Client never sees Postics — only your brand.
      </div>
    </div>
  );
}

/* ---------------- voice preview ---------------- */

function VoicePreview({
  tones,
  ownerFace,
  voiceLine,
  dos,
  eeatCount,
  brandColor,
}: {
  tones: string[];
  ownerFace: OwnerFace;
  voiceLine: string;
  dos: string[];
  eeatCount: number;
  brandColor: string;
}) {
  const blurb = useMemo(() => {
    const isPlayful = tones.includes("Playful");
    const isPremium = tones.includes("Premium");
    const isDirect = tones.includes("Direct");
    const isWarm = tones.includes("Warm");

    const opener =
      ownerFace === "yes"
        ? "I'm Maya, and this lot from Yirgacheffe is one I sourced last spring."
        : ownerFace === "partial"
          ? "Our Q-grader cupped this Yirgacheffe lot at 88 — here's what to expect."
          : "Yirgacheffe Konga, 250g — washed, single-origin, roasted Tuesday.";

    const middle = isPremium
      ? "Floral aromatics with a clean citrus finish; designed for pour-over."
      : isPlayful
        ? "Bright, floral, a little bit show-off — pour-over loves it."
        : isWarm
          ? "Floral, citrus-bright, and easy to brew well at home."
          : "Floral aromatics, citrus body, pour-over recommended.";

    const closer = isDirect
      ? "Brew at 1:16, 94°C."
      : dos[0]
        ? `${dos[0]} — that's the through-line.`
        : "Ships within 14 days of roast.";

    return `${opener} ${middle} ${closer}`;
  }, [tones, ownerFace, dos]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Eye className="size-3.5" strokeWidth={1.75} />
          Voice preview
        </div>
        <span
          className="inline-block size-3 rounded-full border border-line"
          style={{ background: brandColor }}
          aria-label="Brand color"
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-900">{blurb}</p>
      <div className="mt-3 text-[11px] italic text-muted-foreground">
        "{voiceLine}"
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-sunken px-2 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-brand-700">
          <Check className="size-3" strokeWidth={2} />
          brand vocab: clean
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 px-2 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-[color:var(--accent-gold)]">
          <ShieldCheck className="size-3" strokeWidth={2} />
          E-E-A-T: {eeatCount} signals
        </span>
      </div>
      <div className="mt-3 flex items-start gap-1.5 rounded-md border border-dashed border-line bg-surface-sunken/40 p-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 size-3 shrink-0" strokeWidth={1.75} />
        Preview updates live as you change tone, do/don't, and owner-as-face.
      </div>
    </Card>
  );
}

/* ---------------- sticky bar ---------------- */

function StickyBar({
  onSave,
  onReset,
}: {
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div className="pointer-events-auto flex w-full max-w-[1180px] items-center justify-between gap-4 rounded-xl border border-line bg-surface/90 px-4 py-2.5 shadow-[0_10px_30px_-10px_rgba(20,24,31,0.18)] backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="size-3.5 text-[color:var(--accent-gold)]"
            strokeWidth={1.75}
          />
          Changes guide every generated piece and the quality-gate.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-ink-700/30 hover:text-ink-700"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-medium text-[color:var(--primary-foreground)] hover:bg-brand-700/90"
          >
            Save brand kit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function CardHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-ink-900">{title}</div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition",
        active
          ? "border-brand-700/60 bg-brand-100 text-brand-700"
          : "border-line bg-surface text-ink-700 hover:border-ink-700/30",
      )}
    >
      {children}
    </button>
  );
}

function ChipListField({
  label,
  items,
  setItems,
  placeholder,
  helper,
  tone = "neutral",
}: {
  label: string;
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
  helper?: string;
  tone?: "brand" | "danger" | "neutral";
}) {
  const [v, setV] = useState("");
  const add = () => {
    const t = v.trim();
    if (!t || items.includes(t)) return;
    setItems([...items, t]);
    setV("");
  };
  const chipCls =
    tone === "brand"
      ? "border-brand-100 bg-brand-100/60 text-brand-700"
      : tone === "danger"
        ? "border-[#F1D2CE] bg-[#F7E2DF] text-[color:var(--danger)]"
        : "border-line bg-surface-sunken text-ink-700";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {helper ? (
          <span className="text-[10px] text-muted-foreground">{helper}</span>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-md border border-line bg-surface p-2">
        {items.map((t) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
              chipCls,
            )}
          >
            {t}
            <button
              onClick={() => setItems(items.filter((x) => x !== t))}
              aria-label={`Remove ${t}`}
              className="opacity-60 hover:opacity-100"
            >
              <X className="size-3" strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 bg-transparent px-1 text-xs text-ink-900 placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </div>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full resize-none rounded-md border border-line bg-surface px-2.5 py-2 text-xs text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-700/30"
      />
    </div>
  );
}