import type { Metadata } from "next";
import Link from "next/link";
import { Dosis } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "3MMODELS",
  description: "Modern luxury modeling agency",
};

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/models", label: "Models" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/become-a-model", label: "Become a model" },
];

const boardNav = [
  { label: "Non Binary", division: "non-binary" },
  { label: "Girls", division: "girls" },
  { label: "Women", division: "women" },
  { label: "Men", division: "men" },
  { label: "Boys", division: "boys" },
  { label: "Become a model", href: "/contact" },
];

const dosis = Dosis({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dosis",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dosis.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border-color)] bg-white/90 backdrop-blur">
            <div className="mx-auto flex flex-col items-center gap-4 px-6 py-6 lg:max-w-6xl lg:flex-row lg:justify-between lg:px-8">
              <div className="flex flex-col items-center text-center uppercase tracking-[0.7em] text-[var(--muted)]">
                <Link href="/" className="text-[11px]">3MMODELS</Link>
                <span className="text-[9px] tracking-[0.5em]">Management & Placement</span>
              </div>
              <nav className="flex flex-wrap justify-center gap-5 text-[11px] uppercase tracking-[0.4em] text-[var(--muted)]">
                {primaryNav.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-black transition-colors">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-[var(--border-color)]">
              <div className="mx-auto flex flex-wrap justify-center gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.5em] text-[var(--muted)] lg:max-w-6xl lg:px-8">
                {boardNav.map((item) => {
                  const href = item.href ?? `/models?division=${encodeURIComponent(item.division ?? "")}`;
                  return (
                    <Link key={item.label} href={href} className="hover:text-black transition-colors">
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-16">
              {children}
            </div>
          </main>

          <footer className="border-t border-[var(--border-color)] bg-white/90">
            <div className="mx-auto flex flex-col items-center gap-2 px-6 py-6 text-[11px] uppercase tracking-[0.4em] text-[var(--muted)] lg:max-w-6xl lg:flex-row lg:justify-between lg:px-8">
              <span>© {new Date().getFullYear()} 3MMODELS. All rights reserved.</span>
              <span>Mediaslide model agency software</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
