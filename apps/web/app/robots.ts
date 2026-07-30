import type { MetadataRoute } from "next";

import { siteUrl } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/admin/"],
      userAgent: "*",
    },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
