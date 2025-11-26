import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { AuthContext } from "./AuthContext";
import { toast } from "sonner";

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "userId",
    "userRole",
  ]);

  const [token, setToken] = useState(cookies.token || null);
  const [storedId, setStoredId] = useState(cookies.userId || null);
  const [userDetails, setUserDetails] = useState(
    localStorage.getItem("userDetails") || null
  );
  const [userRole, setUserRole] = useState(cookies.userRole || null);
  // initialize isAuthenticated from existing cookie/token
  const [isAuthenticated, setIsAuthenticated] = useState(!!cookies.token);

  const login = (newToken, newId, userDetails, userRole) => {
    setIsAuthenticated(true);
    setCookie("token", newToken, { path: "/" });
    setCookie("userId", newId, { path: "/" });
    setCookie("userRole", userRole, { path: "/" });
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setToken(newToken);
    setStoredId(newId);
    setUserDetails(userDetails);
    setUserRole(userRole);
  };

  const logout = () => {
    try {
      removeCookie("token", { path: "/" });
      removeCookie("userId", { path: "/" });
      removeCookie("userRole", { path: "/" });
      localStorage.removeItem("userDetails"); // <-- Key addition: Clear localStorage
      // Reset state
      setIsAuthenticated(false);
      setToken(null);
      setStoredId(null);
      setUserDetails(null);
      setUserRole(null);
      // Show feedback
      toast.success("Logged out successfully!");
      // Reload and redirect (simplified)
      window.location.href = "/"; // Use href for a full redirect instead of throw redirect
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Keep isAuthenticated in sync if token changes (e.g., on page load or cookie updates)
  React.useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  return (
    <>
      <AuthContext.Provider
        value={{
          token,
          userDetails,
          userRole,
          login,
          logout,
          storedId,
          isAuthenticated,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
