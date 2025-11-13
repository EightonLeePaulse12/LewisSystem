import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { FetchProducts } from "@/api/products";
import { ProductsSidebar } from "@/components/ProductsSidebar"; // Your new component

export default function ProductsSection() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", page, limit, search],
    queryFn: () => FetchProducts(page, limit, search),
    onSuccess: (data) => console.log("Fetched Products: ", data),
    throwOnError: (data) => console.log("Error: ", data),
  });

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !category || p.category?.name === category;
    const matchesPrice =
      p.unitPrice >= priceRange.min && p.unitPrice <= priceRange.max;
    return matchesCategory && matchesPrice;
  });

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Product Catalog</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductsSidebar
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onPriceChange={setPriceRange}
        />
        <div className="flex-1">
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Card key={product.productId}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                        <p>{product.description?.substring(0, 100)}...</p>
                        <p className="mt-2 font-semibold">
                          ${product.unitPrice}
                        </p>
                        <p>Stock: {product.stockQty}</p>
                        <Link to={`/products/${product.productId}`}>
                          <Button variant="outline" className="mt-4">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center col-span-full">
                    No products found.
                  </p>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="self-center">Page {page}</span>
                <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
