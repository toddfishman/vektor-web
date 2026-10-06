"use client";

/* Adds class "in" once the element scrolls into view (CSS handles the animation). */
import { useEffect, useRef, useState, type ReactNode } from "react";

export function RevealList({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <ul ref={ref} className={`${className} reveal${on ? " in" : ""}`}>{children}</ul>;
}
