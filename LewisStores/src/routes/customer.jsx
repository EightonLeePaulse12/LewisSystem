import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "@tanstack/react-router";
import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";

export const Route = createFileRoute("/customer")({
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
        redirect("/")
      )}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
