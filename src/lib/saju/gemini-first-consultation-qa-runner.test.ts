import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("gemini_first_consultation_qa_runner", () => {
  it("covers_the_five_required_live_qa_concerns_without_snapshotting_answers", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("썸/재회");
    expect(script).toContain("이직/퇴사");
    expect(script).toContain("돈 모으기");
    expect(script).toContain("번아웃");
    expect(script).toContain("친구/가족관계");
    expect(script).toContain("사업/창업");
    expect(script).toContain("도윤");
    expect(script).toContain("generateText");
    expect(script).toContain("gemini-2.5-flash-lite");
    expect(script).toContain("docs\", \"qa");
    expect(script).not.toContain("toMatchSnapshot");
  });

  it("uses_user_names_that_do_not_overlap_with_character_names", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("userName");
    expect(script).toContain("[사용자 이름]");
    expect(script).toContain("소민");
    expect(script).not.toContain("민준님");
  });

  it("checks_first_answer_tone_against_pressure_and_fear_phrases", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("돈 냄새");
    expect(script).toContain("놓치면 안 돼");
    expect(script).toContain("꼭 기억하셔야 해요");
    expect(script).toContain("필수적");
    expect(script).toContain("물이 새는 주머니");
    expect(script).toContain("물이 조금씩 새는 주머니");
    expect(script).toContain("걱정 마세요");
    expect(script).toContain("[사주]");
    expect(script).toContain("다음 질문에 답해주시면");
    expect(script).toContain("더 깊이 이야기 나눌 수 있습니다");
    expect(script).toContain("나쁘지 않은 흐름");
    expect(script).toContain("잠재력은 충분하지만");
    expect(script).toContain("잠재력이 충분");
    expect(script).toContain("편안해지는 활동");
    expect(script).toContain("좋아하는 음악");
    expect(script).toContain("reflectedConcern");
    expect(script).toContain("hasFollowUpQuestion");
    expect(script).toContain("hasExactTwoParagraphs");
  });

  it("checks_first_answer_for_specific_saju_grounded_coaching_not_generic_reassurance", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("hasSajuGroundedFlow");
    expect(script).toContain("hasConcreteTodayAction");
    expect(script).toContain("사주 근거");
    expect(script).toContain("구체 행동");
    expect(script).toContain("사주라는 단어");
    expect(script).toContain("오늘 할 일은 추상적인 위로가 아니라");
    expect(script).toContain("좋아하는 활동");
  });

  it("checks_first_answer_against_emoji_foreign_words_and_missing_final_question", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("hasEmoji");
    expect(script).toContain("hasLightForeignWord");
    expect(script).toContain("hasEnglishMixing");
    expect(script).toContain("englishMixingPatterns");
    expect(script).toContain("endsWithQuestion");
    expect(script).toContain("이모지 없음");
    expect(script).toContain("가벼운 외래어 없음");
    expect(script).toContain("영어 혼합 없음");
    expect(script).toContain("정확히 2문단");
    expect(script).toContain("모든 답변은 한국어로만 작성해");
    expect(script).toContain("타이밍이라는 단어 자체를 실패로 본다");
    expect(script).toContain("타이밍이 아니라 시기라고만 써");
    expect(script).toContain("Western Astrology");
    expect(script).toContain("Children's Palace");
    expect(script).toContain("질문으로 끝남");
    expect(script).toContain("parenthesizedForeignWordPattern");
    expect(script).toContain("hasCharacterNameAddress");
    expect(script).toContain("캐릭터명 호칭 없음");
    expect(script).toContain("마지막 문장은 반드시 실제 질문 1문장");
    expect(script).toContain("님의\\\\s+사주");
    expect(script).toContain("이름이 빠진 님 호칭");
    expect(script).toContain("설명문이나 조언문으로 끝내지 마");
    expect(script).toContain("알려드릴 수 있습니다");
    expect(script).toContain("캐릭터 이름으로 사용자를 부르지 마");
  });

  it("uses_word_boundary_patterns_for_short_dismissive_terms", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("blockedPatterns");
    expect(script).toContain("물이?\\\\s*.{0,8}새는\\\\s+주머니");
    expect(script).toContain("\\\\[(?:사주|자미두수|점성술)\\\\]");
    expect(script).toContain('new RegExp("\\\\*\\\\*")');
    expect(script).toContain("new RegExp");
    expect(script).toContain("(^|[\\\\s\\\"'“])니(?=[\\\\s\\\"'”])");
    expect(script).toContain("(^|[\\\\s\\\"'“])형이");
    expect(script).not.toContain('text.includes("형이")');
  });

  it("writes_a_failure_report_when_live_gemini_qa_cannot_complete", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("renderFailureReport");
    expect(script).toContain("Gemini QA failed");
    expect(script).toContain("process.exitCode = 1");
    expect(script).toContain("-failed.md");
  });

  it("retries_live_answers_when_quality_evaluation_fails", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("MAX_QA_ATTEMPTS");
    expect(script).toContain("isPassingEvaluation");
    expect(script).toContain("buildQualityFeedback");
    expect(script).toContain("품질 기준 미달 항목");
    expect(script).toContain("attempt < MAX_QA_ATTEMPTS");
  });

  it("records_attempt_durations_for_operational_latency_tracking", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("attemptDurationsMs");
    expect(script).toContain("totalDurationMs");
    expect(script).toContain("시도별 소요");
  });
});
