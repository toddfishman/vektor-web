import type { Metadata } from "next";
import Link from "next/link";
import { SimpleForm } from "@/components/forms/simple-form";
import { SectionHead } from "@/components/site/sections";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Refer & recommend",
  description: "Refer a shipper, a carrier or a future teammate to Vektor Logistics, or leave a recommendation.",
};

const KINDS = {
  shipper: { label: "Refer a shipper", h: "Know a shipper who deserves better service?", p: "Introduce us. We’ll treat them the way we treat you." },
  carrier: { label: "Refer a carrier", h: "Know a carrier who does it right?", p: "Good carriers get the freight. Send them our way." },
  employee: { label: "Refer a teammate", h: "Know someone who’d be great at Vektor?", p: "Logistics, operations, technology and client services." },
} as const;
type Kind = keyof typeof KINDS;

/* TODO(vektor): referral reward terms, if any; add them under each card and in the confirmation. */
export default async function Refer({ searchParams }: PageProps<"/refer">) {
  const k = (await searchParams).kind;
  const kind: Kind = k === "carrier" || k === "employee" ? k : "shipper";
  const reviews = [
    site.reviews.google && { href: site.reviews.google, label: "Recommend us on Google" },
    site.reviews.businessRate && { href: site.reviews.businessRate, label: "Review us on BusinessRate" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <div className="spacer-hdr" />
      <section className="sec">
        <div className="wrap">
          <SectionHead tag="Refer & recommend" title="Good partners know good partners." lede="Point someone our way, or tell others what working with Vektor is like." />
          <div className="refer-grid">
            {(Object.keys(KINDS) as Kind[]).map((x) => (
              <Link key={x} href={`/refer?kind=${x}#refer-form`}>
                <h3>{KINDS[x].h}</h3><p>{KINDS[x].p}</p><span className="go">{KINDS[x].label}</span>
              </Link>
            ))}
          </div>
          {reviews.length > 0 && (
            <div className="review-links">{reviews.map((r) => <a key={r.href} className="btn ghost" href={r.href} rel="noopener" target="_blank">{r.label}</a>)}</div>
          )}
        </div>
      </section>

      <section className="sec paper" id="refer-form">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <p className="tag">{KINDS[kind].label}</p>
            <h2>{KINDS[kind].h}</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>Tell us who they are and how to reach them. We’ll mention you when we do.</p>
          </div>
          <SimpleForm key={kind} kind="referral" cta={KINDS[kind].label} sentText="Thanks for the introduction. We’ll reach out and let you know how it goes." fields={[
            { name: "kind", label: "", type: "hidden", defaultValue: kind },
            { name: "name", label: "Your name", required: true, autoComplete: "name" },
            { name: "email", label: "Your email", type: "email", required: true, autoComplete: "email" },
            { name: "referralName", label: kind === "employee" ? "Their name" : "Contact name", required: true },
            { name: "referralCompany", label: kind === "employee" ? "Current role or company" : "Their company" },
            { name: "referralEmail", label: "Their email", type: "email" },
            { name: "referralPhone", label: "Their phone", type: "tel" },
            { name: "message", label: "Anything we should know?", type: "textarea" },
          ]} />
        </div>
      </section>
    </>
  );
}
