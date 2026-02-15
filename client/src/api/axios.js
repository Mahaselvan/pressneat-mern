import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";

const instance = axios.create({
  baseURL: API_ORIGIN ? `${API_ORIGIN}/api` : "/api"
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
