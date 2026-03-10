import { useEffect, useRef, useCallback, useState } from "react";
import { Socket } from "socket.io-client";

interface TypingUser {
  userId: string;
  username: string;
  socketId: string;
}

export const useTyping = (
  socket: Socket | null,
  conversationId: string,
  currentUser: { id: string; username: string }
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    console.log("[useTyping] startTyping - socket:", !!socket, "| conversationId:", conversationId, "| isTyping:", isTypingRef.current);
    if (!socket || !conversationId || isTypingRef.current) return;
    isTypingRef.current = true;
    console.log("[useTyping] emitting typing:start", { conversationId, userId: currentUser.id, username: currentUser.username });
    socket.emit("typing:start", {
      conversationId,
      userId: currentUser.id,
      username: currentUser.username,
    });
  }, [socket, conversationId, currentUser]);

  const stopTyping = useCallback(() => {
    console.log("[useTyping] stopTyping - socket:", !!socket, "| conversationId:", conversationId, "| isTyping:", isTypingRef.current);
    if (!socket || !conversationId || !isTypingRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isTypingRef.current = false;
    console.log("[useTyping] emitting typing:stop", { conversationId, userId: currentUser.id });
    socket.emit("typing:stop", {
      conversationId,
      userId: currentUser.id,
    });
  }, [socket, conversationId, currentUser]);

  const onInputChange = useCallback(() => {
    console.log("[useTyping] onInputChange triggered");
    startTyping();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stopTyping, 2000);
  }, [startTyping, stopTyping]);

  useEffect(() => {
    console.log("[useTyping] useEffect - socket:", !!socket, "| conversationId:", conversationId);
    if (!socket) return;

    const onTypingStart = (user: TypingUser) => {
      console.log("[useTyping] received typing:start", user);
      setTypingUsers((prev) => {
        const already = prev.find((u) => u.socketId === user.socketId);
        console.log("[useTyping] already in list:", already, "| current list:", prev);
        return already ? prev : [...prev, user];
      });
    };

    const onTypingStop = ({ socketId }: { socketId: string }) => {
      console.log("[useTyping] received typing:stop - socketId:", socketId);
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.socketId !== socketId);
        console.log("[useTyping] typingUsers after stop:", filtered);
        return filtered;
      });
    };

    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    console.log("[useTyping] listeners registered on socket:", socket.id);

    return () => {
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      console.log("[useTyping] listeners removed");
    };
  }, [socket, conversationId]);

  useEffect(() => {
    return () => {
      console.log("[useTyping] conversationId changed or unmount - stopping typing");
      stopTyping();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [conversationId]);

  return { typingUsers, onInputChange, stopTyping };
};