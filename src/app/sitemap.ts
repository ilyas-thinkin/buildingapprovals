import type { MetadataRoute } from "next";

const siteUrl = "https://www.buildingapprovals.ae";

const serviceIds = [
  "civil-defense",
  "dewa",
  "dubai-municipality",
  "emaar",
  "nakheel",
  "food-control",
  "jafza",
  "dha",
  "dso",
  "dda",
  "signage",
  "spa",
  "shisha",
  "smoking",
  "pool",
  "solar",
  "tent",
  "rta",
  "tecom",
  "tpc",
  "trakhees",
];

const blogSlugs = [
  "dubai-municipality-approval-process-2026",
  "dubai-municipality-approvals-2026-updated-rules",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Main pages with higher priority
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/services`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Service pages
  const servicePages: MetadataRoute.Sitemap = serviceIds.map((id) => ({
    url: `${siteUrl}/services/${id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...mainPages, ...servicePages, ...blogPages];
}
