import ProductsSection from "@/components/ProductsSection";
import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/public/products/")({
  beforeLoad: ({ context }) => {
    const {  userRole } = context.auth;
    if (["Admin", "Manager"].includes(userRole)) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <ProductsSection />
    </>
  );
}
