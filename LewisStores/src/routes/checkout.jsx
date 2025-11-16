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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useReducer } from "react";
import { useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { checkout } from "@/api/checkout";
import API_URL from "@/constants/ApiUrl";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { PaystackButton } from "react-paystack";

export const Route = createFileRoute("/checkout")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const hasToken = document.cookie && document.cookie.indexOf("token=") !== -1;
    if (!hasToken) {
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
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
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
      case "SET_FULL_NAME":
        return { ...state, fullName: action.payload };
      case "SET_ADDRESS_LINE1":
        return { ...state, addressLine1: action.payload };
      case "SET_ADDRESS_LINE2":
        return { ...state, addressLine2: action.payload };
      case "SET_CITY":
        return { ...state, city: action.payload };
      case "SET_POSTAL_CODE":
        return { ...state, postalCode: action.payload };
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
  const deliveryFee = deliveryFees[state.deliveryOption] || 0;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const monthlyInterestRate = 0.02; 
  const monthlyPayment =
    state.paymentType === "Credit"
      ? (
          (total *
            (monthlyInterestRate *
              Math.pow(1 + monthlyInterestRate, state.termMonths))) /
          (Math.pow(1 + monthlyInterestRate, state.termMonths) - 1 || 1)
        ).toFixed(2)
      : null;

  const mutation = useMutation({
    mutationFn: (data) => checkout(data),
    onSuccess: (order) => {
      if (state.paymentType === "Full") {
        dispatch({
          type: "SET_PAYSTACK_CONFIG",
          payload: {
            reference: order.orderId.toString(),
            email: user.email || "user@example.com",
            amount: Math.round(total * 100),
            publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            onSuccess: async (response) => {
              try {
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
              } catch (err) {
                console.error("Confirmation error:", err);
                alert("Payment confirmation failed. Please contact support.");
              }
            },
            onClose: () => console.log("Payment closed"),
          },
        });
      } else {
        clearCart();
        navigate({ to: `/order-confirmation/${order.orderId}` });
      }
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      let message = "An error occurred during checkout. Please try again.";
      if (error.message?.includes("Invalid term")) {
        message = "Invalid term months. Please select between 1 and 36.";
      } else if (error.response?.data) {
        message = error.response.data.message || message;
      }
      alert(message);
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
    if (state.paymentType === "Credit" && (state.termMonths < 1 || state.termMonths > 36 || !Number.isInteger(state.termMonths))) {
      alert("Term months must be an integer between 1 and 36.");
      return;
    }
    if (!state.fullName || !state.addressLine1 || !state.city || !state.postalCode) {
      alert("Please fill in all billing address fields.");
      return;
    }

    const checkoutData = {
      Items: items.map((item) => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
      })),
      DeliveryOption: state.deliveryOption,
      PaymentType: state.paymentType === "Full" ? 0 : 1, // Use int for enum: 0 = Cash, 1 = Credit
      TermMonths: state.paymentType === "Credit" ? state.termMonths : null,
      BillingAddress: {
        FullName: state.fullName,
        AddressLine1: state.addressLine1,
        AddressLine2: state.addressLine2,
        City: state.city,
        PostalCode: state.postalCode,
      },
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
                  <Label htmlFor="terms">Term Months (1-36)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="36"
                    step="1"
                    value={state.termMonths}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_TERM_MONTHS",
                        payload: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                  <p className="mt-2">Estimated Monthly Payment: ${monthlyPayment || '0.00'}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                placeholder="Full Name"
                value={state.fullName}
                onChange={(e) =>
                  dispatch({ type: "SET_FULL_NAME", payload: e.target.value })
                }
              />
              <Input
                placeholder="Address Line 1"
                value={state.addressLine1}
                onChange={(e) =>
                  dispatch({ type: "SET_ADDRESS_LINE1", payload: e.target.value })
                }
              />
              <Input
                placeholder="Address Line 2 (optional)"
                value={state.addressLine2}
                onChange={(e) =>
                  dispatch({ type: "SET_ADDRESS_LINE2", payload: e.target.value })
                }
              />
              <Input
                placeholder="City"
                value={state.city}
                onChange={(e) =>
                  dispatch({ type: "SET_CITY", payload: e.target.value })
                }
              />
              <Input
                placeholder="Postal Code"
                value={state.postalCode}
                onChange={(e) =>
                  dispatch({ type: "SET_POSTAL_CODE", payload: e.target.value })
                }
              />
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