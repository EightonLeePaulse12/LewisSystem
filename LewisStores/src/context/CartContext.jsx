import { useContext } from "react";
import { CartContext } from "./CartProvider";

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // During HMR/fast-refresh the provider can be momentarily unavailable.
    // Return a safe fallback in development to avoid the overlay crashing the page.
    if (
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.DEV
    ) {
      console.warn(
        "useCart must be used within CartProvider - returning fallback in dev"
      );
      return {
        items: [],
        addItem: () => {
          console.warn("addItem called but CartProvider is not mounted");
        },
        removeItem: () => {},
        updateQuantity: () => {},
        clearCart: () => {},
        total: 0,
      };
    }
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
