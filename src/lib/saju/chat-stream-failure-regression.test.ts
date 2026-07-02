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
    expect(route).toContain("incomplete assistant response skipped");
    expect(route).toContain("return;");
    expect(route).toContain("content: assistantText");
    expect(route).toContain("decrement_star");
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
});
