import type { Metadata } from "next";
import Link from "next/link";
import { Lockup } from "@/components/brand/logo";
import "@/styles/team.css";

/* The employee area is separate from the public site: its own layout, never indexed,
   never cached (see headers in next.config.ts), and gated by src/proxy.ts. */
export const metadata: Metadata = { title: "Vektor Team", robots: { index: false, follow: false } };

export default function TeamLayout({ children }: LayoutProps<"/team">) {
  return (
    <div className="team">
      <header className="team-hdr">
        <Link href="/team" aria-label="Vektor Team home"><Lockup height={34} /></Link>
        <span className="team-badge">Team</span>
        <Link className="team-pub" href="/">Public site ↗</Link>
      </header>
      {children}
    </div>
  );
}
