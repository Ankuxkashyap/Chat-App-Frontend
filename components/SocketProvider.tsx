"use client";

import { useEffect } from "react";
import { connectSocket } from "@/lib/api/socket";
import { useAuthStore } from "@/store/auth";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
  useEffect(() => {
    connectSocket(user?.id);
  }, [user?.id]);

  return <>{children}</>;
}