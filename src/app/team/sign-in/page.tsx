import { redirect } from "next/navigation";
import { auth, signIn, ssoConfigured } from "@/auth";

export default async function SignIn({ searchParams }: PageProps<"/team/sign-in">) {
  const { error, callbackUrl } = await searchParams;
  const session = ssoConfigured ? await auth() : null;
  if (session?.user) redirect("/team");
  // only ever return to a page inside /team (callbackUrl may be absolute)
  let back = "/team";
  if (typeof callbackUrl === "string") {
    try { const p = new URL(callbackUrl, "http://x").pathname; if (p.startsWith("/team") && !p.startsWith("/team/sign-in")) back = p; } catch { /* ignore */ }
  }

  return (
    <main className="team-signin">
      <p className="tag">Vektor Team</p>
      <h1>Sign in with your Vektor Microsoft account.</h1>
      <p className="lede">Same account you use for Outlook and Teams. Your company’s multi-factor sign-in applies.</p>
      {error && <p className="team-err" role="alert">{error === "AccessDenied" ? "That account isn’t part of Vektor’s Microsoft 365. Use your @vektor-logistics.com account." : "Sign-in didn’t complete. Please try again."}</p>}
      {ssoConfigured ? (
        <form action={async () => { "use server"; await signIn("microsoft-entra-id", { redirectTo: back }); }}>
          <button className="btn" type="submit">Continue with Microsoft <i className="ar" /></button>
        </form>
      ) : (
        <p className="team-err">Microsoft 365 sign-in isn’t configured on this deployment yet. See docs/m365-sso.md.</p>
      )}
    </main>
  );
}
