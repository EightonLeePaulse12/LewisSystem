import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "@tanstack/react-router";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";

export const Route = createFileRoute("/customer")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated, userRole } = context.auth;
    if (!isAuthenticated || userRole !== "Customer") {
      throw redirect({ to: "/public/home" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>
        <CustomerNavbar />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
