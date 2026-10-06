import { Intro } from "@/components/site/intro";
import { Services, Story, Testimonials } from "@/components/site/interactive";
import { Audiences, Hero, Offices, Proof, TrustedBy } from "@/components/site/sections";
import { QuoteBuilder } from "@/components/quote/quote-builder";

export default function Home() {
  return (
    <>
      <Intro />
      <Hero />
      <Proof />
      <Audiences />
      <TrustedBy />
      <Story />
      <Services />
      <QuoteBuilder />
      <Testimonials />
      <Offices />
    </>
  );
}
