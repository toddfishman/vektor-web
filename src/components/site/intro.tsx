"use client";

/*
  Home intro: glazed truck photo; the arrow appears huge on its own (~1s), rotates 180°
  and shrinks into the V, EKTOR rises, LOGISTICS wipes in left to right, then a shine
  sweeps the V. While the intro is on screen the header logo is hidden.
  Click the logo to replay. Honors prefers-reduced-motion (static lockup).
*/
import Image from "next/image";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { IntroMark } from "@/components/brand/logo";

export function Intro() {
  const sec = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const shine = useRef<SVGAnimateElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const flyMark = useCallback(() => {
    const mk = btn.current?.querySelector<SVGSVGElement>(".mk");
    const s = sec.current;
    if (!mk || !s || !mk.animate) return;
    mk.getAnimations().forEach((a) => a.cancel());
    const r = mk.getBoundingClientRect(), b = s.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (r.left + r.width / 2), dy = b.top + b.height * 0.47 - (r.top + r.height / 2);
    const S = Math.max(1.6, Math.min(b.width * 0.5, b.height * 0.52) / r.height);
    const big = `translate(${dx}px,${dy}px) scale(${S}) rotate(0deg)`;
    mk.animate(
      [
        { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(${S * 0.88}) rotate(0deg)` },
        { opacity: 1, transform: big, offset: 0.18 },
        { opacity: 1, transform: big, offset: 0.5 },
        { opacity: 1, transform: "translate(0,0) scale(1) rotate(180deg)" },
      ],
      { duration: 2300, delay: 150, easing: "cubic-bezier(.65,0,.25,1)", fill: "both" },
    );
  }, []);

  const run = useCallback(() => {
    const s = sec.current; if (!s) return;
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.forEach(clearTimeout); timers.current = [];
    s.classList.remove("play"); void s.offsetWidth; s.classList.add("play");
    if (!RM) {
      flyMark();
      timers.current.push(setTimeout(() => { try { shine.current?.beginElement(); } catch { /* SMIL unsupported */ } }, 4250));
    }
    document.body.classList.add("intro-run");
    timers.current.push(setTimeout(() => document.body.classList.remove("intro-run"), 5400));
  }, [flyMark]);

  useEffect(() => {
    run();
    document.body.classList.add("at-intro");
    const io = new IntersectionObserver((es) => document.body.classList.toggle("at-intro", es[0].isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    if (sec.current) io.observe(sec.current);
    const t = timers.current;
    return () => { io.disconnect(); t.forEach(clearTimeout); document.body.classList.remove("at-intro", "intro-run"); };
  }, [run]);

  return (
    <section className="intro" ref={sec} aria-label="Vektor Logistics">
      <Image className="iimg" src="/img/hero-1.jpg" alt="A Vektor Logistics truck on the highway at sunset" fill priority sizes="100vw" />
      <div className="glaze" aria-hidden="true" />
      <button type="button" className="ilogo hd" ref={btn} aria-label="Vektor Logistics (replay intro)" onClick={run}>
        <span className="iw">
          <span className="row">
            <IntroMark shineRef={shine} />
            <span className="vk">{[..."EKTOR"].map((c, i) => <b key={i} style={{ "--i": i } as CSSProperties}>{c}</b>)}</span>
          </span>
          <span className="lg">{[..."LOGISTICS"].map((c, i) => <b key={i}>{c}</b>)}</span>
        </span>
      </button>
      <a className="cue" href="#hero"><span>Find your direction</span><i /></a>
    </section>
  );
}
