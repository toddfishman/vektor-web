import type { ReactNode } from "react";
import { site } from "@/content/site";

/*
  Placeholder legal pages. These are NOT final text: counsel must supply the privacy
  policy, terms and SMS consent language before launch (see docs/launch-checklist.md).
  The banner stays visible until NEXT_PUBLIC_LEGAL_FINAL=1.
*/
export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  const final = process.env.NEXT_PUBLIC_LEGAL_FINAL === "1";
  return (
    <>
      <div className="spacer-hdr" style={{ background: "var(--paper)" }} />
      <section className="sec paper">
        <div className="wrap prose">
          {!final && <p className="notice">Draft placeholder. Final text from {site.name}’s counsel is required before launch.</p>}
          <p className="tag">{site.name}</p>
          <h1 style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}>{title}</h1>
          {updated && <p className="mono" style={{ marginTop: "1rem", color: "var(--ink3)" }}>Last updated {updated}</p>}
          {children}
        </div>
      </section>
    </>
  );
}
