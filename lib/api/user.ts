import api from "../axios";

export const userApi = {
    search: async (query: string) => {
    const res = await api.get(`/user/search?query=${query}`);
    return res.data;
  },
};