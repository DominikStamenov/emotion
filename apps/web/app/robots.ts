import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/admin/"],
      userAgent: "*",
    },
    sitemap: "https://emotion.com/sitemap.xml",
  };
}
