import { PortalHead } from "@/components/team/ui";
import { documents } from "@/content/team";
import { can, requireTeamUser } from "@/lib/team";

export default async function Documents() {
  const user = await requireTeamUser();
  const docs = documents.filter((d) => !d.roles || can(user, ...d.roles));
  return (
    <main>
      <PortalHead tag="Library" title="Documents" />
      <div className="tcard">
        <ul className="tlist">
          {docs.map((d) => <li key={d.title}>{d.href ? <a href={d.href} target="_blank" rel="noopener"><b>{d.title}</b><span>{d.kind}</span></a> : <span className="tmissing"><b>{d.title}</b><span>{d.kind} · link needed</span></span>}</li>)}
        </ul>
        <p className="tnote">Files stay in SharePoint; this page links to them so permissions stay in Microsoft 365.</p>
      </div>
    </main>
  );
}
