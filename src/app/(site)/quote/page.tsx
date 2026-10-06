import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { Story } from "@/components/site/interactive";

export const metadata: Metadata = {
  title: "Get a quote",
  description: "Request a freight quote from Vektor Logistics: truckload, partial, LTL, intermodal, drayage or dedicated. A rep confirms the rate.",
};

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const { eq } = await searchParams;
  return (
    <>
      <div className="spacer-hdr" style={{ background: "var(--paper)" }} />
      <QuoteBuilder big initialEq={typeof eq === "string" ? eq : undefined} />
      <Story />
    </>
  );
}
