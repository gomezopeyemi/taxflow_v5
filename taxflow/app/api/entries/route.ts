// app/api/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateTax } from "@/lib/tax";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { income, country, deductions, notes } = body;

    if (!income || income <= 0) {
      return NextResponse.json(
        { error: "Income must be a positive number" },
        { status: 400 }
      );
    }

    const result = calculateTax(
      Number(income),
      country ?? "NG",
      Number(deductions ?? 0)
    );

    const { data, error } = await supabase
      .from("tax_entries")
      .insert({
        user_id: user.id,
        income: Number(income),
        country: country ?? "NG",
        deductions: Number(deductions ?? 0),
        taxable_income: result.taxableIncome,
        estimated_tax: result.estimatedTax,
        effective_rate: result.effectiveRate,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tax_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries: data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
