// UserOrders.jsx (updated to enable refetch on window focus to ensure status updates after navigation)
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { getOrders } from "@/api/checkout";

const UserOrders = () => {
  const navigate = useNavigate(); // Use navigate hook

  // Fetch orders (default to page 1, limit 10; you can add pagination later)
  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["userOrders", 1, 10], // Include page and limit in key for potential pagination
    queryFn: async () => {
      const res = await getOrders(1, 10);
      return res; // Assuming res is { data: [...] } or directly the array; adjust if needed
    },
    refetchOnWindowFocus: true, // Enable refetch when window gains focus to update status after navigation
  });

  // Extract orders array safely
  const orders = Array.isArray(ordersResponse?.data)
    ? ordersResponse.data
    : Array.isArray(ordersResponse)
    ? ordersResponse
    : [];

  return (
    <div className="container max-w-4xl py-10 mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
        <p className="text-muted-foreground">
          View and manage your recent orders.
        </p>
      </div>
      {/* --- My Orders Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>View and manage your recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isOrdersLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : ordersError ? (
            <p className="text-destructive">
              Error loading orders: {ordersError.message}
            </p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate({ to: `/orders/${order.orderId}` })} // Use navigate for routing
                  >
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      {new Date(order.OrderDate).toLocaleString()}{" "}
                      {/* Adjusted to OrderDate as per your code */}
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Pending"
                            ? "default"
                            : order.status === "Cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOrders;
