"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TeamNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="team-nav" aria-label="Employee portal">
      {items.map((n) => {
        const on = n.href === "/team" ? path === "/team" : path.startsWith(n.href);
        return <Link key={n.href} href={n.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>{n.label}</Link>;
      })}
    </nav>
  );
}
