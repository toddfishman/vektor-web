"use client";

import { useEffect, useRef, useState } from "react";
import { attachDragTilt, createLaneMap } from "./lane-map";
import { cityLabel, roadMiles } from "@/content/map-data";
import { EQUIP_LABEL, SAMPLE_LANES } from "@/content/marketing";
import { offices } from "@/content/site";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Hero: the 3D lane map with the "sample lanes" HUD. */
export function HeroMap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hi, setHi] = useState(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const wide = innerWidth > 900;
    const m = createLaneMap(cv, {
      lanes: SAMPLE_LANES, tilt: 0.95, yaw: -0.1,
      cx: wide ? (innerWidth < 1500 ? 0.735 : 0.7) : 0.5, cy: wide ? 0.64 : 0.66,
      zoom: wide ? (innerWidth < 1500 ? 0.43 : 0.47) : 1.0,
      pins: offices.map((o) => o.city),
    });
    let k = 0, user = 0;
    const show = (i: number) => { m.S.hi = i; setHi(i); };
    show(0);
    const detach = attachDragTilt(cv, m, (i) => { user = performance.now(); if (i !== m.S.hi) show(i); });
    let timer: ReturnType<typeof setInterval> | undefined;
    const onMove = (e: MouseEvent) => { if (!e.buttons) m.S.tYaw = -0.1 + (e.clientX / innerWidth - 0.5) * 0.12; };
    if (!reduced()) {
      timer = setInterval(() => { if (performance.now() - user > 6000) { k = (k + 1) % SAMPLE_LANES.length; show(k); } }, 3200);
      addEventListener("mousemove", onMove);
    }
    return () => { m.destroy(); detach(); clearInterval(timer); removeEventListener("mousemove", onMove); };
  }, []);

  const l = SAMPLE_LANES[hi];
  return (
    <>
      <canvas ref={ref} aria-hidden="true" />
      <div className="hint">Hover a lane · drag to tilt</div>
      <div className="hud" aria-live="polite">
        <div className="live">Sample lanes</div>
        <div className="lane">{cityLabel(l[0])} → {cityLabel(l[1])}</div>
        <div className="row"><span className="k">Equipment</span><span>{EQUIP_LABEL[l[2]]}</span></div>
        <div className="row"><span className="k">Distance</span><span>{roadMiles(l[0], l[1]).toLocaleString()} mi</span></div>
        <div className="row"><span className="k">Tracking</span><span>Real-time</span></div>
      </div>
    </>
  );
}

/** Offices: map with pulsing pins and the office strip underneath. */
export function OfficesMap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<ReturnType<typeof createLaneMap> | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const m = createLaneMap(cv, {
      lanes: [["Monterey", "Lakewood Ranch", "van"], ["Monterey", "Fresno", "van"], ["Monterey", "Pleasanton", "van"], ["Fresno", "Fontana", "van"]],
      tilt: 0.8, yaw: 0, pins: offices.map((o) => o.city), labels: offices.map((o) => o.city), short: true, cx: 0.5, cy: 0.52, zoom: 0.9,
    });
    mapRef.current = m;
    const detach = attachDragTilt(cv, m);
    return () => { m.destroy(); detach(); };
  }, []);

  const pick = (c: (typeof offices)[number]["city"]) => { setFocus(c); if (mapRef.current) mapRef.current.S.focus = c; };

  return (
    <>
      <div className="offmap"><canvas ref={ref} aria-hidden="true" /></div>
      <div className="offs">
        {offices.map((o) => (
          <div key={o.city} className={`off${focus === o.city ? " on" : ""}`} tabIndex={0} onMouseEnter={() => pick(o.city)} onFocus={() => pick(o.city)}>
            <div className="r">{o.role}</div>
            <h3 className="h4">{o.name}</h3>
            <p>{o.lines.map((ln) => <span key={ln}>{ln}<br /></span>)}{o.phone && <a href={`tel:${o.phone.replace(/\D/g, "")}`}>{o.phone}</a>}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/** Carriers page: all sample lanes, hover to highlight. */
export function CarrierMap() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const m = createLaneMap(cv, { lanes: SAMPLE_LANES, tilt: 0.9, yaw: 0.06, pins: offices.map((o) => o.city), cx: 0.5, cy: 0.55 });
    const detach = attachDragTilt(cv, m, (i) => { m.S.hi = i; });
    return () => { m.destroy(); detach(); };
  }, []);
  return <div className="offmap" style={{ height: "clamp(360px,48vw,600px)" }}><canvas ref={ref} aria-hidden="true" /></div>;
}
