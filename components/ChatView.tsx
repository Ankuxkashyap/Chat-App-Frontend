"use client";

import { useState } from "react";
import { ArrowLeft, Phone, Video, MoreHorizontal, Send } from "lucide-react";
import { Contact } from "@/components/ChatSidebar";

type Message = {
  id: number;
  text: string;
  mine: boolean;
  time: string;
};

const seedMessages = (contact: Contact): Message[] => [
  { id: 1, text: "Hey! How's it going?", mine: false, time: "9:00 AM" },
  { id: 2, text: "Pretty good, you?", mine: true, time: "9:01 AM" },
  {
    id: 3,
    text: contact.lastMessage,
    mine: false,
    time: contact.lastMessageTime,
  },
];

type Props = {
  contact: Contact;
  onBack: () => void;
};

export function ChatView({ contact, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>(seedMessages(contact));
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input.trim(), mine: true, time },
    ]);
    setInput("");
  };

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
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
          />
          {contact.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black dark:text-white text-sm tracking-tight">
            {contact.name}
          </p>
          <p className="text-black/40 dark:text-white/40 text-xs">
            {contact.online ? "Online" : "Offline"}
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
      <div className="flex-1 px-4 py-4 space-y-2">
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
      </div>

      {/* Input */}
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
