// app/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto animate-slide-up">
        {/* Logo mark */}
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-[#1e1e2e] bg-[#111118] text-sm text-[#8888a8]">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-slow" />
          Tax estimation, simplified
        </div>

        <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-[#e8e8f0] mb-4">
          Tax<span className="text-indigo-400">Flow</span>
        </h1>

        <p className="text-lg text-[#8888a8] mb-10 leading-relaxed">
          Know your tax before it knows you.
          <br />
          Clean inputs, instant estimates, zero confusion.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            Get started free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a40] text-[#8888a8] hover:text-[#e8e8f0] font-medium transition-all duration-200"
          >
            Sign in
          </Link>
        </div>

        {/* Features row */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "⚡", label: "Real-time calc" },
            { icon: "🌍", label: "Multi-country" },
            { icon: "📊", label: "Visual breakdown" },
          ].map((f) => (
            <div
              key={f.label}
              className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]/50"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm text-[#8888a8]">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
