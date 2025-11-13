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
import { FetchProducts } from "@/api/products";

export function ProductsSidebar({
  onSearchChange,
  onCategoryChange,
  onPriceChange,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
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
  }, [search, onSearchChange])

  useEffect(() => {
    onCategoryChange(category);
    onPriceChange({ min: minPrice, max: maxPrice });
  }, [category, minPrice, maxPrice, onCategoryChange, onPriceChange]);

  return (
    <Card className="w-full lg:w-64">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search by Name or SKU</Label>
          <Input
            id="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice === Infinity ? "" : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || Infinity)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
