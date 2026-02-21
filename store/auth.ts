import { authApi } from "@/lib/api/auth";
import { create } from "zustand";
import {toast} from "react-hot-toast"

interface AuthState {
    user: any;
    setUser: (user: any) => void;
    logout: () => void;
    signup: (name: string, email: string, password: string) => Promise<void>;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;    
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null, loading: false }),
    loading: false,

    signup: async (name, email, password) => {
        set({ loading: true });
        try{
            const res = await authApi.sign(name, email, password);
            const data = await authApi.getUser();
            set({ user: data.user, loading: false});
            toast.success("Signup successful ");
        }catch(err){
            console.error("Signup error:", err);
            toast.error("Signup failed");
        }finally{
            set({ loading: false });
        }
    },
    login: async (email, password) => {
        set({ loading: true });
        try{
            const res = await authApi.login(email, password);
            const data = await authApi.getUser();
            set({ user: data.user, loading: false});
            toast.success("Login successful");
        }catch(err){
            console.error("Login error:", err);
            toast.error("Login failed");
        }
    },
}))