import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { FetchProducts } from "@/api/products";
import { ProductsSidebar } from "@/components/ProductsSidebar";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming available for loading
import { Package, Eye } from "lucide-react"; // Added icons
import { cn } from "@/lib/utils"; // Assuming available
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

export default function ProductsSection() {
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

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
    <div
      className={cn(
        "min-h-screen bg-linear-to-br from-blue-50 to-red-100 p-4"
      )}
    >
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Product Catalog</h1>
          <p className="mt-2 text-gray-600">Discover our amazing collection</p>
        </div>

        <div className="flex justify-end mb-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-4 w-80">
              <h2 className="mb-4 text-lg font-semibold">Filters</h2>
              <ProductsSidebar
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
                onPriceChange={setPriceRange}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProductsSidebar
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onPriceChange={setPriceRange}
          />
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card
                    key={i}
                    className="bg-white border border-gray-200 shadow-sm"
                  >
                    <CardHeader className="p-3">
                      <Skeleton className="w-3/4 h-5" />
                      <Skeleton className="w-full h-32 rounded-md" />
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-2/3 h-3" />
                      <Skeleton className="w-1/2 h-4" />
                      <Skeleton className="w-full h-8" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pageProducts.length > 0 ? (
                    pageProducts.map((product) => (
                      <Card
                        key={product.productId}
                        className="pt-0 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 group"
                      >
                        {/* FULL-WIDTH IMAGE AT TOP OF CARD */}
                        <div className="w-full h-48 overflow-hidden rounded-t-md">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              loading="lazy"
                              className=""
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-100">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <CardHeader>
                          <CardTitle className="text-lg font-semibold leading-tight text-gray-900">
                            {product.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2">
                          <p className="text-xs text-gray-600">
                            SKU:{" "}
                            <span className="font-medium">{product.sku}</span>
                          </p>

                          <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">
                            {product.description?.substring(0, 80)}...
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-red-600">
                              R{product.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Stock:{" "}
                              <span className="font-medium">
                                {product.stockQty}
                              </span>
                            </p>
                          </div>

                          <Link to={`/public/products/${product.productId}`}>
                            <Button
                              size="sm"
                              className="w-full text-white transition-colors duration-200 bg-red-600 hover:bg-red-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="py-5 text-center col-span-full">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg text-gray-600">
                        No products found.
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters.
                      </p>
                    </div>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="hover:bg-red-50"
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum = Math.max(1, page - 2) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className={cn(
                                "w-8 h-8",
                                pageNum === page
                                  ? "bg-red-600 text-white"
                                  : "hover:bg-red-50"
                              )}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="hover:bg-red-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
