import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GuestNavbar } from "@/components/NavigationMenus/GuestNavbar";
import { redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated, userRole } = context.auth;
    if (isAuthenticated && userRole === "Admin") {
      throw redirect({ to: "/admin/manage/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, userRole } = useAuth();
  return (
    <div>
      {isAuthenticated && userRole === "Customer" ? (
        <div>
          <CustomerNavbar />
        </div>
      ) : (
        <GuestNavbar />
      )}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
