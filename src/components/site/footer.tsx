import Link from "next/link";
import { Lockup } from "@/components/brand/logo";
import { offices, site, socialLinks } from "@/content/site";

export function Band() {
  return (
    <section className="band">
      <div className="wrap">
        <h2>Freight with a person behind it.</h2>
        <div className="btns">
          <Link className="btn" href="/quote">Get a quote <i className="ar" /></Link>
          <Link className="btn ghost" href="/carriers">Haul with us</Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const hq = offices[0];
  const socials = socialLinks();
  return (
    <footer className="foot">
      <div className="wrap">
        <div>
          <Link className="logo" href="/" aria-label="Vektor Logistics home"><Lockup height={120} stacked /></Link>
          <p style={{ marginTop: "1.2rem", fontSize: ".93rem" }}>
            We build strong connections between shippers, carriers and retailers. People-first culture, trusted partnerships, real results.
          </p>
          {socials.length > 0 && (
            <ul className="socials" aria-label="Vektor on social media">
              {socials.map((s) => <li key={s.key}><a href={s.url} rel="me noopener" target="_blank">{s.label}</a></li>)}
            </ul>
          )}
        </div>
        <div>
          <h2 className="h5">Go</h2>
          <ul>
            <li><Link href="/shippers">Ship with us</Link></li>
            <li><Link href="/carriers">Haul with us</Link></li>
            <li><Link href="/partnerships">Partnerships</Link></li>
            <li><Link href="/refer">Refer &amp; recommend</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="h5">Speak with a Vektor agent</h2>
          <ul>
            <li><span className="live">24/7/365</span></li>
            <li><a href={`tel:${site.agent.phone.tel}`}>{site.agent.phone.display}</a></li>
            <li><a href={`mailto:${site.email.sales}`}>{site.email.sales}</a></li>
            <li>{hq.lines[0]}<br />{hq.lines[1]}</li>
          </ul>
        </div>
        <div>
          <h2 className="h5">Members</h2>
          <ul>
            {site.memberships.map((m) => <li key={m}>{m}</li>)}
            <li>Best of 2026 · BusinessRate</li>
          </ul>
        </div>
        <div className="base">
          <span>© {new Date().getFullYear()} {site.legalName}</span>
          <span>{site.mc} · {site.usdot}</span>
          <span className="legal">
            <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/accessibility">Accessibility</Link> · <Link href="/team">Team sign-in</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
