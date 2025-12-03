import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { getOrdersAdmin, updateOrderStatus } from "@/api/manage";
import { Link } from "@tanstack/react-router";

const OrdersManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Fixed: Initialize to "all" to avoid empty string
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ["manageOrders", page, 10],
    queryFn: () => getOrdersAdmin(page, 10),
  });

  // Memoized filtering
  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.filter((order) => {
      const matchesSearch =
        !debouncedSearch ||
        order.orderId.toString().includes(debouncedSearch) ||
        (order.customerName &&
          order.customerName
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter; // Fixed: Check for "all"
      const orderDate = new Date(order.orderDate);
      const matchesDate =
        (!startDate || orderDate >= new Date(startDate)) &&
        (!endDate || orderDate <= new Date(endDate));
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [rawOrders, debouncedSearch, statusFilter, startDate, endDate]);

  const updateMutation = useMutation({
    mutationFn: ({ id, newStatus }) => updateOrderStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageOrders"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error("Failed to update order status: " + error.message);
    },
  });

  const handleStatusChange = (id, newStatus) =>
    updateMutation.mutate({ id, newStatus });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all"); // Fixed: Reset to "all"
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold" id="oMheading">Orders Management</h2>

      <Card>
        <CardHeader>
          <CardTitle id="manageOrdersTitle">Manage Orders</CardTitle>
          <CardDescription id="manageOrdersDescription">
            View, search, filter, and update order statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2"  id="orderSearchIcon">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search by Order ID or Customer Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
                id="orderSearchInput"
              />
            </div>
            <div className="flex items-center gap-2" id="orderStatusFilterIcon">
              <Filter className="w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" id="orderStatusFilter">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>{" "}
                  {/* Fixed: Use "all" instead of "" */}
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Packed">Packed</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
              id="orderStartDateFilter"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
              id="orderEndDateFilter"
            />
            <Button id="resetFiltersButton" variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">
              No orders found matching your filters on this page.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow id="ordersTableHeaderRow">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.customerId || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>R{order.total.toFixed(2)}</TableCell>
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
                    <TableCell>
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(order.orderId, value.toString())
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Packed">Packed</SelectItem>
                          <SelectItem value="Dispatched">Dispatched</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/manage/orders/${order.orderId}`}>
                        <Button variant="outline" className="mt-4">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              id="previousPageButton"
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!rawOrders || rawOrders.length < 10}
              id="nextPageButton"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;
