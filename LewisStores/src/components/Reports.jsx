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
import { Badge } from "@/components/ui/badge";
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
import {
  TrendingUp,
  PieChart,
  BarChart,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Download,
} from "lucide-react";

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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-600">
        Loading reports...
      </div>
    );
  if (error)
    return <div className="text-red-600">Error loading reports: {error.message}</div>;

  // --- Destructure dashboard data ---
  const {
    revenueTrend = [],
    orderStatusDistribution = [],
    topCategoriesBySales = [],
    lowestStock = [],
    avgOrderValue = 0,
    recentOrders = [],
  } = dashboard;

  // --- Chart Data with theme colors ---
  const revenueData = {
    labels: revenueTrend.map((r) => r.period),
    datasets: [
      {
        label: "Revenue",
        data: revenueTrend.map((r) => r.revenue),
        borderColor: "#dc2626", // red-600
        backgroundColor: "rgba(220,38,38,0.2)", // red-600/20
        tension: 0.4,
        pointBackgroundColor: "#dc2626",
      },
    ],
  };

  const orderStatusData = {
    labels: orderStatusDistribution.map((o) => o.status),
    datasets: [
      {
        data: orderStatusDistribution.map((o) => o.count),
        backgroundColor: [
          "#dc2626", // red-600
          "#fbbf24", // yellow-400
          "#334155", // slate-700
          "#f43f5e", // rose-500
          "#6d28d9", // violet-700
          "#0ea5e9", // sky-500
          "#84cc16", // lime-500
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
        backgroundColor: "#dc2626", // red-600
        borderColor: "#dc2626",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-4 sm:px-6 py-16 mx-auto max-w-7xl space-y-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-center text-slate-900 md:text-5xl">
          Reports Dashboard
        </h1>

        {/* Top Charts: Revenue + Order Status */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="overflow-hidden shadow-md rounded-2xl">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Revenue Trend
              </CardTitle>
              <TrendingUp className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md rounded-2xl">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Order Status Distribution
              </CardTitle>
              <PieChart className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                <Pie data={orderStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mid Charts: Top Categories + Low Stock */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="overflow-hidden shadow-md rounded-2xl">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Top Categories by Sales
              </CardTitle>
              <BarChart className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                <Bar data={topCategoriesData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md rounded-2xl">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Low Stock Alerts
              </CardTitle>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4">
                {lowestStock.map((p) => (
                  <li
                    key={p.productId}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span className="font-medium text-lg">{p.name}</span>
                    <Badge
                      className={`text-sm ${
                        p.stockQty < p.reorderThreshold
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                      } font-medium px-3 py-1`}
                    >
                      {p.stockQty} units
                    </Badge>
                  </li>
                )) || (
                  <li className="text-center text-slate-500">No low stock items</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Avg Order Value */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="overflow-hidden shadow-md rounded-2xl">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Recent Orders
              </CardTitle>
              <ShoppingCart className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                {recentOrders.map(
                  (order) =>
                    order && (
                      <div
                        key={order.orderId}
                        className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 text-slate-700"
                      >
                        <span className="font-medium text-lg">{order.orderId.slice(0, 8)}...</span>
                        <span className="text-lg text-slate-900">${order.total.toFixed(2)}</span>
                        <Badge className="text-sm bg-slate-200 text-slate-700 font-medium px-3 py-1">
                          {order.status}
                        </Badge>
                      </div>
                    )
                ) || (
                  <div className="text-center text-slate-500">No recent orders</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl bg-red-50 hover:bg-red-100 transition-colors">
            <CardHeader className="flex items-center justify-between px-8 py-6 bg-red-50">
              <CardTitle className="text-lg font-medium text-slate-600">
                Avg Order Value
              </CardTitle>
              <DollarSign className="w-6 h-6 text-red-600" />
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="text-2xl font-bold text-slate-900">
                ${avgOrderValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Reports Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            Download Reports
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Sales Report */}
            <Card className="shadow-md rounded-2xl">
              <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Sales Report
                </CardTitle>
                <Download className="w-6 h-6 text-red-600" />
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div>
                  <Label htmlFor="sales-start" className="text-sm font-medium text-slate-600">
                    Start Date
                  </Label>
                  <Input
                    id="sales-start"
                    type="date"
                    value={salesStart}
                    onChange={(e) => setSalesStart(e.target.value)}
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="sales-end" className="text-sm font-medium text-slate-600">
                    End Date
                  </Label>
                  <Input
                    id="sales-end"
                    type="date"
                    value={salesEnd}
                    onChange={(e) => setSalesEnd(e.target.value)}
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="sales-format" className="text-sm font-medium text-slate-600">
                    Format
                  </Label>
                  <Select value={salesFormat} onValueChange={setSalesFormat}>
                    <SelectTrigger className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-12 px-8 text-base font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                  onClick={() =>
                    handleDownload("sales", salesStart, salesEnd, salesFormat)
                  }
                >
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Payments Report */}
            <Card className="shadow-md rounded-2xl">
              <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Payments Report
                </CardTitle>
                <Download className="w-6 h-6 text-red-600" />
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div>
                  <Label htmlFor="payments-start" className="text-sm font-medium text-slate-600">
                    Start Date
                  </Label>
                  <Input
                    id="payments-start"
                    type="date"
                    value={paymentsStart}
                    onChange={(e) => setPaymentsStart(e.target.value)}
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="payments-end" className="text-sm font-medium text-slate-600">
                    End Date
                  </Label>
                  <Input
                    id="payments-end"
                    type="date"
                    value={paymentsEnd}
                    onChange={(e) => setPaymentsEnd(e.target.value)}
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="payments-format" className="text-sm font-medium text-slate-600">
                    Format
                  </Label>
                  <Select value={paymentsFormat} onValueChange={setPaymentsFormat}>
                    <SelectTrigger className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-12 px-8 text-base font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
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
            <Card className="shadow-md rounded-2xl">
              <CardHeader className="flex items-center justify-between px-8 py-6 bg-slate-50">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Overdue Report
                </CardTitle>
                <Download className="w-6 h-6 text-red-600" />
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div>
                  <Label htmlFor="overdue-format" className="text-sm font-medium text-slate-600">
                    Format
                  </Label>
                  <Select value={overdueFormat} onValueChange={setOverdueFormat}>
                    <SelectTrigger className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-12 px-8 text-base font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                  onClick={() => handleOverdueDownload(overdueFormat)}
                >
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}