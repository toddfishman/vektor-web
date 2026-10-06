import type { Metadata } from "next";
import { Testimonials } from "@/components/site/interactive";
import { Btn, LogoWall } from "@/components/site/sections";
import { customers } from "@/content/site";

export const metadata: Metadata = {
  title: "Our customers",
  description: "Grocery, food, retail and produce brands that ship with Vektor Logistics.",
};

/* The complete customer list. Add customers in src/content/site.ts (and a logo in public/logos). */
export default function Customers() {
  const list = customers.filter((c) => c.permission === "granted");
  const kinds = [...new Set(list.map((c) => c.kind))];
  return (
    <>
      <div className="spacer-hdr" />
      <section className="sec trust customers-sec" aria-labelledby="cust-h">
        <div className="wrap">
          <div className="trust-head">
            <div>
              <p className="tag">Customers</p>
              <h1 id="cust-h" className="h2">Our valued <em>customers.</em></h1>
            </div>
            <p className="lede">Every name here trusts Vektor with freight that has to arrive on time and in condition. Thank you for shipping with us.</p>
          </div>
          <LogoWall />
          <div className="cust-list">
            {kinds.map((k) => (
              <div key={k}>
                <h2 className="h5">{k}</h2>
                <ul>{list.filter((c) => c.kind === k).map((c) => <li key={c.slug}>{c.name}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="btns" style={{ justifyContent: "center", marginTop: "2.4rem" }}>
            <Btn href="/quote">Ship with Vektor</Btn><Btn href="/trust" ghost>Why they trust us</Btn>
          </div>
        </div>
      </section>
      <Testimonials />
    </>
  );
}
