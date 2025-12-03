import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { FetchProducts } from "@/api/products";
import { ProductsSidebar } from "@/components/ProductsSidebar";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming available for loading
import { Package, Eye, ShoppingCart } from "lucide-react"; // Added icons
import { cn } from "@/lib/utils"; // Assuming available
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner"; // Optional: for feedback

export default function ProductsSection() {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products-all", search],
    queryFn: () => FetchProducts(1, 1000, search),
  });

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory =
      !category ||
      p.category?.name?.toLowerCase().trim() === category.toLowerCase().trim();

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

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    if (product.stockQty <= 0) {
      toast.error("This product is out of stock.");
      return;
    }

    addItem({
      productId: product.productId,
      name: product.name,
      unitPrice: product.unitPrice,
      image: product.imageUrl || "",
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  return (
    <div
      className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8")}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full shadow-md">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-4xl font-bold text-gray-900"
            id="productCatalogTitle"
          >
            Product Catalog
          </h1>
          <p className="mt-2 text-lg text-gray-600" id="productCatalogSubtitle">
            Discover our amazing collection
          </p>
        </div>

        <div
          className="flex justify-end mb-6 lg:hidden"
          id="filterMobileButton"
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-2 rounded-full shadow-sm"
                id="filterButton"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-6 w-80 rounded-r-2xl">
              <h2 className="mb-6 text-xl font-semibold text-gray-900" id="filtersTitle">
                Filters
              </h2>
              <ProductsSidebar
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
                onPriceChange={setPriceRange}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
            <ProductsSidebar
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onPriceChange={setPriceRange}
            />
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card
                    key={i}
                    className="pt-0 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl"
                  >
                    <Skeleton className="w-full h-48" />
                    <CardHeader className="p-4 pt-0">
                      <Skeleton className="w-3/4 h-6" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-2/3 h-3" />
                      <Skeleton className="w-1/2 h-4" />
                      <Skeleton className="w-full h-10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pageProducts.length > 0 ? (
                    pageProducts.map((product) => (
                      <Card
                        key={product.productId}
                        className="pt-0 pb-0 overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-xl hover:-translate-y-1 group"
                      >
                        {/* FULL-WIDTH IMAGE AT TOP OF CARD */}
                        <div className="w-full h-48 overflow-hidden bg-gray-50">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              loading="lazy"
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Package className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>

                        <CardHeader className="px-4 py-3">
                          <CardTitle className="text-lg font-semibold leading-tight text-gray-900 line-clamp-1">
                            {product.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 pt-0 pb-4 space-y-2">
                          <p className="text-xs text-gray-500">
                            SKU: <span className="font-medium text-gray-600">{product.sku}</span>
                          </p>

                          <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                            {product.description?.substring(0, 80)}...
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-lg font-bold text-red-600">
                              R{product.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock: <span className="font-medium text-gray-600">{product.stockQty}</span>
                            </p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Link to={`/public/products/${product.productId}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-blue-600 border-blue-600 rounded-full hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="flex-1 text-white bg-red-600 rounded-full hover:bg-red-700"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stockQty <= 0}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-white shadow-sm col-span-full rounded-2xl">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-semibold text-gray-900">
                        No products found
                      </p>
                      <p className="mt-2 text-gray-500">
                        Try adjusting your filters or search terms
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
                      className="rounded-full hover:bg-red-50"
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
                                "min-w-[2.5rem] rounded-full",
                                pageNum === page
                                  ? "bg-red-600 text-white hover:bg-red-700"
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
                      className="rounded-full hover:bg-red-50"
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