import Link from "next/link";
import { announcements, quickLinks } from "@/content/team";
import { site } from "@/content/site";
import { audit } from "@/lib/audit";
import { can, requireTeamUser } from "@/lib/team";
import { Pending, PortalHead } from "@/components/team/ui";

export default async function TeamHome() {
  const user = await requireTeamUser();
  audit("team.view", { page: "/team", email: user.email, demo: user.demo });
  const first = user.name.split(" ")[0] || "there";

  return (
    <main>
      <PortalHead tag={`Good to see you, ${first}`} title="Today at Vektor" />
      <div className="team-grid">
        <section className="tcard span2" aria-labelledby="t-quotes">
          <h2 id="t-quotes"><Link href="/team/quotes">Quote requests from the site →</Link></h2>
          <Pending title="Not connected yet" source="lead store (SharePoint list, database or CRM — see docs/decisions.md)">
            Website quote requests arrive by email{process.env.LEADS_WEBHOOK_URL ? " and the CRM webhook" : ""} today. Once the lead store is chosen they&rsquo;ll list here with status.
          </Pending>
        </section>
        <section className="tcard" aria-labelledby="t-numbers">
          <h2 id="t-numbers">My numbers</h2>
          <Pending title="Coming with Turvo data" source="Turvo API">Loads, margin and quote win rate.</Pending>
        </section>
        <section className="tcard" aria-labelledby="t-links">
          <h2 id="t-links"><Link href="/team/tools">Tools →</Link></h2>
          <ul className="tlinks">
            {quickLinks.slice(0, 4).map((l) => (
              <li key={l.name}>{l.href ? <a href={l.href} target="_blank" rel="noopener"><b>{l.name}</b><span>{l.what}</span></a> : <span className="tmissing"><b>{l.name}</b><span>{l.what} · link needed</span></span>}</li>
            ))}
          </ul>
        </section>
        <section className="tcard" aria-labelledby="t-news">
          <h2 id="t-news"><Link href="/team/announcements">Announcements →</Link></h2>
          <ul className="tnews">{announcements.slice(0, 2).map((a) => <li key={a.title}><span className="mono">{a.date}</span><b>{a.title}</b><p>{a.body}</p></li>)}</ul>
        </section>
        <section className="tcard" aria-labelledby="t-oncall">
          <h2 id="t-oncall"><Link href="/team/on-call">24/7 on-call →</Link></h2>
          <Pending title="Rotation source needed" source="Teams Shifts or a SharePoint list">Customers reach the 24/7 line at {site.agent.phone.display}.</Pending>
        </section>
        {can(user, "leadership") && (
          <section className="tcard" aria-labelledby="t-admin">
            <h2 id="t-admin"><Link href="/team/admin">Leadership →</Link></h2>
            <p className="tnote">Partnership inquiries, AI-agent callbacks and site settings.</p>
          </section>
        )}
      </div>
    </main>
  );
}
