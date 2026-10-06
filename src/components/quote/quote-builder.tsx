"use client";

/*
  Quote builder: 01 Route · 02 Freight · 03 Timing · + Extras (optional) · 04 Contact.
  Asks only for what's needed to price a load (based on Turvo's shipment fields); advanced
  items stay collapsed. Conditional fields: reefer temp; LTL unit dims + class; drayage
  port/terminal and container details; hazmat UN # + class.
  Server-side validation is the same schema (src/lib/forms/schemas.ts).
*/
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createLaneMap, type Lane, type LaneMapHandle } from "@/components/map/lane-map";
import { CITIES, cityLabel, parseCity, roadMiles, type CityName } from "@/content/map-data";
import { ACCESSORIALS, EQUIP_BY_MODE, QUOTE_MODES } from "@/lib/forms/schemas";
import { ACC_NAME, EQUIP_NAME } from "@/lib/forms/turvo";
import { useSubmit } from "@/components/forms/use-submit";
import { QIC } from "./icons";

type Mode = (typeof QUOTE_MODES)[number];
type Step = "route" | "freight" | "timing" | "contact";

const MODES: [Mode, string, string][] = [
  ["ftl", "Full truckload", "A whole trailer, door to door"],
  ["partial", "Partial", "Shares a trailer, no rehandling"],
  ["ltl", "LTL", "A few pallets, priced by class"],
  ["imx", "Intermodal", "Rail for the long haul"],
  ["dray", "Drayage", "Containers to or from a port"],
  ["ded", "Dedicated", "Trucks committed to your lanes"],
];
const EQ_LABEL: Record<string, string> = { van: "Dry van", reefer: "Reefer", flat: "Flatbed", step: "Step deck", power: "Power only", any: "Not sure", c20: "20′", c40: "40′", c40h: "40′ high cube" };
const EQ_LABEL_BY_MODE: Partial<Record<Mode, Record<string, string>>> = { imx: { van: "53′ dry", reefer: "53′ reefer" }, dray: { any: "Other" } };
const FLAT_ONLY = new Set(["tarp", "straps", "oversize"]);
const CLASSES = ["50", "55", "60", "65", "70", "77.5", "85", "92.5", "100", "110", "125", "150", "175", "200", "250", "300", "400", "500"];
const PICK_TYPES = ["Business with a dock", "Business, no dock", "Residential", "Port or rail ramp", "Farm or field", "Trade show"];
const DROP_TYPES = ["Business with a dock", "Business, no dock", "Residential", "Port or rail ramp", "Distribution center", "Trade show"];
const UNIT_TYPES = ["Pallets", "Crates", "Cartons", "Drums", "Totes", "Bins", "Loose / floor-loaded"];
const HAZ = ["1 Explosives", "2 Gases", "3 Flammable liquids", "4 Flammable solids", "5 Oxidizers", "6 Toxic", "7 Radioactive", "8 Corrosive", "9 Misc."];

/** Map a service's equipment key (from the services drawer) to mode + trailer. */
const FROM_SERVICE: Record<string, [Mode, string | null]> = {
  ltl: ["ltl", null], imx: ["imx", "van"], ded: ["ded", "van"], van: ["ftl", "van"], reefer: ["ftl", "reefer"], flat: ["ftl", "flat"],
};

const empty = {
  origin: "", destination: "", stops: [] as string[], originType: PICK_TYPES[0], destinationType: DROP_TYPES[0],
  mode: "ftl" as Mode, equipment: "reefer" as string | null,
  commodity: "", weightLb: "", handlingUnits: "", handlingUnitType: UNIT_TYPES[0], tempF: "", reeferMode: "Continuous",
  l: "", w: "", h: "", freightClass: "", stackable: false,
  port: "", steamshipLine: "", containerId: "", bookingOrBol: "", lastFreeDay: "", emptyReturnBy: "",
  hazmat: false, unNumber: "", hazardClass: "",
  pickupDate: "", pickupTouched: false, deliverBy: "", frequency: "once" as "once" | "rec", loadsPer: "", loadsPeriod: "loads per week",
  accessorials: [] as string[], po: "", reference: "", orderNo: "", targetRate: "", declaredValue: "", notes: "",
  name: "", company: "", email: "", phone: "", consent: false,
};
type Q = typeof empty;

const okEmail = (v: string) => /.+@.+\..+/.test(v);

const noSubscribe = () => () => {};
function twoDaysOut() {
  const d = new Date(Date.now() + 2 * 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lanesFor(pts: CityName[], equipment: string | null): Lane[] {
  const out: Lane[] = [];
  for (let i = 0; i < pts.length - 1; i++) if (pts[i] !== pts[i + 1]) out.push([pts[i], pts[i + 1], equipment === "reefer" ? "reefer" : "van"]);
  return out;
}

function readiness(q: Q, pickup: string) {
  const list = EQUIP_BY_MODE[q.mode];
  const ltlOk = q.mode !== "ltl" || Boolean(q.handlingUnits && q.l && q.w && q.h);
  const tempOk = q.equipment !== "reefer" || Boolean(q.tempF);
  const drayOk = q.mode !== "dray" || Boolean(q.port);
  const s = {
    route: Boolean(q.origin.trim() && q.destination.trim()),
    freight: Boolean((!list.length || q.equipment) && q.commodity.trim() && q.weightLb.trim() && ltlOk && tempOk && drayOk),
    timing: Boolean(pickup),
    contact: Boolean(q.name.trim() && q.company.trim() && okEmail(q.email) && q.consent),
  };
  const miss: Record<Step, string> = {
    route: !q.origin.trim() ? "origin" : "destination",
    freight: !q.commodity.trim() ? "commodity" : !q.weightLb.trim() ? "weightLb" : !tempOk ? "tempF" : !drayOk ? "port" : !ltlOk ? (q.handlingUnits ? "l" : "handlingUnits") : "commodity",
    timing: "pickupDate",
    contact: !q.name.trim() ? "name" : !q.company.trim() ? "company" : !okEmail(q.email) ? "email" : "consent",
  };
  return { s, miss };
}

export function QuoteBuilder({ big = false, initialEq }: { big?: boolean; initialEq?: string }) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [q, setQ] = useState<Q>(() => {
    const pre = initialEq ? FROM_SERVICE[initialEq] : undefined;
    return pre ? { ...empty, mode: pre[0], equipment: pre[1] } : empty;
  });
  const [need, setNeed] = useState<string | null>(null);
  const { state, submit } = useSubmit("quote");
  const cv = useRef<HTMLCanvasElement>(null);
  const map = useRef<LaneMapHandle | null>(null);
  const laneKey = useRef("");

  const set = useCallback(<K extends keyof Q>(k: K, v: Q[K]) => { setQ((p) => ({ ...p, [k]: v })); setNeed((n) => (n === k ? null : n)); }, []);

  const setMode = useCallback((m: Mode, eq?: string | null) => setQ((p) => {
    const list = EQUIP_BY_MODE[m] as string[];
    let e = eq === undefined ? (p.equipment && list.includes(p.equipment) ? p.equipment : list[0] ?? null) : eq;
    if (!list.length) e = null;
    return { ...p, mode: m, equipment: e };
  }), []);

  // default pickup two days out; client-only so server HTML stays deterministic
  const defaultPickup = useSyncExternalStore(noSubscribe, twoDaysOut, () => "");
  const pickup = q.pickupTouched ? q.pickupDate : defaultPickup;

  // services drawer → "Quote this" on pages with the builder embedded
  useEffect(() => {
    const f = (e: Event) => { const pre = FROM_SERVICE[(e as CustomEvent<string>).detail]; if (pre) setMode(pre[0], pre[1]); };
    addEventListener("vk:quote-eq", f);
    return () => removeEventListener("vk:quote-eq", f);
  }, [setMode]);

  // lane map
  useEffect(() => {
    if (!cv.current) return;
    map.current = createLaneMap(cv.current, { lanes: [], tilt: 0.72, yaw: 0, single: true, cx: 0.5, cy: 0.6, zoom: 0.8, fit: 0.95, dot: "150,164,180" });
    return () => map.current?.destroy();
  }, []);

  const o = parseCity(q.origin), d = parseCity(q.destination);
  const stops = q.stops.map(parseCity).filter(Boolean) as CityName[];
  const segs = lanesFor(o && d ? [o, ...stops, d] : [], q.equipment);
  const laneSig = `${segs.map((g) => g[0] + ">" + g[1]).join("|")}#${q.equipment === "reefer" ? "r" : "v"}`;

  useEffect(() => {
    const m = map.current; if (!m || !segs.length || laneKey.current === laneSig) return;
    laneKey.current = laneSig;
    m.setLanes(segs); m.S.labels = [segs[0][0], segs[segs.length - 1][1]]; m.S.prog = 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { m.S.prog = 1; return; }
    let st = 0;
    const an = (n: number) => { st ||= n; m.S.prog = Math.min(1, (n - st) / 1100); if (m.S.prog < 1) requestAnimationFrame(an); };
    requestAnimationFrame(an);
  }, [laneSig]); // eslint-disable-line react-hooks/exhaustive-deps -- segs is derived from laneSig

  const mi = segs.length ? segs.reduce((a, g) => a + roadMiles(g[0], g[1]), 0) : 0;
  const days = q.mode === "dray" ? 1 : q.mode === "imx" ? Math.ceil(mi / 350) + 1 : q.mode === "ltl" ? Math.ceil(mi / 400) + 1 : Math.max(1, Math.ceil(mi / 520));
  const range = q.mode === "ltl" || q.mode === "imx";
  const laneText = segs.length
    ? `${cityLabel(o!)} → ${cityLabel(d!)}${stops.length ? ` · ${stops.length} stop${stops.length > 1 ? "s" : ""}` : ""}`
    : q.origin && q.destination ? `${q.origin} → ${q.destination}` : "Add a pickup and delivery";

  const { s, miss } = readiness(q, pickup);
  const steps: [Step, string][] = [["route", "Route"], ["freight", "Freight"], ["timing", "Timing"], ["contact", "Contact"]];
  const nDone = steps.filter(([k]) => s[k]).length;
  const all = nDone === 4;
  const firstMissing = steps.find(([k]) => !s[k]);

  const tags = [q.mode, q.equipment].filter(Boolean) as string[];
  const show = (...t: string[]) => t.some((x) => tags.includes(x));
  const eqList = EQUIP_BY_MODE[q.mode] as string[];
  const fmtDate = (v: string, o2: Intl.DateTimeFormatOptions) => new Date(v + "T12:00").toLocaleDateString(undefined, o2);

  const summary: [string, string][] = [
    ["Moves as", `${MODES.find((m) => m[0] === q.mode)![1]}${q.equipment ? ` · ${EQUIP_NAME[q.equipment]}` : ""}${q.equipment === "reefer" && q.tempF ? ` · ${q.tempF}°F` : ""}`],
    ["Freight", [q.commodity, q.weightLb ? `${(+q.weightLb.replace(/\D/g, "") || q.weightLb).toLocaleString()} lb` : "", show("ltl", "partial", "ftl", "ded", "imx") && q.handlingUnits ? `${q.handlingUnits} ${q.handlingUnitType.toLowerCase()}` : ""].filter(Boolean).join(" · ") || "—"],
    ["Pickup", pickup ? fmtDate(pickup, { weekday: "short", month: "short", day: "numeric" }) + (q.deliverBy ? ` → by ${fmtDate(q.deliverBy, { month: "short", day: "numeric" })}` : "") : "—"],
    ["Frequency", q.frequency === "once" ? "One time" : `${q.loadsPer || "?"} ${q.loadsPeriod}`],
  ];
  const acc = q.accessorials.filter((a) => !FLAT_ONLY.has(a) || ["flat", "step"].includes(q.equipment ?? ""));
  if (acc.length) summary.push(["Services", acc.map((a) => ACC_NAME[a]).join(", ")]);
  if (q.hazmat) summary.push(["Hazmat", [q.unNumber, q.hazardClass].filter(Boolean).join(" · ") || "Yes"]);

  function jump(k: Step) {
    const field = miss[k];
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(`[data-step="${k}"]`)?.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
    setNeed(field);
    setTimeout(() => document.getElementById(id(field))?.focus({ preventScroll: true }), RM ? 0 : 450);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const k = steps.find(([k]) => !s[k]);
    if (k) { jump(k[0]); return; }
    const hp = String(new FormData(e.currentTarget).get("website") ?? "");
    await submit({
      origin: q.origin, destination: q.destination, stops: q.stops.filter((x) => x.trim()),
      originType: q.originType, destinationType: q.destinationType,
      mode: q.mode, equipment: eqList.length ? q.equipment : null,
      commodity: q.commodity, weightLb: q.weightLb,
      handlingUnits: q.handlingUnits, handlingUnitType: q.handlingUnitType,
      tempF: q.equipment === "reefer" ? q.tempF : "", reeferMode: q.equipment === "reefer" ? q.reeferMode : "",
      dims: show("ltl", "partial") ? { l: q.l, w: q.w, h: q.h } : {}, freightClass: show("ltl", "partial") ? q.freightClass : "", stackable: q.stackable,
      dray: q.mode === "dray" ? { port: q.port, steamshipLine: q.steamshipLine, containerId: q.containerId, bookingOrBol: q.bookingOrBol, lastFreeDay: q.lastFreeDay, emptyReturnBy: q.emptyReturnBy } : {},
      hazmat: q.hazmat, unNumber: q.hazmat ? q.unNumber : "", hazardClass: q.hazmat ? q.hazardClass : "",
      pickupDate: pickup, deliverBy: q.deliverBy, frequency: q.frequency, loadsPer: q.loadsPer, loadsPeriod: q.loadsPeriod,
      accessorials: acc, po: q.po, reference: q.reference, orderNo: q.orderNo, targetRate: q.targetRate, declaredValue: q.declaredValue, notes: q.notes,
      name: q.name, company: q.company, email: q.email, phone: q.phone, consent: q.consent,
    }, hp);
  }

  /* --- small field helpers --- */
  const F = ({ k, label, req, hint, children, cls }: { k: string; label: string; req?: boolean; hint?: string; children: ReactNode; cls?: string }) => (
    <div className={`qfld${cls ? ` ${cls}` : ""}${need === k ? " need" : ""}`}>
      <label htmlFor={id(k)}>{label}{req && <b className="rq" aria-hidden="true"> *</b>}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
  const text = (k: keyof Q, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={id(k)} value={q[k] as string} onChange={(e) => set(k, e.target.value as never)} {...extra} />
  );
  const sel = (k: keyof Q, opts: string[], extra: React.SelectHTMLAttributes<HTMLSelectElement> = {}) => (
    <select id={id(k)} value={q[k] as string} onChange={(e) => set(k, e.target.value as never)} {...extra}>{opts.map((v) => <option key={v} value={v}>{v || "Not sure"}</option>)}</select>
  );
  const radioKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const bs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
    const i = bs.indexOf(document.activeElement as HTMLButtonElement); if (i < 0) return;
    e.preventDefault();
    const nb = bs[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length];
    nb.focus(); nb.click();
  };

  const sent = state.s === "sent";

  return (
    <section className="sec paper qsec" id="qsec">
      <div className="wrap">
        <div className="shead">
          <div><p className="tag">Quote builder</p><h2>{big ? "Get a quote." : "Get a quote in four steps."}</h2></div>
          <p className="lede">Starred fields are all we need to price it. Everything else is optional and helps us price it sharper.</p>
        </div>
        <div className="qx">
          <form className="qf" id={id("form")} noValidate aria-label="Quote request" onSubmit={onSubmit}>
            {/* 01 Route */}
            <fieldset className={`qs${s.route ? " done" : ""}`} data-step="route">
              <legend className="vh">Route</legend>
              <div className="qhd"><span className="qn">01</span><span className="qtt">Route</span><span className="qck" aria-hidden="true" /></div>
              <div className="qroute">
                {F({ k: "origin", label: "Pickup city or ZIP", req: true, children: text("origin", { list: id("cities"), autoComplete: "off", required: true, placeholder: "e.g. Salinas, CA" }) })}
                <button className="qswap" type="button" aria-label="Swap pickup and delivery" onClick={() => setQ((p) => ({ ...p, origin: p.destination, destination: p.origin }))}>⇅</button>
                {q.stops.length > 0 && (
                  <div className="qstops">
                    {q.stops.map((v, i) => (
                      <div className="qfld qstop" key={i}>
                        <label htmlFor={id(`stop${i}`)}>Stop {i + 1}</label>
                        <div className="qpair">
                          <input id={id(`stop${i}`)} list={id("cities")} value={v} placeholder="City or ZIP" autoComplete="off" onChange={(e) => setQ((p) => ({ ...p, stops: p.stops.map((x, j) => (j === i ? e.target.value : x)) }))} />
                          <button type="button" className="qx-rm" aria-label={`Remove stop ${i + 1}`} onClick={() => setQ((p) => ({ ...p, stops: p.stops.filter((_, j) => j !== i) }))}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {F({ k: "destination", label: "Delivery city or ZIP", req: true, children: text("destination", { list: id("cities"), autoComplete: "off", required: true, placeholder: "e.g. Chicago, IL" }) })}
              </div>
              {q.stops.length < 3 && <button type="button" className="qlink" onClick={() => setQ((p) => ({ ...p, stops: [...p.stops, ""] }))}>+ Add a stop</button>}
              <details className="qmore">
                <summary>Location types <span>optional</span></summary>
                <div className="qgrid2">
                  {F({ k: "originType", label: "Pickup location", children: sel("originType", PICK_TYPES) })}
                  {F({ k: "destinationType", label: "Delivery location", children: sel("destinationType", DROP_TYPES) })}
                </div>
              </details>
            </fieldset>

            {/* 02 Freight */}
            <fieldset className={`qs${s.freight ? " done" : ""}`} data-step="freight">
              <legend className="vh">Freight</legend>
              <div className="qhd"><span className="qn">02</span><span className="qtt">Freight</span><span className="qck" aria-hidden="true" /></div>
              <p className="qlbl" id={id("ql-mode")}>How should it move? <b className="rq">*</b></p>
              <div className="qcards qmodes" role="radiogroup" aria-labelledby={id("ql-mode")} onKeyDown={radioKeys}>
                {MODES.map(([k, n, dsc]) => (
                  <button key={k} type="button" role="radio" aria-checked={q.mode === k} tabIndex={q.mode === k ? 0 : -1} onClick={() => setMode(k)}>
                    {QIC[k]}<span className="n">{n}</span><span className="d">{dsc}</span>
                  </button>
                ))}
              </div>
              {eqList.length > 0 && (
                <div>
                  <p className="qlbl" id={id("ql-eq")}>Trailer <b className="rq">*</b></p>
                  <div className="qcards qeqs" role="radiogroup" aria-labelledby={id("ql-eq")} onKeyDown={radioKeys}>
                    {eqList.map((k) => (
                      <button key={k} type="button" role="radio" aria-checked={q.equipment === k} tabIndex={q.equipment === k ? 0 : -1} onClick={() => setQ((p) => ({ ...p, equipment: k }))}>
                        {QIC[k]}<span className="n">{EQ_LABEL_BY_MODE[q.mode]?.[k] ?? EQ_LABEL[k]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="qgrid2">
                {F({ k: "commodity", label: "What is it?", req: true, children: text("commodity", { placeholder: "e.g. fresh apples, boxed", required: true }) })}
                {F({ k: "weightLb", label: "Total weight", req: true, children: <div className="qunit">{text("weightLb", { inputMode: "numeric", placeholder: "40,000", required: true })}<span>lb</span></div> })}
                {show("ltl", "partial", "ftl", "ded", "imx") && F({ k: "handlingUnits", label: "Handling units", req: q.mode === "ltl", children: (
                  <div className="qpair">{text("handlingUnits", { inputMode: "numeric", placeholder: "26" })}{sel("handlingUnitType", UNIT_TYPES, { "aria-label": "Unit type", id: id("handlingUnitType") })}</div>
                ) })}
                {show("reefer") && F({ k: "tempF", label: "Temperature", req: true, children: (
                  <div className="qpair"><div className="qunit">{text("tempF", { inputMode: "numeric", placeholder: "34" })}<span>°F</span></div>{sel("reeferMode", ["Continuous", "Cycle"], { "aria-label": "Reefer mode", id: id("reeferMode") })}</div>
                ) })}
              </div>
              {show("ltl", "partial") && (
                <div className="qblock">
                  <p className="qlbl">Size of each unit {q.mode === "ltl" && <b className="rq">*</b>}</p>
                  <div className="qgrid4">
                    {F({ k: "l", label: "Length", children: <div className="qunit">{text("l", { inputMode: "numeric", placeholder: "48" })}<span>in</span></div> })}
                    {F({ k: "w", label: "Width", children: <div className="qunit">{text("w", { inputMode: "numeric", placeholder: "40" })}<span>in</span></div> })}
                    {F({ k: "h", label: "Height", children: <div className="qunit">{text("h", { inputMode: "numeric", placeholder: "60" })}<span>in</span></div> })}
                    {F({ k: "freightClass", label: "Freight class", children: sel("freightClass", ["", ...CLASSES]) })}
                  </div>
                  <label className="qchk"><input type="checkbox" checked={q.stackable} onChange={(e) => set("stackable", e.target.checked)} /> Units can be stacked</label>
                </div>
              )}
              {show("dray") && (
                <div className="qblock">
                  <p className="qlbl">Container details</p>
                  <div className="qgrid2">
                    {F({ k: "port", label: "Port or terminal", req: true, children: text("port", { placeholder: "e.g. Port of Oakland, OICT" }) })}
                    {F({ k: "steamshipLine", label: "Steamship line", children: text("steamshipLine", { placeholder: "e.g. Maersk" }) })}
                    {F({ k: "containerId", label: "Container #", children: text("containerId", { placeholder: "MSCU 1234567" }) })}
                    {F({ k: "bookingOrBol", label: "Booking or bill of lading #", children: text("bookingOrBol") })}
                    {F({ k: "lastFreeDay", label: "Last free day", children: text("lastFreeDay", { type: "date" }) })}
                    {F({ k: "emptyReturnBy", label: "Empty return by", children: text("emptyReturnBy", { type: "date" }) })}
                  </div>
                </div>
              )}
              <label className="qchk"><input type="checkbox" checked={q.hazmat} onChange={(e) => set("hazmat", e.target.checked)} /> This is hazardous material</label>
              {q.hazmat && (
                <div className="qgrid2 qhzf">
                  {F({ k: "unNumber", label: "UN number", children: text("unNumber", { placeholder: "UN1203" }) })}
                  {F({ k: "hazardClass", label: "Hazard class", children: <select id={id("hazardClass")} value={q.hazardClass} onChange={(e) => set("hazardClass", e.target.value)}><option value="">Select</option>{HAZ.map((h) => <option key={h}>{h}</option>)}</select> })}
                </div>
              )}
            </fieldset>

            {/* 03 Timing */}
            <fieldset className={`qs${s.timing ? " done" : ""}`} data-step="timing">
              <legend className="vh">Timing</legend>
              <div className="qhd"><span className="qn">03</span><span className="qtt">Timing</span><span className="qck" aria-hidden="true" /></div>
              <div className="qgrid2">
                {F({ k: "pickupDate", label: "Pickup date", req: true, children: <input id={id("pickupDate")} type="date" required value={pickup} onChange={(e) => setQ((p) => ({ ...p, pickupDate: e.target.value, pickupTouched: true }))} /> })}
                {F({ k: "deliverBy", label: "Deliver by", hint: "Leave blank if flexible", children: text("deliverBy", { type: "date" }) })}
              </div>
              <p className="qlbl" id={id("ql-freq")}>How often?</p>
              <div className="qseg" role="radiogroup" aria-labelledby={id("ql-freq")} onKeyDown={radioKeys}>
                {(["once", "rec"] as const).map((f) => (
                  <button key={f} type="button" role="radio" aria-checked={q.frequency === f} tabIndex={q.frequency === f ? 0 : -1} onClick={() => set("frequency", f)}>{f === "once" ? "One time" : "Recurring"}</button>
                ))}
              </div>
              {q.frequency === "rec" && (
                <div className="qfreqn"><div className="qpair">
                  <input value={q.loadsPer} onChange={(e) => set("loadsPer", e.target.value)} inputMode="numeric" placeholder="3" aria-label="Number of loads" />
                  <select value={q.loadsPeriod} onChange={(e) => set("loadsPeriod", e.target.value)} aria-label="Per"><option>loads per week</option><option>loads per month</option></select>
                </div></div>
              )}
            </fieldset>

            {/* + Extras */}
            <fieldset className="qs qopt" data-step="extras">
              <legend className="vh">Extras</legend>
              <div className="qhd"><span className="qn">+</span><span className="qtt">Extras</span><span className="qopt-t">optional</span></div>
              <details className="qmore">
                <summary>Services, reference numbers or a target rate</summary>
                <p className="qlbl">Services</p>
                <div className="qchips">
                  {ACCESSORIALS.filter((a) => !FLAT_ONLY.has(a) || ["flat", "step"].includes(q.equipment ?? "")).map((a) => (
                    <button key={a} type="button" aria-pressed={q.accessorials.includes(a)}
                      onClick={() => setQ((p) => ({ ...p, accessorials: p.accessorials.includes(a) ? p.accessorials.filter((x) => x !== a) : [...p.accessorials, a] }))}>
                      {ACC_NAME[a]}
                    </button>
                  ))}
                </div>
                <div className="qgrid2">
                  {F({ k: "po", label: "PO #", children: text("po") })}
                  {F({ k: "reference", label: "Your reference #", children: text("reference") })}
                  {F({ k: "orderNo", label: "Order #", children: text("orderNo") })}
                  {F({ k: "targetRate", label: "Target rate", children: <div className="qunit pre"><span>$</span>{text("targetRate", { inputMode: "numeric", placeholder: "All-in" })}</div> })}
                  {F({ k: "declaredValue", label: "Declared value", hint: "Only if you need extra coverage", children: <div className="qunit pre"><span>$</span>{text("declaredValue", { inputMode: "numeric" })}</div> })}
                  {F({ k: "notes", label: "Anything else?", cls: "full", children: <textarea id={id("notes")} rows={2} placeholder="Dock hours, special handling…" value={q.notes} onChange={(e) => set("notes", e.target.value)} /> })}
                </div>
              </details>
            </fieldset>

            {/* 04 Contact */}
            <fieldset className={`qs${s.contact ? " done" : ""}`} data-step="contact">
              <legend className="vh">Contact</legend>
              <div className="qhd"><span className="qn">04</span><span className="qtt">Contact</span><span className="qck" aria-hidden="true" /></div>
              <div className="qgrid2">
                {F({ k: "name", label: "Your name", req: true, children: text("name", { autoComplete: "name", required: true }) })}
                {F({ k: "company", label: "Company", req: true, children: text("company", { autoComplete: "organization", required: true }) })}
                {F({ k: "email", label: "Email", req: true, children: text("email", { type: "email", autoComplete: "email", required: true }) })}
                {F({ k: "phone", label: "Phone", hint: "For a faster callback", children: text("phone", { type: "tel", autoComplete: "tel" }) })}
              </div>
              <label className={`qchk${need === "consent" ? " need" : ""}`}>
                <input type="checkbox" id={id("consent")} checked={q.consent} onChange={(e) => set("consent", e.target.checked)} />
                I agree that Vektor may store this information to prepare my quote. <b className="rq">*</b>
              </label>
              <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            </fieldset>
          </form>

          <aside className="qside" aria-label="Quote summary">
            <div className="qm">
              <canvas ref={cv} aria-hidden="true" />
              <div className="qmo"><span className="mono" style={{ color: "var(--sodium)" }}>Your lane</span><div className="lane">{laneText}</div></div>
              <div className="qstat">
                <div><span className="mono">Road miles</span><b>{mi ? mi.toLocaleString() : "—"}</b></div>
                <div><span className="mono">Est. transit</span><b>{mi ? `${range ? `${days}–${days + 1}` : days}${days > 1 || range ? " days" : " day"}` : "—"}</b></div>
                <div><span className="mono">Tracking</span><b>Live</b></div>
              </div>
            </div>
            <div className="qr">
              <dl className="qsum">{summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <ol className="qready">
                {steps.map(([k, t], i) => (
                  <li key={k} className={s[k] ? "ok" : undefined}>
                    <button type="button" onClick={() => jump(k)}><span>{s[k] ? "✓" : `0${i + 1}`}</span>{t}</button>
                  </li>
                ))}
              </ol>
              {!sent && (
                <button className="btn qgo" type="submit" form={id("form")} aria-disabled={!all || state.s === "sending"} disabled={state.s === "sending"}>
                  {state.s === "sending" ? "Sending…" : all ? "Request my quote" : `${nDone} of 4 steps done`} <i className="ar" />
                </button>
              )}
              {!sent && <p className="qnote">{all ? "Miles and transit are planning estimates. A Vektor rep confirms the rate." : `Next: finish ${firstMissing![1].toLowerCase()}.`}</p>}
              {state.s === "error" && <p className="qnote err" role="alert">{state.message}</p>}
              {sent && (
                <div className="qdone" role="status">
                  <span className="mono" style={{ color: "var(--go)" }}>Request received</span>
                  <b>{state.id}</b>
                  <p>Thanks, {q.name.split(" ")[0]}. A Vektor rep is pricing {laneText} and will reply to {q.email}{q.phone ? ` or call ${q.phone}` : ""}. Your rate will come with an expiration date.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
        <datalist id={id("cities")}>{(Object.keys(CITIES) as CityName[]).map((c) => <option key={c} value={cityLabel(c)} />)}</datalist>
      </div>
    </section>
  );
}
