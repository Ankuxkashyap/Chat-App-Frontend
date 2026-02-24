"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {}, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-sm bg-background/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Convoo
          </Link>

          <div className=" md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>

                <ModeToggle />
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Login</Button>
                </Link>

                <Link href="/auth">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden backdrop-blur-lg bg-background/10">
          <div className="px-6 py-4 space-y-4">
            {user ? (
              <div className="flex gap-3">
                <ModeToggle />
              </div>
            ) : (
              <>
                <Link href="/login" className="block">
                  Login
                </Link>
                <Link href="/signup" className="block">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
