"use server";

import { EmotionAiProvider } from "@repo/ai";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";

function textContent(value: unknown) {
  return JSON.stringify(value);
}

export async function rebuildPublicKnowledge() {
  await requireAdminProfile();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return;
  }

  const supabase = await createClient();
  const provider = new EmotionAiProvider({
    apiKey,
    model: process.env.OPENAI_CHAT_MODEL,
  });
  const [
    { data: services },
    { data: projects },
    { data: insights },
    { data: pages },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, title, short_description, content")
      .eq("status", "published"),
    supabase
      .from("projects")
      .select("id, title, summary, content, is_seed, verified_at")
      .eq("status", "published"),
    supabase
      .from("insights")
      .select("id, title, excerpt, content")
      .eq("status", "published"),
    supabase
      .from("pages")
      .select("id, title, summary")
      .eq("status", "published"),
  ]);
  const documents = [
    ...(services || []).map((item) => ({
      content:
        (item.short_description || "") + "\n" + textContent(item.content),
      id: item.id,
      sourceType: "services",
      title: item.title,
    })),
    ...(projects || [])
      .filter((item) => !item.is_seed || item.verified_at)
      .map((item) => ({
        content: (item.summary || "") + "\n" + textContent(item.content),
        id: item.id,
        sourceType: "projects",
        title: item.title,
      })),
    ...(insights || []).map((item) => ({
      content: (item.excerpt || "") + "\n" + textContent(item.content),
      id: item.id,
      sourceType: "insights",
      title: item.title,
    })),
    ...(pages || []).map((item) => ({
      content: item.summary || item.title,
      id: item.id,
      sourceType: "pages",
      title: item.title,
    })),
  ].filter((document) => document.content.trim().length > 10);

  for (const document of documents) {
    const hash = createHash("sha256").update(document.content).digest("hex");
    const embedding = await provider.embed(document.content.slice(0, 12000));

    await supabase
      .from("knowledge_documents")
      .update({ status: "archived" })
      .eq("source_type", document.sourceType)
      .eq("source_id", document.id);
    await supabase.from("knowledge_documents").insert({
      content: document.content,
      content_hash: hash,
      embedded_at: new Date().toISOString(),
      embedding: "[" + embedding.join(",") + "]",
      metadata: { indexedBy: "admin" },
      source_id: document.id,
      source_type: document.sourceType,
      status: "published",
      title: document.title,
      visibility: "public",
    });
  }

  revalidatePath("/ai");
}
