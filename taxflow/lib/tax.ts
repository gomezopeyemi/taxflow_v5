// lib/tax.ts
// ─────────────────────────────────────────────────────────────
// Tax logic — modular, beginner-readable, easy to extend.
// To add a new country: add an entry to TAX_CONFIGS below.
// ─────────────────────────────────────────────────────────────

import { TaxConfig, TaxCalculationResult, BracketBreakdown } from "@/types";

// ── Tax configurations per country ──────────────────────────
export const TAX_CONFIGS: Record<string, TaxConfig> = {
  NG: {
    country: "Nigeria",
    currency: "NGN",
    symbol: "₦",
    brackets: [
      { min: 0,         max: 300_000,    rate: 0.07, label: "7% band"  },
      { min: 300_000,   max: 600_000,    rate: 0.11, label: "11% band" },
      { min: 600_000,   max: 1_100_000,  rate: 0.15, label: "15% band" },
      { min: 1_100_000, max: 1_600_000,  rate: 0.19, label: "19% band" },
      { min: 1_600_000, max: 3_200_000,  rate: 0.21, label: "21% band" },
      { min: 3_200_000, max: null,       rate: 0.24, label: "24% band" },
    ],
  },
  US: {
    country: "United States",
    currency: "USD",
    symbol: "$",
    brackets: [
      { min: 0,          max: 11_600,    rate: 0.10, label: "10% band" },
      { min: 11_600,     max: 47_150,    rate: 0.12, label: "12% band" },
      { min: 47_150,     max: 100_525,   rate: 0.22, label: "22% band" },
      { min: 100_525,    max: 191_950,   rate: 0.24, label: "24% band" },
      { min: 191_950,    max: 243_725,   rate: 0.32, label: "32% band" },
      { min: 243_725,    max: 609_350,   rate: 0.35, label: "35% band" },
      { min: 609_350,    max: null,      rate: 0.37, label: "37% band" },
    ],
  },
  GB: {
    country: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    brackets: [
      { min: 0,       max: 12_570,  rate: 0.00, label: "Personal allowance" },
      { min: 12_570,  max: 50_270,  rate: 0.20, label: "Basic rate 20%"     },
      { min: 50_270,  max: 125_140, rate: 0.40, label: "Higher rate 40%"    },
      { min: 125_140, max: null,    rate: 0.45, label: "Additional rate 45%" },
    ],
  },
  GH: {
    country: "Ghana",
    currency: "GHS",
    symbol: "₵",
    brackets: [
      { min: 0,       max: 4_380,   rate: 0.00, label: "0% band"  },
      { min: 4_380,   max: 5_580,   rate: 0.05, label: "5% band"  },
      { min: 5_580,   max: 6_780,   rate: 0.10, label: "10% band" },
      { min: 6_780,   max: 9_180,   rate: 0.175, label: "17.5% band" },
      { min: 9_180,   max: 49_380,  rate: 0.25, label: "25% band" },
      { min: 49_380,  max: null,    rate: 0.30, label: "30% band" },
    ],
  },
  KE: {
    country: "Kenya",
    currency: "KES",
    symbol: "KSh",
    brackets: [
      { min: 0,         max: 288_000,   rate: 0.10, label: "10% band" },
      { min: 288_000,   max: 388_000,   rate: 0.25, label: "25% band" },
      { min: 388_000,   max: 6_000_000, rate: 0.30, label: "30% band" },
      { min: 6_000_000, max: 9_600_000, rate: 0.325, label: "32.5% band" },
      { min: 9_600_000, max: null,      rate: 0.35, label: "35% band" },
    ],
  },
  CA: {
    country: "Canada",
    currency: "CAD",
    symbol: "CA$",
    brackets: [
      { min: 0,        max: 55_867,   rate: 0.15, label: "15% band" },
      { min: 55_867,   max: 111_733,  rate: 0.205, label: "20.5% band" },
      { min: 111_733,  max: 154_906,  rate: 0.26, label: "26% band" },
      { min: 154_906,  max: 220_000,  rate: 0.29, label: "29% band" },
      { min: 220_000,  max: null,     rate: 0.33, label: "33% band" },
    ],
  },
};

// ── Core calculation function ────────────────────────────────
export function calculateTax(
  grossIncome: number,
  countryCode: string,
  deductions: number = 0
): TaxCalculationResult {
  const config = TAX_CONFIGS[countryCode] ?? TAX_CONFIGS["NG"];
  const taxableIncome = Math.max(0, grossIncome - deductions);

  let estimatedTax = 0;
  const bracketBreakdown: BracketBreakdown[] = [];

  for (const bracket of config.brackets) {
    if (taxableIncome <= bracket.min) break;

    const upperBound = bracket.max ?? Infinity;
    const taxableInBracket = Math.min(taxableIncome, upperBound) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;

    estimatedTax += taxInBracket;

    if (taxableInBracket > 0) {
      bracketBreakdown.push({
        label: bracket.label,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        taxAmount: taxInBracket,
      });
    }
  }

  const effectiveRate =
    taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0;

  return {
    taxableIncome,
    estimatedTax,
    effectiveRate,
    bracketBreakdown,
    afterTaxIncome: taxableIncome - estimatedTax,
  };
}

// ── Formatting helpers ───────────────────────────────────────
export function formatCurrency(
  amount: number,
  countryCode: string
): string {
  const config = TAX_CONFIGS[countryCode] ?? TAX_CONFIGS["NG"];
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function getCountryList() {
  return Object.entries(TAX_CONFIGS).map(([code, cfg]) => ({
    code,
    name: cfg.country,
    symbol: cfg.symbol,
    currency: cfg.currency,
  }));
}
