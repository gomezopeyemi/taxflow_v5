// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxFlow — Simple Tax Estimation",
  description:
    "A clean, minimal tax estimation tool. Input your income, get instant estimates.",
  keywords: ["tax", "income", "Nigeria", "tax calculator", "TaxFlow"],
  openGraph: {
    title: "TaxFlow",
    description: "Simple, clean tax estimation for real users.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-geist-sans: 'DM Sans', system-ui, sans-serif;
            --font-geist-mono: 'DM Mono', monospace;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0] antialiased">
        {children}
      </body>
    </html>
  );
}
