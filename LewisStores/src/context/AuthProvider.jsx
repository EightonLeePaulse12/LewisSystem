import { useState, React, createContext } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["token", "userId"]);

  const [token, setToken] = useState(cookies.token || null);
  const [storedId, setStoredId] = useState(cookies.userId || null);

  const login = (newToken, newId) => {
    setCookie("token", newToken);
    setCookie("userId", newId);
    setToken(newToken);
    setStoredId(newId);
  };

  const logout = () => {
    removeCookie("token");
    removeCookie("userId");
    setToken(null);
    setStoredId(null);
  };

  return (
    <>
      <AuthContext.Provider
        value={{ token, login, logout, storedId, isAuthenticated: !!token }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
