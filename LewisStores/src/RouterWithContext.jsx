// src/RouterWithContext.tsx
import { RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { useAuth } from "@/hooks/useAuth";
import { createRouter } from "@tanstack/react-router";

const router = createRouter({ routeTree });

export function RouterWithContext() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated,
          userRole,
        },
      }}
    />
  );
}
