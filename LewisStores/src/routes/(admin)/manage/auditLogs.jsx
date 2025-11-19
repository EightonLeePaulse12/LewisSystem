import { createFileRoute } from "@tanstack/react-router";
import AuditLogs from "@/components/AuditLogs";

export const Route = createFileRoute("/(admin)/manage/auditLogs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuditLogs />;
}
