"use client";
// components/TaxForm.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  calculateTax,
  formatCurrency,
  formatPercent,
  getCountryList,
  TAX_CONFIGS,
} from "@/lib/tax";
import { TaxCalculationResult } from "@/types";
import {
  Loader2,
  ChevronDown,
  Info,
  Download,
  CheckCircle2,
} from "lucide-react";

export default function TaxForm() {
  const router = useRouter();
  const [income, setIncome] = useState("");
  const [country, setCountry] = useState("NG");
  const [deductions, setDeductions] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countries = getCountryList();
  const config = TAX_CONFIGS[country];

  // Real-time calculation
  const recalculate = useCallback(() => {
    const inc = parseFloat(income.replace(/,/g, ""));
    const ded = parseFloat(deductions.replace(/,/g, "")) || 0;
    if (!isNaN(inc) && inc > 0) {
      setResult(calculateTax(inc, country, ded));
    } else {
      setResult(null);
    }
  }, [income, country, deductions]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setError(null);

    try {
      const inc = parseFloat(income.replace(/,/g, ""));
      const ded = parseFloat(deductions.replace(/,/g, "")) || 0;

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: inc, country, deductions: ded, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      setSaved(true);
      setTimeout(() => {
        router.push("/dashboard/history");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPDF() {
    if (!result) return;
    const inc = parseFloat(income.replace(/,/g, ""));
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const sym = config.symbol;

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 60);
    doc.text("TaxFlow — Tax Summary", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Country: ${config.country} (${country})`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [["Field", "Amount"]],
      body: [
        ["Gross Income", `${sym}${inc.toLocaleString()}`],
        ["Deductions", `${sym}${(parseFloat(deductions) || 0).toLocaleString()}`],
        ["Taxable Income", `${sym}${result.taxableIncome.toLocaleString()}`],
        ["Estimated Tax", `${sym}${result.estimatedTax.toLocaleString()}`],
        ["Effective Rate", formatPercent(result.effectiveRate)],
        ["After-tax Income", `${sym}${result.afterTaxIncome.toLocaleString()}`],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY ?? 140;

    autoTable(doc, {
      startY: finalY + 10,
      head: [["Tax Band", "Rate", "Taxable Amount", "Tax"]],
      body: result.bracketBreakdown.map((b) => [
        b.label,
        formatPercent(b.rate * 100),
        `${sym}${b.taxableAmount.toLocaleString()}`,
        `${sym}${b.taxAmount.toLocaleString()}`,
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 30, 46] },
    });

    doc.save(`taxflow-estimate-${Date.now()}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Form card */}
      <div
        className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 animate-slide-up"
        style={{ animationFillMode: "both", opacity: 0 }}
      >
        <div className="grid gap-5">
          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-[#8888a8] mb-1.5 uppercase tracking-wide">
              Country
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full appearance-none bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-4 py-2.5 pr-10 text-sm text-[#e8e8f0] focus:border-indigo-500/60 focus:outline-none transition-colors cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570] pointer-events-none"
              />
            </div>
          </div>

          {/* Income */}
          <div>
            <label className="block text-xs font-medium text-[#8888a8] mb-1.5 uppercase tracking-wide">
              Annual income <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570] text-sm font-mono">
                {config.symbol}
              </span>
              <input
                type="number"
                placeholder="0"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555570] focus:border-indigo-500/60 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Deductions */}
          <div>
            <label className="block text-xs font-medium text-[#8888a8] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              Deductions
              <span className="normal-case text-[#555570] font-normal tracking-normal">
                (optional)
              </span>
              <div className="group relative inline-block">
                <Info size={12} className="text-[#555570] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#16161f] border border-[#1e1e2e] rounded-lg p-2.5 text-xs text-[#8888a8] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  Deductions reduce your taxable income (e.g. pension, allowances).
                </div>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570] text-sm font-mono">
                {config.symbol}
              </span>
              <input
                type="number"
                placeholder="0"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555570] focus:border-indigo-500/60 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#8888a8] mb-1.5 uppercase tracking-wide">
              Notes <span className="normal-case text-[#555570] font-normal tracking-normal">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. FY 2024, includes salary + freelance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555570] focus:border-indigo-500/60 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Live result panel */}
      {result && (
        <div
          className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 animate-slide-up space-y-5"
          style={{ animationFillMode: "both", opacity: 0 }}
        >
          <h2 className="text-sm font-medium text-[#e8e8f0]">
            Live estimate
          </h2>

          {/* Summary numbers */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Taxable income"
              value={formatCurrency(result.taxableIncome, country)}
              sub=""
              accent="indigo"
            />
            <StatBox
              label="Estimated tax"
              value={formatCurrency(result.estimatedTax, country)}
              sub=""
              accent="red"
            />
            <StatBox
              label="Effective rate"
              value={formatPercent(result.effectiveRate)}
              sub=""
              accent="amber"
            />
            <StatBox
              label="After-tax income"
              value={formatCurrency(result.afterTaxIncome, country)}
              sub=""
              accent="green"
            />
          </div>

          {/* Tax-to-income bar */}
          <div>
            <div className="flex justify-between text-xs text-[#555570] mb-1.5">
              <span>After-tax</span>
              <span>Tax</span>
            </div>
            <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all duration-500 ease-out rounded-l-full"
                style={{
                  width: `${Math.min(100, (result.afterTaxIncome / (parseFloat(income) || 1)) * 100).toFixed(1)}%`,
                }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500 ease-out rounded-r-full"
                style={{
                  width: `${Math.min(100, (result.estimatedTax / (parseFloat(income) || 1)) * 100).toFixed(1)}%`,
                }}
              />
            </div>
          </div>

          {/* Bracket breakdown */}
          {result.bracketBreakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#555570] uppercase tracking-wide mb-2">
                Bracket breakdown
              </p>
              <div className="space-y-1.5">
                {result.bracketBreakdown.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
                  >
                    <span className="text-[#8888a8]">{b.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#555570] font-mono tabular-nums">
                        {formatCurrency(b.taxableAmount, country)}
                      </span>
                      <span className="text-[#e8e8f0] font-mono tabular-nums w-20 text-right">
                        −{formatCurrency(b.taxAmount, country)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saved && <CheckCircle2 size={14} />}
              {saved ? "Saved!" : saving ? "Saving…" : "Save estimate"}
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a40] text-[#8888a8] hover:text-[#e8e8f0] text-sm transition-colors flex items-center gap-2"
              title="Export PDF"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-[#555570] text-center pb-4">
        ⚠️ Estimates are simplified. Consult a tax professional for official filings.
      </p>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "indigo" | "red" | "amber" | "green";
}) {
  const colors = {
    indigo: "text-indigo-400",
    red: "text-red-400",
    amber: "text-amber-400",
    green: "text-green-400",
  };

  return (
    <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
      <p className="text-xs text-[#555570] mb-1">{label}</p>
      <p className={`text-base font-medium tabular-nums ${colors[accent]}`}>
        {value}
      </p>
    </div>
  );
}
