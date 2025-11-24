import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import ManageSidebar from "@/components/NavigationMenus/ManageSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
    <div className="flex min-h-screen bg-slate-50">
      <SidebarProvider>
        <ManageSidebar />
        <SidebarInset className="flex-1">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}