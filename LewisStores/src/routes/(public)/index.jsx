// src/routes/index.jsx (updated to be under layout, but no component change)
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="mb-4 text-4xl font-bold">Welcome to Lewis E-Commerce</h1>
      <p className="mb-6 text-lg">Shop our latest products!</p>
      <Link to="/products">
        <Button>View Catalog</Button>
      </Link>
    </div>
  );
}
