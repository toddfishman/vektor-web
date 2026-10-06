# Launch checklist

Status as of Oct 6, 2026. Items marked **blocker** must be done before DNS cutover.

## Needed from Vektor

| # | Item | Where it goes | Blocker |
|---|---|---|---|
| 1 | Domain + DNS access (vektor-logistics.com) | Host DNS settings | **blocker** |
| 2 | GitHub org for this repo | Push `main`, enable branch protection + CI | **blocker** |
| 3 | Hosting account (Vercel or Netlify) | Connect repo, set env vars from `.env.example` | **blocker** |
| 4 | Where quote leads go (inbox and/or CRM) | `LEADS_TO_*`, `LEADS_WEBHOOK_URL` | **blocker** |
| 5 | Sending domain verified in Resend (SPF/DKIM) | `RESEND_API_KEY`, `LEADS_FROM` | **blocker** if email is a channel |
| 6 | The staffed 24/7 number, whether it takes texts, and how it's staffed | `site.agent` in `src/content/site.ts` | **blocker** |
| 7 | Live chat vs. callback vs. click-to-call only | `site.agent.mode` (currently `callback`) | |
| 8 | Social handles (LinkedIn, Facebook, Instagram, YouTube/X) | `site.social` | |
| 9 | Google + BusinessRate profile URLs for recommendations | `site.reviews` | |
| 10 | Customer logo files (Trader Joe's, Campbell's, Whole Foods, Krispy Kreme, Amway, Dick's, Fowler Packing). Permission confirmed by Todd Oct 6; keep the written permissions on file | Drop transparent SVG/PNG files into `public/logos/` named by slug (see `public/logos/README.md`) | Tiles show names until files land |
| 10b | Escalation number for "Was the agent not helpful? Call ___" (placeholder 555 number today) and whether it shows always or only after the agent is used | `site.agent.escalation` | **blocker** |
| 11 | Referral reward terms, if any | `/refer` page | |
| 12 | Photo rights for every image in `public/img` | Replace any without rights | **blocker** |
| 13 | Testimonials approved for public use | `TESTIMONIALS` in `marketing.ts` | |
| 14 | Confirm partnership programs offered today (esp. cross-border, managed transportation) | `PARTNERSHIPS` in `marketing.ts` | **blocker** (no claims we can't back) |
| 15 | Microsoft 365 admin to register the SSO app | `docs/m365-sso.md` | blocker for `/team` only |
| 16 | Turvo API access level | Dashboard data, future quote push | |
| 17 | RMIS carrier-setup URL | `site.carrierOnboardingUrl` | |
| 18 | Tenant-specific links for Drumkit, Bitfreighter, SharePoint docs, on-call source | `src/content/team.ts` | |
| 19 | Exact legal entity name | `site.legalName` | |

## AI agent
- [ ] **blocker** Anthropic API key in Vercel (`ANTHROPIC_API_KEY`), on Vektor's account before launch; set a monthly spend limit in the Anthropic console.
- [ ] **blocker** Vektor reviews `src/lib/agent/knowledge.ts` line by line (it's what the agent says publicly), and confirms or removes every [CONFIRM] item.
- [ ] Red-team pass: try to get rates, promises, other customers' details, off-topic answers; fix anything that slips.
- [ ] Privacy policy covers chat transcripts and callback requests.
- [ ] Decide on voice (Deepgram or similar) and the human escalation number.

## Legal & trust

- [ ] **blocker** Privacy policy, terms of use from counsel (pages are placeholders with a visible banner until `NEXT_PUBLIC_LEGAL_FINAL=1`).
- [ ] **blocker** SMS consent language if Vektor will text customers/carriers (the agent bar offers "Text").
- [ ] Cookie consent: not needed today (no analytics or ad cookies). Required the moment analytics/chat that sets cookies is added.
- [ ] Accessibility statement reviewed (page exists).
- [ ] Trademark search on the Heading arrow; custom-drawn wordmark replaces the Space Grotesk stand-in (`src/components/brand/logo.tsx`).

## Tech before cutover

- [ ] Crawl the current WordPress site; fill `redirects()` in `next.config.ts` so old URLs 301 to the new pages.
- [ ] **blocker** Treat the current WordPress install as compromised: rotate every credential it touched (hosting, DB, admin users, email/SMTP, API keys) at cutover, and take it offline rather than leaving it reachable.
- [ ] Set `NEXT_PUBLIC_SITE_URL`; remove `NEXT_PUBLIC_NOINDEX` on production only.
- [ ] Spam protection beyond honeypot + timing + per-instance rate limit: add host WAF rate rules and Cloudflare Turnstile on forms.
- [ ] Analytics + lead attribution (GA4 or a privacy-friendly option like Plausible); then add a Content-Security-Policy header.
- [ ] Uptime monitoring on `/` and `/api/forms/contact` (expect 422 on empty POST).
- [ ] Log drain for audit events (`type: "audit"` JSON lines) with retention.
- [ ] Lighthouse/Core Web Vitals pass on mobile; real-device check of the intro and lane maps (canvas is heavy on low-end phones; consider pausing maps off-screen, already done via IntersectionObserver).
- [ ] `npm audit`: current high findings are in the ESLint toolchain (dev-only), not shipped code. Re-check after `eslint-config-next` updates.

## Recommended next (not in v1)

- Track-a-load page (reference # → status via Turvo / FourKites / MacroPoint).
- Case studies / insights (CMS-driven) for SEO and sales.
- Spanish-language option if carrier/driver demand is there.
- Dashboard: lead store with status, Turvo "my numbers", CRM pipeline, onboarding checklists, people directory from Microsoft Graph.
