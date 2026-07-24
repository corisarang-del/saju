import { describe, expect, it } from "vitest";
import {
  buildSafeInitialAnalysisFallback,
  getInitialAnalysisPrompt,
  shouldAutoStartInitialAnalysis,
} from "./initial-analysis";

describe("initial_analysis", () => {
  it("starts_initial_analysis_when_new_reading_has_no_messages", () => {
    expect(
      shouldAutoStartInitialAnalysis({
        readingId: "reading-1",
        messageCount: 0,
        needsBirthInfo: false,
        isAnalyzing: false,
        isLoading: false,
        isExhausted: false,
        alreadyStarted: false,
      }),
    ).toBe(true);
  });

  it("does_not_start_initial_analysis_when_already_started_or_unavailable", () => {
    expect(
      shouldAutoStartInitialAnalysis({
        readingId: "reading-1",
        messageCount: 0,
        needsBirthInfo: false,
        isAnalyzing: false,
        isLoading: false,
        isExhausted: false,
        alreadyStarted: true,
      }),
    ).toBe(false);

    expect(
      shouldAutoStartInitialAnalysis({
        readingId: undefined,
        messageCount: 0,
        needsBirthInfo: false,
        isAnalyzing: false,
        isLoading: false,
        isExhausted: false,
        alreadyStarted: false,
      }),
    ).toBe(false);

    expect(
      shouldAutoStartInitialAnalysis({
        readingId: "reading-1",
        messageCount: 1,
        needsBirthInfo: false,
        isAnalyzing: false,
        isLoading: false,
        isExhausted: false,
        alreadyStarted: false,
      }),
    ).toBe(false);
  });

  it("returns_character_specific_initial_prompt", () => {
    expect(getInitialAnalysisPrompt("charon_f")).toContain("두 사람");
    expect(getInitialAnalysisPrompt("charon_f")).toContain("상대방 정보");
    expect(getInitialAnalysisPrompt("charon_f")).not.toContain("내 사주를 바탕으로 지금 관계운");
    expect(getInitialAnalysisPrompt("seojun")).toContain("커리어");
    expect(getInitialAnalysisPrompt("doyun")).toContain("사업");
  });

  it("keeps_initial_prompts_aligned_with_first_consultation_foreign_word_rules", () => {
    expect(getInitialAnalysisPrompt("doyun")).toContain("창업 시기");
    expect(getInitialAnalysisPrompt("doyun")).not.toContain("타이밍");
  });

  it("fallback_mentions_partner_when_compatibility_context_exists", () => {
    const fallback = buildSafeInitialAnalysisFallback({
      characterId: "charon_f",
      callName: "현철 씨",
      partnerName: "민지",
    });

    expect(fallback).toContain("현철 씨");
    expect(fallback).toContain("민지");
    expect(fallback).toContain("두 사람");
    expect(fallback).toContain("궁합");
    expect(fallback).not.toContain("내 사주만");
  });
});
