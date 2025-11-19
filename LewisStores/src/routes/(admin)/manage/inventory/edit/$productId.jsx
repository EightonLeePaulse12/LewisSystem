import { createFileRoute } from "@tanstack/react-router";
import EditProduct from "@/components/EditProduct";

export const Route = createFileRoute("/(admin)/manage/inventory/edit/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();

  return <EditProduct productId={productId} />;
}
