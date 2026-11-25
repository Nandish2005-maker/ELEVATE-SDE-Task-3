import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const KEY = "cv_admin";

// Task 2 has no backend, so login is checked against fixed dummy credentials.
export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "true";
    } catch {
      return false;
    }
  });

  const login = (username, password) => {
    if (username.trim() === "admin" && password === "admin") {
      localStorage.setItem(KEY, "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setIsAdmin(false);
  };

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
