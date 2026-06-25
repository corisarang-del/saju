import { describe, expect, it } from "vitest";
import {
  summarizeConversationMemory,
  type ConversationMemoryInput,
} from "./memory";

const input: ConversationMemoryInput = {
  sajuProfile: {
    name: "민수",
    concerns: ["career", "love"],
  },
  messages: [
    { role: "user", content: "요즘 이직을 해야 할지 계속 고민돼." },
    { role: "assistant", content: "지금은 준비와 탐색을 같이 해야 해." },
    { role: "user", content: "연애도 좀 답답하고 확신이 없어." },
    { role: "assistant", content: "관계에서는 속도보다 신뢰 확인이 먼저야." },
  ],
};

describe("summarizeConversationMemory", () => {
  it("returns_profile_and_recent_summary_when_messages_exist", () => {
    const memory = summarizeConversationMemory(input);

    expect(memory).toEqual({
      displayName: "민수",
      recurringConcerns: ["career", "love"],
      recentSummary: expect.stringContaining("이직"),
      messageCount: 4,
      toneLevel: "warm",
    });
  });

  it("returns_closer_tone_when_message_count_is_high", () => {
    const memory = summarizeConversationMemory({
      ...input,
      messages: Array.from({ length: 13 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: `대화 ${index}`,
      })),
    });

    expect(memory.toneLevel).toBe("close");
  });
});

