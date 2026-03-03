import api from "../axios"
import { UserT } from "../types/user";

export const friendApi = {
    get: async (page:number,limit:number) => {
        const res = await api.get(`/friendship?page=${page}&limit=${limit}`)
        return res.data;
    }
} 