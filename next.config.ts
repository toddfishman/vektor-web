import type { NextConfig } from "next";

const security = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // TODO: add a Content-Security-Policy once analytics/chat vendors are chosen (docs/launch-checklist.md)
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // Employee area: never cached by the CDN or the browser's shared caches.
      { source: "/team/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/team", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    // Old WordPress URLs (from the live site's navigation, Oct 2026) → new pages.
    // TODO(vektor): crawl the full live site (blog posts, etc.) before cutover and extend this.
    return [
      { source: "/about", destination: "/trust", permanent: true },
      { source: "/about-us", destination: "/trust", permanent: true },
      { source: "/our-team", destination: "/trust", permanent: true },
      { source: "/our-services", destination: "/shippers", permanent: true },
      { source: "/services/:slug*", destination: "/shippers", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
};

export default nextConfig;
