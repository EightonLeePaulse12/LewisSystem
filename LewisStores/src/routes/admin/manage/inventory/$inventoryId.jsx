import { createFileRoute } from "@tanstack/react-router";
import InventoryDetail from "@/components/InventoryDetail";

export const Route = createFileRoute("/admin/manage/inventory/$inventoryId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { inventoryId } = Route.useParams();

  return <InventoryDetail inventoryId={inventoryId} />;
}
