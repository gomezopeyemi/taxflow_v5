"use client";
// components/DashboardClient.tsx

import Link from "next/link";
import { useState, useEffect } from "react";
import { TaxEntry } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/tax";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, TrendingUp, Receipt, Percent, Clock } from "lucide-react";

interface Props {
  entries: TaxEntry[];
  userEmail: string;
}

function RelativeTimeDisplay({ dateString }: { dateString: string }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setTime(formatRelativeTime(dateString));
  }, [dateString]);

  return (
    <span suppressHydrationWarning>
      {time}
    </span>
  );
}

export default function DashboardClient({ entries, userEmail }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalIncome = entries.reduce((s, e) => s + e.income, 0);
  const totalTax = entries.reduce((s, e) => s + e.estimated_tax, 0);
  const avgRate =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.effective_rate, 0) / entries.length
      : 0;
  const latest = entries[0] ?? null;

  // Chart data — last 8 entries reversed for chronological order
  const chartData = [...entries]
    .slice(0, 8)
    .reverse()
    .map((e, i) => ({
      name: `#${i + 1}`,
      Income: e.income,
      Tax: e.estimated_tax,
      "After Tax": e.taxable_income - e.estimated_tax,
    }));

  const stats = [
    {
      label: "Total income tracked",
      value: entries.length > 0 ? formatCurrency(totalIncome, latest?.country ?? "NG") : "—",
      icon: TrendingUp,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Total estimated tax",
      value: entries.length > 0 ? formatCurrency(totalTax, latest?.country ?? "NG") : "—",
      icon: Receipt,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Avg. effective rate",
      value: entries.length > 0 ? formatPercent(avgRate) : "—",
      icon: Percent,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Last updated",
      value: latest ? (
        <RelativeTimeDisplay dateString={latest.created_at} />
      ) : (
        "No entries yet"
      ),
      icon: Clock,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <p className="text-sm text-[#555570]">
            {userEmail.split("@")[0]}
          </p>
          <h1 className="text-2xl font-light text-[#e8e8f0] mt-0.5">
            Overview
          </h1>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
        >
          <Plus size={15} />
          New estimate
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" suppressHydrationWarning>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118] animate-slide-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both", opacity: 0 }}
          >
            <div className={`inline-flex p-2 rounded-lg ${s.bg} border ${s.border} mb-3`}>
              <s.icon size={15} className={s.color} />
            </div>
            <p className="text-lg font-medium text-[#e8e8f0] tabular-nums">{s.value}</p>
            <p className="text-xs text-[#555570] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div
          className="p-6 rounded-xl border border-[#1e1e2e] bg-[#111118] animate-slide-up"
          style={{ animationDelay: "280ms", animationFillMode: "both", opacity: 0 }}
        >
          <h2 className="text-sm font-medium text-[#e8e8f0] mb-1">
            Income vs Tax
          </h2>
          <p className="text-xs text-[#555570] mb-6">
            Your last {chartData.length} estimates
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#555570", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555570", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}K`
                    : v
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#16161f",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e8e8f0",
                }}
                formatter={(value: number | string) =>
                  Number(value).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="Income"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="Tax"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#taxGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent entries */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: "360ms", animationFillMode: "both", opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#e8e8f0]">Recent estimates</h2>
          {entries.length > 3 && (
            <Link
              href="/dashboard/history"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-[#1e1e2e]">
            <Receipt size={32} className="text-[#555570] mx-auto mb-3" />
            <p className="text-sm text-[#555570]">No estimates yet</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-colors"
            >
              <Plus size={14} />
              Create your first estimate
            </Link>
          </div>
        ) : (
          <div className="space-y-2" suppressHydrationWarning>
            {entries.slice(0, 5).map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryRow({ entry }: { entry: TaxEntry }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[#1e1e2e] bg-[#111118] hover:border-[#2a2a40] transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#16161f] border border-[#1e1e2e] flex items-center justify-center text-sm font-mono text-[#8888a8]">
          {entry.country}
        </div>
        <div>
          <p className="text-sm font-medium text-[#e8e8f0] tabular-nums">
            {formatCurrency(entry.income, entry.country)}
          </p>
          <p className="text-xs text-[#555570]">
            <RelativeTimeDisplay dateString={entry.created_at} />
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-red-400 tabular-nums">
          −{formatCurrency(entry.estimated_tax, entry.country)}
        </p>
        <p className="text-xs text-[#555570]">
          {formatPercent(entry.effective_rate)} eff. rate
        </p>
      </div>
    </div>
  );
}
