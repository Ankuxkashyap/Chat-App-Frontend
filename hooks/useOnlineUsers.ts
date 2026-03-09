import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export const useOnlineUsers = (): Set<string> => {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) {
      console.log("[useOnlineUsers] socket is null, skipping effect");
      return;
    }

    console.log("[useOnlineUsers] effect running - socket.id:", socket.id, "| connected:", socket.connected);

    const requestOnlineUsers = () => {
      console.log("[useOnlineUsers] emitting getOnlineUsers - socket.id:", socket.id);
      socket.emit("getOnlineUsers");
    };

    const handleOnlineUsers = (userIds: string[]) => {
      console.log("[useOnlineUsers] received onlineUsers:", userIds);
      setOnlineUsers(new Set(userIds));
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      console.log("[useOnlineUsers] received userOnline - userId:", userId);
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      console.log("[useOnlineUsers] received userOffline - userId:", userId);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    if (socket.connected) {
      console.log("[useOnlineUsers] socket already connected, requesting online users immediately");
      requestOnlineUsers();
    } else {
      console.log("[useOnlineUsers] socket not yet connected, waiting for connect event");
    }
    const handleConnect = () => {
      console.log("[useOnlineUsers] connect event fired, requesting online users");
      socket.emit("getOnlineUsers");
    };
    
    socket.on("connect", handleConnect);
  
    socket.on("connect", requestOnlineUsers);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      console.log("[useOnlineUsers] cleanup - removing listeners for socket.id:", socket.id);
      socket.off("connect", requestOnlineUsers);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket]);

  return onlineUsers;
};