import { createFileRoute, Outlet, Navigate, useRouterState } from "@tanstack/react-router";
import { useAdmin } from "@/features/admin/AdminContext";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/admin/login";

  if (!session && !isLogin) {
    return <Navigate to="/admin/login" />;
  }
  return <Outlet />;
}