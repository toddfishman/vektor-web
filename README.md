# vektor-web

Production site for **Vektor Logistics** (vektor-logistics.com), plus the authenticated employee area at `/team`.

Built from the "Vektor Signal" prototype (design source of truth) and `research/Website_Build_Handoff.md` (Oct 6, 2026).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack). Note: in v16 `middleware` is now `src/proxy.ts`, and `params`/`searchParams` are async.
- **Plain CSS + design tokens.** `src/theme/tokens.css` holds every color, font and spacing value; components never hard-code brand colors. The canvas lane maps read their colors from the same tokens.
- **Self-hosted fonts** via `@fontsource-variable` (Archivo with width axis, Hanken Grotesk, JetBrains Mono, Space Grotesk). No Google Fonts calls.
- **Forms**: one zod schema per form (`src/lib/forms/schemas.ts`) shared by client and server; `POST /api/forms/:form` delivers by email (Resend) and/or signed webhook (CRM).
- **Employee area**: Auth.js (`next-auth@5`) with Microsoft Entra ID (M365) SSO, roles from Entra app roles, gated by `src/proxy.ts`, never cached.

## Run it

```bash
npm ci
cp .env.example .env.local   # fill what you need; forms log to the console in dev if no channel is set
npm run dev                  # http://localhost:3000
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`. CI runs all three on every PR (`.github/workflows/ci.yml`).

## Where things live

| Path | What |
|---|---|
| `src/theme/tokens.css` | Coral & Black tokens. Reskin here. |
| `src/content/site.ts` | Company facts, phone/24-7 agent line, socials, review links, offices, customer logos + permission flags, nav. **Most TODO(vektor) items are here.** |
| `src/content/marketing.ts` | Services, story steps, testimonials, sample lanes, partnership programs |
| `src/content/team.ts` | Dashboard quick links, announcements, documents, on-call |
| `src/components/brand/logo.tsx` | Heading mark, header/footer lockups, intro mark |
| `src/components/site/intro.tsx` | Home intro animation (arrow → V, EKTOR, LOGISTICS wipe, shine) |
| `src/components/site/header.tsx` | Header + full-screen menu |
| `src/components/map/lane-map.ts` | Canvas 3D lane-map renderer (framework-free) |
| `src/components/quote/quote-builder.tsx` | Quote builder (Route · Freight · Timing · Extras · Contact) |
| `src/lib/forms/turvo.ts` | Quote → Turvo field mapping |
| `src/lib/leads.ts` | Lead delivery (Resend email, signed webhook) |
| `src/lib/agent/` | AI agent: `knowledge.ts` (public facts), `prompt.ts` (rules), `tools.ts`, `run.ts` (provider) |
| `public/logos/` | Customer logo marks (transparent PNG/SVG, auto-detected by slug) |
| `src/auth.ts`, `src/proxy.ts`, `src/lib/team.ts`, `src/app/team/` | Employee portal |
| `docs/` | Decisions, launch checklist, M365 SSO setup |

## Pages

Public: `/`, `/shippers`, `/carriers`, `/partnerships`, `/quote` (pre-fill with `?o=&d=&mode=&eq=&com=&wt=&pd=`), `/careers`, `/trust`, `/customers`, `/contact` (AI agent chat first; `?topic=callback` for callbacks), `/refer`, `/privacy`, `/terms`, `/accessibility`.
Employee portal: `/team` (dashboard), `/team/quotes`, `/team/announcements`, `/team/directory`, `/team/on-call`, `/team/documents`, `/team/tools`, `/team/admin` (leadership), `/team/sign-in`.
API: `/api/forms/:form`, `/api/agent` (chat, NDJSON stream), `/api/auth/*`.

## Reskinning

Add a `[data-theme="name"]` block in `tokens.css` overriding the same variables (including `--map-*` and `--logo-*`), then set `theme` in `src/content/site.ts`. Swap the mark in `logo.tsx` if the identity changes.

## Before launch

See [`docs/launch-checklist.md`](docs/launch-checklist.md). Open product/tech choices are in [`docs/decisions.md`](docs/decisions.md).
