"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Bell,
  UserRoundPlus,
  User,
  Settings,
  LogOut,
  CreditCard,
  Shield,
  ChevronRight,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api/auth";

const mockNotifications = [
  { id: 1, title: "Sarah sent you a message", time: "2m ago", unread: true, icon: <MessageCircle size={13} /> },
  { id: 2, title: "James accepted your request", time: "18m ago", unread: true, icon: <UserCheck size={13} /> },
  { id: 3, title: "New message in #general", time: "1h ago", unread: false, icon: <MessageCircle size={13} /> },
  { id: 4, title: "Alex sent you a friend request", time: "3h ago", unread: false, icon: <UserRoundPlus size={13} /> },
];

export default function Navbar() {
  const { user, setUser, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarInitials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const dropdownBase =
    "absolute top-[calc(100%+8px)] right-0 rounded-2xl border z-50 overflow-hidden shadow-xl " +
    "bg-white dark:bg-[#111113] border-black/[0.08] dark:border-white/[0.08] " +
    "animate-[fadeDown_0.15s_cubic-bezier(0.34,1.56,0.64,1)]";

  const menuRow =
    "flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors no-underline " +
    "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white " +
    "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]";

  const iconWrap =
    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 " +
    "bg-black/[0.05] dark:bg-white/[0.07]";

  const divider = "border-t border-black/[0.06] dark:border-white/[0.06] my-1";

  return (
    <>
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.08] shadow-sm"
          : "bg-white/60 dark:bg-black/60 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.05]"
        }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-14 items-center justify-between">

            <Link href="/" className="flex items-center select-none no-underline font-mono">
              <span className="text-xs font-bold text-black/25 dark:text-white/30">{"{"}</span>
              <span className="text-[1.1rem] font-bold tracking-[0.08em] uppercase text-black dark:text-white mx-1">CONVOO</span>
              <span className="text-xs font-bold text-black/25 dark:text-white/30">{"}"}</span>
            </Link>

            <div className="flex items-center gap-0.5">
              {user ? (
                <>
                  <Link
                    href="/request"
                    title="Friend Requests"
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all duration-150"
                  >
                    <UserRoundPlus className="w-[18px] h-[18px]" />
                  </Link>

                  <div ref={notifRef} className="relative">
                    <button
                      onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                      title="Notifications"
                      className="relative w-9 h-9 flex items-center justify-center rounded-xl text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all duration-150"
                    >
                      <Bell className="w-[18px] h-[18px]" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-red-500 border-2 border-white dark:border-black" />
                      )}
                    </button>

                    {notifOpen && (
                      <div className={`${dropdownBase} w-[300px]`}>
                        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                          <span className="text-sm font-semibold text-black dark:text-white">Notifications</span>
                          <button className="text-[11px] font-semibold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Mark all read
                          </button>
                        </div>

                        <div className="pb-1.5">
                          {mockNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04] ${n.unread ? "bg-black/[0.015] dark:bg-white/[0.025]" : ""
                                }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-px ${n.unread
                                  ? "bg-black dark:bg-white text-white dark:text-black"
                                  : "bg-black/[0.06] dark:bg-white/[0.08] text-black/40 dark:text-white/40"
                                }`}>
                                {n.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm m-0 leading-snug truncate ${n.unread
                                    ? "font-medium text-black dark:text-white"
                                    : "font-normal text-black/60 dark:text-white/60"
                                  }`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-black/35 dark:text-white/35 m-0 mt-0.5">{n.time}</p>
                              </div>
                              {n.unread && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white flex-shrink-0 mt-2" />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className={divider} />
                        <div className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white cursor-pointer transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                          View all notifications
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-0.5">
                    <ModeToggle />
                  </div>

                  <div ref={profileRef} className="relative ml-1">
                    <button
                      onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                      title="Profile"
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer border-none bg-transparent"
                    >
                      <div className="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-[11px] font-black flex-shrink-0">
                        {avatarInitials}
                      </div>
                      <span className="text-sm font-medium text-black/70 dark:text-white/70 max-w-[90px] truncate hidden sm:block">
                        {user?.name?.split(" ")[0] ?? "Account"}
                      </span>
                    </button>

                    {profileOpen && (
                      <div className={`${dropdownBase} w-[240px]`}>
                        <div className="px-4 py-3.5 flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-black flex-shrink-0">
                            {avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-black dark:text-white m-0 truncate">
                              {user?.name ?? "User"}
                            </p>
                            <p className="text-xs text-black/40 dark:text-white/40 m-0 truncate">
                              {user?.email ?? ""}
                            </p>
                          </div>
                        </div>

                        <div className="py-1.5">
                          <Link href="/profile" onClick={() => setProfileOpen(false)} className={menuRow}>
                            <div className={iconWrap}><User size={14} /></div>
                            <span className="flex-1">View Profile</span>
                            <ChevronRight size={13} className="opacity-30" />
                          </Link>

                          <Link href="/settings" onClick={() => setProfileOpen(false)} className={menuRow}>
                            <div className={iconWrap}><Settings size={14} /></div>
                            <span className="flex-1">Settings</span>
                            <ChevronRight size={13} className="opacity-30" />
                          </Link>

                          <Link href="/billing" onClick={() => setProfileOpen(false)} className={menuRow}>
                            <div className={iconWrap}><CreditCard size={14} /></div>
                            <span className="flex-1">Billing</span>
                            <ChevronRight size={13} className="opacity-30" />
                          </Link>

                          <Link href="/security" onClick={() => setProfileOpen(false)} className={menuRow}>
                            <div className={iconWrap}><Shield size={14} /></div>
                            <span className="flex-1">Privacy & Security</span>
                            <ChevronRight size={13} className="opacity-30" />
                          </Link>
                        </div>

                        <div className={divider} />

                        <div className="py-1.5">
                          <div
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors text-red-500 hover:bg-red-500/[0.06]"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/10">
                              <LogOut size={14} className="text-red-500" />
                            </div>
                            <span className="font-medium">Sign Out</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <ModeToggle />

                  <div className="flex items-center gap-1.5 ml-1">
                    <Link
                      href="/auth"
                      className="px-4 py-1.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] rounded-xl transition-all duration-150 no-underline"
                    >
                      Login
                    </Link>

                    <Link
                      href="/auth"
                      className="px-4 py-1.5 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-opacity duration-150 no-underline"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}