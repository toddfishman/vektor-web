import { AgentActions } from "./contact-actions";

/*
  "Speak with a Vektor agent, 24/7/365" — sticky on mobile (the menu and footer carry
  it on every size). Mode and numbers come from site.agent; see src/content/site.ts.
*/
export function AgentBar() {
  return (
    <aside className="agentbar" aria-label="Speak with a Vektor agent, 24/7/365">
      <span className="agentbar-t"><span className="live">24/7/365</span>Speak with a Vektor agent</span>
      <div className="agentbar-a"><AgentActions compact /></div>
    </aside>
  );
}
