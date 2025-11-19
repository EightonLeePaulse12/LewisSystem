import { createFileRoute } from "@tanstack/react-router";
import Import from "@/components/Import";

export const Route = createFileRoute("/(admin)/manage/inventory/import")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Import />;
}
