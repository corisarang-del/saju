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
  assistantSummary: string;
  followUpSeed: string;
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
    .slice(-8)
    .map((message) => message.content.trim())
    .filter(Boolean);
  const recentAssistantMessages = input.messages
    .filter((message) => message.role === "assistant")
    .slice(-8)
    .map((message) => message.content.trim())
    .filter(Boolean);

  return {
    displayName: input.sajuProfile.name,
    recurringConcerns: input.sajuProfile.concerns,
    recentSummary:
      recentUserMessages.length > 0
        ? recentUserMessages.join(" ")
        : "아직 쌓인 대화가 없어 오늘의 기본 흐름부터 안내한다.",
    assistantSummary:
      recentAssistantMessages.length > 0
        ? recentAssistantMessages.join(" ")
        : "아직 상담 답변 요약이 없어 첫 상담 기준으로 이어간다.",
    followUpSeed:
      recentUserMessages.join(" ")
      || input.sajuProfile.concerns.join(", ")
      || "오늘 가장 먼저 정리하고 싶은 고민",
    messageCount: input.messages.length,
    toneLevel: getToneLevel(input.messages.length),
  };
}
