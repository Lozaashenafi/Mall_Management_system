import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_REACT_APP_SERVER_URL || "http://localhost:3300/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
