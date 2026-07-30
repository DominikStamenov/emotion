import {
  EmotionAiProvider,
  type ConversationMessage,
  type PublicKnowledgeSource,
} from "@repo/ai";
import type { Json } from "@repo/database";
import {
  aiChatRequestSchema,
  getForwardedClientAddress,
  hasInvalidRequestOrigin,
  hasOversizedRequestBody,
} from "@repo/domain";
import { createHmac, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

const SESSION_COOKIE = "emotion_ai_session";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const configuredContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const coreKnowledge: PublicKnowledgeSource = {
  content: [
    "eMotion is a digital agency combining strategy, branding, digital design, development, motion and applied AI.",
    configuredSiteUrl
      ? "The current public website is " + configuredSiteUrl + "."
      : "",
    configuredContactEmail
      ? "The public contact address is " + configuredContactEmail + "."
      : "",
    "Project examples and testimonials currently shown on the website are temporary seed content and must not be presented as verified client claims.",
    "A project conversation can be started through the structured brief at /contact.",
  ]
    .filter(Boolean)
    .join(" "),
  id: "emotion-core",
  title: "eMotion approved public facts",
};

function hashValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function vectorLiteral(vector: number[]) {
  return "[" + vector.join(",") + "]";
}

function jsonToText(value: Json) {
  return JSON.stringify(value).slice(0, 3500);
}

export async function POST(request: NextRequest) {
  if (hasOversizedRequestBody(request, 20_000)) {
    return NextResponse.json(
      { error: "Request is too large." },
      { status: 413 },
    );
  }

  if (hasInvalidRequestOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const hashSecret = process.env.IP_HASH_SECRET;

  if (!apiKey || !hashSecret || hashSecret.length < 32) {
    return NextResponse.json(
      { error: "AI concierge is not configured yet." },
      { status: 503 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = aiChatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please send a shorter, complete question." },
      { status: 422 },
    );
  }

  const sessionValue =
    request.cookies.get(SESSION_COOKIE)?.value ||
    randomBytes(24).toString("hex");
  const sessionHash = hashValue(sessionValue, hashSecret);
  const sessionRateLimitKey = hashValue("session:" + sessionValue, hashSecret);
  const addressRateLimitKey = hashValue(
    "address:" + getForwardedClientAddress(request),
    hashSecret,
  );
  const supabase = createAdminClient();
  const [sessionLimit, addressLimit] = await Promise.all([
    supabase.rpc("consume_rate_limit", {
      p_action: "public_ai_chat",
      p_key_hash: sessionRateLimitKey,
      p_max_requests: 30,
      p_window_seconds: 3600,
    }),
    supabase.rpc("consume_rate_limit", {
      p_action: "public_ai_chat",
      p_key_hash: addressRateLimitKey,
      p_max_requests: 120,
      p_window_seconds: 3600,
    }),
  ]);

  const rateLimitError = sessionLimit.error || addressLimit.error;
  const allowed = sessionLimit.data && addressLimit.data;

  if (rateLimitError || !allowed) {
    return NextResponse.json(
      { error: "The concierge needs a short pause. Please try again later." },
      {
        headers: rateLimitError ? undefined : { "Retry-After": "3600" },
        status: rateLimitError ? 503 : 429,
      },
    );
  }

  let conversationId = parsed.data.conversationId;

  if (conversationId) {
    const { data: ownedConversation } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("visitor_session_hash", sessionHash)
      .maybeSingle();

    if (!ownedConversation) {
      conversationId = undefined;
    }
  }

  if (!conversationId) {
    const { data: conversation, error } = await supabase
      .from("ai_conversations")
      .insert({
        channel: "web",
        metadata: { locale: "en" },
        visitor_session_hash: sessionHash,
      })
      .select("id")
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: "The conversation could not be started." },
        { status: 503 },
      );
    }

    conversationId = conversation.id;
  }

  await supabase.from("ai_messages").insert({
    content: parsed.data.message,
    conversation_id: conversationId,
    role: "user",
  });

  const provider = new EmotionAiProvider({
    apiKey,
    model: process.env.OPENAI_CHAT_MODEL,
  });
  const startedAt = Date.now();

  try {
    if (await provider.isFlagged(parsed.data.message)) {
      const safeReply =
        "I cannot help with that request. I can still answer questions about eMotion services, process or starting a project.";

      await Promise.all([
        supabase.from("ai_messages").insert({
          content: safeReply,
          conversation_id: conversationId,
          role: "assistant",
          safety: { flaggedInput: true },
        }),
        supabase
          .from("ai_conversations")
          .update({ status: "blocked" })
          .eq("id", conversationId),
      ]);

      const response = NextResponse.json({
        conversationId,
        message: safeReply,
        sources: [],
      });
      response.cookies.set(SESSION_COOKIE, sessionValue, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
      return response;
    }

    const embedding = await provider.embed(parsed.data.message);
    const [{ data: matches }, { data: services }, { data: history }] =
      await Promise.all([
        supabase.rpc("match_knowledge_documents", {
          include_internal: false,
          match_count: 6,
          query_embedding: vectorLiteral(embedding),
          requested_locale: "en",
        }),
        supabase
          .from("services")
          .select("id, title, short_description, content")
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .order("position")
          .limit(6),
        supabase
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .in("role", ["user", "assistant"])
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

    const knowledge: PublicKnowledgeSource[] = [
      coreKnowledge,
      ...(matches || []).map((match) => ({
        content: match.content,
        id: match.id,
        title: match.title,
      })),
      ...(services || []).map((service) => ({
        content:
          (service.short_description || "") +
          "\n" +
          jsonToText(service.content),
        id: service.id,
        title: service.title,
      })),
    ].slice(0, 9);
    const messages = (history || []).reverse().map((message) => ({
      content: message.content,
      role: message.role as ConversationMessage["role"],
    }));
    const answer = await provider.answer({ knowledge, messages });
    const citations = knowledge.map((source, index) => ({
      id: source.id,
      index: index + 1,
      title: source.title,
    }));

    await Promise.all([
      supabase.from("ai_messages").insert({
        citations: citations as Json,
        content: answer.text,
        conversation_id: conversationId,
        input_tokens: answer.inputTokens,
        latency_ms: Date.now() - startedAt,
        model: answer.model,
        output_tokens: answer.outputTokens,
        prompt_version: "public-concierge-v1",
        role: "assistant",
      }),
      supabase
        .from("ai_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId),
    ]);

    const response = NextResponse.json({
      conversationId,
      message: answer.text,
      sources: citations,
    });
    response.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          "The concierge is temporarily unavailable. Please use the project contact form.",
      },
      { status: 503 },
    );
  }
}
