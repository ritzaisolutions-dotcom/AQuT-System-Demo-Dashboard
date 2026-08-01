import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haller Dev-Dashboard",
  description: "Interne Rohversion — DB-Zustand AQuT Pipeline",
};

const nav = [
  { href: "/leads", label: "Leads" },
  { href: "/objekte", label: "Objekte" },
  { href: "/kunden", label: "Kunden" },
  { href: "/demo-mails", label: "Demo-Mails" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Haller Dev-Dashboard
            </span>
            <nav className="flex gap-3 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
