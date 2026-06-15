import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Sparkle,
  PenLine,
  ShieldCheck,
  BarChart3,
  Settings2,
} from "lucide-react";
import { useScope } from "./scope";
import {
  ScopeSwitcher,
  TopBar,
  CreditsPill,
  SideBarShell,
  type SideItem,
  useActiveFromRoute,
  type Crumb,
} from "./topbar-parts";

export type ProjectNavId =
  | "overview"
  | "plan"
  | "studio"
  | "editor"
  | "review"
  | "analytics"
  | "settings";

/**
 * The ONLY shell a solo business sees, and the shell an agency drops INTO
 * after opening a client from the workspace console.
 */
export function ProjectShell({
  active,
  breadcrumb,
  children,
}: {
  /** Optional — when omitted the active id is derived from the current route. */
  active?: ProjectNavId;
  /** Tail crumbs only — the scope prefix (agency / client) is added here. */
  breadcrumb: Crumb[];
  children: ReactNode;
}) {
  const { role, workspace, currentProject } = useScope();
  const [collapsed, setCollapsed] = useState(false);

  const derived = useActiveFromRoute<ProjectNavId>(
    {
      "/dashboard": "overview",
      "/plan": "plan",
      "/studio": "studio",
      "/editor": "editor",
      "/review": "review",
      "/analytics": "analytics",
      "/settings": "settings",
    },
    "overview",
  );
  const activeId: ProjectNavId = active ?? derived;

  const create: SideItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
    { id: "plan", label: "Content Plan", icon: CalendarDays, to: "/plan", badge: 4 },
    { id: "studio", label: "Product Studio", icon: Sparkle, to: "/studio" },
    { id: "editor", label: "Editor", icon: PenLine, to: "/editor" },
  ];
  // Review only appears for projects on option Б (human-in-the-loop review).
  if (currentProject.reviewEnabled) {
    create.push({ id: "review", label: "Review", icon: ShieldCheck, to: "/review", badge: 7 });
  }

  const measure: SideItem[] = [
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/analytics" },
    { id: "settings", label: "Settings", icon: Settings2, to: "/settings" },
  ];

  const crumbPrefix: Crumb[] =
    role === "agency"
      ? [
          { label: workspace.name, to: "/clients" },
          { label: currentProject.name, to: "/dashboard" },
        ]
      : [{ label: currentProject.name, to: "/dashboard" }];

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <SideBarShell
        brand={<BrandMark />}
        groups={[
          { label: "Create", items: create },
          { label: "Measure & manage", items: measure },
        ]}
        active={activeId}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          left={<ScopeSwitcher mode="project" />}
          breadcrumb={[...crumbPrefix, ...breadcrumb]}
          right={<CreditsPill mode="project" />}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function BrandMark() {
  const { role } = useScope();
  // Logo → console (agency) / Overview (solo). Landing is reachable from the avatar / sign-out.
  const to = role === "agency" ? "/clients" : "/dashboard";
  return (
    <Link to={to} className="flex items-center gap-2.5 hover:opacity-80">
      <div className="grid size-8 place-items-center rounded-md bg-brand-700 text-[color:var(--primary-foreground)]">
        <span className="font-display text-base leading-none">P</span>
      </div>
      <div className="min-w-0">
        <div className="font-display text-base text-ink-900">Postics</div>
        <div className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          project
        </div>
      </div>
    </Link>
  );
}