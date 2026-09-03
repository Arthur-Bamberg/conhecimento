"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChat, IconDocument } from "./icons";

const links = [
  { href: "/textos", label: "Textos", icon: IconDocument },
  { href: "/chat", label: "Chat", icon: IconChat },
];

export function ShellNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex items-stretch gap-1 text-sm">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            suppressHydrationWarning
            className={
              active
                ? "inline-flex min-h-11 items-center gap-1.5 border-b-2 border-accent px-2.5 font-medium text-foreground"
                : "inline-flex min-h-11 items-center gap-1.5 border-b-2 border-transparent px-2.5 text-muted transition-colors duration-200 hover:text-foreground"
            }
          >
            <Icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
