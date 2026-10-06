"use client";

/* Header + full-screen menu (the chosen menu style, all screen sizes). */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lockup } from "@/components/brand/logo";
import { nav, site, socialLinks } from "@/content/site";

/** Pages that open on a full-bleed photo keep a transparent header until scrolled. */
const PHOTO_TOP = ["/", "/shippers", "/carriers", "/careers", "/trust", "/partnerships"];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(scrollY > 40);
    f(); addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);

  // close the menu whenever the route changes
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setOpen(false); }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); document.documentElement.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || !PHOTO_TOP.includes(path);
  const socials = socialLinks();

  return (
    <header className={`hdr${solid ? " solid" : ""}`}>
      <div className="wrap">
        <Link className="logo" href="/" aria-label="Vektor Logistics home"><Lockup height={46} play /></Link>
        <button className="burger" aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav className={`nav${open ? " open" : ""}`} id="nav" aria-label="Main" aria-hidden={!open} inert={!open}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={path.startsWith(n.href) ? "on" : undefined} aria-current={path.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <Link className="btn" href="/quote">Get a quote <i className="ar" /></Link>
          <div className="nav-meta">
            <a href={`tel:${site.agent.phone.tel}`}><span className="live">Vektor agent · 24/7/365</span>{site.agent.phone.display}</a>
            {socials.length > 0 && (
              <ul className="socials">{socials.map((s) => <li key={s.key}><a href={s.url} rel="me noopener" target="_blank">{s.label}</a></li>)}</ul>
            )}
            <Link className="nav-portal" href="/team">Employee portal</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
