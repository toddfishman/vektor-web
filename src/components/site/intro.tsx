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

/** Arrow → V, EKTOR, LOGISTICS wipe and the shine are all done by about this point. */
const INTRO_MS = 5600;
const SCROLL_MS = 1900;

/*
  After the intro on first landing, glide down to the hero ("Freight with direction.").
  Skipped with reduced motion or a #hash link, and cancelled the moment the visitor
  scrolls, touches, clicks or presses a key — we never fight the user for the page.
*/
function autoScrollToHero() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || location.hash) return () => {};
  let stopped = false, raf = 0;
  const evts = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  const stop = () => { stopped = true; cancelAnimationFrame(raf); evts.forEach((e) => removeEventListener(e, stop)); };
  evts.forEach((e) => addEventListener(e, stop, { passive: true }));
  const timer = setTimeout(() => {
    const hero = document.getElementById("hero");
    if (stopped || !hero || scrollY > 40) return stop();
    const from = scrollY, to = hero.getBoundingClientRect().top + scrollY;
    const ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let t0 = 0;
    const step = (now: number) => {
      if (stopped) return;
      t0 ||= now;
      const p = Math.min(1, (now - t0) / SCROLL_MS);
      scrollTo({ top: from + (to - from) * ease(p), behavior: "instant" });
      if (p < 1) raf = requestAnimationFrame(step); else stop();
    };
    raf = requestAnimationFrame(step);
  }, INTRO_MS);
  return () => { clearTimeout(timer); stop(); };
}

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
    timers.current.push(setTimeout(() => { document.body.classList.remove("intro-run"); document.body.classList.add("intro-done"); }, INTRO_MS));
  }, [flyMark]);

  useEffect(() => {
    document.body.classList.remove("intro-done");
    run();
    document.body.classList.add("at-intro");
    const io = new IntersectionObserver((es) => {
      const at = es[0].isIntersecting;
      document.body.classList.toggle("at-intro", at);
      if (!at) document.body.classList.add("intro-done"); // scrolled past: show the header
    }, { rootMargin: "-80px 0px 0px 0px" });
    if (sec.current) io.observe(sec.current);
    const t = timers.current;
    const stopAuto = autoScrollToHero();
    return () => { io.disconnect(); t.forEach(clearTimeout); stopAuto(); document.body.classList.remove("at-intro", "intro-run", "intro-done"); };
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
      <noscript><style>{".intro .iimg{opacity:.9!important}.intro .ilogo .mk,.intro .ilogo .vk b,.intro .ilogo .lg,.intro .cue{opacity:1!important;clip-path:none!important}"}</style></noscript>
    </section>
  );
}
