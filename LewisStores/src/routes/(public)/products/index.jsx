import ProductsSection from "@/components/ProductsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <ProductsSection />
    </>
  );
}
