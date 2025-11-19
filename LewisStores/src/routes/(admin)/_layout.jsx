import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ManageSidebar } from "@/components/NavigationMenus/ManageSidebar";

export const Route = createFileRoute("/(admin)/_layout")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated, userRole } = context.auth;
    if (!isAuthenticated || !["Admin", "Manager"].includes(userRole)) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex">
      <ManageSidebar />
      <main className="flex-1 p-4 ml-64">
        <Outlet />
      </main>
    </div>
  );
}