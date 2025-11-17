import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { getInventory, createProduct, updateProduct, deleteProduct, importProducts, exportProducts, uploadProductImages } from "@/api/manage";

const Inventory = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [newProduct, setNewProduct] = useState({ Name: "", Description: "", Price: 0, StockQty: 0, ReorderThreshold: 0 });
  const [editingProduct, setEditingProduct] = useState(null);
//   const [images, setImages] = useState({});

  const { data: products, isLoading } = useQuery({
    queryKey: ["inventory", page, 10, filter],
    queryFn: () => getInventory(page, 10, filter),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product created");
      setNewProduct({ Name: "", Description: "", Price: 0, StockQty: 0, ReorderThreshold: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product updated");
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product deleted");
    },
  });

  const importMutation = useMutation({
    mutationFn: importProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Products imported");
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportProducts,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.csv");
      document.body.appendChild(link);
      link.click();
    },
  });

  const handleCreate = () => createMutation.mutate(newProduct);
  const handleUpdate = () => updateMutation.mutate({ id: editingProduct.ProductId, data: editingProduct });
  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleImport = (file) => importMutation.mutate(file);
  const handleExport = () => exportMutation.mutate();

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Inventory Management</h2>

      {/* Filters and Actions */}
      <div className="flex space-x-4">
        <Input placeholder="Filter products" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Button onClick={handleExport}>Export CSV</Button>
        <input type="file" accept=".csv" onChange={(e) => handleImport(e.target.files[0])} />
      </div>

      {/* Create Product Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Name</Label>
            <Input value={newProduct.Name} onChange={(e) => setNewProduct({ ...newProduct, Name: e.target.value })} />
            {/* Add other fields similarly */}
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardContent>
          {isLoading ? <Loader2 className="animate-spin" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock Qty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.stockQty}</TableCell>
                    <TableCell>
                      <Button onClick={() => setEditingProduct(product)}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDelete(product.ProductId)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog (similar to create) */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Name</Label>
              <Input value={editingProduct.Name} onChange={(e) => setEditingProduct({ ...editingProduct, Name: e.target.value })} />
              {/* Add other fields */}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
