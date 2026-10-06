"use client";

import { useEffect, useRef, useState } from "react";
import type { FormKind } from "@/lib/forms/schemas";

export type SubmitState =
  | { s: "idle" }
  | { s: "sending" }
  | { s: "sent"; id: string }
  | { s: "error"; message: string; errors?: Record<string, string> };

/** Posts JSON to /api/forms/:kind with the anti-spam fields added. */
export function useSubmit(kind: FormKind) {
  const started = useRef(0);
  const [state, setState] = useState<SubmitState>({ s: "idle" });
  useEffect(() => { started.current = performance.now(); }, []);

  async function submit(data: Record<string, unknown>, honeypot = "") {
    setState({ s: "sending" });
    try {
      const r = await fetch(`/api/forms/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, website: honeypot, t: Math.round(performance.now() - started.current) }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setState({ s: "sent", id: j.id }); return true; }
      setState({ s: "error", message: j.error || (j.errors ? "Please check the highlighted fields." : "Something went wrong."), errors: j.errors });
    } catch {
      setState({ s: "error", message: "Network error. Please try again or call us." });
    }
    return false;
  }

  return { state, submit, reset: () => setState({ s: "idle" }) };
}
