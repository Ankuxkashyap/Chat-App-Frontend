"use client";

import { useState } from "react";
import { ChatSidebar, Contact } from "@/components/ChatSidebar";
import { ChatView } from "@/components/ChatView";
import { EmptyChat } from "@/components/EmptyChat";

export default function Home() {
  const [selected, setSelected] = useState<Contact | null>(null);
  return (
    <div className="w-full h-[calc(100vh-64px)] flex bg-white dark:bg-black overflow-hidden">
      {/* Sidebar - full width on mobile, fixed width on desktop */}
      <div className="w-full md:w-80 md:flex shrink-0">
        <ChatSidebar selectedId={selected?.id ?? null} onSelect={setSelected} />
      </div>

      {/* Chat area - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex flex-1">
        {selected ? (
          <ChatView contact={selected} onBack={() => setSelected(null)} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
