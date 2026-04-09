"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreHorizontal,
  Send,
  Check,
  CheckCheck,
} from "lucide-react";
import { Contact } from "@/components/ChatSidebar";
import { useSocket } from "@/hooks/useSocket";
import { useTyping } from "@/hooks/useTyping";
import { messageApi } from "@/lib/api/message";
import { useParams } from "next/navigation";
import { getDateLabel } from "@/helper/getDateLabel";

type MessageStatus = "SENT" | "DELIVERED" | "SEEN";

type ApiMessage = {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  text: string;
  mine: boolean;
  createdAt: string;
  time: string;
  status: MessageStatus;
};

type Props = {
  contact: Contact;
  onBack: () => void;
  currentUserId: string;
};

const mapApiMessage = (msg: ApiMessage, currentUserId: string): Message => ({
  id: msg.id,
  text: msg.content,
  mine: msg.senderId === currentUserId,
  createdAt: msg.createdAt,
  status: msg.status ?? "SENT",
  time: new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

// ── Status Icon ───────────────────────────────────────────────────────────────
function MessageStatusIcon({
  status,
  mine,
}: {
  status: MessageStatus;
  mine: boolean;
}) {
  if (!mine) return null;

  if (status === "SEEN") {
    return (
      <span className="inline-flex items-center" title="Seen">
        <CheckCheck className="w-3 h-3 text-blue-400 dark:text-blue-300" />
      </span>
    );
  }
  if (status === "DELIVERED") {
    return (
      <span className="inline-flex items-center" title="Delivered">
        <CheckCheck className="w-3 h-3 text-white/50 dark:text-black/50" />
      </span>
    );
  }
  // SENT
  return (
    <span className="inline-flex items-center" title="Sent">
      <Check className="w-3 h-3 text-white/50 dark:text-black/50" />
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ChatView({
  contact,
  onBack,
  currentUserId,
  currentUsername,
}: Props) {
  const { id } = useParams();
  const conversationId = id as string;
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isOnline, setIsOnline] = useState(false);

  // ── Online presence ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.emit("getOnlineUsers");

    socket.on("onlineUsers", (users: string[]) => {
      setIsOnline(users.includes(contact.user?.id));
    });

    socket.on("userOnline", ({ userId }: { userId: string }) => {
      if (userId === contact.user?.id) setIsOnline(true);
    });

    socket.on("userOffline", ({ userId }: { userId: string }) => {
      if (userId === contact.user?.id) setIsOnline(false);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket, contact.user?.id]);

  // ── Typing ──────────────────────────────────────────────────────────────────
  const { typingUsers, onInputChange, stopTyping } = useTyping(
    socket,
    conversationId,
    { id: currentUserId, username: currentUsername },
  );

  // ── Fetch + socket events ───────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !socket) return;

    const fetchMessages = async () => {
      try {
        const res = await messageApi.getmessage(conversationId);
        const raw = res?.data?.data ?? res?.data ?? res ?? [];
        const data = Array.isArray(raw) ? raw : [];
        const mapped = data.map((msg: ApiMessage) =>
          mapApiMessage(msg, currentUserId),
        );
        setMessages(mapped);

        // Mark all incoming messages as DELIVERED on load
        mapped
          .filter((m: Message) => !m.mine && m.status === "SENT")
          .forEach((m: Message) => {
            socket.emit("messageDelivered", {
              messageId: m.id,
              senderId: contact.user?.id,
            });
          });
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
    socket.emit("joinConversation", conversationId);

    // New incoming message
    socket.on("newMessage", (msg: ApiMessage) => {
      const mapped = mapApiMessage(msg, currentUserId);

      setMessages((prev) => {
        // Already exists — just update status, no duplicate
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev.map((m) => (m.id === msg.id ? mapped : m));

        // It's our own message arriving via socket — replace oldest optimistic
        if (mapped.mine) {
          const optimisticIndex = prev.findIndex((m) =>
            m.id.startsWith("optimistic-"),
          );
          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = mapped;
            return next;
          }
        }

        return [...prev, mapped];
      });

      // Auto-emit delivered for incoming messages
      if (!mapped.mine) {
        socket.emit("messageDelivered", {
          messageId: msg.id,
          senderId: msg.senderId,
        });
      }
    });

    // Status update from backend
    socket.on("messageStatusUpdated", (updated: ApiMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === updated.id ? { ...m, status: updated.status } : m,
        ),
      );
    });

    // Seen — batch update from backend
    socket.on("messagesSeenBatch", (data: { messageIds: string[] }) => {
      setMessages((prev) =>
        prev.map((m) =>
          data.messageIds.includes(m.id) ? { ...m, status: "SEEN" } : m,
        ),
      );
    });

    return () => {
      socket.emit("leaveConversation", { conversationId });
      socket.off("newMessage");
      socket.off("messageStatusUpdated");
      socket.off("messagesSeenBatch");
    };
  }, [conversationId, socket]);

  // ── Mark messages as SEEN when chat is open (batched) ─────────────────────
  useEffect(() => {
    if (!socket || messages.length === 0) return;

    const unseenIds = messages
      .filter((m) => !m.mine && m.status !== "SEEN")
      .map((m) => m.id);

    if (unseenIds.length === 0) return;

    // Single emit with all IDs → prevents concurrent DB writes / P2034 deadlock
    socket.emit("markAsSeen", {
      messageIds: unseenIds,
      senderId: contact.user?.id,
    });
  }, [messages, socket, contact.user?.id]);

  // ── Auto scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim()) return;
    const messageData = input.trim();
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      text: messageData,
      mine: true,
      createdAt: now.toISOString(),
      time,
      status: "SENT",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    stopTyping();

    try {
      const res = await messageApi.sendMessage(conversationId, messageData);
      const savedMsg = res?.data?.data ?? res?.data ?? res;
      const realMessage = mapApiMessage(savedMsg, currentUserId);

      setMessages((prev) => {
        // Socket newMessage event may have already added the real message —
        // if so, just drop the optimistic one to avoid duplicate keys
        const realAlreadyExists = prev.some((m) => m.id === realMessage.id);
        if (realAlreadyExists) {
          return prev.filter((m) => m.id !== optimisticMessage.id);
        }
        // Otherwise swap optimistic → real
        return prev.map((m) =>
          m.id === optimisticMessage.id ? realMessage : m,
        );
      });

      socket.emit("sendMessage", { conversationId, content: messageData });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-black/8 dark:border-white/8">
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black dark:text-white" />
        </button>

        <div className="relative shrink-0">
          {contact.user?.avatar ? (
            <img
              src={contact.user.avatar}
              alt={contact.user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 ring-2 ring-black/5 dark:ring-white/5 flex items-center justify-center">
              <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                {contact.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black dark:text-white text-sm tracking-tight">
            {contact.user?.name}
          </p>
          <p className="text-black/40 dark:text-white/40 text-xs">
            {isOnline ? "Online" : contact.user?.username}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[Phone, Video, MoreHorizontal].map((Icon, i) => (
            <button
              key={i}
              className="w-8 h-8 flex items-center justify-center rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg, index) => {
          const prev = messages[index - 1];
          const showSeparator =
            !prev ||
            getDateLabel(msg.createdAt) !== getDateLabel(prev.createdAt);

          return (
            <div key={msg.id}>
              {showSeparator && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />
                  <span className="text-xs text-black/30 dark:text-white/30 font-medium shrink-0">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />
                </div>
              )}

              <div
                className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.mine
                      ? "bg-black dark:bg-white text-white dark:text-black rounded-br-sm"
                      : "bg-black/5 dark:bg-white/5 text-black dark:text-white rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Time + Status */}
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      msg.mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        msg.mine
                          ? "text-white/50 dark:text-black/50"
                          : "text-black/30 dark:text-white/30"
                      }`}
                    >
                      {msg.time}
                    </p>
                    <MessageStatusIcon status={msg.status} mine={msg.mine} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 animate-bounce"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-black/8 dark:border-white/8">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onInputChange();
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-sm transition-all"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black disabled:opacity-30 hover:opacity-80 transition-all duration-200 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
