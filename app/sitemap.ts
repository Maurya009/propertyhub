/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MetadataRoute } from "next";
import { getServerApiUrl } from "./lib/api";

const SITE_URL =
  process.env.SITE_URL || "https://propertyhub-ten.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/properties`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const response = await fetch(`${getServerApiUrl()}/properties`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return staticPages;
    }

    const data = await response.json();

    const properties = Array.isArray(data?.data)
  ? data.data
  : [];

    const propertyPages: MetadataRoute.Sitemap = properties
      .filter((property: any) => property?._id)
      .map((property: any) => ({
        url: `${SITE_URL}/properties/${property._id}`,
        lastModified: property.updatedAt
          ? new Date(property.updatedAt)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [...staticPages, ...propertyPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}