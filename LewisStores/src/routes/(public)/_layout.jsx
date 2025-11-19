import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GuestNavbar } from "@/components/NavigationMenus/GuestNavbar";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/(public)/_layout")({
  component: PublicLayout,
});

function PublicLayout() {
  const { isAuthenticated, userRole } = useAuth();
  const showCustomerNav = isAuthenticated && userRole === "Customer";

  return (
    <div>
      {showCustomerNav ? <CustomerNavbar /> : <GuestNavbar />}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}