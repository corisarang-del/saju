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
    expect(instructions).toContain("정확히 2문단");
    expect(instructions).toContain("다음 대화");
    expect(instructions).toContain("질문");
  });

  it("keeps_first_answer_mobile_sized_and_ends_with_one_clear_question", () => {
    const instructions = getFirstConsultationInstructions({
      isFirstAssistantTurn: true,
      birthHourKnown: true,
    });

    expect(instructions).not.toContain("빈 줄 기준 최대 3문단");
    expect(instructions).not.toContain("1~3문단");
    expect(instructions).toContain("정확히 2문단");
    expect(instructions).toContain("마지막 문장은 반드시 물음표로 끝");
    expect(instructions).toContain("마지막 문장은 반드시 실제 질문 1문장");
    expect(instructions).toContain("설명문이나 조언문으로 끝내지 마");
    expect(instructions).toContain("알려드릴 수 있습니다");
    expect(instructions).toContain("질문은 1개만");
    expect(instructions).toContain("이모지");
    expect(instructions).toContain("영문자");
    expect(instructions).toContain("가벼운 외래어");
    expect(instructions).toContain("루틴, 패턴, 플랜, 체크, 밸런스, 리스크, 포인트, 타이밍");
    expect(instructions).toContain("시기, 확인, 계획, 방법");
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
    expect(instructions).toContain("상투적인 가능성 문장");
    expect(instructions).toContain("과도한 단정");
    expect(instructions).not.toContain("나쁘지 않은 흐름");
    expect(instructions).not.toContain("잠재력은 충분하지만");
    expect(instructions).not.toContain("물이 새는 주머니");
    expect(instructions).not.toContain("필수적");
  });

  it("requires_saju_grounded_flow_and_concrete_today_action", () => {
    const instructions = getFirstConsultationInstructions({
      isFirstAssistantTurn: true,
      birthHourKnown: true,
    });

    expect(instructions).toContain("사주 근거");
    expect(instructions).toContain("사주라는 단어");
    expect(instructions).toContain("오늘 할 일은 추상적인 위로가 아니라");
    expect(instructions).toContain("기록하기");
    expect(instructions).toContain("정리하기");
    expect(instructions).toContain("비교하기");
    expect(instructions).toContain("나누기");
    expect(instructions).toContain("흐릿한 활동 추천");
    expect(instructions).not.toContain("편안해지는 활동");
    expect(instructions).not.toContain("물이 새는 주머니");
    expect(instructions).toContain("번아웃");
    expect(instructions).toContain("몸 상태");
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
