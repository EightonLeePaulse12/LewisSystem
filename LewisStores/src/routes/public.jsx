// routes/(public)/_layout/index.jsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { GuestNavbar } from "@/components/NavigationMenus/GuestNavbar";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/public")({
  beforeLoad: ({ context }) => {
    const { isAuthenticated, userRole } = context.auth;

    // only block admin/manager
    if (isAuthenticated && ["Admin", "Manager"].includes(userRole)) {
      throw redirect({ to: "/admin" });
    }
  },
  component: PublicLayout,
});

function PublicLayout() {
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
