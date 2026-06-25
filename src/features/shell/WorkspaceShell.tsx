import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Users,
  UserCog,
  Palette,
  Store,
  CreditCard,
  Handshake,
  Building2,
} from "lucide-react";
import { useScope } from "./scope";
import {
  ScopeSwitcher,
  TopBar,
  SideBarShell,
  type SideItem,
  CreditsPill,
  useActiveFromRoute,
  type Crumb,
} from "./topbar-parts";

export type WorkspaceNavId =
  | "agency"
  | "clients"
  | "team"
  | "brand"
  | "marketplace"
  | "billing"
  | "partner";

/**
 * Agencies only. Solo businesses are redirected into their single project shell.
 * One altitude up from ProjectShell — shares the same chrome primitives.
 */
export function WorkspaceShell({
  active,
  breadcrumb,
  children,
}: {
  active?: WorkspaceNavId;
  breadcrumb: Crumb[];
  children: ReactNode;
}) {
  const { role, workspace } = useScope();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const derived = useActiveFromRoute<WorkspaceNavId>(
    {
      "/agency": "agency",
      "/clients": "clients",
      "/team": "team",
      "/brand-kit": "brand",
      "/marketplace": "marketplace",
      "/billing": "billing",
      "/partner": "partner",
    },
    "agency",
  );
  const activeId: WorkspaceNavId = active ?? derived;

  // Solo businesses never see the workspace scope.
  useEffect(() => {
    if (role === "business") navigate({ to: "/dashboard" });
  }, [role, navigate]);

  const items: SideItem[] = [
    { id: "agency", label: "Agency", icon: Building2, to: "/agency" },
    { id: "clients", label: "Clients", icon: Users, to: "/clients" },
    { id: "team", label: "Team & roles", icon: UserCog, to: "/team" },
    { id: "brand", label: "Brand kit / White-label", icon: Palette, to: "/brand-kit" },
    { id: "marketplace", label: "Marketplace", icon: Store, to: "/marketplace" },
    { id: "billing", label: "Billing & shared credits", icon: CreditCard, to: "/billing" },
    { id: "partner", label: "Partner", icon: Handshake, to: "/partner" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <SideBarShell
        brand={<WorkspaceBrand />}
        groups={[{ items }]}
        active={activeId}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          left={<ScopeSwitcher mode="workspace" />}
          breadcrumb={[{ label: workspace.name, to: "/clients" }, ...breadcrumb]}
          right={<CreditsPill mode="workspace" />}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function WorkspaceBrand() {
  return (
    <Link to="/clients" className="flex items-center gap-2.5 hover:opacity-80">
      <div className="grid size-8 place-items-center rounded-md bg-ink-900 text-paper">
        <span className="font-display text-base leading-none">P</span>
      </div>
      <div className="min-w-0">
        <div className="font-display text-base text-ink-900">Postics</div>
        <div className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
          workspace
        </div>
      </div>
    </Link>
  );
}