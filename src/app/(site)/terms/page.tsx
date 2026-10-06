import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <LegalPage title="Terms of use">
      <h2>What this page will cover</h2>
      <p>Use of this website, that mileage and transit figures in the quote builder are planning estimates and not offers, that rates are confirmed by a Vektor representative with an expiration date, and SMS terms if Vektor texts customers or carriers.</p>
    </LegalPage>
  );
}
