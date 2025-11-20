// src/components/StoreSettingsPage.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FetchStoreSettings, UpdateStoreSettings } from "@/api/manage";

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: FetchStoreSettings,
  });

  const [formData, setFormData] = useState({
    StoreName: "",
    Address: "",
    TaxRate: 0,
    Currency: "USD",
  });

  useState(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: UpdateStoreSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
      // Add toast success
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Store Settings</h1>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="storeName">Store Name</Label>
        <Input id="storeName" name="StoreName" value={formData.StoreName} onChange={handleChange} />
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="Address" value={formData.Address} onChange={handleChange} />
        <Label htmlFor="taxRate">Tax Rate</Label>
        <Input id="taxRate" name="TaxRate" type="number" step="0.01" value={formData.TaxRate} onChange={handleChange} />
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" name="Currency" value={formData.Currency} onChange={handleChange} />
        <Button type="submit" className="mt-4">
          Save Changes
        </Button>
      </form>
    </div>
  );
}