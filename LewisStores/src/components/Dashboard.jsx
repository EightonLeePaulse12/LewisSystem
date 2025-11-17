import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"; // From recharts
import { getDashboard } from "@/api/manage";

const Dashboard = () => {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <p>Error: {error.message}</p>;

  const { lowStock, sales, outstanding, recentOrders } = dashboard;

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      {/* Outstanding Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${outstanding.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Payment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="PaymentType" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Reorder Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((product) => (
                <TableRow key={product.ProductId}>
                  <TableCell>{product.ProductId}</TableCell>
                  <TableCell>{product.Name}</TableCell>
                  <TableCell>{product.StockQty}</TableCell>
                  <TableCell>{product.ReorderThreshold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "Pending" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
