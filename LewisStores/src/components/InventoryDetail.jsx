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
    reorderThreshold: 0,
  });

  const [images, setImages] = useState({
    imageUrl: null,  // For new file uploads only
  });

  const [currentImageUrl, setCurrentImageUrl] = useState("");  // For displaying existing image

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        stockQty: product.stockQty || 0,
        unitPrice: product.unitPrice || 0,
        description: product.description || "",
        reorderThreshold: product.reorderThreshold || 0,
      });
      // Assuming product.imageUrl is base64; add prefix for display
      setCurrentImageUrl(
        product.imageUrl ? `data:image/jpeg;base64,${product.imageUrl}` : ""
      );
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (updateDetails) => updateProduct(inventoryId, updateDetails),
    onSuccess: () => {
      toast.success("Product details updated");
      queryClient.invalidateQueries({ queryKey: ["inventory", "product"] });
      queryClient.invalidateQueries({ queryKey: ["product", inventoryId] });  // Invalidate specific product
    },
    onError: (error) =>
      toast.error("Failed to update details: " + error.message),
  });

  const imagesMutation = useMutation({
    mutationFn: (newImages) => updateProductImages(inventoryId, newImages),
    onSuccess: () => {
      toast.success("Product images updated");
      queryClient.invalidateQueries({ queryKey: ["inventory", "product"] });
      queryClient.invalidateQueries({ queryKey: ["product", inventoryId] });
      navigate("/admin/manage/inventory");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => ({ ...prev, imageUrl: file }));
      setCurrentImageUrl(URL.createObjectURL(file));  // Show preview of new image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      const hasNewImage = images.imageUrl && images.imageUrl instanceof File;
      if (hasNewImage) {
        await imagesMutation.mutateAsync(images);
      } else {
        navigate("/admin/manage/inventory");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-600">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-6 py-12 mx-auto max-w-7xl space-y-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Product Not Found
        </h2>
        <Link to="/admin/manage/inventory">
          <Button
            variant="outline"
            className="h-12 px-8 text-base font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = updateMutation.isPending || imagesMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-6 py-12 mx-auto max-w-7xl space-y-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Edit Product
        </h2>

        <Card className="overflow-hidden shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-900">
              Update Product Details
            </CardTitle>
            <CardDescription className="text-slate-500">
              Modify the product information and images.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-600">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="sku" className="text-sm font-medium text-slate-600">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="stockQty" className="text-sm font-medium text-slate-600">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stockQty"
                    name="stockQty"
                    type="number"
                    value={formData.stockQty}
                    onChange={handleInputChange}
                    required
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice" className="text-sm font-medium text-slate-600">
                    Unit Price
                  </Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderThreshold" className="text-sm font-medium text-slate-600">
                    Reorder Threshold
                  </Label>
                  <Input
                    id="reorderThreshold"
                    name="reorderThreshold"
                    type="number"
                    value={formData.reorderThreshold}
                    onChange={handleInputChange}
                    required
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-600">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-2 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-600">Image</Label>
                {currentImageUrl && (
                  <img
                    src={currentImageUrl}
                    alt="Current product image"
                    loading="lazy"
                    className="object-cover w-full max-w-md h-64 rounded-xl border border-slate-200 shadow-sm"
                  />
                )}
                <div>
                  <Label htmlFor="imageUrl" className="text-sm font-medium text-slate-600">
                    New Image (optional)
                  </Label>
                  <Input
                    id="imageUrl"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 md:flex-row">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 px-8 text-base font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 md:w-auto"
                  id="updateProductButton"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : null}
                  {isPending ? "Updating..." : "Update Product"}
                </Button>
                <Link to="/admin/manage/inventory">
                  <Button
                    variant="outline"
                    className="w-full h-12 px-8 text-base font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 md:w-auto"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDetail;