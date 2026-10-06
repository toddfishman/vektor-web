import { redirect } from "next/navigation";
import { Pending, PortalHead } from "@/components/team/ui";
import { site } from "@/content/site";
import { can, requireTeamUser } from "@/lib/team";

export default async function Admin() {
  const user = await requireTeamUser();
  if (!can(user, "leadership")) redirect("/team");
  const agentOn = Boolean(process.env.ANTHROPIC_API_KEY) && process.env.AGENT_ENABLED !== "0";
  const leads = { email: Boolean(process.env.RESEND_API_KEY && process.env.LEADS_FROM), webhook: Boolean(process.env.LEADS_WEBHOOK_URL) };
  return (
    <main>
      <PortalHead tag="Leadership & admin" title="Admin" />
      <div className="team-grid">
        <section className="tcard"><h2>Site status</h2>
          <ul className="tlist">
            <li><b>AI agent</b><span>{agentOn ? `On · ${process.env.AGENT_MODEL || "claude-sonnet-5-5"}` : "Off (no API key)"}</span></li>
            <li><b>Lead email</b><span>{leads.email ? "Connected" : "Not connected"}</span></li>
            <li><b>CRM webhook</b><span>{leads.webhook ? "Connected" : "Not connected"}</span></li>
            <li><b>Escalation line</b><span>{site.agent.escalation.phone.display} · shows {site.agent.escalation.reveal === "always" ? "always" : "after the agent is used"}</span></li>
          </ul>
        </section>
        <section className="tcard"><h2>Partnership inquiries</h2>
          <Pending title="Email only for now" source="lead store / CRM">Inquiries from /partnerships route to LEADS_TO_PARTNERSHIP.</Pending>
        </section>
        <section className="tcard"><h2>AI agent review</h2>
          <Pending title="Transcript review" source="log drain or lead store">Callback requests include the chat transcript today. A review queue for flagged chats comes with the lead store.</Pending>
        </section>
        <section className="tcard span3"><h2>Users & roles</h2>
          <Pending title="Managed in Microsoft Entra ID" source="Entra app roles: rep, ops, carrier, leadership, admin">Assign people or groups to roles in Entra → Enterprise applications → Vektor Team (website). See docs/m365-sso.md.</Pending>
        </section>
      </div>
    </main>
  );
}
