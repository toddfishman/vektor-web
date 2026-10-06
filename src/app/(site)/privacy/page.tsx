import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <h2>What this page will cover</h2>
      <p>What we collect through this site (quote, contact, carrier, careers, partnership and referral forms), why, who we share it with (for example our email and CRM providers), how long we keep it, and how to ask us to access or delete it, including rights under the California Consumer Privacy Act.</p>
      <h2>Questions</h2>
      <p>Email <a href={`mailto:${site.email.sales}`}>{site.email.sales}</a> or call {site.phone.display}.</p>
    </LegalPage>
  );
}
