import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex items-center justify-center w-full h-screen p-2 ">
      <h1>Hello, World!</h1>
    </div>
  );
}
