"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { messageApi } from "@/lib/api/message";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { get } from "http";
import { getSocket } from "@/lib/api/socket";

type MessageStatus = "SENT" | "DELIVERED" | "SEEN";

export type Contact = {
  conversationId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
    status: MessageStatus;
    updatedAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
};

function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center shrink-0 min-w-[18px] h-[18px] rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold px-1.5 tabular-nums">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  selectedId: string | null;
  onSelect?: (contact: Contact) => void;
};

export function ChatSidebar({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);
  const onlineUsers = useOnlineUsers();
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await messageApi.getConversations();
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setContacts(data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const socket = getSocket();

    const handleConversationUpdated = (payload: {
      conversationId: string;
      lastMessage: Contact["lastMessage"];
      updatedAt: string;
    }) => {
      setContacts((prev) => {
        const updated = prev.map((c) => {
          if (c.conversationId !== payload.conversationId) return c;
          const isActive = c.conversationId === selectedId;
          return {
            ...c,
            lastMessage: payload.lastMessage,
            unreadCount: isActive ? 0 : c.unreadCount + 1,
            updatedAt: payload.updatedAt,
          };
        });
        return [...updated].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      });
    };

    socket?.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket?.off("conversation_updated", handleConversationUpdated);
    };
  }, [selectedId]);

  const handleSelect = (contact: Contact) => {
    if (contact.conversationId === selectedId) return;
    setContacts((prev) =>
      prev.map((c) =>
        c.conversationId === contact.conversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );
    onSelect?.(contact);
    router.push(`/chat/${contact.conversationId}`);
  };

  const filtered = (contacts ?? []).filter((c) => {
    if (!c?.user) return false;
    return (
      c.user.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.user.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-black/8 dark:border-white/8 w-full">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Messages
          </h1>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30"
            size={15}
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-sm transition-all"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {filtered.length === 0 && !loading ? (
          <p className="text-black/30 dark:text-white/30 text-center text-sm py-10">
            No contacts found
          </p>
        ) : (
          <>
            {filtered.map((contact) => {
              const isSelected = selectedId === contact.conversationId;
              const hasUnread = contact.unreadCount > 0;

              return (
                <button
                  key={contact.conversationId}
                  onClick={() => handleSelect(contact)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-left ${
                    isSelected
                      ? "bg-black/5 dark:bg-white/5"
                      : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {contact.user.avatar ? (
                      <img
                        src={contact.user.avatar}
                        alt={contact.user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 ring-2 ring-black/5 dark:ring-white/5 flex items-center justify-center">
                        <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                          {getInitials(contact.user.name)}
                        </span>
                      </div>
                    )}
                    {/* Online dot */}
                    {onlineUsers.has(contact.user.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name + time */}
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm tracking-tight truncate ${
                          hasUnread
                            ? "font-bold text-black dark:text-white"
                            : "font-semibold text-black dark:text-white"
                        }`}
                      >
                        {contact.user.name}
                      </p>
                      <span
                        className={`text-xs shrink-0 ${
                          hasUnread
                            ? "text-black dark:text-white font-semibold"
                            : "text-black/30 dark:text-white/30"
                        }`}
                      >
                        {formatTime(
                          contact.lastMessage?.createdAt ?? contact.updatedAt,
                        )}
                      </span>
                    </div>

                    {/* Bottom row: preview + badge */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? "text-black dark:text-white font-medium"
                            : "text-black/40 dark:text-white/40"
                        }`}
                      >
                        {contact.lastMessage?.content ?? "No messages yet"}
                      </p>
                      <UnreadBadge count={contact.unreadCount} />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Loader */}
            <div ref={loaderRef} className="py-4 flex justify-center">
              {loading && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
