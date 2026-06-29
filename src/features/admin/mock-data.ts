export type AdminOrg = {
  id: string;
  name: string;
  domain: string;
  plan: "Starter" | "Growth" | "Premium" | "Agency";
  mrr: number;
  status: "healthy" | "at-risk" | "churned" | "trial";
  activatedAt: string;
  lastActivity: string;
  ownerEmail: string;
  stripeCustomerId: string;
};

export const ADMIN_ORGS: AdminOrg[] = [
  {
    id: "org_01H8N",
    name: "Northbound Coffee Roasters",
    domain: "northboundroasters.com",
    plan: "Growth",
    mrr: 449,
    status: "healthy",
    activatedAt: "2026-02-11",
    lastActivity: "2 min ago",
    ownerEmail: "ops@northboundroasters.com",
    stripeCustomerId: "cus_QkR4n8M2",
  },
  {
    id: "org_01H8P",
    name: "Loomwell Linens",
    domain: "loomwell.co",
    plan: "Premium",
    mrr: 999,
    status: "healthy",
    activatedAt: "2025-11-04",
    lastActivity: "11 min ago",
    ownerEmail: "alex@loomwell.co",
    stripeCustomerId: "cus_QkR7m4P1",
  },
  {
    id: "org_01H8Q",
    name: "Velourie Atelier",
    domain: "velourie.shop",
    plan: "Starter",
    mrr: 199,
    status: "at-risk",
    activatedAt: "2026-05-18",
    lastActivity: "4 days ago",
    ownerEmail: "studio@velourie.shop",
    stripeCustomerId: "cus_QkR9b1F3",
  },
  {
    id: "org_01H8R",
    name: "Harbor & Ash Outfitters",
    domain: "harborandash.com",
    plan: "Growth",
    mrr: 449,
    status: "trial",
    activatedAt: "2026-06-24",
    lastActivity: "37 min ago",
    ownerEmail: "matt@harborandash.com",
    stripeCustomerId: "cus_QkS01dQ2",
  },
  {
    id: "org_01H8S",
    name: "Pinegrove Pet Supply",
    domain: "pinegrovepet.com",
    plan: "Agency",
    mrr: 1299,
    status: "healthy",
    activatedAt: "2025-08-22",
    lastActivity: "1 hr ago",
    ownerEmail: "ops@pinegrovepet.com",
    stripeCustomerId: "cus_QkS17gH4",
  },
  {
    id: "org_01H8T",
    name: "Solstice Soap Co.",
    domain: "solsticesoap.com",
    plan: "Starter",
    mrr: 199,
    status: "churned",
    activatedAt: "2025-09-10",
    lastActivity: "21 days ago",
    ownerEmail: "hi@solsticesoap.com",
    stripeCustomerId: "cus_QkS22vN6",
  },
];

export type PipelineJob = {
  id: string;
  org: string;
  type: "article" | "product-photo" | "product-video" | "social-post";
  stage: "queued" | "generating" | "qa" | "publishing" | "done" | "failed";
  costUSD: number;
  startedAt: string;
};

export const PIPELINE_JOBS: PipelineJob[] = [
  { id: "job_8410", org: "Northbound Coffee Roasters", type: "article", stage: "generating", costUSD: 0.04, startedAt: "19:41:02" },
  { id: "job_8411", org: "Loomwell Linens", type: "product-photo", stage: "qa", costUSD: 0.11, startedAt: "19:40:48" },
  { id: "job_8412", org: "Pinegrove Pet Supply", type: "product-video", stage: "publishing", costUSD: 1.82, startedAt: "19:39:12" },
  { id: "job_8413", org: "Velourie Atelier", type: "social-post", stage: "failed", costUSD: 0.02, startedAt: "19:38:55" },
  { id: "job_8414", org: "Harbor & Ash Outfitters", type: "article", stage: "done", costUSD: 0.03, startedAt: "19:37:30" },
  { id: "job_8415", org: "Northbound Coffee Roasters", type: "product-photo", stage: "queued", costUSD: 0, startedAt: "—" },
];

export type Segment = {
  id: string;
  name: string;
  description: string;
  orgs: number;
  trend: "up" | "down" | "flat";
};

export const SEGMENTS: Segment[] = [
  { id: "seg_activated_30d", name: "Activated in last 30 days", description: "First publish + connector verified.", orgs: 18, trend: "up" },
  { id: "seg_stalled", name: "Stalled (no publish 14d)", description: "Connector linked but no schedule running.", orgs: 6, trend: "down" },
  { id: "seg_video_heavy", name: "Video-heavy spenders", description: "≥ 30% credits on product video this month.", orgs: 4, trend: "flat" },
  { id: "seg_premium_lapsed", name: "Premium → Growth downgrade risk", description: "Usage below Premium floor 30 days.", orgs: 2, trend: "down" },
];

export type BuildSurface = {
  id: string;
  area: "AI Gateway" | "Connector" | "Pipeline" | "Billing" | "Auth";
  surface: string;
  status: "live" | "stub" | "missing";
  note: string;
};

export const BUILD_SURFACES: BuildSurface[] = [
  { id: "ai_gateway", area: "AI Gateway", surface: "Anthropic key", status: "stub", note: "No real key wired — every job returns a placeholder draft and ~$0 cost." },
  { id: "ai_images", area: "AI Gateway", surface: "Image model route", status: "stub", note: "Returns watermarked sample image." },
  { id: "ai_video", area: "AI Gateway", surface: "Video model route", status: "missing", note: "Provider not yet selected." },
  { id: "connector_wp", area: "Connector", surface: "WordPress plugin v0.4", status: "live", note: "Pairing + publish working." },
  { id: "connector_woo", area: "Connector", surface: "WooCommerce sync", status: "live", note: "Products + media." },
  { id: "pipeline_qa", area: "Pipeline", surface: "Quality-gate scorer", status: "stub", note: "Uses heuristic only; LLM eval blocked on AI key." },
  { id: "pipeline_publish", area: "Pipeline", surface: "Site publisher", status: "live", note: "Scheduling + retries." },
  { id: "billing_stripe", area: "Billing", surface: "Stripe webhooks", status: "live", note: "All event types acknowledged." },
  { id: "billing_credits", area: "Billing", surface: "Credit ledger", status: "live", note: "Per-org ledger reconciles nightly." },
  { id: "auth_staff", area: "Auth", surface: "Staff SSO + MFA", status: "stub", note: "UI ready; service-role enforcement pending." },
];