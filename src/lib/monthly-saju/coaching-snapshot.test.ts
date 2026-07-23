import { describe, expect, it } from "vitest";
import { createCoachingSnapshot } from "./coaching-snapshot";

describe("coaching_snapshot", () => {
  it("creates_love_coaching_fields_when_first_consultation_concern_is_love", () => {
    expect(
      createCoachingSnapshot({
        readingId: "reading-1",
        sourceMessageId: "message-1",
        concern: "love",
        createdAt: "2026-07-07T00:00:00.000Z",
      }),
    ).toEqual({
      readingId: "reading-1",
      sourceMessageId: "message-1",
      concern: "썸/재회",
      todayDo: "상대 반응보다 내 감정 소모 지점을 먼저 정리",
      todayAvoid: "확답을 재촉하거나 불안해서 장문 보내기",
      relationshipTip: "마지막 연락 흐름을 짧게 복기",
      followUpQuestion: "최근 연락에서 가장 마음이 흔들린 순간은 언제였어?",
      weeklyFocus: "이번 주는 연락 패턴과 감정 소모를 분리해서 봐",
      monthlyFocus: "이번 달은 기다릴지 움직일지 기준을 먼저 세워",
      createdAt: "2026-07-07T00:00:00.000Z",
    });
  });

  it("creates_each_required_coaching_template_when_concern_changes", () => {
    expect(
      ["career", "wealth", "health", "relationship"].map((concern) =>
        createCoachingSnapshot({
          readingId: "reading-1",
          sourceMessageId: "message-1",
          concern: concern as "career" | "wealth" | "health" | "relationship",
          createdAt: "2026-07-07T00:00:00.000Z",
        }),
      ),
    ).toEqual([
      expect.objectContaining({
        concern: "이직/퇴사",
        todayDo: "지금 직장에서 버틸 이유와 떠날 이유를 각각 3개씩 적기",
      }),
      expect.objectContaining({
        concern: "돈 모으기",
        todayDo: "이번 달 고정 지출과 충동 지출을 분리",
      }),
      expect.objectContaining({
        concern: "번아웃",
        todayDo: "오늘 반드시 하지 않아도 되는 일을 하나 덜어내기",
      }),
      expect.objectContaining({
        concern: "친구/가족관계",
        todayDo: "내가 감당할 수 있는 선을 한 문장으로 정리",
      }),
    ]);
  });
});
