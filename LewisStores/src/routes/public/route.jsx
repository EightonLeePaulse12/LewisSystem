import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
// import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/public")({
  // beforeLoad: ({ context }) => {
  //     const { isAuthenticated, userRole } = context.auth;
  
  //     if (!isAuthenticated || !["Admin", "Manager"].includes(userRole)) {
  //       throw redirect({ to: "/public/home" });
  //     }
  //   },
  component: PublicLayout,
});