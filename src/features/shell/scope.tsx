import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "business" | "agency";

export type Project = {
  id: string;
  name: string;
  initials: string;
  domain: string;
  /** Option Б — human-in-the-loop review enabled for this project. */
  reviewEnabled: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  initials: string;
};

type ScopeState = {
  role: Role;
  setRole: (r: Role) => void;
  workspace: Workspace;
  projects: Project[];
  /** Current project for ProjectShell. Solo businesses always have exactly one. */
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  credits: { used: number; total: number };
};

const ScopeCtx = createContext<ScopeState | null>(null);

const DEFAULT_WORKSPACE: Workspace = { id: "acme", name: "Acme Studio", initials: "AS" };
const DEFAULT_PROJECTS: Project[] = [
  { id: "vellum-bean", name: "Vellum & Bean", initials: "VB", domain: "vellumbean.co", reviewEnabled: true },
  { id: "northwind-tea", name: "Northwind Tea", initials: "NT", domain: "northwindtea.com", reviewEnabled: false },
  { id: "linden-mercantile", name: "Linden Mercantile", initials: "LM", domain: "lindenmercantile.shop", reviewEnabled: true },
  { id: "old-mill-roasters", name: "Old Mill Roasters", initials: "OM", domain: "oldmillroasters.co", reviewEnabled: false },
];

const ROLE_KEY = "postics:role";
const PROJECT_KEY = "postics:currentProjectId";

export function ScopeProvider({ children, initialRole = "agency" }: { children: ReactNode; initialRole?: Role }) {
  const [role, setRoleState] = useState<Role>(initialRole);
  const [projects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [currentProjectId, setCurrentProjectIdState] = useState<string>(DEFAULT_PROJECTS[0].id);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = window.localStorage.getItem(ROLE_KEY) as Role | null;
    if (r === "business" || r === "agency") setRoleState(r);
    const p = window.localStorage.getItem(PROJECT_KEY);
    if (p && DEFAULT_PROJECTS.some((x) => x.id === p)) setCurrentProjectIdState(p);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, r);
  };
  const setCurrentProjectId = (id: string) => {
    setCurrentProjectIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(PROJECT_KEY, id);
  };

  const value = useMemo<ScopeState>(() => {
    const visible = role === "business" ? projects.slice(0, 1) : projects;
    const current = visible.find((p) => p.id === currentProjectId) ?? visible[0];
    return {
      role,
      setRole,
      workspace: DEFAULT_WORKSPACE,
      projects: visible,
      currentProject: current,
      setCurrentProjectId,
      credits: { used: 3240, total: 10000 },
    };
  }, [role, projects, currentProjectId]);

  return <ScopeCtx.Provider value={value}>{children}</ScopeCtx.Provider>;
}

export function useScope() {
  const v = useContext(ScopeCtx);
  if (!v) throw new Error("useScope must be used inside <ScopeProvider />");
  return v;
}