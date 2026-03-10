import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";

export const useSocket = (): Socket | null => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002", {
      withCredentials: true,
      auth: { userId: user.id },
    });

    s.on("connect", () => {
      console.log("[useSocket] connected:", s.id);
      setSocket(s); 
    });

    s.on("disconnect", () => {
      console.log("[useSocket] disconnected");
      setSocket(null);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  return socket;
};