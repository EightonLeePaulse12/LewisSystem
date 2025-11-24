import { Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { GuestNavbar } from "@/components/NavigationMenus/GuestNavbar";
import { Footer } from "@/components/Footer";

export function PublicLayout() {
  const { userRole } = useAuth(); // Assuming useAuth provides userRole; adjust if needed

  const showCustomerNavbar = userRole === "Customer";

  return (
    <div className="flex flex-col min-h-screen">
      {showCustomerNavbar ? <CustomerNavbar /> : <GuestNavbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}