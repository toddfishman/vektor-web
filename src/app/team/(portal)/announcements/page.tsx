import { PortalHead } from "@/components/team/ui";
import { announcements } from "@/content/team";
import { requireTeamUser } from "@/lib/team";

export default async function Announcements() {
  await requireTeamUser();
  return (
    <main>
      <PortalHead tag="Company" title="Announcements" />
      <div className="tcard">
        <ul className="tnews">{announcements.map((a) => <li key={a.title}><span className="mono">{a.date}</span><b>{a.title}</b><p>{a.body}</p></li>)}</ul>
        <p className="tnote">Edited in src/content/team.ts for now; moves to the CMS (or a SharePoint news feed) later.</p>
      </div>
    </main>
  );
}
