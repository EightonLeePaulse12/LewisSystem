import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { AuthContext } from "./AuthContext";
import { redirect } from "@tanstack/react-router";

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
    setIsAuthenticated(false);
    removeCookie("token");
    removeCookie("userId");
    removeCookie("userRole");
    setToken(null);
    setStoredId(null);
    setUserDetails(null);
    setUserRole(null);
    throw redirect({ to: "/" });
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
