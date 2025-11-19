import { createFileRoute } from "@tanstack/react-router";
import StoreSettings from "@/components/StoreSettings";

export const Route = createFileRoute("/(admin)/manage/storeSettings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StoreSettings />;
}
