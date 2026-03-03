import api from "../axios";

interface MessageData {
    id: string,
    content: string
    senderId: string
    conversationId: string
    createdAt: Date
    updatedAt: Date
}

interface MessageResponse {
    data: MessageData
}

export const messageApi = {
    getConversationById: async (id: string) => {
        const res = await api.get(`/conversations/${id}`, {
            withCredentials: true
        })
        return res
    },
    createConversation: async (id: string) => {
        const res = await api.post(`/conversations/${id}`, {
            withCredentials: true,
        });
        return res.data;
    },
    getConversations: async () => {
        const res = await api.get(`/conversations`, {
            withCredentials: true,
        });
        return res;
    },
    sendMessage: async (conversationId: string, message: string) => {
        try {
            const res = await api.post(`/messages`, { conversationId, message }, {
                withCredentials: true,
            })
            return res
        } catch (err) {
            console.log(err)
        }
    },
    getmessage: async (conversationId: string) => {
        try {
            const res = await api.get<MessageResponse[]>(`/messages/${conversationId}`, {
                withCredentials: true
            })
            return res
        } catch (err) {
            console.log(err)
        }
    }
}
