import { authApi } from "@/lib/api/auth";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { UserT } from "@/lib/types/user";

interface AuthState {
  user: UserT | null;
  setUser: (user: UserT) => void;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, loading: false }),
  loading: false,

  signup: async (name, email, password) => {
    try {
      set({ loading: true });
      await authApi.sign(name, email, password);
      const data = await authApi.getUser();
      set({ user: data.user, loading: false });
      toast.success("Signup successful ");
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    try {
      set({ loading: true });
      await authApi.login(email, password);
      const data = await authApi.getUser();
      set({ user: data.user, loading: false });
      toast.success("Login successful");
      return true;
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
