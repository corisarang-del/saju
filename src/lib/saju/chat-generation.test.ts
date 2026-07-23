import { describe, expect, it } from "vitest";
import { getChatMaxOutputTokens } from "./chat-generation";

describe("chat_generation", () => {
  it("gives_free_initial_analysis_enough_tokens_to_finish_long_korean_answers", () => {
    expect(getChatMaxOutputTokens({ isFree: true })).toBeGreaterThanOrEqual(4000);
  });

  it("keeps_paid_answers_with_a_larger_generation_budget", () => {
    expect(getChatMaxOutputTokens({ isFree: false })).toBeGreaterThanOrEqual(8000);
  });

  it("keeps_first_consultation_mobile_sized_without_forcing_mid_sentence_cutoffs", () => {
    expect(getChatMaxOutputTokens({ isFree: true, isFirstAssistantTurn: true })).toBeLessThan(
      getChatMaxOutputTokens({ isFree: true, isFirstAssistantTurn: false }),
    );
    expect(getChatMaxOutputTokens({ isFree: true, isFirstAssistantTurn: true })).toBeGreaterThanOrEqual(1000);
    expect(getChatMaxOutputTokens({ isFree: true, isFirstAssistantTurn: true })).toBeLessThanOrEqual(1600);
  });
});
