import { EmotionAiProvider, type PublicKnowledgeSource } from "@repo/ai";
import type { Json } from "@repo/database";
import {
  hasPermission,
  internalCopilotRequestSchema,
  type AppRole,
} from "@repo/domain";
import { NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseConfig } from "../../../../lib/supabase/config";
import { createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

function vectorLiteral(vector: number[]) {
  return "[" + vector.join(",") + "]";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !getPublicSupabaseConfig()) {
    return NextResponse.json(
      { error: "Internal copilot is not configured yet." },
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

  const parsed = internalCopilotRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Send a shorter, complete copilot request." },
      { status: 422 },
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", userId)
    .single();
  if (!profile?.active || !hasPermission(profile.role as AppRole, "ai:use")) {
    return NextResponse.json(
      { error: "Copilot access denied." },
      { status: 403 },
    );
  }

  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const { data: owned } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("channel", "internal")
      .eq("owner_id", profile.id)
      .maybeSingle();
    if (!owned) conversationId = undefined;
  }

  if (!conversationId) {
    const { data: conversation, error } = await supabase
      .from("ai_conversations")
      .insert({
        channel: "internal",
        metadata: { task: parsed.data.task },
        owner_id: profile.id,
      })
      .select("id")
      .single();
    if (error || !conversation) {
      return NextResponse.json(
        { error: "Copilot conversation could not be started." },
        { status: 503 },
      );
    }
    conversationId = conversation.id;
  }

  const provider = new EmotionAiProvider({
    apiKey,
    model: process.env.OPENAI_CHAT_MODEL,
  });
  const startedAt = Date.now();

  try {
    if (await provider.isFlagged(parsed.data.message)) {
      return NextResponse.json(
        { error: "The copilot cannot help with that request." },
        { status: 422 },
      );
    }

    await supabase.from("ai_messages").insert({
      content: parsed.data.message,
      conversation_id: conversationId,
      role: "user",
    });

    const embedding = await provider.embed(parsed.data.message);
    const { data: matches } = await supabase.rpc("match_knowledge_documents", {
      include_internal: true,
      match_count: 8,
      query_embedding: vectorLiteral(embedding),
      requested_locale: "en",
    });
    const knowledge: PublicKnowledgeSource[] = (matches || []).map((match) => ({
      content: match.content,
      id: match.id,
      title: match.title,
    }));

    let operationalContext = "";
    if (hasPermission(profile.role as AppRole, "crm:read")) {
      const [{ data: opportunities }, { data: inquiries }] = await Promise.all([
        supabase
          .from("opportunities")
          .select(
            "title, stage, estimated_value, currency, probability, next_step, expected_close_at",
          )
          .not("stage", "in", '("won","lost")')
          .order("updated_at", { ascending: false })
          .limit(12),
        supabase
          .from("inquiries")
          .select(
            "company, status, requested_services, budget_range, timeframe, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(12),
      ]);
      operationalContext = JSON.stringify({
        currentPipeline: opportunities || [],
        recentInquiries: inquiries || [],
      }).slice(0, 12000);
    }

    const answer = await provider.answerInternal({
      knowledge,
      operationalContext,
      question: parsed.data.message,
      task: parsed.data.task,
    });
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
        prompt_version: "internal-copilot-v1",
        role: "assistant",
      }),
      supabase
        .from("ai_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId),
    ]);

    return NextResponse.json({
      conversationId,
      message: answer.text,
      sources: citations,
    });
  } catch {
    return NextResponse.json(
      { error: "The private copilot is temporarily unavailable." },
      { status: 503 },
    );
  }
}
