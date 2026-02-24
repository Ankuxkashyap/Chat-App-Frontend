import api from "@/lib/axios";

export const RequestApi = {
  get: async () => {
    try {
      const res = await api.get("/friendship/requests", {
        withCredentials: true,
      });
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  },
};
