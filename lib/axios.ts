import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:3002",
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const req = err.config;

    if (err.response?.status === 401 && !req._retry) {
      req._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
           await api.post(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );
        } catch (e) {
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      return api(req); 
    }

    return Promise.reject(err);
  }
);

export default api;