/*
  Canvas lane-map renderer (ported from the prototype). Framework-free on purpose:
  React components own one instance each via useLaneMap and call destroy() on unmount.
  Colors come from the theme tokens (--map-a, --map-a2, --map-b, --map-dot) so a reskin
  recolors the maps too.
*/
import { CITIES, MAP_POINTS, cityLabel, type CityName } from "@/content/map-data";

export type Lane = [CityName, CityName, string];

export type LaneMapOptions = {
  lanes?: Lane[];
  tilt?: number;
  yaw?: number;
  zoom?: number;
  cx?: number;
  cy?: number;
  fit?: number;
  single?: boolean;
  short?: boolean;
  pins?: CityName[];
  labels?: CityName[];
  dot?: string;
};

export type LaneMapState = {
  tilt: number; yaw: number; tYaw: number; tTilt: number; zoom: number; cx: number; cy: number;
  lanes: Lane[]; hi: number; prog: number; focus: CityName | null; pins: CityName[]; labels: CityName[];
};

export type LaneMapHandle = ReturnType<typeof createLaneMap>;

const prefersReducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function themeColors(el: Element) {
  const cs = getComputedStyle(el);
  const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
  return {
    a: v("--map-a", "255,107,91"),
    a2: v("--map-a2", "255,138,125"),
    b: v("--map-b", "255,194,184"),
    dot: v("--map-dot", "138,152,168"),
    mono: v("--fm", "monospace"),
  };
}

export function createLaneMap(cv: HTMLCanvasElement, o: LaneMapOptions = {}) {
  const ctx = cv.getContext("2d")!;
  const RM = prefersReducedMotion();
  const COL = themeColors(cv);
  let W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now(), vis = true;
  const S: LaneMapState = {
    tilt: o.tilt ?? 0.95, yaw: o.yaw ?? -0.08, tYaw: o.yaw ?? -0.08, tTilt: o.tilt ?? 0.95,
    zoom: o.zoom ?? 1, cx: o.cx ?? 0.5, cy: o.cy ?? 0.52, lanes: o.lanes || [], hi: -1, prog: 1,
    focus: null, pins: o.pins || [], labels: o.labels || [],
  };
  const parts: { i: number; t: number; s: number }[] = [];

  function setLanes(l: Lane[]) {
    S.lanes = l;
    parts.length = 0;
    l.forEach((_, i) => {
      const n = o.single ? 1 : 2;
      for (let k = 0; k < n; k++) parts.push({ i, t: Math.random(), s: 0.06 + Math.random() * 0.05 });
    });
  }
  setLanes(S.lanes);

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
  }

  /** map coords -> screen [x, y, depth] */
  function P(x: number, y: number, z: number): [number, number, number] {
    const X = x - 500, Y = y - 300;
    const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw);
    const X2 = X * cyw - Y * syw, Y2 = X * syw + Y * cyw;
    const ct = Math.cos(S.tilt), st = Math.sin(S.tilt);
    const y3 = Y2 * ct - z * st, z3 = Y2 * st + z * ct;
    const k = Math.min(W / 1000, H / (620 * Math.max(0.55, ct))) * S.zoom * (o.fit || 1), f = 1100, d = f / (f + z3);
    return [W * S.cx + X2 * k * d, H * S.cy + y3 * k * d, d];
  }

  function arcPts(a: CityName, b: CityName, n = 48) {
    const A = CITIES[a], B = CITIES[b], L = Math.hypot(B.x - A.x, B.y - A.y), h = Math.min(200, L * 0.34);
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(P(A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t, -Math.sin(Math.PI * t) * h));
    }
    return pts;
  }

  function frame(now: number) {
    if (!vis) { raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    S.yaw += (S.tYaw - S.yaw) * 0.06; S.tilt += (S.tTilt - S.tilt) * 0.06;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);

    // dot grid
    const base = o.dot || COL.dot;
    const kk = Math.min(W / 1000, H / (620 * Math.max(0.55, Math.cos(S.tilt)))) * S.zoom * (o.fit || 1);
    for (let i = 0; i < MAP_POINTS.length; i += 2) {
      const p = P(MAP_POINTS[i], MAP_POINTS[i + 1], 0);
      const s = Math.max(1.1, 2.6 * kk * p[2]);
      ctx.fillStyle = `rgba(${base},${Math.min(0.75, 0.4 + 0.35 * (p[2] - 0.85))})`;
      ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
    }

    // lanes
    const arcs = S.lanes.map((l) => arcPts(l[0], l[1]));
    arcs.forEach((pts, i) => {
      const hi = i === S.hi, m = Math.max(2, Math.round(pts.length * S.prog));
      ctx.beginPath();
      for (let j = 0; j < m; j++) { const p = pts[j]; if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = hi || o.single ? `rgba(${COL.a2},.95)` : `rgba(${COL.b},${S.hi >= 0 ? 0.14 : 0.32})`;
      ctx.lineWidth = hi || o.single ? 2.4 : 1.2; ctx.stroke();
      if (hi || o.single) { ctx.strokeStyle = `rgba(${COL.a},.25)`; ctx.lineWidth = 9; ctx.stroke(); }
    });

    // particles
    if (S.prog >= 1) parts.forEach((pt) => {
      if (!RM) pt.t = (pt.t + pt.s * dt * (o.single ? 1.6 : 1)) % 1;
      const pts = arcs[pt.i]; if (!pts || pts.length < 2 || !(pt.t >= 0)) return;
      const hi = pt.i === S.hi || o.single;
      const idx = pt.t * (pts.length - 1), j = Math.floor(idx);
      for (let k = 0; k < 10; k++) {
        const q = pts[Math.max(0, j - k)]; if (!q) continue;
        ctx.fillStyle = `rgba(${hi ? COL.a2 : COL.b},${(1 - k / 10) * (hi ? 0.9 : 0.55)})`;
        const r = (hi ? 3.4 : 2.2) * (1 - k / 12) * q[2];
        ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.fill();
      }
      const h = pts[j]; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(h[0], h[1], (hi ? 3 : 2) * h[2], 0, 7); ctx.fill();
    });

    // office pins
    const ph = (now / 1000) % 2;
    S.pins.forEach((c) => {
      const C = CITIES[c]; if (!C) return;
      const p = P(C.x, C.y, 0); const on = S.focus === c;
      if (!RM) { ctx.strokeStyle = `rgba(${COL.a},${(1 - ph / 2) * 0.8})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 4 + ph * (on ? 16 : 10), 0, 7); ctx.stroke(); }
      ctx.fillStyle = `rgb(${COL.a})`; ctx.beginPath(); ctx.arc(p[0], p[1], on ? 6.5 : 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p[0], p[1], on ? 2.5 : 1.8, 0, 7); ctx.fill();
    });

    // endpoints + labels
    const ends = new Set<CityName>(); S.lanes.forEach((l) => { ends.add(l[0]); ends.add(l[1]); });
    ends.forEach((c) => {
      if (S.pins.includes(c)) return;
      const C = CITIES[c]; const p = P(C.x, C.y, 0);
      ctx.fillStyle = `rgba(${COL.b},.9)`; ctx.beginPath(); ctx.arc(p[0], p[1], 2.4 * p[2], 0, 7); ctx.fill();
    });
    const lab = [...S.labels]; if (S.hi >= 0 && S.lanes[S.hi]) lab.push(S.lanes[S.hi][0], S.lanes[S.hi][1]);
    ctx.font = `600 ${W < 600 ? 10 : 11.5}px ${COL.mono}`;
    lab.forEach((c) => {
      const C = CITIES[c]; if (!C) return;
      const p = P(C.x, C.y, 0); const t = (o.short ? c : cityLabel(c)).toUpperCase(); const w = ctx.measureText(t).width;
      const x = Math.min(W - w - 18, Math.max(8, p[0] + 10)), y = p[1] - 12;
      ctx.fillStyle = "rgba(10,10,10,.78)"; ctx.fillRect(x - 6, y - 12, w + 12, 18);
      ctx.fillStyle = "#fff"; ctx.fillText(t, x, y + 1);
    });
    raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; });
  io.observe(cv);
  resize();
  addEventListener("resize", resize);
  raf = requestAnimationFrame(frame);

  return {
    S, setLanes, resize,
    pick(mx: number, my: number) {
      let best = -1, bd = 40;
      S.lanes.forEach((l, i) => arcPts(l[0], l[1], 24).forEach((p) => {
        const d = Math.hypot(p[0] - mx, p[1] - my); if (d < bd) { bd = d; best = i; }
      }));
      return best;
    },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", resize); },
  };
}

/** Drag to tilt/rotate; optional hover-to-highlight a lane (mouse only). Returns a cleanup. */
export function attachDragTilt(cv: HTMLCanvasElement, m: LaneMapHandle, hover?: (i: number) => void) {
  let down: { x: number; y: number; yaw: number; tilt: number } | null = null;
  const pd = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, yaw: m.S.tYaw, tilt: m.S.tTilt }; cv.setPointerCapture(e.pointerId); };
  const pu = () => { down = null; };
  const pm = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    if (down && e.pointerType !== "touch") {
      m.S.tYaw = down.yaw + (e.clientX - down.x) * 0.003;
      m.S.tTilt = Math.max(0.35, Math.min(1.15, down.tilt + (e.clientY - down.y) * 0.003));
      return;
    }
    if (hover && e.pointerType === "mouse") { const i = m.pick(e.clientX - r.left, e.clientY - r.top); if (i >= 0) hover(i); }
  };
  cv.addEventListener("pointerdown", pd); cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu); cv.addEventListener("pointermove", pm);
  return () => { cv.removeEventListener("pointerdown", pd); cv.removeEventListener("pointerup", pu); cv.removeEventListener("pointercancel", pu); cv.removeEventListener("pointermove", pm); };
}
