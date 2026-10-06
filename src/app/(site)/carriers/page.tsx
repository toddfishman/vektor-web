import type { Metadata } from "next";
import Image from "next/image";
import { SimpleForm } from "@/components/forms/simple-form";
import { CarrierMap } from "@/components/map/maps";
import { Btn, PageHead, SectionHead } from "@/components/site/sections";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Haul with Vektor",
  description: "Net 20 or Quick Pay, a live load board, cash advances, and steady West Coast produce freight. Become a Vektor carrier partner.",
};

export default function Carriers() {
  return (
    <>
      <PageHead img="transport-support" alt="Red truck on an open road" tag="Haul with Vektor" title="A partner that respects your business."
        lede="Long-term partnerships with carriers who value professionalism, performance and consistency. Our tech keeps your wheels turning and your cash flow strong.">
        <Btn href="#cform">Become a carrier partner</Btn>
        <a className="btn ghost" href={`tel:${site.phone.tel}`}>Call {site.phone.display}</a>
      </PageHead>

      <section className="sec">
        <div className="wrap">
          <div className="bigs">
            <div><b>Net <em>20</em></b><h4>Fast payment terms</h4><p>Industry-leading terms, flexible to your business.</p></div>
            <div><b>Quick<em>Pay</em></b><h4>Paid faster when you need it</h4><p>Don’t wait on the cycle when cash is tight.</p></div>
            <div><b>Live</b><h4>Interactive load board</h4><p>See and bid on loads in real time. Keep trucks full.</p></div>
            <div><b>Cash<em>+</em></b><h4>Cash advances</h4><p>Cover planned and unplanned road expenses.</p></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--night2)" }}>
        <div className="wrap split">
          <div className="ph" style={{ position: "relative" }}><Image src="/img/adv-safe.jpg" alt="Freight being loaded" fill sizes="(max-width:860px) 100vw, 50vw" /></div>
          <div>
            <p className="tag">Compliance</p>
            <h2>Good carriers get the freight.</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>We set, monitor and maintain strict compliance standards for every carrier partner. That keeps cargo out of the wrong hands, and keeps the good loads going to carriers who do it right.</p>
            <p className="mono" style={{ color: "var(--steel)", marginTop: "1.4rem" }}>Vektor Logistics · {site.mc} · {site.usdot}</p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionHead tag="Lanes we run" title="Loads coast to coast." lede="Heavy West Coast produce outbound, with backhauls across the country. Hover a lane." />
          <CarrierMap />
        </div>
      </section>

      <section className="sec paper" id="cform">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <p className="tag">Get set up</p>
            <h2>Ready to start hauling?</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>Tell us about your equipment and lanes. Our carrier team will get you set up and on the board.</p>
            {site.carrierOnboardingUrl && (
              <div className="btns" style={{ marginTop: "1.4rem" }}>
                <a className="btn" href={site.carrierOnboardingUrl} rel="noopener" target="_blank">Start carrier setup <i className="ar" /></a>
              </div>
            )}
            <div style={{ position: "relative", marginTop: "2rem", aspectRatio: "16/10", borderRadius: "var(--r)", overflow: "hidden" }}>
              <Image src="/img/svc-yard-2.jpg" alt="Trucks in a yard" fill sizes="(max-width:860px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
          </div>
          <SimpleForm kind="carrier" cta="Become a carrier partner" fields={[
            { name: "name", label: "Name", required: true, autoComplete: "name" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "company", label: "Carrier name", required: true, autoComplete: "organization" },
            { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
            { name: "mcNumber", label: "MC #" },
            { name: "dotNumber", label: "USDOT #" },
            { name: "equipment", label: "Equipment", type: "select", options: ["Dry Van", "Reefer", "Flatbed", "Power Only", "Intermodal / Drayage", "Other"] },
            { name: "lanes", label: "Preferred lanes", placeholder: "e.g. Salinas to the Midwest" },
            { name: "message", label: "Anything else?", type: "textarea" },
          ]} />
        </div>
      </section>
    </>
  );
}
