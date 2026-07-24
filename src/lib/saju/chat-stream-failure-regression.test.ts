import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("chat_stream_failure_regression", () => {
  it("uses_ui_message_stream_errors_instead_of_empty_text_streams", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");
    const room = readProjectFile("src/components/saju/chat/ChatRoom.tsx");

    expect(route).toContain("toUIMessageStreamResponse");
    expect(route).toContain("getUserFacingChatErrorMessage");
    expect(route).toContain("serializeChatProviderError");
    expect(route).not.toContain("toTextStreamResponse");
    expect(room).toContain("DefaultChatTransport");
    expect(room).not.toContain("TextStreamChatTransport");
  });

  it("does_not_persist_or_charge_incomplete_assistant_answers_as_success", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(route).toContain("const assistantText = text.trim()");
    expect(route).toContain("shouldPersistAssistantAnswer");
    expect(route).toContain("finishReason === \"error\"");
    expect(route).toContain("finishReason === \"length\"");
    expect(route).toContain("incomplete assistant response skipped");
    expect(route).toContain("return;");
    expect(route).toContain("content: params.assistantText");
    expect(route).toContain("reserve_chat_star");
    expect(route).toContain("refund_chat_star");
    expect(route).not.toContain("decrement_star");
  });

  it("shows_recoverable_quota_error_and_retry_copy_on_the_client", () => {
    const room = readProjectFile("src/components/saju/chat/ChatRoom.tsx");

    expect(room).toContain("지금 AI 응답 한도가 잠시 막혔어");
    expect(room).toContain("getUserFacingChatErrorMessage");
    expect(room).toContain("retryInitialAnalysis");
  });

  it("renders_stream_error_or_empty_assistant_messages_as_visible_chat_copy", () => {
    const bubble = readProjectFile("src/components/saju/chat/ChatBubble.tsx");

    expect(bubble).toContain("getUiMessageDisplayText");
  });

  it("does_not_decrement_client_star_balance_when_stream_finishes_with_incomplete_answer", () => {
    const room = readProjectFile("src/components/saju/chat/ChatRoom.tsx");

    expect(room).toContain("getChatCompletionFailureMessage");
    expect(room).toContain("getFinishedAssistantText");
    expect(room).toContain("isError");
    expect(room).toContain("finishReason");
    expect(room).toContain("if (failureMessage)");
  });

  it("marks_successful_first_chat_as_used_so_follow_ups_are_not_treated_as_first_consultations", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(route).toContain("chat_used: reading.chat_used + 1");
    expect(route).toContain(".from(\"saju_readings\")");
    expect(route).toContain(".update({ chat_used:");
  });

  it("creates_coaching_snapshot_only_after_successful_first_assistant_message_persist", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");
    const assistantInsertIndex = route.indexOf("const { data: assistantMessage, error: assistantInsertError }");
    const snapshotIndex = route.indexOf(".from(\"coaching_snapshots\")");
    const chatUsedIndex = route.indexOf("chat_used: reading.chat_used + 1");

    expect(route).toContain("createCoachingSnapshot");
    expect(route).toContain("reading.chat_used === 0 && params.isInitialAnalysis");
    expect(route).toContain("failed to create coaching snapshot");
    expect(route).toContain("return;");
    expect(assistantInsertIndex).toBeGreaterThan(-1);
    expect(snapshotIndex).toBeGreaterThan(assistantInsertIndex);
    expect(chatUsedIndex).toBeGreaterThan(snapshotIndex);
  });

  it("prevalidates_first_consultation_before_streaming_any_assistant_text", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");
    const firstConsultationIndex = route.indexOf("if (isInitialAnalysisRequest)");
    const generateInitialIndex = route.indexOf("generateValidatedInitialAnalysis({", firstConsultationIndex);
    const uiStreamIndex = route.indexOf("return createPrevalidatedAssistantStreamResponse");
    const streamTextIndex = route.indexOf("streamText({");

    expect(route).toContain("MAX_INITIAL_ANALYSIS_ATTEMPTS");
    expect(route).toContain("generateValidatedInitialAnalysis");
    expect(route).toContain("buildInitialAnalysisRetryPrompt");
    expect(route).toContain("buildSafeInitialAnalysisFallback");
    expect(route).toContain("createPrevalidatedAssistantStreamResponse");
    expect(route).toContain("Initial analysis failed quality gate");
    expect(route).toContain("fallbackText");
    expect(route).toContain("finishReason: \"stop\"");
    expect(firstConsultationIndex).toBeGreaterThan(-1);
    expect(generateInitialIndex).toBeGreaterThan(firstConsultationIndex);
    expect(uiStreamIndex).toBeGreaterThan(generateInitialIndex);
    expect(streamTextIndex).toBeGreaterThan(uiStreamIndex);
  });

  it("instructs_every_chat_answer_to_stay_korean_even_when_source_context_has_astrology_terms", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(route).toContain("모든 답변은 한국어로만 작성해");
    expect(route).toContain("영어 번역이나 영어 병기를 넣지 마");
    expect(route).toContain("Western Astrology");
    expect(route).toContain("Ascendant");
    expect(route).toContain("Children's Palace");
  });

  it("carries_partner_context_into_hana_initial_consultation_and_fallback", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(route).toContain("let compatibilityPartnerName: string | null = null");
    expect(route).toContain(".order(\"created_at\", { ascending: false })");
    expect(route).toContain(".maybeSingle()");
    expect(route).toContain("compatibilityPartnerName = String(compat.partner_name || \"\").trim() || null");
    expect(route).toContain("첫 답변부터 반드시");
    expect(route).toContain("두 사람을 함께 언급");
    expect(route).toContain("사용자가 \"내 사주\"라고 물어도");
    expect(route).toContain("partnerName: compatibilityPartnerName");
  });
});
