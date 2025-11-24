import React from "react";
import { useCart } from "@/context/CartContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";


export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100">
      <div className="container mx-auto">
        {/* PAGE TITLE */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Your Cart</h1>
          <p className="mt-2 text-gray-600">Review and update your items</p>
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* ITEMS */}
          <div className="space-y-4 md:col-span-2">
            {items.length === 0 ? (
              <Card className="p-6 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700">
                  Your cart is empty
                </h3>
                <p className="mb-4 text-gray-500">
                  Browse products and add items to your cart.
                </p>
                <Link to="/public/products">
                  <Button className="text-white bg-red-600 hover:bg-red-700">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            ) : (
              items.map((item) => (
                <Card
                  key={item.productId}
                  className="transition-shadow bg-white border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="object-cover w-full h-40 rounded-md sm:w-24 sm:h-24"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
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
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="font-semibold text-gray-900 min-w-[80px] text-right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* SUMMARY */}
          <Card className="p-4 bg-white border border-gray-200 shadow-md h-fit md:sticky md:top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4 text-gray-700">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Link to="/customer/checkout" className="w-full">
                <Button className="w-full text-white bg-red-600 hover:bg-red-700">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/public/products" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
