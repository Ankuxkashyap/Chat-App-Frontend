import api from "../axios";

export const requestApi = {
  get: async () => {
    const res = await api.get("/friendship/requests");  
    return res.data;    
  },    
  accept: async (id: string) => {
    const res = await api.post(`/friendship/requests/${id}/accept`);
    return res.data;
  },
  reject: async (id: string) => {
    const res = await api.post(`/friendship/requests/${id}/reject`);
    return res.data;
  },
};