import { get } from "http";
import api from "../axios";

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login",{ email, password },
      {
        withCredentials: true,
      },
    );
    return res.data;
  },
  sign: async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/signup",{ name, email, password },
      {
        withCredentials: true,
      },
    );
    return res.data;
  },
  getUser: async () => {
    const res = await api.get("/auth/profile", {
      withCredentials: true,
    });
    return res.data;
  }
};
