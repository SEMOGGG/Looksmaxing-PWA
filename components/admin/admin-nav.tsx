"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/routine", label: "Bibliothèque skincare" },
  { href: "/admin/community", label: "Communauté" },
  { href: "/admin/badges", label: "Badges & points" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3.5">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <Logo idPrefix="admin-logo" className="h-6 w-6" />
          <span className="font-heading text-sm font-semibold text-foreground">Admin</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-foreground">
          Retour à l&rsquo;app
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
