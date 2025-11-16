import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useReducer } from "react";
import { useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { checkout } from "@/api/checkout";
import API_URL from "@/constants/ApiUrl";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/checkout")({
  beforeLoad: ({ context }) => {
    if (
      !context.auth.isAuthenticated ||
      !context.auth.roles.includes("Customer")
    ) {
      throw redirect("/login");
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const initialState = {
    deliveryOption: "Standard",
    paymentType: "Full",
    termMonths: 6,
    agreedToTerms: false,
    paystackConfig: null,
  };

  function reducer(state, action) {
    switch (action.type) {
      case "SET_DELIVERY_OPTION":
        return { ...state, deliveryOption: action.payload };
      case "SET_PAYMENT_TYPE":
        return { ...state, paymentType: action.payload };
      case "SET_TERM_MONTHS":
        return { ...state, termMonths: action.payload };
      case "SET_AGREED_TO_TERMS":
        return { ...state, agreedToTerms: action.payload };
      case "SET_PAYSTACK_CONFIG":
        return { ...state, paystackConfig: action.payload };
      default:
        return state;
    }
  }

  const { items, total: cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, token } = useAuth();

  const deliveryFees = { Standard: 10, Express: 20, Pickup: 0 };
  const taxRate = 0.15;
  const subtotal = cartTotal;
  const deliveryFee = deliveryFees[state.deliveryOption];
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const monthlyInterestRate = 0.02; // 2% example
  const monthlyPayment =
    state.paymentType === "Credit"
      ? (
          (total *
            (monthlyInterestRate *
              Math.pow(1 + monthlyInterestRate, state.termMonths))) /
          (Math.pow(1 + monthlyInterestRate, state.termMonths) - 1)
        ).toFixed(2)
      : null;

  const mutation = useMutation({
    mutationFn: checkout(),
    onSuccess: (order) => {
      if (state.paymentType === "Full") {
        dispatch({
          type: "SET_PAYSTACK_CONFIG",
          payload: {
            reference: order.orderId.toString(),
            email: user.email || "user@example.com",
            amount: total * 100, // In kobo
            publicKey:
              import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
              "YOUR_PAYSTACK_PUBLIC_KEY",
            onSuccess: async (response) => {
              await axios.post(
                `${API_URL}payments/confirm/${order.orderId}`,
                {
                  transactionId: response.reference,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              clearCart();
              navigate({ to: `/order-confirmation/${order.orderId}` });
            },
            onclose: () => console.log("Payment closed"),
          },
        });
      } else {
        // Credit: no immediate payment, proceed
        clearCart();
        navigate({ to: `/order-confirmation/${order.orderId}` });
      }
      // Trigger email on backend via Hangfire or directly
    },
    onError: (error) => {
      console.error("Checkout error:", error);
    },
  });

  const handleCheckout = () => {
    if (!state.agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const checkoutData = {
      Items: items.map((item) => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
      })),
      DeliveryOption: state.deliveryOption,
      PaymentType: state.PaymentType,
      TermMonths: state.PaymentType === "Credit" ? state.termMonths : null,
    };

    mutation.mutate(checkoutData);
  };
  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={state.deliveryOption}
                onValueChange={(value) =>
                  dispatch({ type: "SET_DELIVERY_OPTION", payload: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Standard" id="standard" />
                  <Label htmlFor="standard">Standard ($10)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Express" id="express" />
                  <Label htmlFor="express">Express ($20)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pickup" id="pickup" />
                  <Label htmlFor="pickup">Store Pickup ($0)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={state.paymentType}
                onValueChange={(value) =>
                  dispatch({ type: "SET_PAYMENT_TYPE", payload: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Full" id="full" />
                  <Label htmlFor="full">Pay in Full</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Credit" id="credit" />
                  <Label htmlFor="credit">Credit Terms</Label>
                </div>
              </RadioGroup>
              {state.paymentType === "Credit" && (
                <div className="mt-4">
                  <Label htmlFor="terms">Select Terms</Label>
                  <Select
                    value={state.termMonths.toString()}
                    onValueChange={(value) =>
                      dispatch({
                        type: "SET_TERM_MONTHS",
                        payload: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2">Monthly Payment: ${monthlyPayment}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Address Line 1" />
              <Input placeholder="Address Line 2" />
              <Input placeholder="City" />
              <Input placeholder="Postal Code" />
            </CardContent>
          </Card>
        </div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={state.agreedToTerms}
                onCheckedChange={(checked) =>
                  dispatch({ type: "SET_AGREED_TO_TERMS", payload: checked })
                }
              />
              <Label htmlFor="terms">I agree to the terms and conditions</Label>
            </div>
            {state.paystackConfig ? (
              <PaystackButton
                {...state.paystackConfig}
                className="w-full py-2 rounded-md bg-primary text-primary-foreground"
                text="Pay Now"
              />
            ) : (
              <Button
                onClick={handleCheckout}
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Processing..." : "Place Order"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
