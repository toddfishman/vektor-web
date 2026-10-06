/*
  Audit log for the employee area. Writes structured JSON lines to stdout so the host's
  log drain (Vercel/Netlify → Datadog, Axiom, Azure Monitor…) keeps them.
  TODO: pick a retained destination before launch; see docs/decisions.md.
*/
export function audit(event: string, data: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ type: "audit", event, at: new Date().toISOString(), ...data }));
}
