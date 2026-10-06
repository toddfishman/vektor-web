import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SimpleForm } from "@/components/forms/simple-form";
import { Btn, PageHead, SectionHead } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Careers",
  description: "Logistics, operations, technology and client services roles at a people-first 3PL with offices in California and Florida.",
};

const I = {
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" /></svg>,
  grow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>,
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 20s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.6C20 15.4 12 20 12 20z" /></svg>,
};

const VALUES: [keyof typeof I, string, string][] = [
  ["star", "Pioneering spirit", "Work on projects that set new standards for sustainable supply chains."],
  ["grow", "Real growth", "A culture that nurtures talent, continuous learning and advancement."],
  ["map", "Meaningful impact", "Shape strategies with a lasting, positive effect on supply chains and the environment."],
  ["heart", "Inclusive culture", "Diverse perspectives valued, and a sense of belonging for everyone."],
];

export default function Careers() {
  return (
    <>
      <PageHead img="careers-bg" tag="Careers at Vektor" title="Shape the future of supply chains."
        lede="We’re building a team of driven people in logistics, operations, technology and client services who want to make an impact in a fast-moving industry.">
        <Btn href="#openings">See openings</Btn><Btn href="#jform" ghost>Introduce yourself</Btn>
      </PageHead>

      <section className="sec">
        <div className="wrap">
          <SectionHead tag="Why Vektor" title="Move your career forward." />
          <div className="mosaic">
            <div style={{ position: "relative" }}><Image src="/img/hero-4.jpg" alt="Vektor team in a warehouse" fill sizes="66vw" /></div>
            <div style={{ position: "relative" }}><Image src="/img/who-we-are.jpg" alt="Team reviewing an order" fill sizes="34vw" /></div>
            <div style={{ position: "relative" }}><Image src="/img/adv-support.jpg" alt="Team on phones" fill sizes="34vw" /></div>
          </div>
          <div className="vals">
            {VALUES.map(([i, t, d]) => <div className="val" key={t}><div className="ic">{I[i]}</div><h4>{t}</h4><p>{d}</p></div>)}
          </div>
          {/* TODO(vektor): connect an ATS or CMS list of open roles */}
          <div className="jobs" id="openings">
            <div><h4>No open roles posted right now</h4><p>We’re always glad to meet good people. Introduce yourself and we’ll reach out when something fits.</p></div>
            <Btn href="#jform">Introduce yourself</Btn>
          </div>
          <div className="jobs" style={{ marginTop: "1rem" }}>
            <div><h4>Know someone who’d be great here?</h4><p>Refer a friend for a role at Vektor.</p></div>
            <Link className="btn ghost" href="/refer?kind=employee#refer-form">Refer a friend</Link>
          </div>
        </div>
      </section>

      <section className="sec paper" id="jform">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <p className="tag">Say hello</p>
            <h2>Tell us about you.</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>Offices in Monterey, Fresno, Fontana, Pleasanton and Lakewood Ranch, Florida.</p>
          </div>
          <SimpleForm kind="careers" fields={[
            { name: "name", label: "Name", required: true, autoComplete: "name" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "currentRole", label: "Current role" },
            { name: "area", label: "Area of interest", type: "select", options: ["Logistics / Brokerage", "Operations", "Technology", "Client Services", "Accounting", "Other"] },
            { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
            { name: "referredBy", label: "Referred by (optional)" },
            { name: "message", label: "Message", type: "textarea" },
          ]} />
        </div>
      </section>
    </>
  );
}
