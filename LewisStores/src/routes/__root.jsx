import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CartProvider } from "@/context/CartProvider";

const RootLayout = () => {
  return (
    <CartProvider>
      <>
        <div className="flex gap-2 p-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{" "}
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
          <Link to="/login" className="[&.active]:font-bold">
            Login
          </Link>
          <Link to="/register" className="[&.active]:font-bold">
            Register
          </Link>
          <Link to="/products" className="[&.active]:font-bold">
            Catalog
          </Link>
          <Link to="/cart" className="[&.active]:font-bold">
            Cart
          </Link>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
      </>
    </CartProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
