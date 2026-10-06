/* Small shared building blocks, safe for server and client components. */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";

export function Btn({ href, children, ghost }: { href: string; children: ReactNode; ghost?: boolean }) {
  return <Link className={`btn${ghost ? " ghost" : ""}`} href={href}>{children}{!ghost && <> <i className="ar" /></>}</Link>;
}

export function SectionHead({ tag, title, lede }: { tag: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <div className="shead">
      <div><p className="tag">{tag}</p><h2>{title}</h2></div>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

export function Credentials() {
  return (
    <div className="cred">
      <div className="aw"><Image src="/img/award.jpg" alt="Best of 2026 BusinessRate award for Vektor Logistics" width={768} height={961} sizes="150px" /></div>
      <div>
        <h3>Best of 2026, Logistics Service</h3>
        <p style={{ margin: ".5rem 0 0" }}>Recognized by BusinessRate from customer reviews. Proud members of Western Growers and the California Fresh Fruit Association.</p>
        <div className="logos">
          <Image src="/img/western-growers.png" alt="Western Growers" width={768} height={432} sizes="110px" />
          <Image src="/img/cffa.png" alt="California Fresh Fruit Association" width={768} height={265} sizes="170px" />
        </div>
        <p className="mono creds-line">{site.mc} · {site.usdot}</p>
      </div>
    </div>
  );
}

