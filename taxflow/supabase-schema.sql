-- ─────────────────────────────────────────────────────────────
-- TaxFlow — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────

-- 1. Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 2. Create the tax_entries table
create table if not exists public.tax_entries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  income          numeric(18, 2) not null check (income >= 0),
  country         text not null default 'NG',
  deductions      numeric(18, 2) not null default 0 check (deductions >= 0),
  taxable_income  numeric(18, 2) not null,
  estimated_tax   numeric(18, 2) not null,
  effective_rate  numeric(6, 4) not null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_tax_entries_updated
  before update on public.tax_entries
  for each row execute procedure public.handle_updated_at();

-- 4. Row Level Security — users can only see/edit their own rows
alter table public.tax_entries enable row level security;

-- Policy: select own rows
create policy "Users can view own entries"
  on public.tax_entries for select
  using (auth.uid() = user_id);

-- Policy: insert own rows
create policy "Users can insert own entries"
  on public.tax_entries for insert
  with check (auth.uid() = user_id);

-- Policy: update own rows
create policy "Users can update own entries"
  on public.tax_entries for update
  using (auth.uid() = user_id);

-- Policy: delete own rows
create policy "Users can delete own entries"
  on public.tax_entries for delete
  using (auth.uid() = user_id);

-- 5. Index for fast user queries
create index if not exists idx_tax_entries_user_id
  on public.tax_entries(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Done! Your schema is ready.
-- ─────────────────────────────────────────────────────────────
