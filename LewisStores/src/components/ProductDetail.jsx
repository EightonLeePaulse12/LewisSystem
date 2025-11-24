import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router"; // Assuming router is used based on previous context
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FetchSingleProduct } from "@/api/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Optional: for feedback

export default function ProductDetails({ productId }) {
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => FetchSingleProduct(productId),
  });

  const handleAddToCart = () => {
    addItem({
      productId: product.productId,
      name: product.name,
      unitPrice: product.unitPrice,
      image: product.imageUrl || "",
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="w-32 h-10 rounded-md" />
          </div>
          <Card className="overflow-hidden border-gray-200 shadow-lg">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-[400px] bg-gray-100 p-8 flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
                <div className="p-8 space-y-6">
                  <Skeleton className="w-24 h-4 rounded-full" />
                  <Skeleton className="w-3/4 h-10" />
                  <Skeleton className="w-32 h-8" />
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-4" />
                  </div>
                  <Skeleton className="w-full h-12 mt-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Error / Not Found State ---
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100">
        <Card className="max-w-md mx-auto text-center border-red-100 shadow-lg">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Not Found
            </h2>
            <p className="text-gray-500">
              The product you are looking for does not exist or has been
              removed.
            </p>
            <Link to="/products">
              <Button className="mt-4 bg-red-600 hover:bg-red-700">
                Back to Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-red-100">
      <div className="container max-w-5xl py-8 mx-auto">
        {/* Navigation Back */}
        <div className="mb-6">
          <Link to="/public/products" className="inline-flex">
            <Button
              variant="ghost"
              className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden bg-white border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Image Area */}
              <div className="relative bg-gray-50 p-8 flex items-center justify-center min-h-[400px]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-contain w-full h-full max-h-[400px] transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <Package className="w-24 h-24 mb-4" />
                    <span className="text-sm font-medium text-gray-400">
                      No Image Available
                    </span>
                  </div>
                )}

                {/* Floating Stock Badge */}
                <div className="absolute top-4 left-4">
                  {product.stockQty > 0 ? (
                    <Badge className="gap-1 pl-1 pr-2 text-green-700 bg-green-100 border-green-200 shadow-sm hover:bg-green-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 pl-1 pr-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right Column: Details Area */}
              <div className="flex flex-col h-full p-8">
                {/* Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
                    >
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                    <span className="flex items-center gap-1 font-mono text-xs text-gray-400">
                      <Tag className="w-3 h-3" />
                      {product.sku}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold leading-tight text-gray-900">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-red-600">
                    ${product.unitPrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-sm text-gray-400">USD</span>
                </div>

                <Separator className="my-2" />

                {/* Description */}
                <div className="flex-grow py-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {product.description ||
                      "No description available for this product."}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Footer / Actions */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Availability:</span>
                    <span className="font-medium text-gray-900">
                      {product.stockQty} units
                    </span>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stockQty <= 0}
                    className={cn(
                      "w-full text-base font-semibold shadow-md transition-all duration-200",
                      product.stockQty > 0
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stockQty > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
