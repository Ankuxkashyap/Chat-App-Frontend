"use client";
import { useState } from "react";
import { Sora } from "next/font/google";
import { useAuthStore } from "@/store/auth";
import { Loader } from "lucide-react";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { user, setUser,loading,login,signup } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submitted with data:", form);
    e.preventDefault();
    if(isLogin){
      login(form.email, form.password);
    }else{
      signup(form.name, form.email, form.password);
    }
  };

  return (
    <div
      className={`${sora.className} min-h-screen bg-gray-100 flex items-center justify-center px-4`}
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-[400px] p-8">
        <div className="text-center mb-7">
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-gray-900 mb-1">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm font-light text-gray-400 tracking-wide">
            {isLogin
              ? "Login to your Convoo account"
              : "Sign up for your Convoo account"}
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-[0.78rem] font-medium text-gray-700 mb-1.5 tracking-wide">
                Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-light text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[0.78rem] font-medium text-gray-700 mb-1.5 tracking-wide">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="m@example.com"
              onChange={(e)=> setForm({ ...form, email: e.target.value.toLowerCase() })}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-light text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[0.78rem] font-medium text-gray-700 tracking-wide">
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  className="text-[0.78rem] font-light text-gray-500 hover:text-black transition-colors"
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value.trim() })}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-light text-gray-900 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
            />
          </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 disabled:opacity-60 text-white font-medium tracking-wide rounded-lg py-2.5 text-sm transition-all duration-200 active:scale-[0.99] mt-1 flex items-center justify-center gap-2"
            >
            {loading && (
                <Loader className="animate-spin w-4 h-4" />
            )}
            {isLogin ? "Login" : "Sign up"}
        </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[0.72rem] font-light tracking-wider uppercase">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg py-2.5 text-sm text-gray-700 font-medium transition-all duration-200">
          Goggle
        </button>

        <p className="text-center text-sm font-light text-gray-500 mt-5">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-900 font-medium underline underline-offset-2 cursor-pointer hover:text-black transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}