import { useEffect } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "../routeTree.gen";

const router = createRouter({ routeTree });

const Root = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange() {
      if (mediaQuery.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    // Initial check
    handleChange();

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return <RouterProvider router={router} />;
}

export default Root;