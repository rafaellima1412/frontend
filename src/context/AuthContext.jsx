import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const me = await api.get("/user/me");
      setUser(me);
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        console.error("Falha ao carregar sessão:", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (username, password) => {
    const result = await api.postForm("/user/login", { username, password });
    setUser(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await api.postJson("/user/logout");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
