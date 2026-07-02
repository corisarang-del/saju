import { describe, expect, it } from "vitest";
import {
  getFirstConsultationInstructions,
  getInitialAnalysisPrompt,
} from "./initial-analysis";

describe("first_consultation_quality", () => {
  it("guides_first_answer_to_reflect_user_concern_and_continue_the_conversation", () => {
    const instructions = getFirstConsultationInstructions({
      isFirstAssistantTurn: true,
      birthHourKnown: true,
    });

    expect(instructions).toContain("사용자가 고른 고민");
    expect(instructions).toContain("첫 문장");
    expect(instructions).toContain("1~3문단");
    expect(instructions).toContain("다음 대화");
    expect(instructions).toContain("질문");
  });

  it("reassures_users_when_birth_hour_is_unknown", () => {
    const instructions = getFirstConsultationInstructions({
      isFirstAssistantTurn: true,
      birthHourKnown: false,
    });

    expect(instructions).toContain("태어난 시간을 몰라도");
    expect(instructions).toContain("지금 정보로도 충분히");
    expect(instructions).not.toContain("정확하지 않습니다");
    expect(instructions).not.toContain("부족합니다");
  });

  it("blocks_dismissive_fear_based_or_overcertain_language", () => {
    const instructions = getFirstConsultationInstructions({
      isFirstAssistantTurn: true,
      birthHourKnown: true,
    });

    expect(instructions).toContain("니");
    expect(instructions).toContain("형이");
    expect(instructions).toContain("위험해");
    expect(instructions).toContain("무조건");
    expect(instructions).toContain("반드시 후회");
  });

  it("keeps_representative_initial_prompts_concern_specific_but_not_overlong", () => {
    const prompts = [
      getInitialAnalysisPrompt("charon_f"),
      getInitialAnalysisPrompt("jian"),
      getInitialAnalysisPrompt("seojun"),
      getInitialAnalysisPrompt("minjun"),
      getInitialAnalysisPrompt("doctor"),
    ];

    expect(prompts).toEqual([
      expect.stringContaining("관계"),
      expect.stringContaining("재회"),
      expect.stringContaining("커리어"),
      expect.stringContaining("돈"),
      expect.stringContaining("마음"),
    ]);
    for (const prompt of prompts) {
      expect(prompt).toContain("차분히 정리");
      expect(prompt).not.toContain("자세히 분석");
    }
  });
});
