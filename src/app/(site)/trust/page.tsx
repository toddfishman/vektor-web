import type { Metadata } from "next";
import Image from "next/image";
import { Story, Testimonials } from "@/components/site/interactive";
import { Btn, Offices, PageHead, TrustedBy } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Trust",
  description: "Vektor Logistics focuses on long-term value, connecting the dots between shippers, carriers and retailers.",
};

export default function Trust() {
  return (
    <>
      <PageHead img="about-banner" tag="Trust" title="3PLs are a dime a dozen. So what’s the difference?"
        lede="Most brokers obsess over profit per file and loads per person. We focus on long-term value, connecting the dots between shippers, carriers and retailers." />
      <TrustedBy />
      <section className="sec">
        <div className="wrap split">
          <div>
            <p className="tag">The Vektor difference</p>
            <h2>People want to do business with people.</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>Our culture puts people first: shippers, carriers, receivers, trade partners and the communities we serve.</p>
            <p>Technology keeps changing, but some things don’t. We believe people want partners who are honest and fair and who feel like an extension of their own team. We don’t take your trust lightly.</p>
            <div className="btns" style={{ marginTop: "1.4rem" }}><Btn href="/contact">Contact us</Btn><Btn href="/careers" ghost>Careers</Btn></div>
          </div>
          <div className="ph" style={{ position: "relative" }}><Image src="/img/who-we-are.jpg" alt="Vektor team in a produce warehouse" fill sizes="(max-width:860px) 100vw, 50vw" /></div>
        </div>
      </section>
      <Story />
      <Testimonials />
      <Offices />
    </>
  );
}
