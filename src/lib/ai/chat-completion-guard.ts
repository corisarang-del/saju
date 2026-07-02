type ChatFinishReason = "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other" | string | undefined;

interface ChatCompletionGuardInput {
  assistantText: string;
  finishReason?: ChatFinishReason;
  isError: boolean;
  isInitialAnalysis: boolean;
}

const MIN_INITIAL_ANALYSIS_CHARS = 40;
const USER_FACING_FAILURE_MESSAGES = new Set([
  "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.",
  "분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘.",
  "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.",
  "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.",
  "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.",
]);

export function getChatCompletionFailureMessage({
  assistantText,
  finishReason,
  isError,
  isInitialAnalysis,
}: ChatCompletionGuardInput): string | null {
  const trimmedAssistantText = assistantText.trim();

  if (!trimmedAssistantText) {
    return "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.";
  }

  if (USER_FACING_FAILURE_MESSAGES.has(trimmedAssistantText)) {
    return trimmedAssistantText;
  }

  if (isError || finishReason === "error") {
    return "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.";
  }

  if (
    isInitialAnalysis
    && trimmedAssistantText.length > 0
    && trimmedAssistantText.length < MIN_INITIAL_ANALYSIS_CHARS
  ) {
    return "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.";
  }

  return null;
}

export function shouldPersistAssistantAnswer(input: ChatCompletionGuardInput): boolean {
  return getChatCompletionFailureMessage(input) === null;
}
