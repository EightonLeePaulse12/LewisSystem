import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { FetchProducts } from "@/api/products";
import { ProductsSidebar } from "@/components/ProductsSidebar"; // Your new component

export default function ProductsSection() {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  // Fetch a large page of products and perform client-side filtering/pagination
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products-all", search],
    queryFn: () => FetchProducts(1, 1000, search),
  });

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory = !category || p.category?.name === category;
    const matchesPrice =
      p.unitPrice >= priceRange.min && p.unitPrice <= priceRange.max;
    return matchesCategory && matchesPrice;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * limit;
  const end = start + limit;
  const pageProducts = filteredProducts.slice(start, end);

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
                {pageProducts.length > 0 ? (
                  pageProducts.map((product) => (
                    <Card key={product.productId}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>

                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} loading="lazy" className="aspect-square" />
                        )}
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
                        <Link to={`/public/products/${product.productId}`}>
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
                <span className="self-center">
                  Page {page} of {totalPages}
                </span>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
