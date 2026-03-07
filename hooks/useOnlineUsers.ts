import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export const useOnlineUsers = (): Set<string> => {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Request online users only when socket is connected
    const requestOnlineUsers = () => {
      socket.emit("getOnlineUsers");
    };

    // If already connected, request immediately
    if (socket.connected) {
      requestOnlineUsers();
    }

    // Otherwise wait for connect event
    socket.on("connect", requestOnlineUsers);

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("userOnline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("connect", requestOnlineUsers);
      socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket]);

  return onlineUsers;
};