import { PortalHead } from "@/components/team/ui";
import { quickLinks } from "@/content/team";
import { requireTeamUser } from "@/lib/team";

export default async function Tools() {
  await requireTeamUser();
  return (
    <main>
      <PortalHead tag="Systems" title="Tools" />
      <div className="tool-grid">
        {quickLinks.map((l) => l.href
          ? <a key={l.name} className="tool" href={l.href} target="_blank" rel="noopener"><b>{l.name}</b><span>{l.what}</span><i>Open ↗</i></a>
          : <div key={l.name} className="tool tmissing"><b>{l.name}</b><span>{l.what}</span><i>Link needed</i></div>)}
      </div>
    </main>
  );
}
