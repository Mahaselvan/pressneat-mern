import { createContext, useCallback, useContext, useMemo, useState } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });

  const register = useCallback(async (data) => {
    const res = await axios.post("/auth/register", data);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback(async (data) => {
    const res = await axios.post("/auth/login", data);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const adminLogin = useCallback(async (data) => {
    const res = await axios.post("/auth/admin/login", data);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminUser", JSON.stringify(res.data.user));
    setAdmin(res.data.user);
    return res.data.user;
  }, []);

  const adminRegister = useCallback(async (data) => {
    const res = await axios.post("/auth/admin/register", data);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminUser", JSON.stringify(res.data.user));
    setAdmin(res.data.user);
    return res.data.user;
  }, []);

  const refreshUser = useCallback(async (roleHint = "auto") => {
    const authMode =
      roleHint === "admin"
        ? "admin"
        : roleHint === "user"
          ? "user"
          : localStorage.getItem("token")
            ? "user"
            : "admin";

    const { data } = await axios.get("/auth/me", { authMode });
    if (data.role === "admin") {
      localStorage.setItem("adminUser", JSON.stringify(data));
      setAdmin(data);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    }
    return data;
  }, []);

  const updateProfile = useCallback(async (payload, roleHint = "auto") => {
    const authMode =
      roleHint === "admin"
        ? "admin"
        : roleHint === "user"
          ? "user"
          : localStorage.getItem("token")
            ? "user"
            : "admin";

    const { data } = await axios.put("/auth/me", payload, { authMode });
    if (data.role === "admin") {
      localStorage.setItem("adminUser", JSON.stringify(data));
      setAdmin(data);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    }
    return data;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      register,
      login,
      logout,
      admin,
      adminLogin,
      adminRegister,
      adminLogout,
      refreshUser,
      updateProfile,
    }),
    [
      user,
      register,
      login,
      logout,
      admin,
      adminLogin,
      adminRegister,
      adminLogout,
      refreshUser,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
