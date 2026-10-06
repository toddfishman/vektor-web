/* Server-rendered page sections (ported from the prototype's section templates). */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroMap, OfficesMap } from "@/components/map/maps";
import { PROOF } from "@/content/marketing";
import { customers, customersFallback, site } from "@/content/site";
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

/** Customer logos for trust. Only permission-granted logos render; otherwise text fallback. */
export function TrustedBy({ paper = false }: { paper?: boolean }) {
  const shown = customers.filter((c) => c.permission === "granted" && c.logo);
  return (
    <section className={`sec trusted${paper ? " paper" : ""}`}>
      <div className="wrap">
        <p className="tag">Trusted by</p>
        {shown.length ? (
          <ul className="logos-row">
            {shown.map((c) => <li key={c.name}><Image src={c.logo!} alt={c.name} width={180} height={64} /></li>)}
          </ul>
        ) : (
          <p className="trusted-fallback">{customersFallback}.</p>
        )}
      </div>
    </section>
  );
}

export function Offices({ title = "Five offices. One team." }: { title?: string }) {
  return (
    <section className="sec" id="offices">
      <div className="wrap">
        <SectionHead tag="Find us" title={title} lede={<>Call <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a> any hour, or email <a href={`mailto:${site.email.sales}`}>{site.email.sales}</a>.</>} />
        <OfficesMap />
      </div>
    </section>
  );
}
