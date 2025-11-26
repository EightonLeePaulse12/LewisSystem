import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  Truck,
  AlertCircle,
  ShoppingBag,
  Ban,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderDetails, cancelOrder } from "@/api/checkout";
import { cn } from "@/lib/utils";

const OrderDetail = ({ orderId }) => {
  const queryClient = useQueryClient();

  // Fetch order details
  const {
    data: orderDetailsResponse,
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: async () => {
      const res = await getOrderDetails(orderId);
      return res;
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false,
  });

  // Extract orderDetails object safely
  const orderDetails = orderDetailsResponse?.data || orderDetailsResponse;

  // Mutation for canceling an order
  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orderDetails", orderId] });
    },
    onError: (error) => {
      console.error("Cancel order failed:", error);
      toast.error("Failed to cancel order: " + error.message);
    },
  });

  const handleCancelOrder = () => {
    if (orderId) {
      cancelMutation.mutate(orderId);
    }
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Packed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Dispatched":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // --- Loading State ---
  if (isDetailsLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100 lg:p-8">
        <div className="container max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-32 h-10 rounded-md" />
            <Skeleton className="w-64 h-10 rounded-md" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[150px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (detailsError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">
              Unable to Load Order
            </CardTitle>
            <CardDescription>{detailsError.message}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link to="/customer/orders/manage">
              <Button
                variant="outline"
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Orders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  // --- Success State ---
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="container max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link to="/customer/orders/manage">
              <Button
                variant="ghost"
                className="transition-colors bg-white/50 hover:bg-white hover:text-red-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
              Order <span className="text-gray-500">#{orderId}</span>
            </h1>
          </div>
          <Badge
            className={cn(
              "px-4 py-1.5 text-sm font-medium border shadow-sm self-start md:self-auto",
              getStatusColor(orderDetails.status)
            )}
          >
            {orderDetails.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN: Order Items */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden border-gray-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {orderDetails.orderItems &&
                orderDetails.orderItems.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {orderDetails.orderItems.map((item) => (
                      <div
                        key={item.orderItemId}
                        className="flex items-start justify-between p-6 transition-colors hover:bg-gray-50/50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.productName ||
                                `Product ID: ${item.productId}`}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Qty:{" "}
                              <span className="font-medium text-gray-900">
                                {item.quantity}
                              </span>
                            </p>
                            {/* If unit price was available in item object, we could show it here */}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            R{item.lineTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No items details found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info Cards (Optional) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <CardTitle className="text-sm font-medium tracking-wider uppercase">
                      Order Date
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(orderDetails.orderDate).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <CreditCard className="w-4 h-4" />
                    <CardTitle className="text-sm font-medium tracking-wider uppercase">
                      Payment Method
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {orderDetails.paymentType || "Standard Checkout"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN: Summary & Actions */}
          <div className="space-y-6 lg:col-span-1">
            {/* Order Summary Card */}
            <Card className="sticky bg-white border-gray-200 shadow-lg top-6">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    R{orderDetails.subtotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    R{orderDetails.deliveryFee?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">
                    R{orderDetails.tax?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-red-600">
                    R{orderDetails.total?.toFixed(2)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 bg-gray-50/30">
                {orderDetails.status === "Pending" ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-start gap-2 p-3 border border-yellow-100 rounded-md bg-yellow-50">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        You can cancel this order while it is still pending.
                        Once processed, it cannot be cancelled here.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full shadow-md h-11"
                      onClick={handleCancelOrder}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 p-3 text-sm text-gray-500 bg-gray-100 rounded-md">
                      {orderDetails.status === "Cancelled" ? (
                        <>
                          <Ban className="w-4 h-4" />
                          This order has been cancelled
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Order is being processed
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Help Card */}
            <Card className="border-blue-100 shadow-sm bg-blue-50">
              <CardContent className="flex flex-col items-center p-6 space-y-2 text-center">
                <div className="flex items-center justify-center w-10 h-10 mb-2 text-blue-600 bg-blue-100 rounded-full">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  Have an issue with your order? Contact our support team for
                  assistance.
                </p>
                <Link to="/public/contact" className="w-full mt-2">
                  <Button
                    variant="outline"
                    className="w-full text-blue-700 bg-white border-blue-200 hover:bg-blue-100"
                  >
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
