import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
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

const InventoryDetail = ({ inventoryId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", inventoryId],
    queryFn: () => getProductById(inventoryId),
  });

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    stockQty: 0,
    unitPrice: 0,
    description: "",
    category: "",
    reorderThreshold: 0,
  });

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
  });

  const [previews, setPreviews] = useState({
    image1: "",
    image2: "",
    image3: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        stockQty: product.stockQty,
        unitPrice: product.unitPrice,
        description: product.description || "",
        category: product.category || "",
        reorderThreshold: product.reorderThreshold,
      });

      setPreviews({
        image1: product.image1
          ? `data:image/jpeg;base64,${product.image1}`
          : "",
        image2: product.image2
          ? `data:image/jpeg;base64,${product.image2}`
          : "",
        image3: product.image3
          ? `data:image/jpeg;base64,${product.image3}`
          : "",
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (updateDetails) => updateProduct(inventoryId, updateDetails),
    onSuccess: () => {
      toast.success("Product details updated");
      queryClient.invalidateQueries({ queryKey: ["inventory", "product"] });
    },
    onError: (error) =>
      toast.error("Failed to update details: " + error.message),
  });

  const imagesMutation = useMutation({
    mutationFn: (newImages) => updateProductImages(inventoryId, newImages),
    onSuccess: () => {
      toast.success("Product images updated");
      queryClient.invalidateQueries({ queryKey: ["inventory", "product"] });
      navigate("/manage/inventory");
    },
    onError: (error) =>
      toast.error("Failed to update images: " + error.message),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "stockQty" || name === "reorderThreshold"
          ? parseInt(value, 10)
          : name === "unitPrice"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => ({ ...prev, [imageKey]: file }));
      setPreviews((prev) => ({
        ...prev,
        [imageKey]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      const hasNewImages = Object.values(images).some((img) => img !== null);
      if (hasNewImages) {
        await imagesMutation.mutateAsync(images);
      } else {
        navigate("/manage/inventory");
      }
    } catch (error) {
      // Error handled in onError
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-6xl py-10 mx-auto">
        <h2 className="mb-4 text-3xl font-bold">Product Not Found</h2>
        <Link to="/manage/inventory">
          <Button>Back to Inventory</Button>
        </Link>
      </div>
    );
  }

  const isPending = updateMutation.isPending || imagesMutation.isPending;

  return (
    <div className="container max-w-6xl py-10 mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Edit Product</h2>

      <Card>
        <CardHeader>
          <CardTitle>Update Product Details</CardTitle>
          <CardDescription>
            Modify the product information and images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stockQty">Stock Quantity</Label>
                <Input
                  id="stockQty"
                  name="stockQty"
                  type="number"
                  value={formData.stockQty}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="reorderThreshold">Reorder Threshold</Label>
                <Input
                  id="reorderThreshold"
                  name="reorderThreshold"
                  type="number"
                  value={formData.reorderThreshold}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-4">
              <Label>Images</Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {["image1", "image2", "image3"].map((imgKey) => (
                  <div key={imgKey}>
                    <Label htmlFor={imgKey}>
                      {imgKey.charAt(0).toUpperCase() + imgKey.slice(1)}
                    </Label>
                    <Input
                      id={imgKey}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, imgKey)}
                    />
                    {previews[imgKey] && (
                      <img
                        src={previews[imgKey]}
                        alt={`${imgKey} preview`}
                        className="object-cover w-full h-32 mt-2 border rounded-md"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : null}
                {isPending ? "Updating..." : "Update Product"}
              </Button>
              <Link to={`/manage/inventory/${inventoryId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDetail;
