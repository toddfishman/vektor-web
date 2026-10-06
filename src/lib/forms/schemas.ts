/*
  One schema per public form. The same schema validates on the client (readiness hints)
  and on the server (the source of truth). Keep field names stable: the Turvo mapping
  and any CRM webhook depend on them.
*/
import { z } from "zod";

const str = (max = 200) => z.string().trim().max(max);
const opt = (max = 200) => str(max).optional().default("");
const email = z.string().trim().toLowerCase().email("Enter a valid email").max(200);
const consent = z.literal(true, { error: "Please agree so we can store your request" });

/** Honeypot + timing. `website` must stay empty; `t` is ms since the form rendered. */
export const antiSpam = z.object({
  website: z.string().max(0).optional().default(""),
  t: z.number().int().nonnegative().optional(),
});

/* ---------------- quote ---------------- */

export const QUOTE_MODES = ["ftl", "partial", "ltl", "imx", "dray", "ded"] as const;
export const QUOTE_EQUIP = ["van", "reefer", "flat", "step", "power", "any", "c20", "c40", "c40h"] as const;
export const EQUIP_BY_MODE: Record<(typeof QUOTE_MODES)[number], (typeof QUOTE_EQUIP)[number][]> = {
  ftl: ["van", "reefer", "flat", "step", "power", "any"],
  partial: ["van", "reefer", "flat", "any"],
  ded: ["van", "reefer", "flat", "any"],
  imx: ["van", "reefer"],
  dray: ["c20", "c40", "c40h", "any"],
  ltl: [],
};
export const ACCESSORIALS = ["liftp", "liftd", "resi", "inside", "limited", "appt", "team", "assist", "tarp", "straps", "oversize"] as const;

const num = str(20).regex(/^[\d,.\s]*$/, "Numbers only");

export const quoteSchema = z
  .object({
    origin: str(120).min(2, "Add a pickup city or ZIP"),
    destination: str(120).min(2, "Add a delivery city or ZIP"),
    stops: z.array(str(120)).max(3).default([]),
    originType: opt(60),
    destinationType: opt(60),

    mode: z.enum(QUOTE_MODES),
    equipment: z.enum(QUOTE_EQUIP).nullable().default(null),
    commodity: str(200).min(2, "Tell us what it is"),
    weightLb: num.min(1, "Add the total weight"),
    handlingUnits: num.optional().default(""),
    handlingUnitType: opt(40),
    tempF: str(10).regex(/^-?\d*$/, "Numbers only").optional().default(""),
    reeferMode: opt(20),
    dims: z.object({ l: num, w: num, h: num }).partial().default({}),
    freightClass: opt(10),
    stackable: z.boolean().default(false),
    dray: z.object({ port: opt(120), steamshipLine: opt(80), containerId: opt(40), bookingOrBol: opt(60), lastFreeDay: opt(10), emptyReturnBy: opt(10) }).partial().default({}),
    hazmat: z.boolean().default(false),
    unNumber: opt(12),
    hazardClass: opt(40),

    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a pickup date"),
    deliverBy: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).optional().default(""),
    frequency: z.enum(["once", "rec"]).default("once"),
    loadsPer: opt(10),
    loadsPeriod: opt(20),

    accessorials: z.array(z.enum(ACCESSORIALS)).default([]),
    po: opt(60),
    reference: opt(60),
    orderNo: opt(60),
    targetRate: opt(20),
    declaredValue: opt(20),
    notes: opt(2000),

    name: str(120).min(2, "Add your name"),
    company: str(160).min(2, "Add your company"),
    email,
    phone: opt(40),
    consent,
  })
  .superRefine((q, ctx) => {
    const need = (ok: unknown, path: string, message: string) => { if (!ok) ctx.addIssue({ code: "custom", path: [path], message }); };
    const list = EQUIP_BY_MODE[q.mode];
    need(!list.length || (q.equipment && list.includes(q.equipment)), "equipment", "Pick a trailer");
    if (q.equipment === "reefer") need(q.tempF, "tempF", "Add a temperature");
    if (q.mode === "ltl") {
      need(q.handlingUnits, "handlingUnits", "Add the number of units");
      need(q.dims.l && q.dims.w && q.dims.h, "dims", "Add the size of each unit");
    }
    if (q.mode === "dray") need(q.dray.port, "dray", "Add the port or terminal");
  });

export type QuoteInput = z.input<typeof quoteSchema>;
export type Quote = z.output<typeof quoteSchema>;

/* ---------------- simple forms ---------------- */

const base = { name: str(120).min(2, "Add your name"), email, phone: opt(40), message: opt(4000), consent };

export const contactSchema = z.object({
  ...base,
  company: opt(160),
  role: z.enum(["Shipper", "Carrier", "Job seeker", "Other"]).default("Other"),
  topic: z.enum(["general", "callback"]).default("general"),
}).refine((c) => c.topic !== "callback" || c.phone.length >= 7, { path: ["phone"], message: "Add a number we can call" });

export const carrierSchema = z.object({
  ...base,
  company: str(160).min(2, "Add your carrier name"),
  mcNumber: opt(20),
  dotNumber: opt(20),
  equipment: z.enum(["Dry Van", "Reefer", "Flatbed", "Power Only", "Intermodal / Drayage", "Other"]).default("Other"),
  lanes: opt(500),
});

export const careersSchema = z.object({
  ...base,
  currentRole: opt(160),
  area: z.enum(["Logistics / Brokerage", "Operations", "Technology", "Client Services", "Accounting", "Other"]).default("Other"),
  referredBy: opt(120),
});

export const partnershipSchema = z.object({
  ...base,
  company: str(160).min(2, "Add your company"),
  title: opt(120),
  program: z.enum(["Dedicated fleet", "Managed transportation", "Contract & RFP freight", "Seasonal produce programs", "Cross-border", "Strategic & agent partners", "Something else"]).default("Something else"),
  annualVolume: opt(120),
});

export const referralSchema = z.object({
  ...base,
  kind: z.enum(["shipper", "carrier", "employee"]),
  referralName: str(120).min(2, "Who are you referring?"),
  referralCompany: opt(160),
  referralEmail: z.union([email, z.literal("")]).default(""),
  referralPhone: opt(40),
});

export const FORMS = {
  quote: quoteSchema,
  contact: contactSchema,
  carrier: carrierSchema,
  careers: careersSchema,
  partnership: partnershipSchema,
  referral: referralSchema,
} as const;

export type FormKind = keyof typeof FORMS;
export const isFormKind = (k: string): k is FormKind => k in FORMS;
