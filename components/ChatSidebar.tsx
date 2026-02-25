"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export type Contact = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
};

const generateContacts = (start: number, count: number): Contact[] => {
  const names = [
    "Alex Morgan",
    "Jordan Lee",
    "Sam Taylor",
    "Casey Kim",
    "Riley Chen",
    "Morgan Davis",
    "Taylor Swift",
    "Jamie Fox",
    "Drew Quinn",
    "Avery Blake",
    "Parker Jones",
    "Reese Brown",
    "Quinn Wilson",
    "Harper Scott",
    "Skyler Adams",
  ];
  const messages = [
    "Hey, how are you?",
    "Did you see that?",
    "Let's catch up soon!",
    "Sounds good to me",
    "On my way!",
    "Thanks for that",
    "Miss you!",
    "Can we talk?",
    "That was hilarious 😂",
    "See you tomorrow",
  ];
  return Array.from({ length: count }, (_, i) => {
    const idx = (start + i) % names.length;
    const msgIdx = (start + i) % messages.length;
    const mins = Math.floor(Math.random() * 60);
    const hrs = Math.floor(Math.random() * 24);
    return {
      id: start + i,
      name: names[idx],
      username: names[idx].toLowerCase().replace(" ", ""),
      avatar: `https://i.pravatar.cc/150?img=${((start + i) % 70) + 1}`,
      lastMessage: messages[msgIdx],
      lastMessageTime: hrs > 0 ? `${hrs}h` : `${mins}m`,
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 9) + 1 : 0,
      online: Math.random() > 0.5,
    };
  });
};

type Props = {
  selectedId: number | null;
  onSelect: (contact: Contact) => void;
};

export function ChatSidebar({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(generateContacts(1, 15));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setContacts((prev) => [
        ...prev,
        ...generateContacts(prev.length + 1, 10),
      ]);
      setPage((p) => p + 1);
      setLoading(false);
    }, 800);
  }, [loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);
  const router = useRouter();
  const handleSelect = (contact: Contact) => {
    router.push(`/chat/${contact.id}`);
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()),
  );

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

        {/* Search */}
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

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {filtered.length === 0 ? (
          <p className="text-black/30 dark:text-white/30 text-center text-sm py-10">
            No contacts found
          </p>
        ) : (
          <>
            {filtered.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  handleSelect(contact);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-left ${
                  selectedId === contact.id
                    ? "bg-black/5 dark:bg-white/5"
                    : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                }`}
              >
                {/* Avatar with online indicator */}
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-black dark:text-white text-sm tracking-tight truncate">
                      {contact.name}
                    </p>
                    <span className="text-black/30 dark:text-white/30 text-xs shrink-0 ml-2">
                      {contact.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-black/40 dark:text-white/40 text-xs truncate">
                      {contact.lastMessage}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="ml-2 shrink-0 w-5 h-5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Infinite scroll loader */}
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
