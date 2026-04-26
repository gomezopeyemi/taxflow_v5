// types/index.ts

export interface TaxEntry {
  id: string;
  user_id: string;
  income: number;
  country: string;
  deductions: number;
  taxable_income: number;
  estimated_tax: number;
  effective_rate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  label: string;
}

export interface TaxConfig {
  country: string;
  currency: string;
  symbol: string;
  brackets: TaxBracket[];
}

export interface TaxCalculationResult {
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
  bracketBreakdown: BracketBreakdown[];
  afterTaxIncome: number;
}

export interface BracketBreakdown {
  label: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface DashboardStats {
  totalEntries: number;
  totalIncome: number;
  totalTax: number;
  averageEffectiveRate: number;
  latestEntry: TaxEntry | null;
}
