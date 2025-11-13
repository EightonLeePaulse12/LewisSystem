import ProductDetails from "@/components/ProductDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  return (
    <>
      <ProductDetails productId={productId}/>
    </>
  );
}
