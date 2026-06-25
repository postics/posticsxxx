import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  Plug,
  ShoppingBag,
  Webhook,
  Plus,
  Sparkle,
  Coffee,
  MapPin,
  Cpu,
  FileText,
  Image as ImageIcon,
  Video,
  Share2,
  Bell,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useLanguage } from "@/features/shared/PreferencesControls";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
});

type Connector = {
  id: string;
  name: { en: string; ru: string };
  body: { en: string; ru: string };
  meta?: string;
  icon: typeof Plug;
  status: "available" | "soon";
};

type Template = {
  id: string;
  name: { en: string; ru: string };
  body: { en: string; ru: string };
  meta: string;
  icon: typeof Coffee;
  chips: string[];
  recommended?: boolean;
  soon?: boolean;
};

const CONNECTORS: Connector[] = [
  {
    id: "wp",
    name: { en: "WordPress / WooCommerce", ru: "WordPress / WooCommerce" },
    body: {
      en: "Connect your existing WordPress/WooCommerce. Site publishing is the guaranteed channel.",
      ru: "Подключите существующий WordPress/WooCommerce. Публикация на сайте — гарантированный канал.",
    },
    meta: "Postics Connector plugin · publishes posts now · WooCommerce products coming (v0.3)",
    icon: Plug,
    status: "available",
  },
  {
    id: "shopify",
    name: { en: "Shopify", ru: "Shopify" },
    body: {
      en: "Native Shopify app for product copy, articles, and theme blocks.",
      ru: "Нативное приложение Shopify для описаний товаров, статей и блоков темы.",
    },
    meta: "Coming · M1+",
    icon: ShoppingBag,
    status: "soon",
  },
  {
    id: "webhook",
    name: { en: "Custom API / Webhook", ru: "Custom API / Webhook" },
    body: {
      en: "Bring any CMS or headless store via a signed webhook.",
      ru: "Подключите любую CMS или headless-магазин через подписанный webhook.",
    },
    meta: "Coming · M1+",
    icon: Webhook,
    status: "soon",
  },
];

const TEMPLATES: Template[] = [
  {
    id: "woo",
    name: { en: "WooCommerce store (flagship)", ru: "Магазин WooCommerce (флагман)" },
    body: {
      en: "Product descriptions at scale + commercial articles.",
      ru: "Массовые описания товаров и коммерческие статьи.",
    },
    meta: "wholesale wedge · localizes to your markets",
    icon: ShoppingBag,
    chips: ["Product description", "Article", "Social"],
    recommended: true,
  },
  {
    id: "coffee",
    name: { en: "Coffee & specialty e-commerce", ru: "Кофе и specialty-электронная коммерция" },
    body: {
      en: "Modeled on Northbound Coffee Roasters.",
      ru: "Построено по образцу Northbound Coffee Roasters.",
    },
    meta: "12 units/mo · 3 pillars",
    icon: Coffee,
    chips: ["Article", "Product description", "Social"],
  },
  {
    id: "service",
    name: { en: "Local service business", ru: "Локальный сервисный бизнес" },
    body: {
      en: "Service pages, local-intent articles, review-ready trust content.",
      ru: "Сервисные страницы, локальные статьи и контент, готовый к отзывам.",
    },
    meta: "8 units/mo · 4 pillars",
    icon: MapPin,
    chips: ["Article", "Social"],
  },
  {
    id: "saas",
    name: { en: "SaaS / software", ru: "SaaS / ПО" },
    body: {
      en: "Comparison pages, feature articles, changelog social.",
      ru: "Сравнительные страницы, статьи о фичах, чейнджлог в соцсети.",
    },
    meta: "10 units/mo · 4 pillars",
    icon: Cpu,
    chips: ["Article", "Social"],
  },
  {
    id: "agency-leadgen",
    name: { en: "Agency lead-gen site", ru: "Сайт агентства · lead-gen" },
    body: {
      en: "Case-study driven articles with conversion-led landing copy.",
      ru: "Кейсы и статьи с конверсионными лендингами.",
    },
    meta: "Coming · M1+",
    icon: FileText,
    chips: ["Article", "Social"],
    soon: true,
  },
  {
    id: "marketplace-seller",
    name: { en: "Marketplace seller (Amazon/Etsy)", ru: "Продавец на маркетплейсе (Amazon/Etsy)" },
    body: {
      en: "Listings, A+ content, off-platform articles.",
      ru: "Листинги, A+ контент, внешние статьи.",
    },
    meta: "Coming · M1+",
    icon: ShoppingBag,
    chips: ["Product description", "Social"],
    soon: true,
  },
];

const CHIP_ICON: Record<string, typeof FileText> = {
  Article: FileText,
  "Product description": FileText,
  Social: Share2,
  "Product photo": ImageIcon,
  "Product video": Video,
};

const COPY = {
  en: {
    h1: "Marketplace",
    sub: "Connect your site, then start from a template built for your kind of business.",
    section1Eyebrow: "Connectors",
    section1Title: "Connect your site or CMS",
    section1Hint:
      "Site = guaranteed publishing. Social channels stay best-effort behind a pending platform audit. Or just export — no connection needed.",
    available: "Available",
    soon: "Coming · M1+",
    connect: "Connect",
    notify: "Notify me",
    requestTitle: "Request a connector",
    requestBody: "Tell us your stack. We prioritize by demand.",
    section2Eyebrow: "Vertical templates",
    section2Title: "Start from a template built for your business",
    section2Hint:
      "Each template installs a strategy + content-mix preset. AI-only with the automatic quality-gate is the default; human review is an Advanced/Premium add-on.",
    install: "Install template",
    recommended: "Recommended",
    searchPh: "Search templates…",
    noResults: "No templates match that search.",
    clear: "Clear search",
    installed: "Template installed",
    installedDesc: "Preset applied to your project. Open Strategy & Plan to review.",
    soonChip: "soon",
  },
  ru: {
    h1: "Маркетплейс",
    sub: "Подключите сайт, затем начните с шаблона под ваш тип бизнеса.",
    section1Eyebrow: "Коннекторы",
    section1Title: "Подключите сайт или CMS",
    section1Hint:
      "Сайт = гарантированная публикация. Соцсети остаются best-effort до прохождения аудита платформ. Или просто экспорт — без подключения.",
    available: "Доступно",
    soon: "Скоро · M1+",
    connect: "Подключить",
    notify: "Сообщить",
    requestTitle: "Запросить коннектор",
    requestBody: "Расскажите про свой стек. Приоритизируем по спросу.",
    section2Eyebrow: "Вертикальные шаблоны",
    section2Title: "Стартуйте с шаблона под ваш бизнес",
    section2Hint:
      "Каждый шаблон устанавливает пресет стратегии и контент-микса. По умолчанию — только AI с автопроверкой качества; ревью эксперта — опция Advanced/Premium.",
    install: "Установить шаблон",
    recommended: "Рекомендуем",
    searchPh: "Поиск шаблонов…",
    noResults: "Ничего не найдено по запросу.",
    clear: "Сбросить поиск",
    installed: "Шаблон установлен",
    installedDesc: "Пресет применён к проекту. Откройте «Стратегию и план», чтобы проверить.",
    soonChip: "скоро",
  },
};

function MarketplacePage() {
  const [lang] = useLanguage();
  const navigate = useNavigate();
  const key = (lang === "ru" ? "ru" : "en") as "en" | "ru";
  const t = COPY[key];
  const [query, setQuery] = useState("");
  const [installed, setInstalled] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (tpl) =>
        tpl.name[key].toLowerCase().includes(q) ||
        tpl.body[key].toLowerCase().includes(q) ||
        tpl.chips.some((c) => c.toLowerCase().includes(q)),
    );
  }, [query, key]);

  function handleInstall(tpl: Template) {
    setInstalled(tpl.id);
    toast.success(t.installed, { description: `${tpl.name[key]} · ${t.installedDesc}` });
  }

  return (
    <WorkspaceShell active="marketplace" breadcrumb={[{ label: t.h1 }]}>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-8 py-8">
        {/* Header */}
        <header className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.section1Eyebrow} · {t.section2Eyebrow}
          </div>
          <h1 className="font-display text-3xl text-ink-900">{t.h1}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t.sub}</p>
        </header>

        {/* Section 1 — Connectors */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                01 · {t.section1Eyebrow}
              </div>
              <h2 className="font-display text-xl text-ink-900">{t.section1Title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CONNECTORS.map((c) => (
              <ConnectorCard
                key={c.id}
                c={c}
                t={t}
                lang={key}
                onConnect={() => {
                  if (c.status === "available") {
                    navigate({ to: "/settings" });
                  } else {
                    toast(t.notify, { description: c.name[key] });
                  }
                }}
              />
            ))}
            <RequestCard t={t} />
          </div>

          <p className="border-t border-line pt-4 text-xs text-muted-foreground">
            {t.section1Hint}
          </p>
        </section>

        {/* Section 2 — Templates */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                02 · {t.section2Eyebrow}
              </div>
              <h2 className="font-display text-xl text-ink-900">{t.section2Title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.section2Hint}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
              <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPh}
                className="w-56 bg-transparent text-ink-900 outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="grid place-items-center px-8 py-16 text-center">
              <div className="space-y-3">
                <div className="font-display text-base text-ink-900">{t.noResults}</div>
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:border-ink-700/30"
                >
                  {t.clear}
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  t={t}
                  lang={key}
                  isInstalled={installed === tpl.id}
                  onInstall={() => handleInstall(tpl)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}

function ConnectorCard({
  c,
  t,
  lang,
  onConnect,
}: {
  c: Connector;
  t: (typeof COPY)["en"];
  lang: "en" | "ru";
  onConnect: () => void;
}) {
  const Icon = c.icon;
  const isAvailable = c.status === "available";
  return (
    <Card
      className={cn(
        "flex flex-col p-5 transition-shadow hover-lift",
        isAvailable ? "shadow-elev-sm hover:border-ink-700/30" : "opacity-90",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "grid size-9 place-items-center rounded-md",
            isAvailable
              ? "bg-brand-100 text-brand-700"
              : "bg-surface-sunken text-muted-foreground",
          )}
        >
          <Icon className="size-4" strokeWidth={1.5} />
        </div>
        {isAvailable ? (
          <StatusChip tone="live">{t.available}</StatusChip>
        ) : (
          <StatusChip tone="neutral">{t.soon}</StatusChip>
        )}
      </div>

      <div className="mt-4 flex-1">
        <div className="font-display text-base text-ink-900">{c.name[lang]}</div>
        <p className="mt-1 text-sm text-muted-foreground">{c.body[lang]}</p>
        {c.meta ? (
          <div className="mt-3 font-mono-num text-[11px] text-muted-foreground">{c.meta}</div>
        ) : null}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {isAvailable ? (
          <button
            onClick={onConnect}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm text-paper hover:bg-ink-700"
          >
            {t.connect} <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-700 hover:border-ink-700/30"
          >
            <Bell className="size-3.5" strokeWidth={1.75} /> {t.notify}
          </button>
        )}
      </div>
    </Card>
  );
}

function RequestCard({ t }: { t: (typeof COPY)["en"] }) {
  return (
    <Card className="flex flex-col p-5 border-dashed bg-surface-sunken/40">
      <div className="grid size-9 place-items-center rounded-md border border-dashed border-line text-muted-foreground">
        <Plus className="size-4" strokeWidth={1.5} />
      </div>
      <div className="mt-4 flex-1">
        <div className="font-display text-base text-ink-900">{t.requestTitle}</div>
        <p className="mt-1 text-sm text-muted-foreground">{t.requestBody}</p>
      </div>
      <div className="mt-4 border-t border-dashed border-line pt-4">
        <button
          onClick={() => toast(t.requestTitle, { description: "Stub form." })}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-700 hover:border-ink-700/30"
        >
          {t.requestTitle} <ArrowRight className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </Card>
  );
}

function TemplateCard({
  tpl,
  t,
  lang,
  isInstalled,
  onInstall,
}: {
  tpl: Template;
  t: (typeof COPY)["en"];
  lang: "en" | "ru";
  isInstalled: boolean;
  onInstall: () => void;
}) {
  const Icon = tpl.icon;
  return (
    <Card
      className={cn(
        "flex flex-col p-5 hover-lift",
        tpl.recommended
          ? "border-[color:var(--accent-gold-soft)] bg-gradient-to-br from-[color:var(--accent-gold-soft)]/25 to-surface"
          : tpl.soon
            ? "opacity-80"
            : "shadow-elev-sm hover:border-ink-700/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "grid size-9 place-items-center rounded-md",
            tpl.recommended
              ? "bg-[color:var(--accent-gold-soft)] text-[color:var(--accent-gold)]"
              : tpl.soon
                ? "bg-surface-sunken text-muted-foreground"
                : "bg-brand-100 text-brand-700",
          )}
        >
          <Icon className="size-4" strokeWidth={1.5} />
        </div>
        {tpl.recommended ? (
          <StatusChip tone="gold">
            <Sparkle className="size-2.5" strokeWidth={2.5} /> {t.recommended}
          </StatusChip>
        ) : tpl.soon ? (
          <StatusChip tone="neutral">{t.soon}</StatusChip>
        ) : null}
      </div>

      <div className="mt-4 flex-1">
        <div className="font-display text-base text-ink-900">{tpl.name[lang]}</div>
        <p className="mt-1 text-sm text-muted-foreground">{tpl.body[lang]}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tpl.chips.map((chip) => {
          const ChipIcon = CHIP_ICON[chip] ?? FileText;
          const isSoonChip = chip === "Product photo" || chip === "Product video";
          return (
            <span
              key={chip}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                isSoonChip
                  ? "border-line bg-surface-sunken text-muted-foreground"
                  : "border-line bg-surface text-ink-700",
              )}
            >
              <ChipIcon className="size-3" strokeWidth={1.5} />
              {chip}
              {isSoonChip ? (
                <span className="font-mono-num text-[10px] text-muted-foreground">
                  · {t.soonChip}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="mt-3 font-mono-num text-[11px] text-muted-foreground">{tpl.meta}</div>

      <div className="mt-4 border-t border-line pt-4">
        <button
          onClick={onInstall}
          disabled={tpl.soon}
          className={cn(
            "inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
            tpl.soon
              ? "cursor-not-allowed border border-line bg-surface text-muted-foreground"
              : tpl.recommended
                ? "bg-ink-900 text-paper hover:bg-ink-700"
                : "border border-line bg-surface text-ink-700 hover:border-ink-700/30",
          )}
        >
          {isInstalled ? (
            <>
              <Check className="size-3.5" strokeWidth={2} /> {t.installed}
            </>
          ) : (
            <>
              {t.install}
              {!tpl.soon ? <ArrowRight className="size-3.5" strokeWidth={1.75} /> : null}
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
