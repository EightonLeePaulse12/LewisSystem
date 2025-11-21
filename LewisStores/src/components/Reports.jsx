import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DownloadReport,
  DownloadOverdueReport,
  getDashboard,
} from "@/api/manage";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  // --- Download states ---
  const [salesStart, setSalesStart] = useState("");
  const [salesEnd, setSalesEnd] = useState("");
  const [salesFormat, setSalesFormat] = useState("csv");

  const [paymentsStart, setPaymentsStart] = useState("");
  const [paymentsEnd, setPaymentsEnd] = useState("");
  const [paymentsFormat, setPaymentsFormat] = useState("csv");

  const [overdueFormat, setOverdueFormat] = useState("csv");

  const handleDownload = async (type, start, end, format) => {
    try {
      await DownloadReport(type, start, end, format);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOverdueDownload = async (format) => {
    try {
      await DownloadOverdueReport(format);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Fetch dashboard data ---
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard</div>;

  // --- Destructure dashboard data ---
  const {
    revenueTrend = [],
    orderStatusDistribution = [],
    topCategoriesBySales = [],
    lowestStock = [],
    avgOrderValue = 0,
    recentOrders = [],
  } = dashboard;

  // --- Chart Data ---
  const revenueData = {
    labels: revenueTrend.map((r) => r.period),
    datasets: [
      {
        label: "Revenue",
        data: revenueTrend.map((r) => r.revenue),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
      },
    ],
  };

  const orderStatusData = {
    labels: orderStatusDistribution.map((o) => o.status),
    datasets: [
      {
        label: "Orders",
        data: orderStatusDistribution.map((o) => o.count),
        backgroundColor: [
          "#3b82f6",
          "#f97316",
          "#ef4444",
          "#facc15",
          "#22c55e",
          "#6366f1",
          "#f43f5e",
        ],
      },
    ],
  };

  const topCategoriesData = {
    labels: topCategoriesBySales.map((c) => c.category),
    datasets: [
      {
        label: "Sales",
        data: topCategoriesBySales.map((c) => c.sales),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="container p-4 mx-auto space-y-8 max-w-7xl">

      <h1 className="mb-6 text-3xl font-bold">Reports Dashboard</h1>

      {/* Top Charts: Revenue + Order Status */}
      <div className="grid gap-6 md:grid-cols-2">
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={orderStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Mid Charts: Top Categories + Low Stock */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={topCategoriesData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lowestStock.map((p) => (
                <li key={p.productId} className="flex justify-between">
                  <span>{p.name}</span>
                  <span
                    className={
                      p.stockQty < p.reorderThreshold
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {p.stockQty} units
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Avg Order Value */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {recentOrders.map(
                (order) =>
                  order && (
                    <div
                      key={order.orderId}
                      className="flex justify-between py-2 border-b"
                    >
                      <div>{order.orderId.slice(0, 8)}...</div>
                      <div>${order.total.toFixed(2)}</div>
                      <div>{order.status}</div>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${avgOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="sales-start">Start Date</Label>
            <Input
              id="sales-start"
              type="date"
              value={salesStart}
              onChange={(e) => setSalesStart(e.target.value)}
            />
            <Label htmlFor="sales-end">End Date</Label>
            <Input
              id="sales-end"
              type="date"
              value={salesEnd}
              onChange={(e) => setSalesEnd(e.target.value)}
            />
            <Label htmlFor="sales-format">Format</Label>
            <Select value={salesFormat} onValueChange={setSalesFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full mt-2"
              onClick={() =>
                handleDownload("sales", salesStart, salesEnd, salesFormat)
              }
            >
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Payments Report */}
        <Card>
          <CardHeader>
            <CardTitle>Payments Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="payments-start">Start Date</Label>
            <Input
              id="payments-start"
              type="date"
              value={paymentsStart}
              onChange={(e) => setPaymentsStart(e.target.value)}
            />
            <Label htmlFor="payments-end">End Date</Label>
            <Input
              id="payments-end"
              type="date"
              value={paymentsEnd}
              onChange={(e) => setPaymentsEnd(e.target.value)}
            />
            <Label htmlFor="payments-format">Format</Label>
            <Select value={paymentsFormat} onValueChange={setPaymentsFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full mt-2"
              onClick={() =>
                handleDownload(
                  "payments",
                  paymentsStart,
                  paymentsEnd,
                  paymentsFormat
                )
              }
            >
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Overdue Report */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="overdue-format">Format</Label>
            <Select value={overdueFormat} onValueChange={setOverdueFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full mt-2"
              onClick={() => handleOverdueDownload(overdueFormat)}
            >
              Download
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
