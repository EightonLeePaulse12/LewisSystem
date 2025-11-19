import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";  // For potential sub-component use

export const Route = createFileRoute("/(customer)/_layout")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated, userRole } = context.auth;
    if (!isAuthenticated || userRole !== "Customer") {
      throw redirect({ to: "/" });
    }
  },
  component: CustomerLayout,
});

function CustomerLayout() {
  return (
    <div>
      <CustomerNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}