import { createContext, useContext, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { api, clearToken, getToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = getToken();
    const name = localStorage.getItem("admin_name");
    return token ? { token, name } : null;
  });

  const login = async (email, password) => {
    const { accessToken, name } = await api.login(email, password);
    setToken(accessToken);
    localStorage.setItem("admin_name", name);
    setSession({ token: accessToken, name });
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("admin_name");
    setSession(null);
  };

  const value = useMemo(() => ({ session, login, logout }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
