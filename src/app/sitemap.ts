import type { MetadataRoute } from "next";

const siteUrl = "https://buildingapprovals.ae";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/services",
    ...serviceIds.map((id) => `/services/${id}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
  }));

  return routes;
}
