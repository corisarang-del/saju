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
    expect(script).toContain("reflectedConcern");
    expect(script).toContain("hasFollowUpQuestion");
    expect(script).toContain("mobileFriendlyLength");
  });

  it("checks_first_answer_against_emoji_foreign_words_and_missing_final_question", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("hasEmoji");
    expect(script).toContain("hasLightForeignWord");
    expect(script).toContain("endsWithQuestion");
    expect(script).toContain("이모지 없음");
    expect(script).toContain("가벼운 외래어 없음");
    expect(script).toContain("질문으로 끝남");
    expect(script).toContain("parenthesizedForeignWordPattern");
    expect(script).toContain("hasCharacterNameAddress");
    expect(script).toContain("캐릭터명 호칭 없음");
    expect(script).toContain("마지막 문장은 반드시 실제 질문 1문장");
    expect(script).toContain("설명문이나 조언문으로 끝내지 마");
    expect(script).toContain("알려드릴 수 있습니다");
    expect(script).toContain("캐릭터 이름으로 사용자를 부르지 마");
  });

  it("uses_word_boundary_patterns_for_short_dismissive_terms", () => {
    const script = readProjectFile("scripts/qa-gemini-first-consultation.mjs");

    expect(script).toContain("blockedPatterns");
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
});
