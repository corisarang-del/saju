import type { ConcernType } from "@/types/saju";

export type MemoryToneLevel = "new" | "warm" | "close";

export interface ConversationMemoryInput {
  sajuProfile: {
    name: string;
    concerns: ConcernType[];
  };
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

export interface ConversationMemorySummary {
  displayName: string;
  recurringConcerns: ConcernType[];
  recentSummary: string;
  messageCount: number;
  toneLevel: MemoryToneLevel;
}

function getToneLevel(messageCount: number): MemoryToneLevel {
  if (messageCount >= 12) return "close";
  if (messageCount > 0) return "warm";
  return "new";
}

export function summarizeConversationMemory(
  input: ConversationMemoryInput,
): ConversationMemorySummary {
  const recentUserMessages = input.messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content.trim())
    .filter(Boolean);

  return {
    displayName: input.sajuProfile.name,
    recurringConcerns: input.sajuProfile.concerns,
    recentSummary:
      recentUserMessages.length > 0
        ? recentUserMessages.join(" ")
        : "아직 쌓인 대화가 없어 오늘의 기본 흐름부터 안내한다.",
    messageCount: input.messages.length,
    toneLevel: getToneLevel(input.messages.length),
  };
}

