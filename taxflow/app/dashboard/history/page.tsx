// app/dashboard/history/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HistoryClient from "@/components/HistoryClient";
import { TaxEntry } from "@/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: entries } = await supabase
    .from("tax_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-light text-[#e8e8f0]">History</h1>
        <p className="text-sm text-[#8888a8] mt-1">
          All your saved tax estimates.
        </p>
      </div>
      <HistoryClient entries={(entries as TaxEntry[]) ?? []} />
    </div>
  );
}
