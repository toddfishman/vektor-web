/*
  Employee dashboard v1 content. Read-mostly; links out to the systems Vektor already runs.
  TODO(vektor): fill in the blanks (tenant-specific URLs, SharePoint library, on-call source).
  Empty href = shown as "link needed" so gaps are visible to the team, not silently hidden.
*/
import type { Role } from "@/auth";

export const quickLinks: { name: string; what: string; href: string }[] = [
  { name: "Turvo", what: "TMS · loads, quotes, tracking", href: "https://app.turvo.com" },
  { name: "Sage Intacct", what: "Accounting", href: "https://www.intacct.com/ia/acct/login.phtml" },
  { name: "Drumkit", what: "Email-to-load automation", href: "" },
  { name: "Bitfreighter", what: "Carrier sourcing", href: "" },
  { name: "DAT One", what: "Load board · rates", href: "https://one.dat.com" },
  { name: "Microsoft 365", what: "Outlook, Teams, SharePoint", href: "https://www.office.com" },
];

export const announcements: { date: string; title: string; body: string }[] = [
  { date: "2026-10-06", title: "New website in progress", body: "The new vektor-logistics.com is being built. Quote requests from the site will show up here once the lead store is connected." },
];

export const documents: { title: string; kind: string; href: string; roles?: Role[] }[] = [
  { title: "SOP library", kind: "SharePoint", href: "" },
  { title: "Rate confirmation templates", kind: "SharePoint", href: "" },
  { title: "Carrier packet", kind: "PDF", href: "" },
  { title: "Brand kit (Heading mark, Coral & Black)", kind: "Folder", href: "" },
];

/** TODO(vektor): source of truth for the 24/7 rotation (Teams Shifts? a SharePoint list?). */
export const onCall: { window: string; who: string; phone?: string }[] = [];
