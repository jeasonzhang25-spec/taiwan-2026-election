import type { MetadataRoute } from "next";
import { COUNTY_PAGE_IDS } from "@/lib/data/county-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPages = ["", "/data-status", "/sources", "/roadmap"];
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.7 })),
    ...COUNTY_PAGE_IDS.map((id) => ({ url: `${base}/county/${id}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
