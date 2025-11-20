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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/api/manage";

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    dimensions: "",
    unitPrice: 0,
    costPrice: 0,
    stockQty: 0,
    reorderThreshold: 0,
    image1: null,
    image2: null,
    image3: null,
  });

  const mutation = useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Product created");
      navigate({ to: "/manage/inventory" });
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

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h2 className="text-3xl font-bold">Add Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>Fill in the details below.</CardDescription>
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
              <Label>Dimensions</Label>
              <Input
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="e.g., 10x20x30 cm"
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                name="unitPrice"
                type="number"
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
              <Label>Image 1</Label>
              <Input name="image1" type="file" onChange={handleChange} />
            </div>
            <div>
              <Label>Image 2</Label>
              <Input name="image2" type="file" onChange={handleChange} />
            </div>
            <div>
              <Label>Image 3</Label>
              <Input name="image3" type="file" onChange={handleChange} />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
