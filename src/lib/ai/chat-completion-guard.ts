type ChatFinishReason = "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other" | string | undefined;

interface ChatCompletionGuardInput {
  assistantText: string;
  finishReason?: ChatFinishReason;
  isError: boolean;
  isInitialAnalysis: boolean;
}

interface InitialAnalysisQualityReport {
  paragraphCount: number;
  endsWithQuestion: boolean;
  hasSajuGrounding: boolean;
  hasConcreteTodayAction: boolean;
  hasEmoji: boolean;
  hasEnglish: boolean;
  hasBlockedPattern: boolean;
  hasDenseHanjaTerms: boolean;
  isValid: boolean;
}

const MIN_INITIAL_ANALYSIS_CHARS = 40;
const INITIAL_ANALYSIS_FORMAT_FAILURE_MESSAGE =
  "첫 상담 응답 형식이 맞지 않아 다시 분석해줘. 별은 차감하지 않았어.";
const USER_FACING_FAILURE_MESSAGES = new Set([
  "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.",
  "분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘.",
  "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.",
  "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.",
  "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.",
]);
const CONCRETE_TODAY_ACTION_WORDS = [
  "기록",
  "정리",
  "나누",
  "비교",
  "적어",
  "확인",
  "말해",
  "말하",
  "줄이",
  "분리",
  "점검",
];
const CONCRETE_TODAY_ACTION_PATTERN =
  /(오늘|오늘은|오늘부터|오늘 당장|오늘 할 일|오늘 해볼 일|오늘 바로).{0,90}(기록|정리|비교|확인|나누|말하기|적어|점검)/;
const BLOCKED_INITIAL_ANALYSIS_PHRASES = [
  "필수적",
  "나쁘지 않은",
  "나쁘지 않은 흐름",
  "잠재력은 충분하지만",
  "잠재력이 충분",
  "위험해",
  "무조건",
  "반드시 후회",
  "물이 새는 주머니",
  "물이 조금씩 새는 주머니",
  "걱정 마세요",
  "걱정하지 마세요",
  "[사주]",
  "[자미두수]",
  "[점성술]",
  "별자리 데이터",
  "자미두수",
  "서양 점성술",
  "Western Astrology",
  "다음 질문에 답해주시면",
  "더 깊이 이야기 나눌 수 있습니다",
  "더 깊이 이야기 나눌 수 있어요",
  "더 자세히 살펴볼 수 있습니다",
  "더 자세히 살펴볼 수 있어요",
  "더 자세히 살펴보기 위해",
  "좀 더 자세히 이야기",
  "좋아하는 활동",
  "편안해지는 활동",
  "좋아하는 음악",
  "따뜻한 차",
  "짧은 산책",
];
const LIGHT_FOREIGN_WORDS = [
  "OK",
  "오케이",
  "체크",
  "리셋",
  "플랜",
  "솔루션",
  "타이밍",
  "루틴",
  "패턴",
  "밸런스",
  "리스크",
  "포인트",
];
const HARD_SAJU_TERMS = [
  "병오",
  "일간",
  "비견",
  "겁재",
  "정관",
  "편관",
  "정재",
  "편재",
  "식신",
  "상관",
  "인성",
  "십신",
  "세운",
  "대운",
  "월운",
  "명궁",
  "부처궁",
  "관록궁",
  "천기성",
  "자미성",
];
const BLOCKED_INITIAL_ANALYSIS_PATTERNS = [
  ...BLOCKED_INITIAL_ANALYSIS_PHRASES.map((phrase) => new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
  ...LIGHT_FOREIGN_WORDS.map((word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")),
  ...HARD_SAJU_TERMS.map((word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
  /물이?\s*.{0,8}새는\s+주머니/,
  /\[(?:사주|자미두수|점성술)\]/,
  /[\u3400-\u9FFF].{0,80}[\u3400-\u9FFF]/,
  /(^|[\s"'“])님의\s+사주/,
  /\*\*/,
];

function getParagraphCount(text: string): number {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .length;
}

function getParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function hasConcreteTodayAction(text: string): boolean {
  const paragraphs = getParagraphs(text);
  const actionParagraph = paragraphs[1] ?? "";

  return CONCRETE_TODAY_ACTION_PATTERN.test(actionParagraph)
    && CONCRETE_TODAY_ACTION_WORDS.some((word) => actionParagraph.includes(word));
}

function isValidInitialAnalysisFormat(text: string): boolean {
  return getInitialAnalysisQualityReport(text).isValid;
}

export function getInitialAnalysisQualityReport(text: string): InitialAnalysisQualityReport {
  const paragraphCount = getParagraphCount(text);
  const endsWithQuestion = /[?？]\s*$/.test(text);
  const hasSajuGrounding = text.includes("사주");
  const concreteTodayAction = hasConcreteTodayAction(text);
  const hasEmoji = /\p{Extended_Pictographic}/u.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);
  const hasBlockedPattern = BLOCKED_INITIAL_ANALYSIS_PATTERNS.some((pattern) => pattern.test(text));
  const hasDenseHanjaTerms = /[\u3400-\u9FFF].{0,80}[\u3400-\u9FFF]/.test(text.slice(0, 200));

  return {
    paragraphCount,
    endsWithQuestion,
    hasSajuGrounding,
    hasConcreteTodayAction: concreteTodayAction,
    hasEmoji,
    hasEnglish,
    hasBlockedPattern,
    hasDenseHanjaTerms,
    isValid: paragraphCount === 2
      && !hasEmoji
      && !hasEnglish
      && !hasBlockedPattern
      && !hasDenseHanjaTerms
      && endsWithQuestion
      && hasSajuGrounding
      && concreteTodayAction,
  };
}

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

  if (isError || finishReason === "error" || finishReason === "length") {
    return "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.";
  }

  if (
    isInitialAnalysis
    && trimmedAssistantText.length > 0
    && trimmedAssistantText.length < MIN_INITIAL_ANALYSIS_CHARS
  ) {
    return "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.";
  }

  if (isInitialAnalysis && !isValidInitialAnalysisFormat(trimmedAssistantText)) {
    return INITIAL_ANALYSIS_FORMAT_FAILURE_MESSAGE;
  }

  return null;
}

export function shouldPersistAssistantAnswer(input: ChatCompletionGuardInput): boolean {
  return getChatCompletionFailureMessage(input) === null;
}
