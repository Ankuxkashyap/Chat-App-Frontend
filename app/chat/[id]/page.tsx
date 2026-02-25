"use client";

import { useParams, useRouter } from "next/navigation";
import { ChatView } from "@/components/ChatView";
import { ChatSidebar, Contact } from "@/components/ChatSidebar";

const mockContact = (id: number): Contact => ({
  id,
  name: "Jordan Lee",
  username: "jordanlee",
  avatar: `https://i.pravatar.cc/150?img=${id % 70}`,
  lastMessage: "Hey!",
  lastMessageTime: "1h",
  unreadCount: 0,
  online: true,
});

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const contact = mockContact(Number(id));

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-black overflow-hidden">
      {/* Sidebar - only on md+ */}
      <div className="hidden md:flex w-80 shrink-0">
        <ChatSidebar
          selectedId={contact.id}
          onSelect={(c) => router.push(`/chat/${c.id}`)}
        />
      </div>

      {/* Chat area - full width on mobile, flex-1 on md+ */}
      <div className="flex flex-1">
        <ChatView contact={contact} onBack={() => router.back()} />
      </div>
    </div>
  );
}
