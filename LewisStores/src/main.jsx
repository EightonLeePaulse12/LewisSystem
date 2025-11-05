import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Root from './components/Root'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>
);
