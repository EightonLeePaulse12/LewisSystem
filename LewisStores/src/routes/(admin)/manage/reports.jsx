import { createFileRoute } from "@tanstack/react-router";
import Reports from "@/components/Reports";

export const Route = createFileRoute("/(admin)/manage/reports")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Reports />;
}
