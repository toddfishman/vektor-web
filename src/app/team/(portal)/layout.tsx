import { signOut } from "@/auth";
import { TeamNav } from "@/components/team/team-nav";
import { TEAM_NAV, can, requireTeamUser } from "@/lib/team";

/* Employee portal shell: auth gate, sidebar, user box. Every page under (portal) is protected. */
export default async function PortalLayout({ children }: LayoutProps<"/team">) {
  const user = await requireTeamUser();
  const items = TEAM_NAV.filter((n) => !n.roles || can(user, ...n.roles));
  return (
    <>
      {user.demo && (
        <p className="team-demo" role="note">
          Preview mode: Microsoft 365 sign-in isn&rsquo;t connected yet, so this shows placeholder content to reviewers. It turns off automatically once SSO is set up.
        </p>
      )}
      <div className="team-shell">
        <aside className="team-side">
          <TeamNav items={items} />
          <div className="team-me">
            <b>{user.name || user.email}</b>
            <span>{user.email}</span>
            <span className="mono">{user.roles.join(" · ")}</span>
            {!user.demo && (
              <form action={async () => { "use server"; await signOut({ redirectTo: "/team/sign-in" }); }}>
                <button className="team-out" type="submit">Sign out</button>
              </form>
            )}
          </div>
        </aside>
        <div className="team-main">{children}</div>
      </div>
    </>
  );
}
