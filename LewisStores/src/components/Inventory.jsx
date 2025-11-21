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
    mutationFn: (id) => deleteProduct(id), // This function should call the soft delete API
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
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Inventory Management</h2>

      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          placeholder="Filter by category..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Link to="/admin/manage/inventory/add">
          <Button>Add Product</Button>
        </Link>
        <Link to="/manage/inventory/import">
          <Button>Import CSV</Button>
        </Link>
        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage inventory items.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((product) => (
                  <TableRow key={product.productId}>
                    {/* 1. REMOVE the empty Link here */}

                    {/* 2. WRAP the content of the TableCell with the Link */}
                    <TableCell>
                      <Link to={`/admin/manage/inventory/${product.productId}`}>
                        {product.name}
                      </Link>
                    </TableCell>

                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.stockQty}</TableCell>
                    <TableCell>R{product.costPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {/* ... Actions column buttons (Edit/Delete) remain separate ... */}
                      <Link to={`/admin/manage/inventory/${product.productId}`}>
                        <Button variant="outline">Edit</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(product.productId)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={!inventory || inventory.length < 10}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryList;
