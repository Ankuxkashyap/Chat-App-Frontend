"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    authApi
      .getUser()
      .then((data) => {
        setUser(data.user);
        router.push("/");
      })
      .catch(() => {
        router.push("/auth?error=google_failed");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm animate-pulse">Signing you in...</p>
    </div>
  );
}
