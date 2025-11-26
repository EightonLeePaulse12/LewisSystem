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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/customer/checkout")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const hasToken =
      document.cookie && document.cookie.indexOf("token=") !== -1;
    if (!hasToken) throw redirect("/login");
  },
  component: RouteComponent,
});

function RouteComponent() {
  // --- same logic as before, unchanged ---
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
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
                  { transactionId: response.reference },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                clearCart();
                navigate({ to: `/order-confirmation/${order.orderId}` });
              } catch (err) {
                alert(
                  "Payment confirmation failed. Please contact support.",
                  err
                );
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
      let message = "An error occurred during checkout.";
      if (error.message?.includes("Invalid term")) {
        message = "Invalid term months. Must be between 1 and 36.";
      } else if (error.response?.data) {
        message = error.response.data.message || message;
      }
      alert(message);
    },
  });

  const handleCheckout = () => {
    if (!state.agreedToTerms) return alert("Please agree to the terms.");
    if (items.length === 0) return alert("Your cart is empty.");
    if (
      state.paymentType === "Credit" &&
      (state.termMonths < 1 ||
        state.termMonths > 36 ||
        !Number.isInteger(state.termMonths))
    )
      return alert("Term months must be an integer between 1 and 36.");

    if (
      !state.fullName ||
      !state.addressLine1 ||
      !state.city ||
      !state.postalCode
    )
      return alert("Please complete all required address fields.");

    mutation.mutate({
      Items: items.map((item) => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
      })),
      DeliveryOption: state.deliveryOption,
      PaymentType: state.paymentType === "Full" ? 0 : 1,
      TermMonths: state.paymentType === "Credit" ? state.termMonths : null,
      BillingAddress: {
        FullName: state.fullName,
        AddressLine1: state.addressLine1,
        AddressLine2: state.addressLine2,
        City: state.city,
        PostalCode: state.postalCode,
      },
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100">
      <div className="container mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Complete your order by entering your details below.
          </p>
        </div>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* LEFT SIDE */}
          <div className="space-y-6 md:col-span-2">
            {/* --- DELIVERY + PAYMENT SECTIONS --- */}
            <Accordion type="single" collapsible className="mb-6">
              {/* DELIVERY OPTIONS */}
              <AccordionItem value="delivery">
                <AccordionTrigger className="text-lg font-semibold">
                  Delivery Options
                </AccordionTrigger>

                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <RadioGroup
                        value={state.deliveryOption}
                        onValueChange={(value) =>
                          dispatch({
                            type: "SET_DELIVERY_OPTION",
                            payload: value,
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Standard" id="standard" />
                          <Label htmlFor="standard">Standard — $10</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Express" id="express" />
                          <Label htmlFor="express">Express — $20</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Pickup" id="pickup" />
                          <Label htmlFor="pickup">Store Pickup — Free</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* PAYMENT OPTIONS */}
              <AccordionItem value="payment">
                <AccordionTrigger className="text-lg font-semibold">
                  Payment Options
                </AccordionTrigger>

                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4 space-y-4">
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
                        <div className="p-3 border rounded-md bg-muted/40">
                          <Label htmlFor="term">Term Months (1–36)</Label>
                          <Input
                            id="term"
                            type="number"
                            min={1}
                            max={36}
                            value={state.termMonths}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_TERM_MONTHS",
                                payload: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="mt-2"
                          />
                          <p className="mt-2 text-sm font-medium">
                            Estimated Monthly Payment:{" "}
                            <span className="font-bold">
                              R{monthlyPayment || "0.00"}
                            </span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* BILLING ADDRESS */}
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  {
                    placeholder: "Full Name",
                    key: "SET_FULL_NAME",
                    value: state.fullName,
                  },
                  {
                    placeholder: "Address Line 1",
                    key: "SET_ADDRESS_LINE1",
                    value: state.addressLine1,
                  },
                  {
                    placeholder: "Address Line 2 (optional)",
                    key: "SET_ADDRESS_LINE2",
                    value: state.addressLine2,
                  },
                  { placeholder: "City", key: "SET_CITY", value: state.city },
                  {
                    placeholder: "Postal Code",
                    key: "SET_POSTAL_CODE",
                    value: state.postalCode,
                  },
                ].map((input, i) => (
                  <Input
                    key={i}
                    placeholder={input.placeholder}
                    value={input.value}
                    onChange={(e) =>
                      dispatch({ type: input.key, payload: e.target.value })
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* SUMMARY PANEL */}
          <Card className="bg-white border border-gray-200 shadow-lg h-fit md:sticky md:top-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>R{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold border-t">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
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
                <Label htmlFor="terms">
                  I agree to the terms and conditions
                </Label>
              </div>

              {state.paystackConfig ? (
                <Button className="w-full text-white bg-red-600 hover:bg-red-700">
                  Start Payment
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  className="w-full text-white bg-red-600 hover:bg-red-700"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
