"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Bell, UserRoundPlus } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api/auth";

export default function Navbar() {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getUser();
        setUser(data.user);
      } catch {
        logout();
      }
    };
    fetchUser();
  }, [setUser, logout]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-black/8 dark:border-white/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-black dark:text-white"
          >
            Convoo
          </Link>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/request"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                >
                  <UserRoundPlus className="w-5 h-5" />
                </Link>

                <button className="w-9 h-9 flex items-center justify-center rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
                  <Bell className="w-5 h-5" />
                </button>

                <ModeToggle />
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="px-4 py-1.5 text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors duration-200"
                >
                  Login
                </Link>

                <Link
                  href="/auth"
                  className="px-4 py-1.5 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
