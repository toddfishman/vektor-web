/* Equipment glyphs for the quote builder (Todd likes these; keep them). */
const P = { viewBox: "0 0 48 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
const cab = <><path d="M32 8h7l5 5v4h-12" /><circle cx="10" cy="19" r="2.5" /><circle cx="37" cy="19" r="2.5" /></>;

export const QIC: Record<string, React.ReactNode> = {
  van: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" />{cab}</svg>,
  ftl: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" />{cab}</svg>,
  reefer: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" /><path d="M17 6v8M13 8l8 4M21 8l-8 4" />{cab}</svg>,
  flat: <svg {...P}><path d="M2 15h30M6 15V9h10v6M18 15v-4h8v4" />{cab}</svg>,
  ltl: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" /><rect x="6" y="9" width="7" height="6" /><rect x="15" y="11" width="6" height="4" />{cab}</svg>,
  imx: <svg {...P}><rect x="3" y="4" width="34" height="11" /><path d="M11 4v11M19 4v11M27 4v11M2 19h44" /><circle cx="10" cy="19" r="1.5" /><circle cx="36" cy="19" r="1.5" /></svg>,
  ded: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" /><path d="M10 10h14M20 6l4 4-4 4" />{cab}</svg>,
  partial: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" /><rect x="5" y="8" width="12" height="7" fill="currentColor" fillOpacity=".25" />{cab}</svg>,
  dray: <svg {...P}><rect x="3" y="4" width="28" height="11" /><path d="M9 4v11M15 4v11M21 4v11M2 15h30" />{cab}</svg>,
  step: <svg {...P}><path d="M2 15h18v-3h12M8 15V10h8v5" />{cab}</svg>,
  power: <svg {...P}><path d="M18 15h14M32 8h7l5 5v4h-12" /><path d="M22 12h8" strokeDasharray="2 2" /><circle cx="24" cy="19" r="2.5" /><circle cx="37" cy="19" r="2.5" /></svg>,
  c20: <svg {...P}><rect x="14" y="5" width="16" height="10" /><path d="M19 5v10M24 5v10M2 15h30" />{cab}</svg>,
  c40: <svg {...P}><rect x="2" y="5" width="28" height="10" /><path d="M8 5v10M13 5v10M18 5v10M24 5v10M2 15h30" />{cab}</svg>,
  c40h: <svg {...P}><rect x="2" y="2" width="28" height="13" /><path d="M8 2v13M13 2v13M18 2v13M24 2v13M2 15h30" />{cab}</svg>,
  any: <svg {...P}><rect x="2" y="3" width="30" height="14" rx="1" strokeDasharray="3 3" /><path d="M14 8.5a3 3 0 1 1 3.5 3c-1 .3-1.5 1-1.5 2M16 15.5v.5" />{cab}</svg>,
};
