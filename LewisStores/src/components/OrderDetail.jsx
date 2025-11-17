// OrderDetail.jsx (updated for TanStack Router, using orderId param)
import React from "react";
import { Link } from "@tanstack/react-router"; // Updated for TanStack Router
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderDetails, cancelOrder } from "@/api/checkout";

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
      console.log(res); // For debugging
      return res; // Assuming res is { data: {...} } or directly the object; adjust if needed
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
      // Optionally navigate back or refresh
    },
    onError: (error) => {
      console.error("Cancel order failed:", error);
      toast.error("Failed to cancel order");
    },
  });

  const handleCancelOrder = () => {
    console.log("REACHED")
    if (orderId) {
      cancelMutation.mutate(orderId);
    }
  };

  if (isDetailsLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="container max-w-4xl py-10 mx-auto">
        <p className="text-destructive">Error loading order details: {detailsError.message}</p>
        <Link to="/orders">
          <Button variant="outline" className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link to="/orders/manage">
          <Button variant="outline">Back to Orders</Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Order Details - {orderId}</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Detailed information about your order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Date:</strong>{" "}
            {new Date(orderDetails.orderDate).toLocaleString()}
          </p>
          <p>
            <strong>Subtotal:</strong> $
            {orderDetails.subtotal.toFixed(2)}
          </p>
          <p>
            <strong>Delivery Fee:</strong> $
            {orderDetails.deliveryFee.toFixed(2)}
          </p>
          <p>
            <strong>Tax:</strong> $
            {orderDetails.tax.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> $
            {orderDetails.total.toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {orderDetails.status}
          </p>
          <p>
            <strong>Payment Type:</strong>{" "}
            {orderDetails.paymentType}
          </p>
          {/* Add more details as needed, e.g., items list */}
          {orderDetails.orderItems && (
            <div>
              <strong>Items:</strong>
              <ul className="list-disc list-inside">
                {orderDetails.orderItems.map((item) => (
                  <li key={item.orderItemId}>
                    {item.quantity} x {item.productId} - $
                    {item.lineTotal.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {orderDetails?.status === "Pending" && (
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Cancel Order"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default OrderDetail;