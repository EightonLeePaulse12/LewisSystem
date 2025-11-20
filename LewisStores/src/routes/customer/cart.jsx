import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import ShoppingCart from "@/components/ShoppingCart";

export const Route = createFileRoute("/customer/cart")({
  component: CartComponent,
});

function CartComponent() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <>
        <div className="container py-8 mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold">Your Cart is Empty</h1>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </>
    );
  }

  return <ShoppingCart />;
}
