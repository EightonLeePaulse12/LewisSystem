import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react"; // Added icons
import { getDashboard } from "@/api/manage";

const Dashboard = () => {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <p>Error: {error.message}</p>;

  const {
    lowStock,
    recentOrders,
    totalRevenue,
    totalOrders,
    productsInStock,
    lowestStock,
    todaysOrdersCount,
    pendingOrdersCount,
    avgOrderValue,
    revenueTrend,
    orderTrend, // Assuming added to backend
    // Other data not used here (for reports): sales, outstanding, OrderStatusDistribution, TopCategoriesBySales
  } = dashboard;

  // Helper to calculate percentage change
  const calculateTrend = (current, previous) => {
    if (previous === 0) return 0;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // For revenue trend: Get last two months' revenue
  const getMonthlyTrend = (trendData, isCount = false) => {
    if (!trendData || trendData.length < 2) return { current: 0, previous: 0 };

    // Sort by period to ensure order (assuming YYYY-MM)
    const sorted = [...trendData].sort((a, b) =>
      a.Period.localeCompare(b.Period)
    );
    const last = sorted[sorted.length - 1];
    const secondLast = sorted[sorted.length - 2];

    const key = isCount ? "Count" : "Revenue";
    return {
      current: last ? last[key] : 0,
      previous: secondLast ? secondLast[key] : 0,
    };
  };

  const revenueMonthly = getMonthlyTrend(revenueTrend);
  const revenueTrendPct = calculateTrend(
    revenueMonthly.current,
    revenueMonthly.previous
  );
  const revenueTrendUp = revenueTrendPct > 0;

  const ordersMonthly = getMonthlyTrend(orderTrend, true);
  const ordersTrendPct = calculateTrend(
    ordersMonthly.current,
    ordersMonthly.previous
  );
  const ordersTrendUp = ordersTrendPct > 0;

  // For stock trends: Assuming no history, set to 0
  const stockTrendPct = 0; // Or calculate if backend provides
  const lowStockCount = lowStock?.length;
  const lowStockTrendPct = 0;

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      {/* Top 4 Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue?.toFixed(2)}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              {revenueTrendUp ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              {revenueTrendPct}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              {ordersTrendUp ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              {ordersTrendPct}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Products in Stock Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Products in Stock
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInStock}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="w-4 h-4 text-green-500" /> {/* Placeholder */}
              {stockTrendPct}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="w-4 h-4 text-green-500" /> {/* Placeholder */}
              {lowStockTrendPct}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2 Sections: Recent Orders and Low Stock Items */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders?.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      {order.customer
                        ? `${order.customer.user.name}`
                        : "Unknown"}
                    </TableCell>{" "}
                    {/* Assume Customer has FirstName/LastName */}
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${order.total?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Pending" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Items (using 4 lowest) */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Qty Left</TableHead>
                  <TableHead>When to Reorder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowestStock?.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.stockQty}</TableCell>
                    <TableCell>
                      {product.stockQty < product.reorderThreshold
                        ? "Reorder Now"
                        : "Sufficient Stock"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 3 Bottom Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgOrderValue?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
