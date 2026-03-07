import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket } from "@/lib//api/socket";
import { useAuthStore } from "@/store/auth";

export const useSocket = (): Socket => {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket>(getSocket(user?.id));

  useEffect(() => {
    if (user?.id) connectSocket(user.id);
  }, [user?.id]);

  return socketRef.current;
};