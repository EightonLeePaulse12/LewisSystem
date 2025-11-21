import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getProductById,
  updateProduct,
  updateProductImages,
} from "@/api/manage";

const EditProduct = ({ productId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: 0,
    costPrice: 0,
    stockQty: 0,
    reorderThreshold: 0,
    imageUrl: null,  // For new file uploads only
  });
  const [currentImageUrl, setCurrentImageUrl] = useState("");  // For displaying existing image

  // Fetch product data
  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        unitPrice: product.unitPrice || 0,
        costPrice: product.costPrice || 0,
        stockQty: product.stockQty || 0,
        reorderThreshold: product.reorderThreshold || 0,
        imageUrl: null,  // Always null for new uploads
      });
      setCurrentImageUrl(product.imageUrl || "");  // Set for display (assumes base64 or URL)
    }
  }, [product]);

  // Mutation for updating
  const mutation = useMutation({
    mutationFn: async ({ details, images }) => {
      await updateProduct(productId, details);
      if (Object.keys(images).length > 0) {
        await updateProductImages(productId, images);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product updated successfully");
      navigate({ to: "/manage/inventory" });
    },
    onError: (error) =>
      toast.error("Failed to update product: " + error.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const details = {
      sku: form.sku,
      name: form.name,
      description: form.description,
      unitPrice: parseFloat(form.unitPrice),
      costPrice: parseFloat(form.costPrice),
      stockQty: parseInt(form.stockQty, 10),
      reorderThreshold: parseInt(form.reorderThreshold, 10),
    };
    const images = {};
    // Only include if a new file is selected (File object, not string)
    if (form.imageUrl && form.imageUrl instanceof File) {
      images.imageUrl = form.imageUrl;
    }
    mutation.mutate({ details, images });
  };

  const handleChange = (e) => {
       const { name, value, files } = e.target;
       if (files && files[0]) {
         const file = files[0];
         if (file.size > 1024 * 500) { // 1MB example
           toast.error("File too large");
           return;
         }
       }
       setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
     };
     

  if (isFetching) return <Loader2 className="mx-auto mt-10 animate-spin" />;

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h2 className="text-3xl font-bold">Edit Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>Update Product</CardTitle>
          <CardDescription>
            Modify the details below. Re-upload images if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>SKU</Label>
              <Input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                name="unitPrice"
                type="number"
                step="0.01"
                value={form.unitPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Cost Price</Label>
              <Input
                name="costPrice"
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Stock Qty</Label>
              <Input
                name="stockQty"
                type="number"
                value={form.stockQty}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Reorder Threshold</Label>
              <Input
                name="reorderThreshold"
                type="number"
                value={form.reorderThreshold}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Current Image</Label>
              {currentImageUrl && (
                <img
                  src={currentImageUrl}  // Assumes full URL or base64 with prefix
                  alt={form.name}
                  loading="lazy"
                  className="max-w-xs max-h-48 object-cover mb-2"
                />
              )}
              <Label>New Image (optional)</Label>
              <Input
                name="imageUrl"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : null}
              Update Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
