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
    "Textos e chat — Arthur Bamberg / Bamberg Desenvolvimento de Software",
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
        className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <Providers>
          <a href="#conteudo" className="skip-link">
            Ir para o conteúdo
          </a>
          <header className="z-40 shrink-0 border-b border-border bg-background">
            <div className="mx-auto flex w-full max-w-5xl items-stretch justify-between gap-4 px-4">
              <Link href="/textos" className="min-w-0 self-center py-3">
                <span className="block font-semibold">Conhecimento</span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  Arthur Bamberg · Bamberg Desenvolvimento de Software
                </span>
              </Link>
              <ShellNav />
            </div>
          </header>
          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-6 outline-none"
          >
            {children}
          </main>
          <footer className="shrink-0 border-t border-border bg-background">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-4 text-sm text-muted">
              <p>
                Arthur Bamberg · Bamberg Desenvolvimento de Software
              </p>
              <p>
                Tecnologia · Canoas, RS · CNPJ 63.801.318/0001-91 · (51)
                9978-4248
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
