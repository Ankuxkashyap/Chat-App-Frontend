import api from "../axios";

export const requestApi = {
  get: async () => {
    const res = await api.get("/friendship/requests");
    return res.data;
  },
  accept: async (id: string) => {
    const res = await api.post(`/friendship/request/${id}`);
    return res.data;
  },
  reject: async (id: string) => {
    const res = await api.post(`/friendship/request/${id}/reject`);
    return res.data;
  },
};
