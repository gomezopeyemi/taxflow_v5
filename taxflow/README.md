# TaxFlow 💸

> A minimal, production-ready tax estimation web app.  
> Clean UI · Real-time calculation · Multi-country · PDF export

---

## ✨ Features

- 🔐 **Auth** — Email/password + Google OAuth via Supabase
- 📊 **Dashboard** — Income, tax, and effective rate at a glance
- ⚡ **Real-time tax calc** — Updates as you type, no form submit needed
- 🌍 **Multi-country** — Nigeria, USA, UK, Ghana, Kenya, Canada (easy to extend)
- 💾 **Persistence** — All estimates saved per user in Supabase
- 📄 **PDF export** — One-click download of your tax summary
- 📱 **Mobile-first** — Fully responsive dark UI

---

## 🗂 Project Structure

```
taxflow/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css
│   ├── auth/
│   │   ├── page.tsx            # Login / signup page
│   │   └── callback/route.ts   # OAuth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx          # Protected layout (auth check)
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── new/page.tsx        # New tax estimate form
│   │   └── history/page.tsx    # All saved entries
│   └── api/
│       └── entries/
│           ├── route.ts        # GET + POST entries
│           └── [id]/route.ts   # DELETE entry
├── components/
│   ├── AuthForm.tsx            # Login / signup UI
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── DashboardClient.tsx     # Stats + chart
│   ├── TaxForm.tsx             # Tax input + live result
│   └── HistoryClient.tsx       # Entry list with delete
├── lib/
│   ├── tax.ts                  # ⭐ All tax logic lives here
│   ├── utils.ts                # Formatting helpers
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Route protection
├── types/index.ts              # TypeScript types
├── middleware.ts               # Next.js middleware (auth guard)
├── supabase-schema.sql         # ⭐ Run this in Supabase SQL Editor
└── .env.example                # Copy → .env.local
```

---

## 🚀 Setup Guide

### Step 1 — Clone & install

```bash
git clone <your-repo-url>
cd taxflow
npm install
```

---

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project** → choose a name and region
3. Wait ~2 minutes for provisioning

---

### Step 3 — Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

✅ This creates the `tax_entries` table with Row Level Security enabled.

---

### Step 4 — Get your API keys

1. Go to **Settings → API** in your Supabase project
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 5 — Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 6 — (Optional) Enable Google OAuth

1. Go to Supabase → **Authentication → Providers → Google**
2. Enable it and follow the setup guide to get Google OAuth credentials
3. Add your redirect URL: `https://your-domain.com/auth/callback`

> For local dev, also add: `http://localhost:3000/auth/callback`

---

### Step 7 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Step 8 — Build for production

```bash
npm run build
npm run start
```

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Option B — Vercel Dashboard (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

> **Important:** After deploying, go to Supabase → Authentication → URL Configuration and add your Vercel domain to the **Site URL** and **Redirect URLs**.

---

## 🧩 Adding a New Country

Edit `lib/tax.ts` and add an entry to `TAX_CONFIGS`:

```ts
ZA: {
  country: "South Africa",
  currency: "ZAR",
  symbol: "R",
  brackets: [
    { min: 0,         max: 237_100,  rate: 0.18, label: "18% band" },
    { min: 237_100,   max: 370_500,  rate: 0.26, label: "26% band" },
    { min: 370_500,   max: 512_800,  rate: 0.31, label: "31% band" },
    { min: 512_800,   max: 673_000,  rate: 0.36, label: "36% band" },
    { min: 673_000,   max: 857_900,  rate: 0.39, label: "39% band" },
    { min: 857_900,   max: 1_817_000, rate: 0.41, label: "41% band" },
    { min: 1_817_000, max: null,     rate: 0.45, label: "45% band" },
  ],
},
```

That's it — the dropdown and calculations update automatically.

---

## 🔐 Security

- All routes under `/dashboard` are protected by middleware
- Row Level Security (RLS) ensures users only access their own data
- Environment variables are never exposed to the client (except `NEXT_PUBLIC_*`)
- Passwords are handled entirely by Supabase Auth (never stored by the app)

---

## ⚠️ Disclaimer

TaxFlow provides **simplified estimates** for educational purposes only.  
Always consult a certified tax professional for official tax filings.

---

## 📄 License

MIT — free to use, modify, and deploy.
