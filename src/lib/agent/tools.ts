import "server-only";
/*
  Tools the website agent can use. Deliberately narrow: build links, and request a callback.
  Nothing here reads customer data or touches Turvo.
*/
import { deliverLead, newLeadId } from "@/lib/leads";
import { QUOTE_MODES, QUOTE_EQUIP } from "@/lib/forms/schemas";
import { audit } from "@/lib/audit";

export type AgentAction = { label: string; href: string };
export type ToolResult = { content: string; action?: AgentAction; isError?: boolean };

const PAGES = {
  quote: "/quote", shippers: "/shippers", carriers: "/carriers", carrier_setup: "/carriers#cform",
  partnerships: "/partnerships", careers: "/careers", careers_intro: "/careers#jform", trust: "/trust",
  customers: "/customers", refer: "/refer", contact: "/contact", callback: "/contact?topic=callback#message",
  privacy: "/privacy", terms: "/terms",
} as const;

export const TOOL_DEFS = [
  {
    name: "start_quote",
    description:
      "Create a link to Vektor's quote builder pre-filled with what the shipper has told you. Use once you know at least pickup and delivery. The shipper finishes and submits the form themselves; a Vektor rep then prices it.",
    input_schema: {
      type: "object" as const,
      properties: {
        origin: { type: "string", description: "Pickup city and state, or ZIP, e.g. 'Salinas, CA'" },
        destination: { type: "string", description: "Delivery city and state, or ZIP" },
        mode: { type: "string", enum: [...QUOTE_MODES], description: "ftl=full truckload, partial, ltl, imx=intermodal, dray=drayage, ded=dedicated" },
        equipment: { type: "string", enum: [...QUOTE_EQUIP], description: "van=dry van, reefer, flat=flatbed, step=step deck, power=power only, any=not sure, c20/c40/c40h=containers" },
        commodity: { type: "string", description: "What the freight is" },
        weight_lb: { type: "string", description: "Total weight in pounds, digits only" },
        pickup_date: { type: "string", description: "YYYY-MM-DD, only if the shipper gave a specific date" },
      },
      required: ["origin", "destination"],
    },
  },
  {
    name: "request_callback",
    description:
      "Ask a Vektor person to call this visitor back. Only call after the visitor gave their name and phone AND said yes to Vektor storing their details for the callback.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        phone: { type: "string" },
        topic: { type: "string", description: "One or two sentences on what they need, in your words" },
        company: { type: "string" },
        email: { type: "string" },
        role: { type: "string", enum: ["Shipper", "Carrier", "Job seeker", "Other"] },
        consent: { type: "boolean", description: "True only if the visitor explicitly agreed to Vektor storing their details" },
      },
      required: ["name", "phone", "topic", "consent"],
    },
  },
  {
    name: "show_link",
    description: "Give the visitor a button to the right page on the Vektor site.",
    input_schema: {
      type: "object" as const,
      properties: {
        page: { type: "string", enum: Object.keys(PAGES) },
        label: { type: "string", description: "Short button text, e.g. 'Start carrier setup'" },
      },
      required: ["page", "label"],
    },
  },
];

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function runTool(name: string, input: Record<string, unknown>, meta: { ip?: string; transcript: string }): Promise<ToolResult> {
  if (name === "start_quote") {
    const p = new URLSearchParams();
    const set = (k: string, v: string) => { if (v) p.set(k, v); };
    set("o", str(input.origin, 120)); set("d", str(input.destination, 120));
    const mode = str(input.mode); if ((QUOTE_MODES as readonly string[]).includes(mode)) p.set("mode", mode);
    const eq = str(input.equipment); if ((QUOTE_EQUIP as readonly string[]).includes(eq)) p.set("eq", eq);
    set("com", str(input.commodity, 200)); set("wt", str(input.weight_lb, 20).replace(/[^\d]/g, ""));
    const pd = str(input.pickup_date, 10); if (/^\d{4}-\d{2}-\d{2}$/.test(pd)) p.set("pd", pd);
    const href = `/quote?${p.toString()}#qsec`;
    return { content: `Quote link ready for the visitor (shown as a button): ${href}. Tell them to check the details and add contact info to submit.`, action: { label: "Open my quote", href } };
  }

  if (name === "request_callback") {
    if (input.consent !== true) return { content: "Not sent: the visitor has not agreed to Vektor storing their details. Ask first.", isError: true };
    const phone = str(input.phone, 40);
    if (phone.replace(/\D/g, "").length < 7) return { content: "Not sent: that phone number looks incomplete. Ask again.", isError: true };
    const id = newLeadId("contact");
    const r = await deliverLead({
      id, kind: "contact", receivedAt: new Date().toISOString(),
      data: {
        source: "website AI agent", topic: "callback", name: str(input.name, 120), phone,
        email: str(input.email, 200), company: str(input.company, 160), role: str(input.role, 20) || "Other",
        message: str(input.topic, 1000), transcript: meta.transcript.slice(-6000), consent: true,
      },
      meta: { ip: meta.ip },
    });
    audit("agent.callback_requested", { id, delivered: r.ok });
    if (!r.ok) return { content: "The callback request could not be sent right now. Apologize and give (831) 220-8093 to call or text directly.", isError: true };
    return { content: `Callback request sent, reference ${id}. Tell the visitor a Vektor person will call them back, and that they can also call or text (831) 220-8093 any time.` };
  }

  if (name === "show_link") {
    const page = str(input.page) as keyof typeof PAGES;
    const href = PAGES[page];
    if (!href) return { content: "Unknown page.", isError: true };
    return { content: `Button shown for ${href}.`, action: { label: str(input.label, 40) || "Open", href } };
  }

  return { content: `Unknown tool ${name}.`, isError: true };
}
