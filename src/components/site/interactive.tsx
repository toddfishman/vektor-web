"use client";

/* Client-side sections: scroll story, services accordion + drawer, testimonial rotator. */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SERVICES, STORY, TESTIMONIALS } from "@/content/marketing";
import { Credentials, SectionHead } from "./ui";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Story() {
  const [act, setAct] = useState(0);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setAct(Number((e.target as HTMLElement).dataset.i)); }), { rootMargin: "-45% 0px -45% 0px" });
    steps.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, []);
  const s = STORY[act];
  return (
    <section className="sec story" style={{ background: "var(--night2)" }}>
      <div className="wrap">
        <SectionHead tag="How a load moves" title="From call to dock." lede="Scroll the life of a Vektor load. Every step has a person on it." />
        <div className="grid">
          <div className="vis">
            {STORY.map((x, i) => <Image key={x.img + i} src={`/img/${x.img}.jpg`} alt="" fill sizes="(max-width:860px) 100vw, 55vw" className={i === act ? "on" : undefined} />)}
            <div className="route">
              <div className="top">
                <div className="odo"><small>STEP 0{act + 1} / 05</small><span>{s.n.split("· ")[1]}</span></div>
                <span className="mono" style={{ color: "#fff" }}>{Math.round(s.mi * 100)}%</span>
              </div>
              <div className="bar"><div className="fill" style={{ width: `${s.mi * 100}%` }} /><div className="trk" style={{ left: `${s.mi * 100}%` }} /></div>
              <div className="pts"><b>Origin</b><span>Match</span><span>Pickup</span><span>Transit</span><b>Delivered</b></div>
            </div>
          </div>
          <div className="steps">
            {STORY.map((x, i) => (
              <div key={i} className={`step${i === act ? " on" : ""}`} data-i={i} ref={(el) => { steps.current[i] = el; }}>
                <div className="n">{x.n}</div><h3>{x.h}</h3><p>{x.p}</p>
                <div className="chips">{x.c.map((c) => <span key={c} className="chip">{c}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services({ title = "Seven ways to move it." }: { title?: string }) {
  const [on, setOn] = useState(SERVICES[0].id);
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const svc = SERVICES.find((s) => s.id === open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    drawerRef.current?.scrollTo(0, 0);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const quoteThis = (eq: string, e: React.MouseEvent) => {
    setOpen(null);
    // On pages with an embedded quote builder, preselect equipment and scroll to it.
    const q = document.getElementById("qsec");
    if (q) { e.preventDefault(); dispatchEvent(new CustomEvent("vk:quote-eq", { detail: eq })); q.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }); }
    else { e.preventDefault(); router.push(`/quote?eq=${eq}`); }
  };

  return (
    <section className="sec" id="services">
      <div className="wrap">
        <SectionHead tag="Services" title={title} lede="Hover to preview, click for the details." />
        <div className="svcs">
          {SERVICES.map((s) => (
            <button key={s.id} type="button" className={`sv${on === s.id ? " on" : ""}`} aria-haspopup="dialog"
              onMouseEnter={() => { if (innerWidth > 980) setOn(s.id); }} onFocus={() => setOn(s.id)} onClick={() => { setOn(s.id); setOpen(s.id); }}>
              <Image src={`/img/${s.img}.jpg`} alt="" fill sizes="(max-width:980px) 100vw, 50vw" />
              <div className="in">
                <span className="code">{s.code}</span><h3>{s.name}</h3>
                <div className="more"><div><p>{s.tl}</p><span>View service</span></div></div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={`scrim${svc ? " on" : ""}`} onClick={() => setOpen(null)} />
      <aside ref={drawerRef} className={`drawer${svc ? " on" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dr-h" aria-hidden={!svc} inert={!svc}>
        {svc && (
          <>
            <div className="ph">
              <Image src={`/img/${svc.img}.jpg`} alt={svc.name} fill sizes="560px" />
              <button ref={closeRef} className="x" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
            </div>
            <div className="b">
              <span className="code">{svc.code} · SERVICE</span>
              <h2 id="dr-h">{svc.name}</h2>
              <p className="lede" style={{ color: "var(--ink2)" }}>{svc.tl}</p>
              <p>{svc.body}</p>
              <div className="btns" style={{ marginTop: "1.4rem" }}>
                <a className="btn" href={`/quote?eq=${svc.eq}`} onClick={(e) => quoteThis(svc.eq, e)}>Quote this <i className="ar" /></a>
                <Link className="btn ghost" href="/contact">Talk to a rep</Link>
              </div>
              <div className="ph2"><Image src={`/img/${svc.img2}.jpg`} alt="" width={1000} height={600} sizes="560px" /></div>
              <div className="drawer-chips">
                {SERVICES.map((x) => (
                  <button key={x.id} type="button" className={`chip${x.id === svc.id ? " cur" : ""}`} onClick={() => setOpen(x.id)}>{x.name}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const t = setInterval(() => setI((k) => (k + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="sec paper" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <p className="tag">In their words</p>
        <div className="qt" aria-live="polite">
          {TESTIMONIALS.map((q, k) => (
            <figure key={k} className={k === i ? "on" : undefined} aria-hidden={k !== i}>
              <blockquote>{q.q}</blockquote><figcaption>{q.w}</figcaption>
            </figure>
          ))}
        </div>
        <div className="qdots">
          {TESTIMONIALS.map((_, k) => <button key={k} type="button" aria-label={`Quote ${k + 1}`} aria-pressed={k === i} className={k === i ? "on" : undefined} onClick={() => setI(k)} />)}
        </div>
        <Credentials />
      </div>
    </section>
  );
}
