# Decisions

## Made

| Decision | Why |
|---|---|
| Next.js 16 App Router on Vercel or Netlify | Handoff plan; static pages by default, server routes for forms and auth, easy preview deploys. |
| Plain CSS ported from the prototype + a token layer, not Tailwind or CSS-in-JS | Fastest faithful port of a hand-built design; tokens make reskinning one file. Class names follow the prototype so design tweaks map 1:1. |
| Fonts self-hosted (`@fontsource-variable`) | No third-party font requests (privacy, speed, no consent question). |
| Content in typed files under `src/content` for v1 | Lets the site ship before a CMS is chosen; each file is a clean CMS model later. |
| Forms → email (Resend) and/or signed webhook; no direct Turvo write | Turvo's API has no quote endpoint. The Turvo-mapped payload rides along in every quote lead so a later push is a small change. |
| Production refuses to accept a lead when no channel is configured (503) | A form that "succeeds" into nowhere is worse than an error that says "call us". |
| Employee auth = Microsoft Entra ID only, JWT sessions (8h), roles from Entra app roles | Vektor runs M365; no separate passwords; MFA/conditional access stay in Entra. |
| `/team` isolated: own layout, `proxy.ts` gate, `Cache-Control: private, no-store`, noindex | Handoff requirement: never mixed into public caching. |
| Old prototype features dropped: identity switcher, menu-style switcher, "Show Turvo field names" toggle | Prototype review tools, not site features. The Turvo mapping lives in code and docs instead. |
| Quote miles/transit use the prototype's city list and great-circle × 1.18 | Planning estimate only, labeled as such. Real geocoding is a follow-up. |

| Website AI agent = Claude (claude-sonnet-5-5) behind one `runAgent()` function, text chat first | Fast to ship and strong at grounded Q&A + tool use. Voice (Deepgram, another voice-agent platform) plugs in front later without changing prompt, knowledge or tools. |
| Agent facts live in `src/lib/agent/knowledge.ts`, rules in `prompt.ts`; public sources only | Keeps internal/consulting material out of anything the public can query. Facts marked [CONFIRM] need Vektor sign-off. |
| Agent tools are narrow: pre-fill a quote link, request a callback (with consent), show a page link | No rates, no booking, no shipment lookups until those systems and policies exist. |
| Employee portal preview mode on noindex drafts while SSO is off | Lets Tyler review the portal shape; disables itself once Entra SSO is configured. |

## Open

| Question | Options | Notes |
|---|---|---|
| CMS | Sanity, Payload (self-hosted in the same Next app), or stay file-based | Pick before case studies/insights. Payload keeps everything in one repo; Sanity has the friendliest editor. |
| Lead store (feeds the dashboard's "today's quote requests") | SharePoint list via Microsoft Graph (fits M365), Postgres (Neon/Vercel), or the CRM itself | Webhook target is the system of record until then. A SharePoint list + Power Automate would let ops update status without a new tool. |
| CRM | HubSpot, Salesforce, or Turvo CRM features | Determines `LEADS_WEBHOOK_URL`. |
| 24/7 agent channel | AI chat (built) + voice agent (Deepgram or similar) + human escalation line | Decide voice vendor; who answers the escalation line and when it shows (after agent vs. always). |
| AI agent transcripts | keep in log drain, lead store, or not at all | Privacy policy must describe it before launch. |
| Analytics | GA4 vs. Plausible/Fathom | Privacy-friendly option avoids a cookie banner. |
| City/ZIP lookup in the quote builder | keep the curated list, or a geocoder (Mapbox, Google Places) | A geocoder adds a key, cost and a consent question; the free-text field already accepts any city/ZIP. |
| Audit log destination | host log drain → Axiom/Datadog, or Azure Monitor (M365 side) | Needs retention for security review. |
