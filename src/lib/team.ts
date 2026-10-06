import "server-only";
import { redirect } from "next/navigation";
import { auth, hasRole, teamDemo, type Role } from "@/auth";

export type TeamUser = { name: string; email: string; roles: Role[]; demo: boolean };

/** The signed-in employee, or a preview user on draft deployments. Redirects to sign-in otherwise. */
export async function requireTeamUser(): Promise<TeamUser> {
  if (teamDemo) return { name: "Preview Reviewer", email: "preview@vektor-logistics.com", roles: ["admin"], demo: true };
  const s = await auth();
  if (!s?.user) redirect("/team/sign-in");
  return { name: s.user.name ?? "", email: s.user.email ?? "", roles: s.user.roles, demo: false };
}

export const can = (u: TeamUser, ...roles: Role[]) => hasRole(u.roles, ...roles);

export const TEAM_NAV: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/team", label: "Dashboard" },
  { href: "/team/quotes", label: "Quote requests" },
  { href: "/team/announcements", label: "Announcements" },
  { href: "/team/directory", label: "Directory" },
  { href: "/team/on-call", label: "On-call" },
  { href: "/team/documents", label: "Documents" },
  { href: "/team/tools", label: "Tools" },
  { href: "/team/admin", label: "Admin", roles: ["leadership"] },
];
