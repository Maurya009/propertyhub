import type { MetadataRoute } from "next";
import { site } from "./lib/site";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PropertyLite = { _id: string; updatedAt?: string };

async function getProperties(): Promise<PropertyLite[]> {
  try {
    const res = await fetch(`${API_URL}/properties`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getProperties();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${site.url}/properties/${p._id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
