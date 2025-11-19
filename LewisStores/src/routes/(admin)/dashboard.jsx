// src/routes/_admin.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ManageSidebar } from "@/components/NavigationMenus/ManageSidebar";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/dashboard")({
  beforeLoad: ({ context }) => {
    if (
      !context.auth.isAuthenticated ||
      (context.auth.userRole !== "Admin" && context.auth.userRole !== "Manager")
    ) {
      throw redirect({ to: "/dashboard" });
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
