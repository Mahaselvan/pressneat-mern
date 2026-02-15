import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";

const instance = axios.create({
  baseURL: API_ORIGIN ? `${API_ORIGIN}/api` : "/api"
});

instance.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const url = config.url || "";
  const mode = config.authMode || "";

  let token = null;
  if (mode === "admin") {
    token = adminToken;
  } else if (mode === "user") {
    token = userToken;
  } else if (url.startsWith("/admin") || url.startsWith("/auth/admin")) {
    token = adminToken || userToken;
  } else {
    token = userToken || adminToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
