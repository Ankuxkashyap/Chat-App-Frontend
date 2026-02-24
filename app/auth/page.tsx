"use client";
import { useState } from "react";
import { Sora } from "next/font/google";
import { useAuthStore } from "@/store/auth";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { loading, login, signup } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login(form.email, form.password);
      if (success) {
        router.push("/");
      }
    } else {
      const success = await signup(form.name, form.email, form.password);
      if (success) {
        router.push("/");
      }
    }
  };

  return (
    <div
      className={`${sora.className} min-h-screen flex items-center justify-center px-4 overflow-x-hidden
      bg-background transition-colors duration-300`}
    >
      <div
        className="w-full max-w-[420px] p-8 rounded-2xl border  
        bg-card text-card-foreground shadow-lg 
        backdrop-blur-sm"
      >
        <div className="text-center mb-7">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Login to your Convoo account"
              : "Sign up for your Convoo account"}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm 
                focus:outline-none focus:ring-2 focus:ring-primary/30 
                transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="m@example.com"
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value.toLowerCase(),
                })
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-primary/30 
              transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium">Password</label>
              {isLogin && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value.trim(),
                })
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-primary/30 
              transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground 
            hover:opacity-90 rounded-lg py-2.5 text-sm font-medium 
            transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader className="animate-spin w-4 h-4" />}
            {isLogin ? "Login" : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          className="w-full border bg-background hover:bg-accent 
          rounded-lg py-2.5 text-sm font-medium transition-all"
        >
          Google
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
