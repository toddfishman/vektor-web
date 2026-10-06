import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const PATHS = ["", "/shippers", "/carriers", "/partnerships", "/quote", "/careers", "/trust", "/customers", "/contact", "/refer", "/privacy", "/terms", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : p === "/quote" ? 0.9 : 0.7 }));
}
