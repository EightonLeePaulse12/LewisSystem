import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FetchSingleProduct } from "@/api/products";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";

export default function ProductDetails({ productId }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => FetchSingleProduct(productId),
  });
  const { addItem } = useCart();

  if (isLoading) return <p className="mt-8 text-center">Loading...</p>;
  if (!product) return <p className="mt-8 text-center">Product not found</p>;

  return (
    <div className="container p-4 mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <p>{product.description}</p>
          <p className="text-lg font-semibold">${product.unitPrice}</p>
          <p>Stock: {product.stockQty}</p>
          <p>Category: {product.category?.name || "N/A"}</p>
          {/* Placeholder for images: Assume base64 or URL in DTO */}
          {/* <img src={`data:image/jpeg;base64,${product.image1}`} alt="Product" className="w-full rounded-md" /> */}
          <Button
            onClick={() =>
              addItem({
                productId: product.productId,
                name: product.name,
                unitPrice: product.unitPrice,
                image: product.image1 || "",
                quantity: 1,
              })
            }
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
