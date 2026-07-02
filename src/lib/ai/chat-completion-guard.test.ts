import { describe, expect, it } from "vitest";
import {
  getChatCompletionFailureMessage,
  shouldPersistAssistantAnswer,
} from "./chat-completion-guard";

describe("chat_completion_guard", () => {
  it("rejects_partial_answers_when_stream_finished_with_error", () => {
    const result = {
      assistantText: "현철 씨, 사",
      finishReason: "error",
      isError: true,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_too_short_initial_analysis_even_when_stream_reports_stop", () => {
    const result = {
      assistantText: "현철 씨, 사",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("allows_short_follow_up_answers_when_they_are_not_initial_analysis", () => {
    const result = {
      assistantText: "응, 맞아.",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: false,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBeNull();
    expect(shouldPersistAssistantAnswer(result)).toBe(true);
  });

  it("rejects_empty_follow_up_answers_as_failed_generation", () => {
    const result = {
      assistantText: "",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: false,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("allows_substantial_initial_analysis_answers", () => {
    const result = {
      assistantText:
        "현철 씨, 지금은 마음을 차분히 정리하면서 생활 리듬을 다시 세우는 흐름이 강해요. 오늘은 큰 결정보다 해야 할 일을 작게 나누는 게 좋아요.",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBeNull();
    expect(shouldPersistAssistantAnswer(result)).toBe(true);
  });
});
