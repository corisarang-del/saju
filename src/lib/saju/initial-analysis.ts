import type { CharacterType } from "@/types/saju";

interface AutoStartInput {
  readingId?: string;
  messageCount: number;
  needsBirthInfo: boolean;
  isAnalyzing: boolean;
  isLoading: boolean;
  isExhausted: boolean;
  alreadyStarted: boolean;
}

export function shouldAutoStartInitialAnalysis({
  readingId,
  messageCount,
  needsBirthInfo,
  isAnalyzing,
  isLoading,
  isExhausted,
  alreadyStarted,
}: AutoStartInput): boolean {
  return Boolean(readingId)
    && messageCount === 0
    && !needsBirthInfo
    && !isAnalyzing
    && !isLoading
    && !isExhausted
    && !alreadyStarted;
}

export function getFirstConsultationInstructions({
  isFirstAssistantTurn,
  birthHourKnown,
}: {
  isFirstAssistantTurn: boolean;
  birthHourKnown: boolean;
}): string {
  if (!isFirstAssistantTurn) {
    return "";
  }

  const birthHourGuidance = birthHourKnown
    ? "- 태어난 시간이 있으면 시주의 흐름을 참고하되, 생활 언어로 부드럽게 풀어줘."
    : "- 태어난 시간을 몰라도 불안하게 말하지 마. \"태어난 시간을 몰라도 지금 정보로도 충분히 큰 흐름을 볼 수 있어요\"라는 취지로 안심시켜줘.";

  return `
[첫 상담 답변 품질 규칙]
- 사용자가 고른 고민이나 마지막 질문의 핵심 키워드를 첫 문장에 자연스럽게 받아줘.
- 첫 문장: 공감과 상황 정리로 시작해. 사주 용어부터 꺼내지 마.
- 중간: 사주 해석을 생활 언어로 번역해서 1~2개의 핵심 흐름만 짧게 설명해.
- 끝: 다음 대화로 이어질 수 있는 질문이나 선택지를 1개만 남겨줘.
- 길이: 모바일에서 부담 없게 1~3문단으로 답해. 첫 답변에서 장문의 보고서처럼 쏟아내지 마.
${birthHourGuidance}
- 금지 표현: "니", "형이", "위험해", "무조건", "반드시 후회", 조롱, 위협, 과도한 단정.
- 사용자의 선택을 겁주거나 결론을 대신 내려주지 말고, 지금 확인할 조건과 오늘 할 수 있는 행동을 차분히 정리해줘.
`;
}

export function getInitialAnalysisPrompt(characterId: CharacterType): string {
  if (characterId === "charon_f" || characterId === "jian") {
    if (characterId === "jian") {
      return "내 사주를 바탕으로 재회 가능성과 마음 정리 흐름을 먼저 차분히 정리해줘.";
    }

    return "내 사주를 바탕으로 지금 관계운과 연애에서 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "minjun") {
    return "내 사주를 바탕으로 지금 돈 흐름과 수입을 키우는 방향을 먼저 차분히 정리해줘.";
  }

  if (characterId === "seojun") {
    return "내 사주를 바탕으로 지금 커리어 흐름, 일에서 강점과 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "doyun") {
    return "내 사주를 바탕으로 지금 사업 흐름, 창업 타이밍, 의사결정 포인트를 먼저 차분히 정리해줘.";
  }

  if (characterId === "doctor") {
    return "내 사주를 바탕으로 올해 전체 흐름과 건강, 마음 관리 포인트를 먼저 차분히 정리해줘.";
  }

  return "내 사주를 바탕으로 지금 가장 중요한 흐름과 조심할 점, 오늘부터 실천할 조언을 먼저 차분히 정리해줘.";
}
