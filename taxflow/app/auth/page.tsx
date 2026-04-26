// app/auth/page.tsx
import AuthForm from "@/components/AuthForm";
import styles from "./page.module.css";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 opacity-20 ${styles.gridBackground}`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight">
            Tax<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-sm text-[#8888a8] mt-2">
            Sign in or create your account
          </p>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
