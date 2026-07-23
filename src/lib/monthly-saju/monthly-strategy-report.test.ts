import { describe, expect, it } from "vitest";
import { createMonthlyStrategyReport } from "./monthly-strategy-report";

describe("monthly_strategy_report", () => {
  it("builds_personalized_sections_from_snapshot_memory_and_saju_summary", () => {
    const report = createMonthlyStrategyReport({
      latestReading: {
        name: "다은",
        concerns: ["wealth"],
        sajuSummary: "일간은 갑목이고 목 기운이 강하며 금 기운이 약해 기준 정리가 필요해.",
      },
      latestSnapshot: {
        concern: "돈 모으기",
        todayDo: "이번 달 고정 지출과 충동 지출을 분리",
        todayAvoid: "불안해서 갑자기 큰 투자나 소비 결정하기",
        relationshipTip: "돈 이야기를 비교나 자책으로 끌고 가지 않기",
        followUpQuestion: "요즘 제일 자주 새는 돈은 어디야?",
        weeklyFocus: "이번 주는 새는 돈을 찾는 데 집중해",
        monthlyFocus: "이번 달은 지출 기준을 다시 세워",
      },
      conversationMemory: {
        displayName: "다은",
        recurringConcerns: ["wealth"],
        recentSummary: "월급은 들어오는데 쇼핑과 구독비가 자꾸 늘어난다고 말했어.",
        assistantSummary: "돈 흐름은 고정비부터 차분히 다시 잡아야 한다고 안내했어.",
        followUpSeed: "요즘 제일 자주 새는 돈은 어디야?",
        messageCount: 9,
        toneLevel: "warm",
      },
    });

    expect(report.previewSummary).toContain("다은");
    expect(report.previewSummary).toContain("돈 모으기");
    expect(report.sections).toHaveLength(6);
    expect(report.sections.map((section) => section.title)).toEqual([
      "관계",
      "일",
      "돈",
      "마음관리",
      "조심할 시기",
      "이번 달 선택 3개",
    ]);
    expect(report.sections.map((section) => section.detail).join("\n")).toContain(
      "이번 달 고정 지출과 충동 지출을 분리",
    );
    expect(report.sections.map((section) => section.detail).join("\n")).toContain(
      "월급은 들어오는데 쇼핑과 구독비",
    );
    expect(report.sections.map((section) => section.detail).join("\n")).toContain(
      "갑목",
    );
  });

  it("falls_back_to_latest_reading_and_recent_user_messages_when_snapshot_is_missing", () => {
    const report = createMonthlyStrategyReport({
      latestReading: {
        name: "지우",
        concerns: ["health"],
        sajuSummary: "수 기운이 약해 회복 리듬을 먼저 챙겨야 해.",
      },
      recentUserMessages: [
        "요즘 계속 지치고 의욕이 없어.",
        "쉬어야 하는지 계속 버텨야 하는지 모르겠어.",
      ],
    });

    const details = report.sections.map((section) => section.detail).join("\n");

    expect(report.previewSummary).toContain("지우");
    expect(report.previewSummary).toContain("번아웃");
    expect(details).toContain("요즘 계속 지치고 의욕이 없어");
    expect(details).toContain("수 기운이 약해");
    expect(details).toContain("오늘 몸 상태");
  });
});
