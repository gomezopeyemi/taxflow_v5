"use client";
// components/HistoryClient.tsx

import { useState } from "react";
import { TaxEntry } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/tax";
import { formatDate } from "@/lib/utils";
import { Trash2, FileText, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  entries: TaxEntry[];
}

export default function HistoryClient({ entries: initial }: Props) {
  const [entries, setEntries] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    } catch {
      alert("Could not delete entry. Please try again.");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl border border-dashed border-[#1e1e2e]">
        <FileText size={36} className="text-[#555570] mx-auto mb-3" />
        <p className="text-sm text-[#555570]">No estimates saved yet.</p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-colors"
        >
          Create your first estimate
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const isExpanded = expanded === entry.id;
        const isConfirm = confirmDelete === entry.id;

        return (
          <div
            key={entry.id}
            className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#2a2a40] transition-colors animate-slide-up"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both", opacity: 0 }}
          >
            {/* Row header */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setExpanded(isExpanded ? null : entry.id)}
                className="flex items-center gap-4 flex-1 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#16161f] border border-[#1e1e2e] flex items-center justify-center font-mono text-xs text-[#8888a8]">
                  {entry.country}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e8e8f0] tabular-nums">
                    {formatCurrency(entry.income, entry.country)}
                  </p>
                  <p className="text-xs text-[#555570] mt-0.5">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-red-400 tabular-nums">
                    −{formatCurrency(entry.estimated_tax, entry.country)}
                  </p>
                  <p className="text-xs text-[#555570]">
                    {formatPercent(entry.effective_rate)} rate
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                  className={`p-2 rounded-lg transition-all text-sm flex items-center gap-1.5 ${
                    isConfirm
                      ? "bg-red-500/20 border border-red-500/30 text-red-400"
                      : "text-[#555570] hover:text-red-400 hover:bg-red-500/10"
                  }`}
                  title={isConfirm ? "Click again to confirm" : "Delete"}
                >
                  {isConfirm ? (
                    <>
                      <AlertTriangle size={13} />
                      <span className="text-xs hidden sm:inline">Confirm</span>
                    </>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>

                <button
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                  className="p-2 rounded-lg text-[#555570] hover:text-[#e8e8f0] transition-colors"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Expanded breakdown */}
            {isExpanded && (
              <div className="border-t border-[#1e1e2e] p-4 bg-[#0d0d14] animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Income", value: formatCurrency(entry.income, entry.country) },
                    { label: "Deductions", value: formatCurrency(entry.deductions, entry.country) },
                    { label: "Taxable", value: formatCurrency(entry.taxable_income, entry.country) },
                    { label: "After tax", value: formatCurrency(entry.taxable_income - entry.estimated_tax, entry.country) },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-lg bg-[#111118] border border-[#1e1e2e]">
                      <p className="text-xs text-[#555570]">{s.label}</p>
                      <p className="text-sm font-mono font-medium text-[#e8e8f0] mt-0.5 tabular-nums">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {entry.notes && (
                  <p className="text-xs text-[#8888a8] bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-2">
                    📝 {entry.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
