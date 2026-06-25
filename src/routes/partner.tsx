import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  Search,
  ArrowRight,
  Link2,
  Wallet,
  Share2,
  Plug,
  Coins,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/features/shell/WorkspaceShell";
import { Card, StatusChip } from "@/features/shared/primitives";
import { useLanguage } from "@/features/shared/PreferencesControls";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Partner program — Postics" }] }),
  component: PartnerPage,
});

type RefStatus = "active" | "trial" | "pending" | "churned";
type Plan = "Starter" | "Growth" | "Advanced" | "Premium" | "Agency";
type CMS = "WordPress" | "WooCommerce" | "Shopify" | "Custom";

type Referral = {
  id: string;
  name: string;
  domain: string;
  cms: CMS;
  plan: Plan;
  status: RefStatus;
  mrr: number;
  share: number;
  joined: string;
  nextPayout: string;
};

const PLAN_PRICE: Record<Plan, number> = {
  Starter: 199,
  Growth: 449,
  Advanced: 899,
  Premium: 999,
  Agency: 999,
};

const REFERRALS: Referral[] = [
  { id: "r1", name: "Northbound Coffee Roasters", domain: "northbound.coffee", cms: "WooCommerce", plan: "Premium", status: "active", mrr: 999, share: 280, joined: "Feb 2026", nextPayout: "Jul 1" },
  { id: "r2", name: "Holt & Park Goods", domain: "holtpark.co", cms: "WooCommerce", plan: "Growth", status: "active", mrr: 449, share: 126, joined: "Mar 2026", nextPayout: "Jul 1" },
  { id: "r3", name: "Marens Skincare", domain: "marens-skin.com", cms: "Shopify", plan: "Advanced", status: "pending", mrr: 899, share: 252, joined: "Jun 2026", nextPayout: "—" },
  { id: "r4", name: "Cedar Legal Group", domain: "cedarlegal.com", cms: "WordPress", plan: "Starter", status: "active", mrr: 199, share: 56, joined: "Apr 2026", nextPayout: "Jul 1" },
  { id: "r5", name: "Lattice Ops (SaaS)", domain: "lattice-ops.io", cms: "WordPress", plan: "Growth", status: "active", mrr: 449, share: 126, joined: "Jan 2026", nextPayout: "Jul 1" },
  { id: "r6", name: "Quill & Quire Studio", domain: "quillquire.studio", cms: "WordPress", plan: "Starter", status: "trial", mrr: 0, share: 0, joined: "Jun 2026", nextPayout: "—" },
  { id: "r7", name: "Verity Capital", domain: "verity.capital", cms: "WordPress", plan: "Advanced", status: "active", mrr: 899, share: 252, joined: "Dec 2025", nextPayout: "Jul 1" },
  { id: "r8", name: "Northwall Roasters", domain: "northwall.coffee", cms: "WooCommerce", plan: "Growth", status: "churned", mrr: 0, share: 0, joined: "Sep 2025", nextPayout: "—" },
];

type Payout = {
  period: string;
  amount: number;
  status: "paid" | "scheduled" | "processing";
  ref: string;
};

const PAYOUTS: Payout[] = [
  { period: "Jun 2026", amount: 1142, status: "scheduled", ref: "PO-2026-06-0142" },
  { period: "May 2026", amount: 1086, status: "paid", ref: "PO-2026-05-0118" },
  { period: "Apr 2026", amount: 944, status: "paid", ref: "PO-2026-04-0094" },
  { period: "Mar 2026", amount: 812, status: "paid", ref: "PO-2026-03-0078" },
  { period: "Feb 2026", amount: 686, status: "paid", ref: "PO-2026-02-0061" },
];

const COPY = {
  en: {
    h1: "Partner program",
    sub: "Earn recurring revenue for every site you bring to Postics.",
    tierEyebrow: "Tier status",
    tierLabel: "Tier: Partner",
    affiliate: "Affiliate · 25%",
    partner: "Partner · 28%",
    lead: "Lead · 30%",
    progress: "8 / 12 active clients to reach Lead (30%)",
    activeClients: "Active referred clients",
    monthlyShare: "Recurring monthly share",
    lifetime: "Lifetime earned",
    sampleNote: "Sample data — your actual referrals and payouts will appear here.",
    linkEyebrow: "Referral link & tools",
    linkLabel: "Your referral link",
    code: "Referral code",
    copy: "Copy",
    copied: "Copied to clipboard",
    assets: "Download assets",
    attribution: "View attribution",
    linkNote: "30-day attribution · recurring share paid monthly while the client stays subscribed.",
    refsEyebrow: "Referred clients",
    searchPh: "Search clients or domains…",
    statusAll: "All",
    statusActive: "Active",
    statusTrial: "Trial",
    statusPending: "Pending",
    statusChurned: "Churned",
    export: "Export CSV",
    th: { client: "Client", site: "Site", plan: "Plan", status: "Status", mrr: "MRR", share: "Your share", joined: "Joined", next: "Next payout" },
    totals: "totals",
    totalsLine: (n: number, mrr: string, share: string) => `${n} clients · MRR ${mrr} · your monthly share ${share}`,
    cmsSoon: "Shopify · soon",
    emptyTitle: "No referrals yet",
    emptyBody: "Share your link to start earning recurring revenue.",
    payoutsEyebrow: "Payouts",
    payoutMethod: "Payout method",
    stripe: "Stripe Connect",
    setupPayout: "Set up payout",
    payoutsNote: "Payouts run monthly · minimum $50 · paid in USD.",
    pTh: { period: "Period", amount: "Amount", pstatus: "Status", ref: "Reference" },
    paid: "Paid",
    scheduled: "Scheduled",
    processing: "Processing",
    howEyebrow: "How it works",
    step1: "Share your link",
    step2: "They connect their existing site to Postics",
    step3: "You earn 25–30% recurring, every month",
    howNote: "We connect to the client's existing site on their CMS — Postics never builds or hosts sites.",
  },
  ru: {
    h1: "Партнёрская программа",
    sub: "Получайте регулярный доход за каждого приведённого клиента Postics.",
    tierEyebrow: "Статус уровня",
    tierLabel: "Уровень: Partner",
    affiliate: "Affiliate · 25%",
    partner: "Partner · 28%",
    lead: "Lead · 30%",
    progress: "8 / 12 активных клиентов до уровня Lead (30%)",
    activeClients: "Активные клиенты",
    monthlyShare: "Регулярные выплаты в месяц",
    lifetime: "Заработано всего",
    sampleNote: "Демо-данные — здесь появятся ваши реальные рефералы и выплаты.",
    linkEyebrow: "Реферальная ссылка и материалы",
    linkLabel: "Ваша реферальная ссылка",
    code: "Реферальный код",
    copy: "Копировать",
    copied: "Скопировано",
    assets: "Скачать материалы",
    attribution: "Атрибуция",
    linkNote: "Атрибуция 30 дней · выплаты ежемесячно, пока клиент подписан.",
    refsEyebrow: "Приведённые клиенты",
    searchPh: "Поиск клиентов или доменов…",
    statusAll: "Все",
    statusActive: "Активные",
    statusTrial: "Триал",
    statusPending: "Ожидание",
    statusChurned: "Ушли",
    export: "Экспорт CSV",
    th: { client: "Клиент", site: "Сайт", plan: "Тариф", status: "Статус", mrr: "MRR", share: "Ваша доля", joined: "С нами", next: "След. выплата" },
    totals: "итого",
    totalsLine: (n: number, mrr: string, share: string) => `${n} клиентов · MRR ${mrr} · ваша доля ${share}/мес`,
    cmsSoon: "Shopify · скоро",
    emptyTitle: "Пока нет рефералов",
    emptyBody: "Поделитесь ссылкой, чтобы начать зарабатывать.",
    payoutsEyebrow: "Выплаты",
    payoutMethod: "Метод выплаты",
    stripe: "Stripe Connect",
    setupPayout: "Настроить выплаты",
    payoutsNote: "Выплаты ежемесячно · минимум $50 · в USD.",
    pTh: { period: "Период", amount: "Сумма", pstatus: "Статус", ref: "Референс" },
    paid: "Выплачено",
    scheduled: "Запланировано",
    processing: "В обработке",
    howEyebrow: "Как это работает",
    step1: "Поделитесь ссылкой",
    step2: "Клиент подключает свой сайт к Postics",
    step3: "Получаете 25–30% регулярно, каждый месяц",
    howNote: "Мы подключаемся к существующему сайту клиента на его CMS — Postics не создаёт и не хостит сайты.",
  },
};

const fmtMoney = (n: number) =>
  n === 0 ? "—" : `$${n.toLocaleString("en-US")}`;

function PartnerPage() {
  const [lang] = useLanguage();
  const key = (lang === "ru" ? "ru" : "en") as "en" | "ru";
  const t = COPY[key];

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RefStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REFERRALS.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q);
    });
  }, [query, statusFilter]);

  const totals = useMemo(() => {
    const active = REFERRALS.filter((r) => r.status === "active");
    return {
      count: active.length,
      mrr: active.reduce((s, r) => s + r.mrr, 0),
      share: active.reduce((s, r) => s + r.share, 0),
    };
  }, []);

  const refLink = "postics.io/r/northbound-partners";
  const refCode = "NB-PARTNER";

  function copyLink() {
    navigator.clipboard?.writeText(`https://${refLink}`).catch(() => {});
    toast.success(t.copied, { description: refLink });
  }

  function copyCode() {
    navigator.clipboard?.writeText(refCode).catch(() => {});
    toast.success(t.copied, { description: refCode });
  }

  const tierProgress = (totals.count / 12) * 100;

  return (
    <WorkspaceShell active="partner" breadcrumb={[{ label: t.h1, to: "/partner" }]}>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-8 py-8">
        {/* Header */}
        <header className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.tierEyebrow}
          </div>
          <h1 className="font-display text-3xl text-ink-900">{t.h1}</h1>
          <p className="text-sm text-muted-foreground">{t.sub}</p>
        </header>

        {/* Tier strip */}
        <Card className="p-5 space-y-5 shadow-elev-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusChip tone="gold">{t.tierLabel}</StatusChip>
              <span className="font-mono-num text-[11px] text-muted-foreground">
                {t.progress}
              </span>
            </div>
            <span className="font-mono-num text-[11px] text-muted-foreground">
              {t.sampleNote}
            </span>
          </div>

          {/* Ladder */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <TierStep label={t.affiliate} active={false} done />
              <TierStep label={t.partner} active />
              <TierStep label={t.lead} active={false} />
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-brand-700 transition-all"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Tile label={t.activeClients} value={String(totals.count)} />
            <Tile label={t.monthlyShare} value={fmtMoney(totals.share)} />
            <Tile label={t.lifetime} value="$9,860" />
          </div>
        </Card>

        {/* Referral link */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.linkEyebrow}
            </div>
            <StatusChip tone="neutral">
              <Link2 className="size-2.5" strokeWidth={2.5} /> 30d
            </StatusChip>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 min-w-[280px] items-center gap-2 rounded-lg border border-line bg-surface-sunken/40 px-3 py-2">
              <Link2 className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="flex-1 truncate font-mono-num text-sm text-ink-900">{refLink}</span>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-700 hover:border-ink-700/30"
              >
                <Copy className="size-3" strokeWidth={1.75} /> {t.copy}
              </button>
            </div>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs hover:border-ink-700/30"
            >
              <span className="text-muted-foreground">{t.code}</span>
              <span className="font-mono-num text-ink-900">{refCode}</span>
              <Copy className="size-3 text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => toast(t.assets, { description: "Stub download" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-700 hover:border-ink-700/30"
            >
              <Download className="size-3.5" strokeWidth={1.75} /> {t.assets}
            </button>
            <button
              onClick={() => toast(t.attribution, { description: "30-day attribution window" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-700 hover:border-ink-700/30"
            >
              <Share2 className="size-3.5" strokeWidth={1.75} /> {t.attribution}
            </button>
          </div>

          <p className="border-t border-line pt-3 text-xs text-muted-foreground">{t.linkNote}</p>
        </Card>

        {/* Referrals table */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t.refsEyebrow}
              </div>
              <span className="font-mono-num text-[11px] text-muted-foreground">
                {filtered.length}/{REFERRALS.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
                <Search className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPh}
                  className="w-48 bg-transparent text-ink-900 outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex rounded-lg border border-line bg-surface p-0.5 text-xs">
                {([
                  ["all", t.statusAll],
                  ["active", t.statusActive],
                  ["trial", t.statusTrial],
                  ["pending", t.statusPending],
                  ["churned", t.statusChurned],
                ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setStatusFilter(k as "all" | RefStatus)}
                    className={cn(
                      "rounded-md px-2.5 py-1 transition-colors",
                      statusFilter === k
                        ? "bg-ink-900 text-paper"
                        : "text-ink-700 hover:bg-surface-sunken",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => toast(t.export, { description: `${filtered.length} rows` })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-700 hover:border-ink-700/30"
              >
                <Download className="size-3.5" strokeWidth={1.75} /> {t.export}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center px-8 py-16 text-center">
              <div className="space-y-2">
                <div className="font-display text-base text-ink-900">{t.emptyTitle}</div>
                <p className="text-sm text-muted-foreground">{t.emptyBody}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-sunken/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.client}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.site}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.plan}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.status}</th>
                    <th className="px-4 py-2.5 text-right font-medium">{t.th.mrr}</th>
                    <th className="px-4 py-2.5 text-right font-medium">{t.th.share}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.joined}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t.th.next}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-line/60 transition-colors hover:bg-surface-sunken/30"
                    >
                      <td className="px-4 py-3 text-ink-900">{r.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono-num text-xs text-ink-700">{r.domain}</span>
                          <CmsChip cms={r.cms} soonLabel={t.cmsSoon} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge plan={r.plan} />
                      </td>
                      <td className="px-4 py-3">
                        <RefStatusChip status={r.status} t={t} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono-num text-ink-900">
                        {fmtMoney(r.mrr)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-num text-ink-900">
                        {fmtMoney(r.share)}
                      </td>
                      <td className="px-4 py-3 font-mono-num text-xs text-muted-foreground">
                        {r.joined}
                      </td>
                      <td className="px-4 py-3 font-mono-num text-xs text-muted-foreground">
                        {r.nextPayout}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-surface-sunken/60">
                    <td className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.totals}
                    </td>
                    <td colSpan={3} />
                    <td className="px-4 py-3 text-right font-mono-num text-ink-900">
                      {fmtMoney(totals.mrr)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-num text-ink-900">
                      {fmtMoney(totals.share)}
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-xs text-muted-foreground">
                      {t.totalsLine(totals.count, fmtMoney(totals.mrr), fmtMoney(totals.share))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Payouts */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t.payoutsEyebrow}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunken/40 px-2 py-0.5 text-[11px]">
                <Wallet className="size-3 text-brand-700" strokeWidth={1.75} />
                <span className="text-muted-foreground">{t.payoutMethod}:</span>
                <span className="font-mono-num text-ink-900">{t.stripe}</span>
              </span>
            </div>
            <button
              onClick={() => toast(t.setupPayout, { description: "Stub Stripe Connect flow" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-700 hover:border-ink-700/30"
            >
              {t.setupPayout} <ArrowRight className="size-3" strokeWidth={1.75} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">{t.pTh.period}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t.pTh.amount}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t.pTh.pstatus}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t.pTh.ref}</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((p) => (
                  <tr key={p.ref} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-3 text-ink-900">{p.period}</td>
                    <td className="px-4 py-3 text-right font-mono-num text-ink-900">
                      {fmtMoney(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <PayoutStatusChip status={p.status} t={t} />
                    </td>
                    <td className="px-4 py-3 font-mono-num text-xs text-muted-foreground">
                      {p.ref}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">{t.payoutsNote}</p>
        </Card>

        {/* How it works */}
        <Card className="p-5 space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.howEyebrow}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Step n={1} icon={Share2} label={t.step1} />
            <Step n={2} icon={Plug} label={t.step2} />
            <Step n={3} icon={Coins} label={t.step3} />
          </div>
          <p className="border-t border-line pt-3 text-xs text-muted-foreground">{t.howNote}</p>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

function TierStep({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs",
        active
          ? "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/40 text-[color:var(--accent-gold)]"
          : done
            ? "border-line bg-surface text-ink-700"
            : "border-dashed border-line bg-surface-sunken/40 text-muted-foreground",
      )}
    >
      {done ? <Check className="size-3" strokeWidth={2} /> : null}
      <span className="font-mono-num">{label}</span>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-sunken/30 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono-num text-2xl text-ink-900">{value}</div>
    </div>
  );
}

function CmsChip({ cms, soonLabel }: { cms: CMS; soonLabel: string }) {
  const soon = cms === "Shopify" || cms === "Custom";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
        soon
          ? "border-dashed border-line bg-surface-sunken/40 text-muted-foreground"
          : "border-line bg-surface text-ink-700",
      )}
    >
      <Plug className="size-2.5" strokeWidth={1.75} />
      {soon ? soonLabel : cms}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Plan }) {
  const popular = plan === "Premium";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
        popular
          ? "border-[color:var(--accent-gold-soft)] bg-[color:var(--accent-gold-soft)]/30 text-[color:var(--accent-gold)]"
          : "border-line bg-surface text-ink-700",
      )}
    >
      <span>{plan}</span>
      <span className="font-mono-num text-muted-foreground">${PLAN_PRICE[plan]}</span>
    </span>
  );
}

function RefStatusChip({ status, t }: { status: RefStatus; t: (typeof COPY)["en"] }) {
  if (status === "active") return <StatusChip tone="live">{t.statusActive}</StatusChip>;
  if (status === "trial") return <StatusChip tone="neutral">{t.statusTrial}</StatusChip>;
  if (status === "pending") return <StatusChip tone="gold">{t.statusPending}</StatusChip>;
  return <StatusChip tone="danger">{t.statusChurned}</StatusChip>;
}

function PayoutStatusChip({
  status,
  t,
}: {
  status: Payout["status"];
  t: (typeof COPY)["en"];
}) {
  if (status === "paid") return <StatusChip tone="live">{t.paid}</StatusChip>;
  if (status === "scheduled") return <StatusChip tone="gold">{t.scheduled}</StatusChip>;
  return <StatusChip tone="info">{t.processing}</StatusChip>;
}

function Step({ n, icon: Icon, label }: { n: number; icon: typeof Share2; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 hover-lift">
      <div className="grid size-9 place-items-center rounded-md bg-brand-100 text-brand-700">
        <Icon className="size-4" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <div className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          Step {n}
        </div>
        <div className="text-sm text-ink-900">{label}</div>
      </div>
    </div>
  );
}
