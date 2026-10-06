import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { Services, Story, Testimonials } from "@/components/site/interactive";
import { Btn, PageHead, Proof, TrustedBy } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Ship with Vektor",
  description: "Truckload, LTL, cold chain, intermodal, drop trailer, dedicated and yard management, with a real person on every load.",
};

export default function Shippers() {
  return (
    <>
      <PageHead img="hero-1" alt="A Vektor truck on the highway" tag="Ship with Vektor" title="Your freight, handled by people."
        lede="From truckload to cold chain, we put the right capacity and the right people on every load, and tell you where it is the whole way.">
        <Btn href="/quote">Get a quote</Btn><Btn href="/contact" ghost>Talk to a rep</Btn>
      </PageHead>
      <Proof />
      <Services />
      <TrustedBy />
      <Story />
      <QuoteBuilder />
      <Testimonials />
    </>
  );
}
