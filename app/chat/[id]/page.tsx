"use client";

import { useParams, useRouter } from "next/navigation";
import { ChatView } from "@/components/ChatView";
import { ChatSidebar, Contact } from "@/components/ChatSidebar";
import { useState, useEffect } from "react";
import { messageApi } from "@/lib/api/message";
import { useAuthStore } from "@/store/auth";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const res = await messageApi.getConversations();
        const raw = res.data?.data ?? res.data ?? [];
        const data: Contact[] = Array.isArray(raw) ? raw : [];
        const found = data.find((c) => c.conversationId === id);
        setContact(found ?? null);
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-black overflow-hidden">
      <div className="hidden md:flex w-80 shrink-0">
        <ChatSidebar
          selectedId={contact.conversationId}
          onSelect={(c) => router.push(`/chat/${c.conversationId}`)}
        />
      </div>
      <div className="flex flex-1">
        <ChatView
          contact={contact}
          currentUserId={user?.id ?? ""}
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}