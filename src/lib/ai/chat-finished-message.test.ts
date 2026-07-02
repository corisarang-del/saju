import { describe, expect, it } from "vitest";
import { getFinishedAssistantText } from "./chat-finished-message";

describe("chat_finished_message", () => {
  it("returns_primary_finished_message_text_when_available", () => {
    expect(
      getFinishedAssistantText({
        message: {
          role: "assistant",
          parts: [{ type: "text", text: "최종 답변" }],
        },
        messages: [],
      }),
    ).toBe("최종 답변");
  });

  it("falls_back_to_latest_assistant_message_when_finished_message_has_empty_parts", () => {
    expect(
      getFinishedAssistantText({
        message: {
          role: "assistant",
          parts: [],
        },
        messages: [
          { role: "user", parts: [{ type: "text", text: "응 알려줘" }] },
          {
            role: "assistant",
            parts: [{ type: "text", text: "현철 씨, 이어서 설명할게." }],
          },
        ],
      }),
    ).toBe("현철 씨, 이어서 설명할게.");
  });

  it("supports_legacy_content_when_message_does_not_have_parts", () => {
    expect(
      getFinishedAssistantText({
        message: {
          role: "assistant",
          content: "레거시 답변",
        },
        messages: [],
      }),
    ).toBe("레거시 답변");
  });
});
