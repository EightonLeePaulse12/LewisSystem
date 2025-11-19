import React from "react";
import { getSingleOrderAdmin } from "@/api/manage";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Table,
  TableHeader,
  TableCaption,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "./ui/table";

const SingleOrderManagement = ({ orderId }) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getSingleOrderAdmin(orderId),
  });

  if (isLoading) return <p className="mt-8 text-center">Loading...</p>;
  if (!order) return <p className="mt-8 text-center">Order not found</p>;

  return (
    <div className="container p-4 mx-auto">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order ID: {order.data.orderId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* --- Order Summary --- */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="font-semibold">Order Date</p>
              <p>{new Date(order.data.orderDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Order Status</p>
              <p>{order.data.status}</p>
            </div>
            <div>
              <p className="font-semibold">Payment Type</p>
              <p>{order.data.paymentType}</p>
            </div>
          </div>

          <Separator />

          {/* --- Order Items Table --- */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Items Ordered</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.data?.orderItems.map((item) => (
                  <TableRow key={item.orderItemId}>
                    <TableCell className="font-medium">
                      {/* Note: Your orderItems data only has productId. 
                      To show product names, you'd need to fetch product 
                      details separately.
                    */}
                      {item.productId}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.lineTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* --- Financial Summary --- */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.data.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>${order.data.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.data.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleOrderManagement;
