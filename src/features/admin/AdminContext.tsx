import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AdminRole = "platform" | "agency";

export type AdminSession = {
  email: string;
  role: AdminRole;
  agencyName?: string;
  mfa: true;
};

export type Impersonation = {
  orgName: string;
  orgId: string;
  /** epoch ms */
  expiresAt: number;
  reason: string;
};

type Ctx = {
  session: AdminSession | null;
  signIn: (s: AdminSession) => void;
  signOut: () => void;
  impersonation: Impersonation | null;
  startImpersonation: (i: Omit<Impersonation, "expiresAt"> & { minutes?: number }) => void;
  stopImpersonation: () => void;
  /** PLATFORM-ADMIN only — controls the "AI Gateway: STUB" banner. */
  stubMode: boolean;
  setStubMode: (v: boolean) => void;
};

const AdminCtx = createContext<Ctx | null>(null);
const SESSION_KEY = "postics:admin:session";
const IMPERSONATE_KEY = "postics:admin:impersonate";
const STUB_KEY = "postics:admin:stub";

function load<T>(k: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function save(k: string, v: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
function clear(k: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [impersonation, setImpersonation] = useState<Impersonation | null>(null);
  const [stubMode, setStubModeState] = useState<boolean>(true);
  const [, force] = useState(0);

  // Hydrate from localStorage after mount (avoid SSR mismatch).
  useEffect(() => {
    setSession(load<AdminSession>(SESSION_KEY));
    const imp = load<Impersonation>(IMPERSONATE_KEY);
    if (imp && imp.expiresAt > Date.now()) setImpersonation(imp);
    else if (imp) clear(IMPERSONATE_KEY);
    const s = load<{ v: boolean }>(STUB_KEY);
    if (s) setStubModeState(s.v);
  }, []);

  // Tick every second while impersonating so the countdown updates and auto-expires.
  useEffect(() => {
    if (!impersonation) return;
    const id = window.setInterval(() => {
      if (Date.now() >= impersonation.expiresAt) {
        clear(IMPERSONATE_KEY);
        setImpersonation(null);
      } else {
        force((n) => n + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [impersonation]);

  const signIn = useCallback((s: AdminSession) => {
    save(SESSION_KEY, s);
    setSession(s);
  }, []);
  const signOut = useCallback(() => {
    clear(SESSION_KEY);
    clear(IMPERSONATE_KEY);
    setSession(null);
    setImpersonation(null);
  }, []);
  const startImpersonation: Ctx["startImpersonation"] = useCallback((i) => {
    const expiresAt = Date.now() + 1000 * 60 * (i.minutes ?? 20);
    const rec: Impersonation = {
      orgName: i.orgName,
      orgId: i.orgId,
      reason: i.reason,
      expiresAt,
    };
    save(IMPERSONATE_KEY, rec);
    setImpersonation(rec);
  }, []);
  const stopImpersonation = useCallback(() => {
    clear(IMPERSONATE_KEY);
    setImpersonation(null);
  }, []);
  const setStubMode = useCallback((v: boolean) => {
    save(STUB_KEY, { v });
    setStubModeState(v);
  }, []);

  return (
    <AdminCtx.Provider
      value={{
        session,
        signIn,
        signOut,
        impersonation,
        startImpersonation,
        stopImpersonation,
        stubMode,
        setStubMode,
      }}
    >
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

/** Returns a human "MM:SS left" for the current impersonation, or null. */
export function formatRemaining(expiresAt: number): string {
  const ms = Math.max(0, expiresAt - Date.now());
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}