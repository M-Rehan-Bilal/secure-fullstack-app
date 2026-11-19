import { useEffect, useState } from "react";
import { api } from "./api";
import AuthContext from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const response = await api("/auth/me");
      setUser(response.status === 200 ? response.json?.data || null : null);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function refreshUser() {
    const response = await api("/auth/me");
    if (response.status === 200) {
      setUser(response.json?.data || null);
      return true;
    }
    setUser(null);
    return false;
  }

  return <AuthContext.Provider value={{ user, loading, refreshUser, clearUser: () => setUser(null) }}>{children}</AuthContext.Provider>;
}
