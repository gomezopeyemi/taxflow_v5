"use client";
// components/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Plus, Clock, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "New estimate", icon: Plus },
  { href: "/dashboard/history", label: "History", icon: Clock },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 mb-8 px-2"
        onClick={() => setMobileOpen(false)}
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <span className="text-indigo-400 text-xs font-bold">TF</span>
        </div>
        <span className="font-medium text-[#e8e8f0] tracking-tight">
          Tax<span className="text-indigo-400">Flow</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-[#8888a8] hover:text-[#e8e8f0] hover:bg-[#16161f]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-[#1e1e2e] pt-4">
        <div className="px-3 mb-3">
          <p className="text-xs text-[#555570] truncate">{user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8888a8] hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-[#0d0d14] border-r border-[#1e1e2e] flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0d0d14] border-b border-[#1e1e2e] flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="font-medium text-[#e8e8f0]">
          Tax<span className="text-indigo-400">Flow</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#8888a8] hover:text-[#e8e8f0] transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute top-14 left-0 bottom-0 w-64 bg-[#0d0d14] border-r border-[#1e1e2e]"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile spacing */}
      <div className="md:hidden h-14" />
    </>
  );
}
