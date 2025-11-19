import { createFileRoute } from "@tanstack/react-router";
import UserOrders from "@/components/UserOrders";

export const Route = createFileRoute("/(admin)/orders/manage")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserOrders />;
}
