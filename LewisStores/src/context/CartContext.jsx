import { useContext } from "react";
import { CartProvider } from "./CartProvider";

export const useCart = () => {
  const context = useContext(CartProvider);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
