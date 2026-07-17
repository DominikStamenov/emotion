import type { MetadataRoute } from "next";

import { createPublicClient } from "../lib/supabase/public";

const baseUrl = "https://emotion.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/contact", "/privacy", "/cookies", "/terms"].map(
    (path) => ({
      changeFrequency: path ? ("monthly" as const) : ("weekly" as const),
      lastModified: new Date(),
      priority: path ? 0.6 : 1,
      url: baseUrl + path,
    }),
  );
  const supabase = createPublicClient();

  if (!supabase) {
    return staticRoutes;
  }

  const [services, projects, insights, pages] = await Promise.all([
    supabase.from("services").select("slug, updated_at"),
    supabase.from("projects").select("slug, updated_at"),
    supabase.from("insights").select("slug, updated_at"),
    supabase.from("pages").select("slug, updated_at"),
  ]);
  const contentRoutes = [
    ...(services.data || []).map((item) => ({
      ...item,
      path: "/services/",
    })),
    ...(projects.data || []).map((item) => ({ ...item, path: "/work/" })),
    ...(insights.data || []).map((item) => ({
      ...item,
      path: "/insights/",
    })),
    ...(pages.data || []).map((item) => ({ ...item, path: "/" })),
  ].map((item) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(item.updated_at),
    priority: 0.7,
    url: baseUrl + item.path + item.slug,
  }));

  return [...staticRoutes, ...contentRoutes];
}
