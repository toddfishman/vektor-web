import { redirect } from "next/navigation";
import { auth, hasRole, signOut } from "@/auth";
import { announcements, documents, onCall, quickLinks } from "@/content/team";
import { offices, site } from "@/content/site";
import { audit } from "@/lib/audit";

export default async function TeamHome() {
  const session = await auth();
  if (!session?.user) redirect("/team/sign-in");
  const { user } = session;
  audit("team.view", { page: "/team", email: user.email ?? undefined });
  const first = user.name?.split(" ")[0] ?? "there";
  const leader = hasRole(user.roles, "leadership");

  return (
    <main className="team-main">
      <div className="team-top">
        <div>
          <p className="tag">Good to see you, {first}</p>
          <h1>Today at Vektor</h1>
        </div>
        <div className="team-me">
          <span>{user.email}</span>
          <span className="mono">{user.roles.join(" · ")}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/team/sign-in" }); }}><button className="team-out" type="submit">Sign out</button></form>
        </div>
      </div>

      <div className="team-grid">
        <section className="tcard span2" aria-labelledby="t-quotes">
          <h2 id="t-quotes">Quote requests from the site</h2>
          {/* TODO: read from the lead store once chosen (docs/decisions.md). */}
          <div className="tempty">
            <b>Not connected yet</b>
            <p>Website quote requests are delivered by email{process.env.LEADS_WEBHOOK_URL ? " and to the CRM webhook" : ""}. This list turns on when the lead store is connected, with status for each request.</p>
          </div>
        </section>

        <section className="tcard" aria-labelledby="t-numbers">
          <h2 id="t-numbers">My numbers</h2>
          <div className="tempty"><b>Coming with Turvo data</b><p>Loads, margin and quote win rate, once the Turvo API is connected.</p></div>
        </section>

        <section className="tcard" aria-labelledby="t-links">
          <h2 id="t-links">Quick links</h2>
          <ul className="tlinks">
            {quickLinks.map((l) => (
              <li key={l.name}>
                {l.href ? <a href={l.href} target="_blank" rel="noopener"><b>{l.name}</b><span>{l.what}</span></a>
                  : <span className="tmissing"><b>{l.name}</b><span>{l.what} · link needed</span></span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="tcard" aria-labelledby="t-news">
          <h2 id="t-news">Announcements</h2>
          <ul className="tnews">
            {announcements.map((a) => <li key={a.title}><span className="mono">{a.date}</span><b>{a.title}</b><p>{a.body}</p></li>)}
          </ul>
        </section>

        <section className="tcard" aria-labelledby="t-oncall">
          <h2 id="t-oncall">24/7 on-call</h2>
          {onCall.length ? (
            <ul className="tlist">{onCall.map((o) => <li key={o.window}><b>{o.who}</b><span>{o.window}{o.phone ? ` · ${o.phone}` : ""}</span></li>)}</ul>
          ) : (
            <div className="tempty"><b>Rotation source needed</b><p>Customers see {site.agent.phone.display} as the 24/7 line.</p></div>
          )}
        </section>

        <section className="tcard" aria-labelledby="t-docs">
          <h2 id="t-docs">Documents</h2>
          <ul className="tlist">
            {documents.filter((d) => !d.roles || hasRole(user.roles, ...d.roles)).map((d) => (
              <li key={d.title}>{d.href ? <a href={d.href} target="_blank" rel="noopener"><b>{d.title}</b><span>{d.kind}</span></a> : <span className="tmissing"><b>{d.title}</b><span>{d.kind} · link needed</span></span>}</li>
            ))}
          </ul>
        </section>

        <section className="tcard span2" aria-labelledby="t-dir">
          <h2 id="t-dir">Offices</h2>
          <ul className="toffices">
            {offices.map((o) => <li key={o.city}><span className="mono">{o.role}</span><b>{o.name}</b><span>{o.lines.join(", ")}</span></li>)}
          </ul>
          <p className="tnote">People directory: TODO pull from Microsoft 365 (Graph) so it stays current.</p>
        </section>

        {leader && (
          <section className="tcard" aria-labelledby="t-admin">
            <h2 id="t-admin">Leadership</h2>
            <p className="tnote">Partnership inquiries route to leadership by email. Pipeline view arrives with the CRM connection.</p>
          </section>
        )}
      </div>
    </main>
  );
}
