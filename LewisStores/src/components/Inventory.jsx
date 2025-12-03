import React, { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { getInventory, deleteProduct } from "@/api/manage";
import { Link } from "@tanstack/react-router";
import { exportProducts } from "@/api/manage";

const InventoryList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory", page, 10, filter],
    queryFn: () => getInventory(page, 10, filter),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product deleted");
    },
    onError: (error) => toast.error("Failed to delete: " + error.message),
  });

  const handleExport = async () => {
    try {
      const blob = await exportProducts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Products exported successfully");
    } catch (error) {
      toast.error("Failed to export products: " + error.message);
    }
  };

  const filteredInventory =
    inventory?.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-6 py-12 mx-auto space-y-12 max-w-7xl">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900" id="inventoryPageHeading">
          Inventory Management
        </h2>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 transition-all rounded-full bg-slate-50 border-slate-200 focus:bg-white"
              id="inventorySearch"
            />
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400"  id="inventorySearchIcon" />
          </div>
          <div className="relative flex-1">
            <Input
              placeholder="Filter by category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 transition-all rounded-full bg-slate-50 border-slate-200 focus:bg-white"
              id="inventoryFilter"
            />
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400"  id="inventoryFilterIcon" />
          </div>
          <div className="flex gap-4 md:ml-auto">
            <Link to="/admin/manage/inventory/add">
              <Button
                size="lg"
                className="h-12 px-6 text-base font-semibold text-white bg-red-600 shadow-lg hover:bg-red-700 shadow-red-900/20"
                id="addProductButton"
              >
                Add Product
              </Button>
            </Link>
            <Link to="/admin/manage/inventory/import">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base font-semibold text-red-600 border-red-200 hover:bg-red-50"
                id="importProductButton"
              >
                Import CSV
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base font-semibold text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleExport}
              id="exportProductButton"
            >
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-900" id="inventoryCardTitle">
              Products
            </CardTitle>
            <CardDescription className="text-slate-500" id="inventoryCardDescription">
              Manage your inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50" id="inventoryTableHeader">
                    <TableHead className="text-slate-600" id="inventoryTableName">Name</TableHead>
                    <TableHead className="text-slate-600" id="inventoryTableSKU">SKU</TableHead>
                    <TableHead className="text-slate-600" id="inventoryTableStock">Stock</TableHead>
                    <TableHead className="text-slate-600" id="inventoryTablePrice">Price</TableHead>
                    <TableHead className="text-slate-600" id="inventoryTableActions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((product) => (
                    <TableRow
                      key={product.productId}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        <Link
                          to={`/admin/manage/inventory/${product.productId}`}
                          className="transition-colors hover:text-red-600"
                          id="inventoryProductNameLink"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-700" id="inventoryProductSKU">
                        {product.sku}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            product.stockQty < 10
                              ? "bg-red-600 text-white"
                              : "bg-green-600 text-white"
                          } font-medium`}
                           id="inventoryStockBadge"
                        >
                          {product.stockQty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900" id="inventoryProductPrice">
                        R{product.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex gap-2" id="inventoryProductActions">
                        <Link to={`/admin/manage/inventory/${product.productId}`}>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="text-white bg-red-600 hover:bg-red-700"
                          onClick={() => deleteMutation.mutate(product.productId)}
                          id="deleteProductButton"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50 border-slate-100">
              <Button
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                id="inventory-pagination-prev"
              >
                Previous
              </Button>
              <span className="font-medium text-slate-600">Page {page}</span>
              <Button
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={!inventory || inventory.length < 10}
                id="inventory-pagination-next"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryList;