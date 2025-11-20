import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { importProducts } from "@/api/manage"; // The fixed function from Step 1
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ImportPage = () => {
  const [file, setFile] = useState(null);

  const importMutation = useMutation({
    mutationFn: importProducts,
    onSuccess: (data) => {
      toast.success(data || "Import successful!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return toast.error("Please select a file first");
    importMutation.mutate(file);
  };

  return (
    <div className="p-10 space-y-4">
      <h2 className="text-2xl font-bold">Import Products</h2>
      
      <div className="grid max-w-sm gap-2">
        <Input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
        />
        
        <Button 
          onClick={handleUpload} 
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? "Uploading..." : "Start Import"}
        </Button>
      </div>
    </div>
  );
};

export default ImportPage;