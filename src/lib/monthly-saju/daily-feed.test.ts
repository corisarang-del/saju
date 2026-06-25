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
        title: "오늘 밀어붙일 것",
        message: expect.any(String),
      },
      {
        kind: "avoid",
        title: "오늘 피할 것",
        message: expect.any(String),
      },
      {
        kind: "relationship",
        title: "관계에서 챙길 것",
        message: expect.any(String),
      },
    ]);
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

