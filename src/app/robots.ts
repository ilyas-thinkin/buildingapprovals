import type { MetadataRoute } from "next";

const siteUrl = "https://buildingapprovals.ae";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
