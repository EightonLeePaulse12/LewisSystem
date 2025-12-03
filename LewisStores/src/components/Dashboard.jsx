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
} from "lucide-react";
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

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
    orderTrend,
  } = dashboard;

  const calculateTrend = (current, previous) => {
    // 1. Coerce inputs to Numbers explicitly to handle strings (e.g., "100")
    const curr = Number(current || 0);
    const prev = Number(previous || 0);

    // 2. Prevent division by zero (Infinity) or undefined
    if (prev === 0) return 0;

    // 3. Calculate
    const change = ((curr - prev) / prev) * 100;

    // 4. Return a fixed string
    return change.toFixed(1);
  };

  const getMonthlyTrend = (trendData, isCount = false) => {
    if (!trendData || trendData.length < 2) return { current: 0, previous: 0 };
    const sorted = [...trendData].sort((a, b) =>
      a.Period?.localeCompare(b.Period)
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

  // Placeholder trends for stock (assuming no data, set to 0 or calculate if possible)
  const stockTrendPct = 0; // Could add logic if historical data available
  const stockTrendUp = stockTrendPct > 0;
  const lowStockTrendPct = 0; // Placeholder
  const lowStockTrendUp = lowStockTrendPct > 0;

  const lowStockCount = lowStock?.length || 0;

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-4 py-12 mx-auto space-y-12 sm:px-6 max-w-7xl">
        <h2
          className="text-4xl font-extrabold tracking-tight text-slate-900"
          id="dashHeading"
        >
          Dashboard Overview
        </h2>

        {/* Key Metrics Grid - Made more prominent with larger cards and icons */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          id="total"
        >
          {[
            {
              title: "Total Revenue",
              value: (
                <span id="totalRevenue">{`R${
                  totalRevenue?.toFixed(2) || 0
                }`}</span>
              ),
              icon: (
                <DollarSign
                  id="revenueCurrencyIcon"
                  className="w-6 h-6 text-red-600"
                />
              ),
              trendPct: revenueTrendPct,
              trendUp: revenueTrendUp,
              color: "bg-red-50 hover:bg-red-100",
            },
            {
              title: <span id="totalOrders">Total Orders</span>,
              value: <span id="totalOrdersValue">{totalOrders || 0}</span>,
              icon: (
                <ShoppingCart
                  id="totalOrdersIcon"
                  className="w-6 h-6 text-red-600"
                />
              ),
              trendPct: ordersTrendPct,
              trendUp: ordersTrendUp,
              color: "bg-red-50 hover:bg-red-100",
            },
            {
              title: <span id="productsInStock">Products in Stock</span>,
              value: (
                <span id="productsInStockValue">{productsInStock || 0}</span>
              ),
              icon: (
                <Package
                  id="productsInStockIcon"
                  className="w-6 h-6 text-red-600"
                />
              ),
              trendPct: stockTrendPct,
              trendUp: stockTrendUp,
              color: "bg-red-50 hover:bg-red-100",
            },
            {
              title: <span id="lowStockItems">Low Stock Items</span>,
              value: <span id="lowStockItemsValue">{lowStockCount}</span>,
              icon: (
                <AlertTriangle
                  id="lowStockItemsIcon"
                  className="w-6 h-6 text-red-600"
                />
              ),
              trendPct: lowStockTrendPct,
              trendUp: lowStockTrendUp,
              color: "bg-red-50 hover:bg-red-100",
            },
          ].map((metric, idx) => (
            <Card
              key={idx}
              className={`transition-colors shadow-sm rounded-xl ${metric.color} group cursor-default`}
            >
              {console.log(metric)}
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-white rounded-full group-hover:bg-red-50">
                  {metric.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {metric.value}
                </div>
                <p
                  className={`flex items-center mt-1 text-xs ${
                    metric.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.trendUp ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {/* Check if it is NaN, otherwise render. Fallback to 0. */}
                  {isNaN(Number(metric.trendPct))
                    ? 0
                    : Math.abs(Number(metric.trendPct))}
                  % from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity and Alerts - Dual column layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card className="overflow-hidden shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-xl font-bold text-slate-900">
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-600" id="orderId">
                      Order ID
                    </TableHead>
                    <TableHead className="text-slate-600" id="customerName">
                      Customer Name
                    </TableHead>
                    <TableHead className="text-slate-600" id="orderDate">
                      Date
                    </TableHead>
                    <TableHead className="text-slate-600" id="orderTotal">
                      Total
                    </TableHead>
                    <TableHead className="text-slate-600" id="orderStatus">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders?.map((order) => (
                    <TableRow
                      key={order.orderId}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {order.customer
                          ? `${order.customer.user.name}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        R{order.total?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            order.status === "Pending"
                              ? "bg-yellow-400 text-yellow-900"
                              : "bg-slate-200 text-slate-700"
                          } font-medium`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500"
                      >
                        No recent orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card className="overflow-hidden shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-xl font-bold text-slate-900">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead
                      className="text-slate-600"
                      id="lowStockItemsName"
                    >
                      Name
                    </TableHead>
                    <TableHead
                      className="text-slate-600"
                      id="lowStockItemsQtyLeft"
                    >
                      Qty Left
                    </TableHead>
                    <TableHead
                      className="text-slate-600"
                      id="lowStockItemsReorderStatus"
                    >
                      Reorder Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowestStock?.map((product) => (
                    <TableRow
                      key={product.productId}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {product.stockQty}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            product.stockQty < product.reorderThreshold
                              ? "bg-red-600 text-white"
                              : "bg-green-600 text-white"
                          } font-medium`}
                        >
                          {product.stockQty < product.reorderThreshold
                            ? "Reorder Now"
                            : "Sufficient"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-slate-500"
                      >
                        No low stock items
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics - Bottom row with quick glances */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              title: "Today's Orders",
              value: todaysOrdersCount || 0,
              color: "bg-red-50 hover:bg-red-100",
            },
            {
              title: "Pending Orders",
              value: pendingOrdersCount || 0,
              color: "bg-red-50 hover:bg-red-100",
            },
            {
              title: "Avg Order Value",
              value: `R${avgOrderValue?.toFixed(2) || 0}`,
              color: "bg-red-50 hover:bg-red-100",
            },
          ].map((metric, idx) => (
            <Card
              key={idx}
              className={`transition-colors shadow-sm rounded-xl ${metric.color} group`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
