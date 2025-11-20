import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/RegisterForm";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/register")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      const dashboard =
        context.auth.userRole === "Customer" ? "/" : "/manage/dashboard";
      throw redirect({ to: dashboard });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center w-full p-6 min-h-svh md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
