import { useEffect } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/api/socket";

export const useSocket = () => {
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return getSocket();
};