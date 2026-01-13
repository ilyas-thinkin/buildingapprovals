import type { MetadataRoute } from "next";

const siteUrl = "https://www.buildingapprovals.ae";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog/", "/images/"],
        disallow: ["/api/", "/api/*"],
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/images/", "/blog/"],
        disallow: [],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/blog/", "/images/"],
        disallow: ["/api/", "/api/*"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
