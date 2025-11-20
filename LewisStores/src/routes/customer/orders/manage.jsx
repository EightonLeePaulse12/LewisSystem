import { createFileRoute } from "@tanstack/react-router";
import UserOrders from "@/components/UserOrders";

export const Route = createFileRoute("/customer/orders/manage")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserOrders />;
}
