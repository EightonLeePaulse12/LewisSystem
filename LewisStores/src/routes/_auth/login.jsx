import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";
import { redirect } from "@tanstack/react-router";
import { GuestNavbar } from "@/components/NavigationMenus/GuestNavbar";

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
    <>
    <GuestNavbar />
      <div className="flex items-center justify-center w-full min-h-svh">
        <div className="w-full max-w-4xl">
          {" "}
          {/* Changed max-w-sm to max-w-4xl to match the form's width */}
          <LoginForm />
        </div>
      </div>
    </>
  );
}
