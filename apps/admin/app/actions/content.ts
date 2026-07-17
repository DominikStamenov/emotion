"use server";

import { createContentSchema, updateContentSchema } from "@repo/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";

export async function createContent(formData: FormData) {
  const profile = await requireAdminProfile();
  const result = createContentSchema.safeParse({
    collection: formData.get("collection"),
    locale: formData.get("locale") || "en",
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    title: formData.get("title"),
  });

  if (!result.success) {
    redirect("/content/new?error=Provjeri%20obavezna%20polja.");
  }

  const supabase = await createClient();
  const base = {
    created_by: profile.id,
    locale: result.data.locale,
    slug: result.data.slug,
    title: result.data.title,
    updated_by: profile.id,
  };
  let error: { message: string } | null = null;

  switch (result.data.collection) {
    case "pages": {
      const response = await supabase.from("pages").insert({
        ...base,
        summary: result.data.summary,
      });
      error = response.error;
      break;
    }
    case "services": {
      const response = await supabase.from("services").insert({
        ...base,
        short_description: result.data.summary,
      });
      error = response.error;
      break;
    }
    case "projects": {
      const response = await supabase.from("projects").insert({
        ...base,
        summary: result.data.summary,
      });
      error = response.error;
      break;
    }
    case "insights": {
      const response = await supabase.from("insights").insert({
        ...base,
        excerpt: result.data.summary,
      });
      error = response.error;
      break;
    }
    case "testimonials": {
      const response = await supabase.from("testimonials").insert({
        created_by: profile.id,
        person_name: result.data.title,
        quote: result.data.summary,
        updated_by: profile.id,
      });
      error = response.error;
      break;
    }
  }

  if (error) {
    redirect("/content/new?error=Sadržaj%20nije%20spremljen.");
  }

  revalidatePath("/content");
  redirect("/content?created=1");
}

export async function updateContent(formData: FormData) {
  const profile = await requireAdminProfile();
  const result = updateContentSchema.safeParse({
    body: formData.get("body") || undefined,
    collection: formData.get("collection"),
    id: formData.get("id"),
    locale: formData.get("locale") || "en",
    publishAt: formData.get("publishAt") || undefined,
    slug: formData.get("slug"),
    status: formData.get("status"),
    summary: formData.get("summary"),
    title: formData.get("title"),
    verified: formData.get("verified") === "on",
  });

  if (!result.success) {
    redirect("/content?error=Promjene%20nisu%20valjane.");
  }

  let publishedAt: string | null = null;

  if (result.data.status === "published") {
    publishedAt = new Date().toISOString();
  } else if (result.data.status === "scheduled") {
    const scheduled = result.data.publishAt
      ? new Date(result.data.publishAt)
      : null;

    if (!scheduled || Number.isNaN(scheduled.getTime())) {
      redirect("/content?error=Vrijeme%20objave%20nije%20valjano.");
    }

    publishedAt = scheduled.toISOString();
  }

  const canVerify = profile.role === "owner" || profile.role === "admin";
  const supabase = await createClient();
  const common = {
    locale: result.data.locale,
    published_at: publishedAt,
    slug: result.data.slug,
    status: result.data.status,
    title: result.data.title,
    updated_by: profile.id,
  };
  let error: { message: string } | null = null;

  switch (result.data.collection) {
    case "pages": {
      const response = await supabase
        .from("pages")
        .update({ ...common, summary: result.data.summary })
        .eq("id", result.data.id);
      error = response.error;
      if (!error && result.data.body) {
        const { data: section } = await supabase
          .from("page_sections")
          .select("id")
          .eq("page_id", result.data.id)
          .eq("position", 0)
          .maybeSingle();
        const sectionContent = { body: result.data.body, type: "text" };

        if (section) {
          const sectionResponse = await supabase
            .from("page_sections")
            .update({ content: sectionContent, section_type: "text" })
            .eq("id", section.id);
          error = sectionResponse.error;
        } else {
          const sectionResponse = await supabase.from("page_sections").insert({
            content: sectionContent,
            page_id: result.data.id,
            position: 0,
            section_type: "text",
          });
          error = sectionResponse.error;
        }
      }
      break;
    }
    case "services": {
      const response = await supabase
        .from("services")
        .update({
          ...common,
          content: result.data.body
            ? { sections: [{ body: result.data.body, type: "text" }] }
            : undefined,
          short_description: result.data.summary,
        })
        .eq("id", result.data.id);
      error = response.error;
      break;
    }
    case "projects": {
      const response = await supabase
        .from("projects")
        .update({
          ...common,
          content: result.data.body
            ? { sections: [{ body: result.data.body, type: "text" }] }
            : undefined,
          summary: result.data.summary,
          verified_at:
            canVerify && result.data.verified ? new Date().toISOString() : null,
        })
        .eq("id", result.data.id);
      error = response.error;
      break;
    }
    case "insights": {
      const response = await supabase
        .from("insights")
        .update({
          ...common,
          content: result.data.body
            ? { sections: [{ body: result.data.body, type: "text" }] }
            : undefined,
          excerpt: result.data.summary,
        })
        .eq("id", result.data.id);
      error = response.error;
      break;
    }
    case "testimonials": {
      const response = await supabase
        .from("testimonials")
        .update({
          is_verified: canVerify && result.data.verified,
          person_name: result.data.title,
          published_at: publishedAt,
          quote: result.data.summary,
          status: result.data.status,
          updated_by: profile.id,
        })
        .eq("id", result.data.id);
      error = response.error;
      break;
    }
  }

  if (error) {
    redirect("/content?error=Promjene%20nisu%20spremljene.");
  }

  revalidatePath("/content");
  revalidatePath("/");
  redirect("/content?saved=1");
}
