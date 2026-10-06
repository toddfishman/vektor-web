/* Server-rendered page sections (ported from the prototype's section templates). */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroMap, OfficesMap } from "@/components/map/maps";
import { PROOF } from "@/content/marketing";
import { customers } from "@/content/site";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import { AgentActions, EmailActions, Escalation } from "./contact-actions";
import { RevealList } from "./reveal";
import { Btn, SectionHead } from "./ui";

export { Btn, SectionHead, Credentials } from "./ui";

export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="wrap copy">
        <p className="tag">People-first 3PL · Monterey, CA</p>
        <h1>Freight with <em>direction.</em></h1>
        <p className="lede">A vector is magnitude and direction. Vektor moves truckload, LTL, cold chain and intermodal freight across the country, with a real person on every load, day and night.</p>
        <div className="btns"><Btn href="/quote">Get a quote</Btn><Btn href="/carriers" ghost>Haul with us</Btn></div>
      </div>
      <HeroMap />
    </section>
  );
}

export function PageHead({ img, tag, title, lede, children, alt = "" }: { img: string; tag: string; title: string; lede: string; children?: ReactNode; alt?: string }) {
  return (
    <section className="phead">
      <Image src={`/img/${img}.jpg`} alt={alt} fill priority sizes="100vw" />
      <div className="wrap">
        <p className="tag">{tag}</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {children && <div className="btns" style={{ marginTop: "1.8rem" }}>{children}</div>}
      </div>
    </section>
  );
}

export function Proof() {
  const items = PROOF.map((t, i) => <span key={i}><i />{t}</span>);
  return (
    <div className="proof" aria-label="Proof points">
      <div className="row">{items}<span aria-hidden="true" style={{ display: "contents" }}>{PROOF.map((t, i) => <span key={i}><i />{t}</span>)}</span></div>
    </div>
  );
}

export function Audiences() {
  const cards = [
    { href: "/shippers", img: "about-banner", alt: "Vektor truck on the highway", who: "Shippers", h: "Move freight with a team that picks up.", p: "Truckload, LTL, cold chain, intermodal and more, tracked in real time.", go: "Ship with Vektor" },
    { href: "/carriers", img: "transport-support", alt: "Red truck on an open road", who: "Carriers", h: "Haul for a partner who pays fast.", p: "Net 20 or Quick Pay, a live load board, and cash advances for the road.", go: "Haul with Vektor" },
    { href: "/careers", img: "hero-4", alt: "Vektor team in a warehouse", who: "Careers", h: "Build a career that moves.", p: "Logistics, operations, technology and client services at a people-first company.", go: "Work at Vektor" },
  ];
  return (
    <section className="sec">
      <div className="wrap">
        <SectionHead tag="Who we move for" title="Pick your lane." lede="Shippers, carriers and our own people. Vektor is built on relationships with all three." />
        <div className="aud">
          {cards.map((c) => (
            <Link key={c.href} href={c.href}>
              <Image src={`/img/${c.img}.jpg`} alt={c.alt} fill sizes="(max-width:860px) 100vw, 34vw" />
              <span className="who">{c.who}</span><h3>{c.h}</h3><p>{c.p}</p><span className="go">{c.go}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Resolve a customer's logo file in public/logos (svg preferred), at build/render time. */
function logoFor(slug: string): string | null {
  for (const ext of ["svg", "png", "webp"]) {
    if (existsSync(join(process.cwd(), "public", "logos", `${slug}.${ext}`))) return `/logos/${slug}.${ext}`;
  }
  return null;
}

/** "Trusted by": full-bleed wall of customer marks. Only permission-granted customers show. */
export function TrustedBy() {
  const list = customers.filter((c) => c.permission === "granted");
  if (!list.length) return null;
  return (
    <section className="sec trust" aria-labelledby="trust-h">
      <div className="wrap">
        <div className="trust-head">
          <div>
            <p className="tag">Trusted by</p>
            <h2 id="trust-h">Brands you know ship with <em>Vektor.</em></h2>
          </div>
          <p className="lede">From fresh produce to sporting goods, national grocery, food and retail brands count on Vektor to move their freight.</p>
        </div>
        <RevealList className="trust-grid">
          {list.map((c, i) => {
            const logo = logoFor(c.slug);
            return (
              <li key={c.slug} className={`trust-tile${logo ? "" : " no-logo"}`} style={{ "--d": i } as CSSProperties}>
                {logo
                  /* eslint-disable-next-line @next/next/no-img-element -- static brand marks; SVGs skip the optimizer */
                  ? <img src={logo} alt={c.name} className="trust-logo" loading="lazy" decoding="async" />
                  : <span className="trust-name">{c.name}</span>}
                <span className="trust-kind"><b>{c.name}</b>{c.kind}</span>
              </li>
            );
          })}
          <li className="trust-tile trust-cta" style={{ "--d": list.length } as CSSProperties}>
            <Link href="/quote"><span className="trust-name">Your brand next?</span><span className="go">Get a quote</span></Link>
          </li>
        </RevealList>
      </div>
    </section>
  );
}

export function Offices({ title = "Five offices. One team." }: { title?: string }) {
  return (
    <section className="sec" id="offices">
      <div className="wrap">
        <SectionHead tag="Find us" title={title} lede="A Vektor agent answers any hour, every day of the year. Call, text or ask for a callback." />
        <div className="contact-strip">
          <div className="btns"><AgentActions /><EmailActions /></div>
          <Escalation />
        </div>
        <OfficesMap />
      </div>
    </section>
  );
}
