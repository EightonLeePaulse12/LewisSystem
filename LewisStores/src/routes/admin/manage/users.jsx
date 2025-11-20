import { createFileRoute } from "@tanstack/react-router";
import UsersManagement from "@/components/UsersManagement";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/manage/users")({
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== "Admin") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <UsersManagement />;
}
