import React from "react";
import { useCart } from "@/context/CartContext";

const ShoppingCart = () => {
  const { items, removeItem, updateQuantity, total } = useCart();
  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {items.map((item) => (
            <Card key={item.productId} className="mb-4">
              <CardContent className="flex items-center p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-20 h-20 mr-4"
                />
                <div className="grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    className="w-16 mx-2 text-center"
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="ml-4 font-semibold">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.productId)}
                  className="ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {/* Add tax/delivery later in checkout */}
          </CardContent>
          <CardFooter>
            <Link to="/checkout" className="w-full">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ShoppingCart;
