"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/textos", label: "Textos" },
  { href: "/chat", label: "Chat" },
];

export function ShellNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-full bg-accent-soft px-3 py-1.5 font-medium text-accent"
                : "rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
