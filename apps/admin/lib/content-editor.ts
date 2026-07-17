import type { Json } from "@repo/database";
import type { CONTENT_STATUSES } from "@repo/domain";

import { createClient } from "./supabase/server";

export type Collection =
  | "insights"
  | "pages"
  | "projects"
  | "services"
  | "testimonials";

type EditorItem = {
  body: string;
  id: string;
  locale: string;
  publishedAt: string | null;
  slug: string;
  status: (typeof CONTENT_STATUSES)[number];
  summary: string;
  title: string;
  verified: boolean;
};

function bodyFromContent(content: Json) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "";
  }
  const sections = content.sections;
  if (!Array.isArray(sections)) return "";
  return sections
    .flatMap((section) => {
      if (!section || typeof section !== "object" || Array.isArray(section)) {
        return [];
      }
      return typeof section.body === "string" ? [section.body] : [];
    })
    .join("\n\n");
}

export async function getEditorItem(collection: Collection, id: string) {
  const supabase = await createClient();

  if (collection === "pages") {
    const [{ data }, { data: sections }] = await Promise.all([
      supabase
        .from("pages")
        .select("id, locale, slug, title, summary, status, published_at")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("page_sections")
        .select("content")
        .eq("page_id", id)
        .order("position"),
    ]);
    if (!data) return null;
    return {
      body: (sections || [])
        .map((section) => bodyFromContent({ sections: [section.content] }))
        .filter(Boolean)
        .join("\n\n"),
      id: data.id,
      locale: data.locale,
      publishedAt: data.published_at,
      slug: data.slug,
      status: data.status,
      summary: data.summary || "",
      title: data.title,
      verified: true,
    } satisfies EditorItem;
  }

  if (collection === "services") {
    const { data } = await supabase
      .from("services")
      .select(
        "id, locale, slug, title, short_description, content, status, published_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      body: bodyFromContent(data.content),
      id: data.id,
      locale: data.locale,
      publishedAt: data.published_at,
      slug: data.slug,
      status: data.status,
      summary: data.short_description || "",
      title: data.title,
      verified: true,
    } satisfies EditorItem;
  }

  if (collection === "projects") {
    const { data } = await supabase
      .from("projects")
      .select(
        "id, locale, slug, title, summary, content, status, published_at, verified_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      body: bodyFromContent(data.content),
      id: data.id,
      locale: data.locale,
      publishedAt: data.published_at,
      slug: data.slug,
      status: data.status,
      summary: data.summary || "",
      title: data.title,
      verified: Boolean(data.verified_at),
    } satisfies EditorItem;
  }

  if (collection === "insights") {
    const { data } = await supabase
      .from("insights")
      .select("id, locale, slug, title, excerpt, content, status, published_at")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      body: bodyFromContent(data.content),
      id: data.id,
      locale: data.locale,
      publishedAt: data.published_at,
      slug: data.slug,
      status: data.status,
      summary: data.excerpt || "",
      title: data.title,
      verified: true,
    } satisfies EditorItem;
  }

  const { data } = await supabase
    .from("testimonials")
    .select("id, person_name, quote, status, published_at, is_verified")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    body: "",
    id: data.id,
    locale: "en",
    publishedAt: data.published_at,
    slug: "testimonial-" + data.id,
    status: data.status,
    summary: data.quote,
    title: data.person_name,
    verified: data.is_verified,
  } satisfies EditorItem;
}
