"use client";
// components/AuthForm.tsx

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccess("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 shadow-2xl">
      {/* Tab switcher */}
      <div className="flex bg-[#0a0a0f] rounded-lg p-1 mb-6">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === m
                ? "bg-[#16161f] text-[#e8e8f0] shadow-sm"
                : "text-[#555570] hover:text-[#8888a8]"
            }`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570]" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555570] focus:border-indigo-500/60 focus:outline-none transition-colors"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570]" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg pl-9 pr-10 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555570] focus:border-indigo-500/60 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570] hover:text-[#8888a8] transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#1e1e2e]" />
        <span className="text-xs text-[#555570]">or</span>
        <div className="flex-1 h-px bg-[#1e1e2e]" />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-2.5 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a40] disabled:opacity-50 disabled:cursor-not-allowed text-[#8888a8] hover:text-[#e8e8f0] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.32a3.7 3.7 0 01-1.6 2.43v2.02h2.58c1.51-1.39 2.38-3.44 2.38-5.91z" fill="#4285F4"/>
          <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2.01c-.72.48-1.63.76-2.72.76-2.09 0-3.86-1.41-4.49-3.31H.84v2.08A7.99 7.99 0 008 16z" fill="#34A853"/>
          <path d="M3.51 9.5A4.8 4.8 0 013.26 8c0-.52.09-1.03.25-1.5V4.42H.84A8 8 0 000 8c0 1.29.31 2.51.84 3.58L3.51 9.5z" fill="#FBBC05"/>
          <path d="M8 3.19c1.18 0 2.23.4 3.06 1.2l2.29-2.29C11.97.72 10.16 0 8 0A7.99 7.99 0 00.84 4.42L3.51 6.5C4.14 4.6 5.91 3.19 8 3.19z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
}
