import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocket = (userId: string) => {
  if (socket?.connected && socket.auth && (socket.auth as any).userId === userId) {
    console.log("[socket] already connected with same userId, skipping");
    return;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002", {
    autoConnect: false,
    withCredentials: true,
    auth: { userId },
  });

  socket.connect();
};
