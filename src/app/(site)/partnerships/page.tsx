import type { Metadata } from "next";
import { SimpleForm } from "@/components/forms/simple-form";
import { Btn, PageHead, SectionHead, TrustedBy } from "@/components/site/sections";
import { PARTNERSHIPS } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "Dedicated fleet, managed transportation, contract and RFP freight, seasonal produce programs, cross-border and strategic partnerships with Vektor Logistics.",
};

/* TODO(vektor): confirm each program is offered today, and the routing for "Talk partnership" (LEADS_TO_PARTNERSHIP). */
export default function Partnerships() {
  return (
    <>
      <PageHead img="svc-dedicated" alt="Dedicated Vektor trucks" tag="Partnerships" title="Beyond one lane at a time."
        lede="Some shippers need a truck. Others need a partner who can run a network, commit capacity for a season, or plug into their operation for years. That’s the work we want.">
        <Btn href="#talk">Talk partnership</Btn><Btn href="/quote" ghost>Just need a quote?</Btn>
      </PageHead>

      <section className="sec">
        <div className="wrap">
          <SectionHead tag="Programs" title="Six ways to work together." lede="Each one starts with a conversation with Vektor leadership, not a rate sheet." />
          <div className="programs">
            {PARTNERSHIPS.map((p) => (
              <div className="program" key={p.code}><span className="code">{p.code}</span><h3>{p.h}</h3><p>{p.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <TrustedBy />

      <section className="sec paper" id="talk">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <p className="tag">Talk partnership</p>
            <h2>Tell us what you’re building.</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>This goes straight to Vektor leadership. Share your lanes, volume and timing, and we’ll set up a call.</p>
          </div>
          <SimpleForm kind="partnership" cta="Talk partnership" sentText="Vektor leadership will reach out to set up a call." fields={[
            { name: "name", label: "Name", required: true, autoComplete: "name" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "company", label: "Company", required: true, autoComplete: "organization" },
            { name: "title", label: "Title", autoComplete: "organization-title" },
            { name: "program", label: "Interested in", type: "select", options: ["Dedicated fleet", "Managed transportation", "Contract & RFP freight", "Seasonal produce programs", "Cross-border", "Strategic & agent partners", "Something else"] },
            { name: "annualVolume", label: "Rough volume", placeholder: "e.g. 40 loads/week in season" },
            { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
            { name: "message", label: "What do you need?", type: "textarea" },
          ]} />
        </div>
      </section>
    </>
  );
}
