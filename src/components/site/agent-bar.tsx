import Link from "next/link";
import { site } from "@/content/site";

/*
  "Speak with a Vektor agent, 24/7/365" — sticky on mobile (the menu and footer carry
  it on every size). Mode comes from site.agent.mode; see src/content/site.ts.
*/
export function AgentBar() {
  const a = site.agent;
  return (
    <aside className="agentbar" aria-label="Speak with a Vektor agent, 24/7/365">
      <span className="agentbar-t"><span className="live">24/7/365</span>Speak with a Vektor agent</span>
      <div className="agentbar-a">
        <a className="btn" href={`tel:${a.phone.tel}`}>Call</a>
        {a.sms && <a className="btn ghost" href={`sms:${a.sms}`}>Text</a>}
        {a.mode === "callback" && <Link className="btn ghost" href="/contact?topic=callback#message">Call me back</Link>}
      </div>
    </aside>
  );
}
