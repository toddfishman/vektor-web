import { Pending, PortalHead } from "@/components/team/ui";
import { offices } from "@/content/site";
import { requireTeamUser } from "@/lib/team";

export default async function Directory() {
  await requireTeamUser();
  return (
    <main>
      <PortalHead tag="People" title="Directory" />
      <div className="team-grid">
        <section className="tcard span2"><h2>People</h2>
          <Pending title="Pulls from Microsoft 365" source="Microsoft Graph (users, titles, offices, photos)">Names, roles, phone and Teams links stay current automatically once the M365 app registration is approved.</Pending>
        </section>
        <section className="tcard"><h2>Search</h2><input className="tsearch" placeholder="Search people (coming soon)" disabled aria-label="Search people" /></section>
        <section className="tcard span3"><h2>Offices</h2>
          <ul className="toffices">{offices.map((o) => <li key={o.city}><span className="mono">{o.role}</span><b>{o.name}</b><span>{o.lines.join(", ")}</span>{o.phone && <span>{o.phone}</span>}</li>)}</ul>
        </section>
      </div>
    </main>
  );
}
