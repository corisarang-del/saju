import { describe, expect, it } from "vitest";
import { getUiMessageDisplayText } from "./ui-message-display";

describe("ui_message_display", () => {
  it("returns_combined_text_when_message_has_text_parts", () => {
    expect(
      getUiMessageDisplayText({
        role: "assistant",
        parts: [
          { type: "text", text: "첫 문장" },
          { type: "text", text: "\n둘째 문장" },
        ],
      }),
    ).toBe("첫 문장\n둘째 문장");
  });

  it("returns_user_facing_error_when_stream_error_part_has_no_text", () => {
    expect(
      getUiMessageDisplayText({
        role: "assistant",
        parts: [
          {
            type: "error",
            errorText: "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.",
          },
        ],
      }),
    ).toBe("지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.");
  });

  it("returns_empty_assistant_fallback_when_assistant_message_has_no_displayable_text", () => {
    expect(
      getUiMessageDisplayText({
        role: "assistant",
        parts: [],
      }),
    ).toBe("분석 응답을 이어받지 못했어. 잠시 후 다시 시도해줘.");
  });

  it("keeps_user_empty_messages_empty", () => {
    expect(
      getUiMessageDisplayText({
        role: "user",
        parts: [],
      }),
    ).toBe("");
  });
});
