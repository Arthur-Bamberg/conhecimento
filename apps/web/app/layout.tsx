import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ShellNav } from "./shell-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conhecimento",
  description:
    "Textos e chat — Arthur Bamberg / A Bamberg Desenvolvimento de Software",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090b10",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-dvh flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <Providers>
          <header className="border-b border-border bg-surface/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/textos" className="min-w-0">
                <span className="block font-semibold tracking-tight">
                  Conhecimento
                </span>
                <span className="mt-0.5 hidden truncate text-xs text-muted sm:block">
                  Arthur Bamberg · A Bamberg Desenvolvimento de Software
                </span>
              </Link>
              <ShellNav />
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
          <footer className="mt-auto border-t border-border bg-surface/80">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-4 text-xs text-muted">
              <p>
                Arthur Bamberg · A Bamberg Desenvolvimento de Software
              </p>
              <p>
                Tecnologia · Canoas, RS · CNPJ 63.801.318/0001-91 · (51) 9978-4248
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
