import { Pending, PortalHead } from "@/components/team/ui";
import { onCall } from "@/content/team";
import { site } from "@/content/site";
import { requireTeamUser } from "@/lib/team";

export default async function OnCall() {
  await requireTeamUser();
  return (
    <main>
      <PortalHead tag="24/7/365" title="On-call rotation" />
      <div className="team-grid">
        <section className="tcard span2"><h2>This week</h2>
          {onCall.length
            ? <ul className="tlist">{onCall.map((o) => <li key={o.window}><b>{o.who}</b><span>{o.window}{o.phone ? ` · ${o.phone}` : ""}</span></li>)}</ul>
            : <Pending title="Rotation source needed" source="Teams Shifts or a SharePoint list">Who answers the 24/7 line after hours, weekends and holidays, with backup.</Pending>}
        </section>
        <section className="tcard"><h2>Lines customers see</h2>
          <ul className="tlist">
            <li><b>{site.agent.phone.display}</b><span>24/7 agent line (call/text)</span></li>
            <li><b>{site.agent.escalation.phone.display}</b><span>Escalation line (placeholder)</span></li>
            <li><b>Website AI agent</b><span>Chat on /contact; callbacks arrive as leads</span></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
