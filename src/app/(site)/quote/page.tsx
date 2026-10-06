import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { Story } from "@/components/site/interactive";

export const metadata: Metadata = {
  title: "Get a quote",
  description: "Request a freight quote from Vektor Logistics: truckload, partial, LTL, intermodal, drayage or dedicated. A rep confirms the rate.",
};

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const sp = await searchParams;
  const one = (k: string) => { const v = sp[k]; return typeof v === "string" ? v : undefined; };
  const eq = one("eq");
  return (
    <>
      <div className="spacer-hdr" style={{ background: "var(--paper)" }} />
      <QuoteBuilder big initialEq={sp.mode ? undefined : eq}
        prefill={{ origin: one("o"), destination: one("d"), mode: one("mode"), equipment: eq, commodity: one("com"), weightLb: one("wt"), pickupDate: one("pd") }} />
      <Story />
    </>
  );
}
