/*
  Tyler's "Heading" mark: tip-up arrow, split facet + faceted cut.
  TODO(brand): the wordmark is set in Space Grotesk as a stand-in; swap for the
  custom-drawn wordmark (SVG) when it's final. Trademark search on the arrow is open.
*/
import type { CSSProperties } from "react";

/** The arrow. `dark` = drawn for a dark ground (light facet + coral facet). */
export function HeadingMark({ dark = true, className = "mk" }: { dark?: boolean; className?: string }) {
  const on = dark ? "var(--logo-light)" : "var(--logo-dark)";
  return (
    <svg className={className} viewBox="-6 -6 120 136" aria-hidden="true">
      <polygon points="54,0 0,124 54,90" fill={on} />
      <polygon points="54,0 108,124 54,90" fill="var(--logo-accent)" />
      <polygon points="54,0 0,124 27,107" fill="#fff" fillOpacity=".16" />
      <polygon points="54,0 27,107 54,90" fill="#000" fillOpacity=".2" />
      <polygon points="54,0 108,124 81,107" fill="#000" fillOpacity=".26" />
      <polygon points="54,0 81,107 54,90" fill="#fff" fillOpacity=".12" />
    </svg>
  );
}

const letters = (w: string) => [...w].map((c, i) => <b key={i} style={{ "--i": i } as CSSProperties}>{c}</b>);

/** Horizontal (header) or stacked (footer) lockup. `height` is the mark height in px. */
export function Lockup({ height = 46, stacked = false, dark = true, play = false }: { height?: number; stacked?: boolean; dark?: boolean; play?: boolean }) {
  const fs = stacked ? height / 11 : height / 5.2;
  return (
    <span
      className={`hlk${stacked ? " stk" : ""}${play ? " go" : ""}`}
      role="img"
      aria-label="Vektor Logistics"
      style={{ "--hs": `${fs.toFixed(2)}px`, color: dark ? "var(--logo-light)" : "var(--logo-dark)" } as CSSProperties}
    >
      <HeadingMark dark={dark} />
      <span className="wd">
        <span className="vk">{letters("VEKTOR")}</span>
        <span className="lg">LOGISTICS</span>
      </span>
    </span>
  );
}

/** Intro lockup: the mark doubles as the V of VEKTOR, with a shine sweep at the end. */
export function IntroMark({ shineRef }: { shineRef?: React.Ref<SVGAnimateElement> }) {
  return (
    <svg className="mk" viewBox="-6 -6 120 136" aria-hidden="true">
      <defs>
        <clipPath id="imc"><polygon points="54,0 108,124 54,90 0,124" /></clipPath>
        <linearGradient id="imgrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* drawn tip-up; the intro rotates it 180° so it rests as the V */}
      <polygon points="54,0 0,124 54,90" fill="var(--logo-accent)" />
      <polygon points="54,0 108,124 54,90" fill="var(--logo-light)" />
      <polygon points="54,0 0,124 27,107" fill="#fff" fillOpacity=".16" />
      <polygon points="54,0 27,107 54,90" fill="#000" fillOpacity=".2" />
      <polygon points="54,0 108,124 81,107" fill="#000" fillOpacity=".26" />
      <polygon points="54,0 81,107 54,90" fill="#fff" fillOpacity=".12" />
      <g clipPath="url(#imc)">
        <rect x="-50" y="-20" width="40" height="170" fill="url(#imgrad)" transform="skewX(-18)">
          <animate ref={shineRef} attributeName="x" from="-50" to="175" dur="1.5s" begin="indefinite" fill="freeze" calcMode="spline" keySplines=".5 0 .3 1" keyTimes="0;1" />
        </rect>
      </g>
    </svg>
  );
}

export { letters };
