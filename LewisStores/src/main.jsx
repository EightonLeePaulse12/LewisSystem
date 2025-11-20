import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "sonner";
import { RouterWithContext } from "./RouterWithContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartProvider";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <RouterWithContext />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </CookiesProvider>
  </StrictMode>
);
