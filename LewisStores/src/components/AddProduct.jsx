import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"; // Assuming these exist based on RegisterForm
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProduct } from "@/api/manage";
import { 
  PackagePlus, 
  Barcode, 
  Package, 
  FileText, 
  Ruler, 
  DollarSign, 
  Coins, 
  Layers, 
  AlertTriangle, 
  ImagePlus,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";

const AddProduct = ({ className, ...props }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Existing State Logic
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    dimensions: "",
    unitPrice: 0,
    costPrice: 0,
    stockQty: 0,
    reorderThreshold: 0,
    imageUrl: null,
  });

  // Existing Mutation Logic
  const mutation = useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product created successfully");
      navigate({ to: "/admin/manage/inventory" }); // Updated path based on sidebar context
    },
    onError: (error) => toast.error("Failed to create: " + error.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const isLoading = mutation.isPending;

  return (
    <div className={cn("flex flex-col gap-6 justify-center items-center p-4 w-full", className)} {...props}>
      <Card className="w-full max-w-5xl border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        
        {/* Header Section */}
        <CardHeader className="pb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full">
            <PackagePlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Add New Product</CardTitle>
          <CardDescription className="text-gray-600">
            Enter the product details to add it to your inventory
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: General Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Package className="w-5 h-5 text-red-500" />
                General Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="sku" className="text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</FieldLabel>
                  <div className="relative">
                    <Barcode className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="sku"
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      required
                      placeholder="e.g. FURN-001"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</FieldLabel>
                  <div className="relative">
                    <Package className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Leather Sofa"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="description" className="text-sm font-medium text-gray-700">Description</FieldLabel>
                  <div className="relative">
                    <FileText className="absolute w-5 h-5 text-gray-400 top-3 left-3" />
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter a detailed description of the product..."
                      className="min-h-[100px] py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Section 2: Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <DollarSign className="w-5 h-5 text-red-500" />
                Pricing & Inventory
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="unitPrice" className="text-sm font-medium text-gray-700">Unit Price</FieldLabel>
                  <div className="relative">
                    <DollarSign className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="unitPrice"
                      name="unitPrice"
                      type="number"
                      value={form.unitPrice}
                      onChange={handleChange}
                      required
                      className="py-3 pr-4 transition-all duration-200 border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="costPrice" className="text-sm font-medium text-gray-700">Cost Price</FieldLabel>
                  <div className="relative">
                    <Coins className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      value={form.costPrice}
                      onChange={handleChange}
                      required
                      className="py-3 pr-4 transition-all duration-200 border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="stockQty" className="text-sm font-medium text-gray-700">Initial Stock</FieldLabel>
                  <div className="relative">
                    <Layers className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="stockQty"
                      name="stockQty"
                      type="number"
                      value={form.stockQty}
                      onChange={handleChange}
                      required
                      className="py-3 pr-4 transition-all duration-200 border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="reorderThreshold" className="text-sm font-medium text-gray-700">Reorder Level</FieldLabel>
                  <div className="relative">
                    <AlertTriangle className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="reorderThreshold"
                      name="reorderThreshold"
                      type="number"
                      value={form.reorderThreshold}
                      onChange={handleChange}
                      required
                      className="py-3 pr-4 transition-all duration-200 border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Section 3: Specifications */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Ruler className="w-5 h-5 text-red-500" />
                Specifications
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dimensions" className="text-sm font-medium text-gray-700">Dimensions</FieldLabel>
                  <div className="relative">
                    <Ruler className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={form.dimensions}
                      onChange={handleChange}
                      placeholder="e.g. 10x20x30 cm"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="image" className="text-sm font-medium text-gray-700">Product Image</FieldLabel>
                  <div className="relative">
                    <ImagePlus className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="image"
                      name="imageUrl"
                      type="file"
                      onChange={handleChange}
                      className="pb-2.5 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                  </div>
                  <FieldDescription className="mt-1 text-xs text-gray-500">
                    Upload a high-quality image (JPG, PNG).
                  </FieldDescription>
                </Field>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 font-medium text-white transition-all duration-200 bg-red-500 rounded-lg shadow-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Creating Product...
                  </div>
                ) : (
                  <span className="flex items-center text-lg">
                    <Save className="w-5 h-5 mr-2" />
                    Save Product
                  </span>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;