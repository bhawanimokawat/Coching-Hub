import axios from "axios";

// Default baseURL points to relative "/api" or custom environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("institutehub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      const isAuthRoute = error.config?.url?.includes("/auth/login");
      if (!isAuthRoute && localStorage.getItem("institutehub_token")) {
        localStorage.removeItem("institutehub_token");
        localStorage.removeItem("institutehub_user");
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
