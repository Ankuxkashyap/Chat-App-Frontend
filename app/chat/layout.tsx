"use client";

import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useParams } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-black overflow-hidden">
      <div className="hidden md:flex w-80 shrink-0">
        <ChatSidebar
          selectedId={(id as string) ?? ""}
          onSelect={(c) => router.push(`/chat/${c.conversationId}`)}
        />
      </div>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
