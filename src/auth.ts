/*
  Employee sign-in: Microsoft 365 (Entra ID) single sign-on only. No local passwords;
  MFA and conditional access are enforced by Vektor's M365 tenant.

  Roles come from Entra "App roles" on the app registration (assign users or groups in
  Entra → Enterprise applications → Vektor Team → Users and groups). Role values:
  rep, ops, carrier, leadership, admin. A signed-in user with no role gets "rep".
  Setup steps: docs/m365-sso.md
*/
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { audit } from "@/lib/audit";

export const ROLES = ["rep", "ops", "carrier", "leadership", "admin"] as const;
export type Role = (typeof ROLES)[number];

const toRoles = (v: unknown): Role[] => {
  const r = (Array.isArray(v) ? v : []).map((x) => String(x).toLowerCase()).filter((x): x is Role => (ROLES as readonly string[]).includes(x));
  return r.length ? r : ["rep"];
};

declare module "next-auth" {
  interface Session { user: { name?: string | null; email?: string | null; image?: string | null; roles: Role[]; oid?: string } }
}

export const ssoConfigured = Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET && process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER);

/*
  Preview mode for draft deployments: lets reviewers see the portal before Microsoft 365 is
  connected. Only possible while SSO is NOT configured, and only on a noindex preview
  (NEXT_PUBLIC_NOINDEX=1) or with TEAM_DEMO=1. Shows placeholder content only, behind a banner.
  It switches itself off the moment SSO is configured.
*/
export const teamDemo = !ssoConfigured && (process.env.TEAM_DEMO === "1" || process.env.NEXT_PUBLIC_NOINDEX === "1");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      // single-tenant: https://login.microsoftonline.com/<tenant-id>/v2.0
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // one work day
  pages: { signIn: "/team/sign-in", error: "/team/sign-in" },
  trustHost: true,
  callbacks: {
    signIn({ profile }) {
      // Belt and braces on top of the single-tenant issuer: only Vektor's tenant.
      const tenant = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
      const tid = (profile as { tid?: string } | undefined)?.tid;
      if (tenant && tid !== tenant) {
        audit("auth.denied", { reason: "tenant", email: profile?.email ?? undefined });
        return false;
      }
      return true;
    },
    jwt({ token, profile }) {
      if (profile) {
        token.roles = toRoles((profile as { roles?: unknown }).roles);
        token.oid = (profile as { oid?: string }).oid;
      }
      return token;
    },
    session({ session, token }) {
      session.user.roles = toRoles(token.roles);
      session.user.oid = typeof token.oid === "string" ? token.oid : undefined;
      return session;
    },
    /** Used by src/proxy.ts for /team/*. */
    authorized({ auth: a, request }) {
      if (request.nextUrl.pathname.startsWith("/team/sign-in")) return true;
      if (teamDemo) return true;
      return Boolean(a?.user);
    },
  },
  events: {
    signIn({ user }) { audit("auth.sign_in", { email: user.email ?? undefined }); },
    signOut(m) { audit("auth.sign_out", { email: "token" in m ? (m.token?.email ?? undefined) : undefined }); },
  },
});

export const hasRole = (roles: Role[] | undefined, ...need: Role[]) => Boolean(roles?.some((r) => r === "admin" || need.includes(r)));
