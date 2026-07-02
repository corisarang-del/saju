import { describe, expect, it } from "vitest";
import { CONCERN_LABELS } from "./saju";

describe("CONCERN_LABELS", () => {
  it("uses_life_language_for_twenty_something_customers", () => {
    expect(CONCERN_LABELS).toEqual({
      love: "썸/재회",
      career: "이직/퇴사",
      wealth: "돈 모으기",
      health: "번아웃",
      relationship: "친구/가족관계",
      other: "그 외 고민",
    });
  });
});
