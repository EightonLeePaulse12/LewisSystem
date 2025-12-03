import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, DollarSign } from "lucide-react"; // Added icons
import { FetchProducts } from "@/api/products";

export function ProductsSidebar({
  onSearchChange,
  onCategoryChange,
  onPriceChange,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all"); // Changed initial state to "all"
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);

  const { data: allProductsForCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => FetchProducts(1, 1000, ""),
  });

  const categories = [
    ...new Set(
      allProductsForCategories.map((p) => p.category?.name).filter(Boolean)
    ),
  ];

  useEffect(() => {
    onSearchChange(search);
  }, [search, onSearchChange]);

  useEffect(() => {
    const actualCategory = category === "all" ? "" : category; // Convert "all" back to ""
    onCategoryChange(actualCategory);
    onPriceChange({ min: minPrice, max: maxPrice });
  }, [category, minPrice, maxPrice, onCategoryChange, onPriceChange]);

  return (
    <Card className="w-full border-0 shadow-xl lg:w-80 bg-white/80 backdrop-blur-sm top-4 h-fit">
      <CardHeader className="pb-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full">
          <Filter className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label
            htmlFor="search"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Search className="w-4 h-4" />
            Search by Name or SKU
          </Label>
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              id="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <Label
            htmlFor="category"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="py-3 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>{" "}
              {/* Changed value to "all" */}
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            R
            Price Range
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <h2 className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3.5 top-3.5">R</h2>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                className="py-3 pl-8 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative flex-1">
              <h2 className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3.5 top-3.5">R</h2>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice === Infinity ? "" : maxPrice}
                onChange={(e) =>
                  setMaxPrice(Number(e.target.value) || Infinity)
                }
                className="py-3 pl-8 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
