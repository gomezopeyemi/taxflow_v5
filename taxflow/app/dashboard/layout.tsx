// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // After redirect() above, user is guaranteed non-null
  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <Sidebar user={user!} />
      <main className="flex-1 min-h-screen ml-0 md:ml-60 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
