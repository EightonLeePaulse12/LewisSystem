import Dashboard from "@/components/Dashboard";
import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/manage/dashboard")({
  beforeLoad: ({ context }) => {
    console.log(context);
    if (!context.auth.isAuthenticated || context.auth.userRole === "Customer") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboard />;
}
