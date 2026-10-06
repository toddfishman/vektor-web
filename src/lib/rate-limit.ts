/*
  Minimal fixed-window limiter, per server instance. Good enough to blunt a single noisy
  client; for real protection add the host's WAF rules or a shared store (e.g. Upstash)
  and a challenge (e.g. Cloudflare Turnstile). See docs/launch-checklist.md.
*/
const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 10 * 60_000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return true;
  }
  h.n++;
  return h.n <= limit;
}
