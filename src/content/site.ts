/*
  Company facts and launch switches in one place.
  Anything marked TODO(vektor) is waiting on an answer from Vektor; see docs/launch-checklist.md.
  When a CMS is chosen, this file is what moves into it first.
*/
import type { CityName } from "./map-data";

export const site = {
  name: "Vektor Logistics",
  legalName: "Vektor Logistics", // TODO(vektor): exact legal entity name for footer and legal pages
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vektor-logistics.com",
  theme: "coral",
  tagline: "Freight with direction.",
  description:
    "Vektor Logistics is a people-first 3PL moving truckload, LTL, cold chain and intermodal freight across the country, with a real person on every load, day and night.",

  mc: "MC 1298051",
  usdot: "USDOT 3705151",

  phone: { display: "(831) 220-8093", tel: "+18312208093" },
  email: { sales: "sales@vektor-logistics.com" },

  /*
    "Speak with a Vektor agent, 24/7/365".
    TODO(vektor): confirm the staffed 24/7 number (currently the main line) and how it's staffed.
    mode: "call" = click-to-call + text only; "callback" adds a callback request form;
    "chat" is reserved for a live-chat vendor once one is picked.
  */
  agent: {
    phone: { display: "(831) 220-8093", tel: "+18312208093" },
    sms: "+18312208093" as string | null, // TODO(vektor): set to null if the line can't receive texts
    mode: "callback" as "call" | "callback" | "chat",
  },

  /* TODO(vektor): real handles. Empty strings are hidden everywhere. */
  social: {
    linkedin: "" as string,
    facebook: "" as string,
    instagram: "" as string,
    youtube: "" as string,
    x: "" as string,
  },

  /* Where people can leave a recommendation. TODO(vektor): real profile URLs. */
  reviews: {
    google: "" as string,
    businessRate: "" as string,
  },

  /* Carrier onboarding (RMIS, already in Vektor's Turvo stack). TODO(vektor): the setup URL. */
  carrierOnboardingUrl: "" as string,

  memberships: ["Western Growers", "California Fresh Fruit Association"],
  award: "Best of 2026 · Logistics Service (BusinessRate)",
} as const;

export type Office = { city: CityName; name: string; role: string; lines: string[]; phone?: string };

export const offices: Office[] = [
  { city: "Monterey", name: "Monterey", role: "Headquarters", lines: ["24560 Silver Cloud Ct. #104", "Monterey, CA 93940"], phone: "(831) 220-8093" },
  { city: "Fresno", name: "Fresno", role: "Operations", lines: ["677 W Palmdon Dr. #209", "Fresno, CA 93704"], phone: "(831) 220-8093" },
  { city: "Fontana", name: "Fontana", role: "Accounting", lines: ["14601 Slover Ave.", "Fontana, CA 92337"], phone: "(831) 220-8093" },
  { city: "Pleasanton", name: "Pleasanton", role: "Corporate / Legal", lines: ["7031 Koll Center Pkwy #250", "Pleasanton, CA 94566"], phone: "(831) 220-8093" },
  { city: "Lakewood Ranch", name: "Florida", role: "East Coast", lines: ["6311 Atrium Dr. Suite 204", "Lakewood Ranch, FL 34202"] },
];

/*
  "Trusted by" logos. A logo only renders when permission is "granted" AND a file exists.
  Until then the section shows the text fallback. Never flip to granted without written
  permission or contract language that allows it.
*/
export type Customer = { name: string; logo?: string; permission: "pending" | "granted" };
export const customers: Customer[] = [
  { name: "Campbell's", permission: "pending" },
  { name: "Trader Joe's", permission: "pending" },
  { name: "Whole Foods", permission: "pending" },
];
export const customersFallback = "Serving national grocery and CPG brands";

export const nav = [
  { href: "/shippers", label: "Ship" },
  { href: "/carriers", label: "Haul" },
  { href: "/partnerships", label: "Partner" },
  { href: "/careers", label: "Careers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const socialLinks = () =>
  (Object.entries(site.social) as [keyof typeof site.social, string][])
    .filter(([, url]) => url)
    .map(([k, url]) => ({ key: k, url, label: { linkedin: "LinkedIn", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", x: "X" }[k] }));
