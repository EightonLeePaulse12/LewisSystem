import ProductsSection from "@/components/ProductsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <ProductsSection />
    </>
  );
}
