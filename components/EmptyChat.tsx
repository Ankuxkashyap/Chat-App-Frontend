"use client";

import { MessageCircle } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-white dark:bg-black select-none">
      <div className="flex flex-col items-center gap-4 opacity-40">
        <div className="w-16 h-16 rounded-full border-2 border-black dark:border-white flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-black dark:text-white" />
        </div>
        <div className="text-center">
          <p className="text-black dark:text-white font-semibold tracking-tight">
            Your Messages
          </p>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    </div>
  );
}
