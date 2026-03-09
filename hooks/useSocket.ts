import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";

export const useSocket = (): Socket | null => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002", {
      autoConnect: false,
      withCredentials: true,
      auth: { userId: user.id },
    });

    setSocket(s);

    s.on("disconnect", () => {
      console.log("[useSocket] disconnected");
      setSocket(null);
    });

    s.connect();

    console.log("[useSocket] connecting with userId:", user.id);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  return socket;
};