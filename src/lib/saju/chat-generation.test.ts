import { describe, expect, it } from "vitest";
import { getChatMaxOutputTokens } from "./chat-generation";

describe("chat_generation", () => {
  it("gives_free_initial_analysis_enough_tokens_to_finish_long_korean_answers", () => {
    expect(getChatMaxOutputTokens({ isFree: true })).toBeGreaterThanOrEqual(4000);
  });

  it("keeps_paid_answers_with_a_larger_generation_budget", () => {
    expect(getChatMaxOutputTokens({ isFree: false })).toBeGreaterThanOrEqual(8000);
  });
});
