import { createFileRoute, useParams } from "@tanstack/react-router";
import SingleOrderManagement from "@/components/SingleOrderManagement";

export const Route = createFileRoute("/admin/manage/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = useParams({ from: Route.id });

  return <SingleOrderManagement orderId={orderId}/>;
}
