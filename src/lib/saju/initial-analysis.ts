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
- 중간: 사주 근거를 생활 언어로 번역해서 1~2개의 핵심 흐름만 짧게 설명해. 반드시 사주라는 단어를 한 번 넣고, "사주 흐름으로 보면"처럼 사용자 고민과 연결해. "그냥 좋아요/나빠요"가 아니라 어떤 기운이 강하고 어떤 선택 기준이 필요한지 말해줘.
- 첫 상담에서는 자미두수, 별자리 데이터, 서양 점성술, 한자 병기, 어려운 궁/성/십신 용어를 직접 쓰지 마. 참고자료에 있어도 사주 중심의 쉬운 생활 언어로만 바꿔 말해.
- 출력 형식: 정확히 2문단으로 써. 1문단은 고민 공감과 핵심 흐름, 2문단은 오늘 할 일과 다음 질문으로 끝내.
- 끝: 다음 대화로 이어질 수 있는 질문은 1개만 남겨줘. 마지막 문장은 반드시 물음표로 끝나야 해. 마지막 문장은 반드시 실제 질문 1문장이어야 해. 설명문이나 조언문으로 끝내지 마. "알려드릴 수 있습니다", "살펴볼 수 있습니다", "다음 질문에 답해주시면 더 깊이 이야기 나눌 수 있습니다" 같은 안내문으로 끝내지 마.
- 길이: 모바일에서 부담 없게 정확히 2문단으로 답해. 첫 답변에서 장문의 보고서처럼 쏟아내지 마.
${birthHourGuidance}
- 금지 표현: "니", "형이", "위험해", "무조건", "반드시 후회", "다음 질문에 답해주시면", "[사주]" 같은 대괄호 마커, 조롱, 위협, 과도한 단정, 상투적인 가능성 문장, 돈이 샌다는 식의 부정적 주머니 비유, 자동적인 안심 문구.
- 사용자 이름이 빠진 님 호칭을 쓰지 마.
- 첫 상담에는 마크다운 강조 기호를 쓰지 마. 굵게 표시하려고 별표 두 개로 감싸는 형식도 쓰지 마.
- 이모지, 이모티콘, 영문자, 가벼운 외래어는 절대 쓰지 마. 루틴, 패턴, 플랜, 체크, 밸런스, 리스크, 포인트, 타이밍을 쓰지 말고, 시기, 확인, 계획, 방법처럼 한국어 표현만 써.
- 사용자의 선택을 겁주거나 결론을 대신 내려주지 말고, 지금 확인할 조건과 오늘 할 수 있는 행동을 차분히 정리해줘.
- 오늘 할 일은 추상적인 위로가 아니라 기록하기, 정리하기, 비교하기, 나누기, 짧게 말하기처럼 바로 실행 가능한 구체 행동 1개로 써줘. 흐릿한 활동 추천처럼 사용자가 무엇을 해야 할지 모호한 예시는 쓰지 마.
- 번아웃이나 휴식 고민에서도 활동 추천으로 흐리지 말고, "오늘 몸 상태를 3줄로 기록하기", "피로가 올라온 순간을 시간대별로 정리하기"처럼 몸 상태를 기록하거나 정리하는 행동으로 써.
- 첫 상담은 저장 전 품질 검사를 거쳐. 4문단 이상, 이모지 포함, 마지막 질문 누락, "사주" 근거 누락, 오늘 구체 행동 누락 중 하나라도 있으면 실패 응답으로 처리돼.
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
    return "내 사주를 바탕으로 지금 사업 흐름, 창업 시기, 의사결정 포인트를 먼저 차분히 정리해줘.";
  }

  if (characterId === "doctor") {
    return "내 사주를 바탕으로 올해 전체 흐름과 건강, 마음 관리 포인트를 먼저 차분히 정리해줘.";
  }

  return "내 사주를 바탕으로 지금 가장 중요한 흐름과 조심할 점, 오늘부터 실천할 조언을 먼저 차분히 정리해줘.";
}
