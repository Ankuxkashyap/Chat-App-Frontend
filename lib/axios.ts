import axios from "axios";
import {useAuthStore} from '@/store/auth'
const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:3002",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;