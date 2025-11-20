import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      const dashboard =
        context.auth.userRole === "Customer" ? "/" : "/admin/manage/dashboard";
      throw redirect({ to: dashboard });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center w-full p-6 min-h-svh md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}