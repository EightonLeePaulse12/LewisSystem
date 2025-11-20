// routes/admin/_layout.jsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ManageSidebar } from "@/components/NavigationMenus/ManageSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
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
    <SidebarProvider>
      <div className="flex w-full">
        <main className="flex-1 p-4 ml-64">
          <ManageSidebar />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
