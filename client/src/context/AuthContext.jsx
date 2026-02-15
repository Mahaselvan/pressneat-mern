import { createContext, useContext, useState } from "react";
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

  const register = async (data) => {
    const res = await axios.post("/auth/register", data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async (data) => {
    const res = await axios.post("/auth/login", data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const adminLogin = async (data) => {
    const res = await axios.post("/auth/admin/login", data);
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminUser", JSON.stringify(res.data.user));
    setAdmin(res.data.user);
    return res.data.user;
  };

  const adminRegister = async (data) => {
    const res = await axios.post("/auth/admin/register", data);
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminUser", JSON.stringify(res.data.user));
    setAdmin(res.data.user);
    return res.data.user;
  };

  const refreshUser = async () => {
    const { data } = await axios.get("/auth/me");
    if (data.role === "admin") {
      localStorage.setItem("adminUser", JSON.stringify(data));
      setAdmin(data);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await axios.put("/auth/me", payload);
    if (data.role === "admin") {
      localStorage.setItem("adminUser", JSON.stringify(data));
      setAdmin(data);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
