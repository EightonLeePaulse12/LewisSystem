import { createFileRoute } from "@tanstack/react-router";
import OrderDetail from "@/components/OrderDetail";

export const Route = createFileRoute("/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  return <OrderDetail orderId={orderId} />;
}
