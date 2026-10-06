import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Accessibility" };

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility">
      <p>We want everyone to be able to use this site. We design to WCAG 2.2 AA: keyboard access, visible focus, text contrast, labels on every form field, and reduced motion when your device asks for it.</p>
      <p>If something doesn’t work for you, call <a href={`tel:${site.agent.phone.tel}`}>{site.agent.phone.display}</a> any hour, or email <a href={`mailto:${site.email.sales}`}>{site.email.sales}</a>, and a person will help.</p>
    </LegalPage>
  );
}
