import { useEffect } from "react";
import { createFileRoute, Outlet, Navigate, useRouterState, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAdmin, useAdminRole, isPlatformOnlyPath } from "@/features/admin/AdminContext";
import { AdminShell } from "@/features/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = useAdmin();
  const role = useAdminRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = pathname === "/admin/login";

  // Agency-admin hitting a platform-only route → bounce to /admin with a toast.
  useEffect(() => {
    if (!session || isLogin) return;
    if (role !== "platform" && isPlatformOnlyPath(pathname)) {
      toast.error("Platform-only — visible to Postics staff.");
      navigate({ to: "/admin", replace: true });
    }
  }, [session, role, pathname, isLogin, navigate]);

  if (!session && !isLogin) {
    return <Navigate to="/admin/login" />;
  }
  // Login screen renders its own chrome.
  if (isLogin) return <Outlet />;
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}