import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Calendar, ChevronRight, Package } from "lucide-react";
import { getOrders } from "@/api/checkout";
import { cn } from "@/lib/utils";

const UserOrders = () => {
  const navigate = useNavigate();

  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["userOrders", 1, 10],
    queryFn: async () => {
      const res = await getOrders(1, 10);
      return res;
    },
    refetchOnWindowFocus: true,
  });

  // Extract orders array safely
  const orders = Array.isArray(ordersResponse?.data)
    ? ordersResponse.data
    : Array.isArray(ordersResponse)
    ? ordersResponse
    : [];

  // Helper for status colors to match the aesthetic
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };

  return (
    <div className={cn("min-h-screen p-4")}>
      <div className="container max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full shadow-lg shadow-red-200">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your recent purchases
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="overflow-hidden bg-white border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Package className="w-5 h-5 text-gray-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isOrdersLoading ? (
              // Skeleton Loading State
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        {/* <Loader2 /> */}
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-[100px] rounded-full" />
                  </div>
                ))}
              </div>
            ) : ordersError ? (
              <div className="p-10 text-center text-red-600 bg-red-50">
                <p>Error loading orders: {ordersError.message}</p>
              </div>
            ) : orders.length === 0 ? (
              // Empty State
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  No orders found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Looks like you haven't placed any orders yet.
                </p>
              </div>
            ) : (
              // Orders Table
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="pl-6 w-[140px]">Order ID</TableHead>
                      <TableHead>Date Placed</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right" id ="goesIntoOrder">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.orderId}
                        className="transition-colors border-gray-100 cursor-pointer group hover:bg-red-50/30"
                        onClick={() =>
                          navigate({ to: `/customer/orders/${order.orderId}` })
                        }
                      >
                        <TableCell className="pl-6 font-medium text-gray-900">
                          #{order.orderId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(
                              order.OrderDate || order.orderDate
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">
                          R{order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-medium border shadow-none",
                              getStatusColor(order.status)
                            )}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <ChevronRight className="w-5 h-5 ml-auto text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-red-500" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserOrders;
