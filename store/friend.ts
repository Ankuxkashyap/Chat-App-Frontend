import api from "@/lib/axios";

const friendApi = {
  get: async () => {
    const res = await api.get("/friend", {
      withCredentials: true,
    });
    return res.data;
  },
  add: async (id: string) => {
    const res = await api.post(
      "/friend",
      { id },
      {
        withCredentials: true,
      },
    );
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/friend/${id}`, {
      withCredentials: true,
    });
    return res.data;
  },
};
