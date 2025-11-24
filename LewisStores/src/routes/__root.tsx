import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";
import { redirect } from "@tanstack/react-router";

export const Route = createRootRouteWithContext()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),  
  notFoundComponent: () => <div>404 - Not Found</div>,
});
