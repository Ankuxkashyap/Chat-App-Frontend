"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, Video, MoreHorizontal, Send } from "lucide-react";
import { Contact } from "@/components/ChatSidebar";
import { useSocket } from "@/hooks/useSocket";
import { messageApi } from "@/lib/api/message";
import { useParams } from "next/navigation";

type ApiMessage = {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  text: string;
  mine: boolean;
  time: string;
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
  time: new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

export function ChatView({ contact, onBack, currentUserId }: Props) {
  const { id } = useParams();
  const conversationId = id as string;
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await messageApi.getmessage(conversationId);
        const raw = res?.data?.data ?? res?.data ?? res ?? [];
        const data = Array.isArray(raw) ? raw : [];
        setMessages(data.map((msg: ApiMessage) => mapApiMessage(msg, currentUserId)));
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (msg: ApiMessage) => {
      setMessages((prev) => [...prev, mapApiMessage(msg, currentUserId)]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      time,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    try {
      await messageApi.sendMessage(conversationId, messageData);
      socket.emit("sendMessage", {
        conversationId,
        content: messageData,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black h-[calc(100vh-64px)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-black/8 dark:border-white/8">
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black dark:text-white" />
        </button>

        <div className="relative shrink-0">
          <img
            src={contact.user?.avatar || "/placeholder.svg"}
            alt={contact.user?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black dark:text-white text-sm tracking-tight">
            {contact.user?.name}
          </p>
          <p className="text-black/40 dark:text-white/40 text-xs">
            {contact.user?.username}
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
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
              <p
                className={`text-xs mt-1 ${
                  msg.mine
                    ? "text-white/50 dark:text-black/50"
                    : "text-black/30 dark:text-white/30"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-black/8 dark:border-white/8">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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