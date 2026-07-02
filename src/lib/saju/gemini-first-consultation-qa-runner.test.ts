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
    expect(script).toContain("generateText");
    expect(script).toContain("gemini-2.5-flash-lite");
    expect(script).toContain("docs\", \"qa");
    expect(script).not.toContain("toMatchSnapshot");
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
