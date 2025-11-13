import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import ShoppingCart from "@/components/ShoppingCart";

export const Route = createFileRoute("/cart")({
  component: CartComponent,
});

function CartComponent() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <>
        <div className="container py-8 mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold">Your Cart is Empty</h1>
          <Link to="/catalog">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </>
    );
  }

  return <ShoppingCart />;
}
