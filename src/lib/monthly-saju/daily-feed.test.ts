import { describe, expect, it } from "vitest";
import {
  createDailyAgentFeed,
  type DailyFeedInput,
} from "./daily-feed";

const baseInput: DailyFeedInput = {
  date: "2026-06-25",
  characterId: "hana",
  characterName: "하나",
  dayMasterElement: "water",
  strongestElement: "fire",
  weakestElement: "metal",
  concerns: ["career", "love"],
  recentMemory: "요즘 이직과 관계에서 확신이 부족하다고 자주 말했다.",
};

describe("createDailyAgentFeed", () => {
  it("returns_three_action_cards_when_user_has_saju_context", () => {
    const feed = createDailyAgentFeed(baseInput);

    expect(feed.actionCards).toEqual([
      {
        kind: "do",
        title: "하면 좋은 것",
        message: expect.any(String),
      },
      {
        kind: "avoid",
        title: "피할 것",
        message: expect.any(String),
      },
      {
        kind: "relationship",
        title: "관계/말투",
        message: expect.any(String),
      },
    ]);
  });

  it("uses_coaching_snapshot_first_when_snapshot_exists", () => {
    const feed = createDailyAgentFeed({
      ...baseInput,
      coachingSnapshot: {
        concern: "돈 모으기",
        todayDo: "이번 달 고정 지출과 충동 지출을 분리",
        todayAvoid: "불안해서 갑자기 큰 투자나 소비 결정하기",
        relationshipTip: "돈 이야기를 비교나 자책으로 끌고 가지 않기",
        followUpQuestion: "요즘 제일 자주 새는 돈은 식비, 쇼핑, 구독 중 어디야?",
        weeklyFocus: "이번 주는 새는 돈을 찾는 데 집중해",
        monthlyFocus: "이번 달은 지출 기준을 다시 세워",
      },
    });

    expect(feed.actionCards).toEqual([
      {
        kind: "do",
        title: "하면 좋은 것",
        message: "이번 달 고정 지출과 충동 지출을 분리",
      },
      {
        kind: "avoid",
        title: "피할 것",
        message: "불안해서 갑자기 큰 투자나 소비 결정하기",
      },
      {
        kind: "relationship",
        title: "관계/말투",
        message: "돈 이야기를 비교나 자책으로 끌고 가지 않기",
      },
    ]);
    expect(feed.openingMessage).toContain("이번 주는 새는 돈을 찾는 데 집중해");
    expect(feed.followUpQuestion).toBe("요즘 제일 자주 새는 돈은 식비, 쇼핑, 구독 중 어디야?");
  });

  it("returns_morning_afternoon_evening_timeline_when_feed_is_created", () => {
    const feed = createDailyAgentFeed(baseInput);

    expect(feed.timeline.map((item) => item.period)).toEqual([
      "morning",
      "afternoon",
      "evening",
    ]);
  });

  it("uses_selected_character_name_when_creating_opening_message", () => {
    const feed = createDailyAgentFeed(baseInput);

    expect(feed.openingMessage).toContain("하나");
    expect(feed.openingMessage).toContain("2026-06-25");
  });
});
