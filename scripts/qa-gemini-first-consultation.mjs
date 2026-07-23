import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { vertex } from "@ai-sdk/google-vertex";

config({ path: ".env.local" });
config();

const modelId = process.env.AI_MODEL || "gemini-2.5-flash-lite";
const outputDir = join(process.cwd(), "docs", "qa");
const MAX_QA_ATTEMPTS = 3;

const cases = [
  {
    id: "some-reunion",
    label: "썸/재회",
    character: "하나",
    userName: "소민",
    concern: "최근 연락이 애매해진 사람과 다시 이어질 수 있을지 차분히 보고 싶어.",
    expectedKeywords: ["관계", "연락", "마음"],
  },
  {
    id: "career-resignation",
    label: "이직/퇴사",
    character: "서준",
    userName: "유진",
    concern: "지금 회사를 계속 다녀야 할지, 이직이나 퇴사를 준비해야 할지 고민돼.",
    expectedKeywords: ["이직", "퇴사", "직장", "회사"],
  },
  {
    id: "money-saving",
    label: "돈 모으기",
    character: "민준",
    userName: "다은",
    concern: "돈이 잘 모이지 않아서 내 사주 기준으로 수입과 지출 흐름을 정리하고 싶어.",
    expectedKeywords: ["돈", "수입", "지출"],
  },
  {
    id: "burnout",
    label: "번아웃",
    character: "하은",
    userName: "지우",
    concern: "요즘 계속 지치고 의욕이 떨어져. 내 흐름에서 지금 쉬어야 하는지 알고 싶어.",
    expectedKeywords: ["지침", "휴식", "흐름"],
  },
  {
    id: "friends-family",
    label: "친구/가족관계",
    character: "하나",
    userName: "서아",
    concern: "친구와 가족 사이에서 자꾸 마음이 소모돼. 관계에서 조심할 점을 보고 싶어.",
    expectedKeywords: ["친구", "가족", "관계"],
  },
  {
    id: "business-startup",
    label: "사업/창업",
    character: "도윤",
    userName: "하린",
    concern: "창업을 준비해도 될지, 지금 사업 흐름과 조심할 점을 차분히 보고 싶어.",
    expectedKeywords: ["사업", "창업", "흐름"],
  },
];

const blockedPhrases = [
  "돈 냄새",
  "놓치면 안 돼",
  "꼭 기억하셔야 해요",
  "필수적",
  "나쁘지 않은 흐름",
  "잠재력은 충분하지만",
  "잠재력이 충분",
  "물이 새는 주머니",
  "물이 조금씩 새는 주머니",
  "걱정 마세요",
  "걱정하지 마세요",
  "[사주]",
  "[자미두수]",
  "[점성술]",
  "다음 질문에 답해주시면",
  "더 깊이 이야기 나눌 수 있습니다",
  "더 깊이 이야기 나눌 수 있어요",
  "더 자세히 살펴볼 수 있습니다",
  "더 자세히 살펴볼 수 있어요",
  "좋아하는 활동",
  "편안해지는 활동",
  "좋아하는 음악",
  "따뜻한 차",
  "짧은 산책",
  "위험해",
  "무조건",
  "반드시 후회",
];

const lightForeignWords = [
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

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const parenthesizedForeignWordPattern = new RegExp(
  `\\((?:${lightForeignWords.map(escapeRegExp).join("|")})\\)`,
  "i",
);

const englishMixingPatterns = [
  /Western Astrology/i,
  /Ascendant/i,
  /Midheaven/i,
  /Children's Palace/i,
  /Emperor Star/i,
  /supportive star/i,
  /\b(?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i,
  /[A-Za-z]/,
  /[A-Za-z]{4,}(?:\s+[A-Za-z]{2,}){2,}/,
];

const blockedPatterns = [
  ...blockedPhrases.map((phrase) => new RegExp(escapeRegExp(phrase))),
  new RegExp("물이?\\s*.{0,8}새는\\s+주머니"),
  new RegExp("\\[(?:사주|자미두수|점성술)\\]"),
  new RegExp("(^|[\\s\"'“])님의\\s+사주"),
  new RegExp("\\*\\*"),
  new RegExp("(^|[\\s\"'“])니(?=[\\s\"'”])"),
  new RegExp("(^|[\\s\"'“])형이"),
];

const sajuGroundingWords = ["사주", "흐름", "기운", "시기", "강점", "조심"];
const concreteActionWords = [
  "기록",
  "정리",
  "나누",
  "비교",
  "적어",
  "확인",
  "말해",
  "줄이",
  "분리",
  "점검",
];
const concreteTodayActionPattern =
  /(오늘|오늘은|오늘부터|오늘 당장|오늘 할 일|오늘 해볼 일|오늘 바로).{0,90}(기록|정리|비교|확인|나누|말하기|적어|점검)/;

const system = `너는 월간사주의 첫 상담 품질 QA용 AI 상담사야.
- 사용자의 고민을 첫 문장에서 직접 받아줘.
- 사주 용어는 생활 언어로 풀어줘.
- 사주 근거는 반드시 넣되, 생활 언어로 풀어줘. 반드시 사주라는 단어를 한 번 넣고, "사주 흐름으로 보면"처럼 사용자 고민과 연결해.
- 답변은 정확히 2문단으로 써. 1문단은 고민 공감과 핵심 흐름, 2문단은 오늘 할 일과 다음 질문으로 끝내.
- 오늘 할 일은 추상적인 위로가 아니라 기록하기, 정리하기, 비교하기, 나누기, 짧게 말하기처럼 바로 실행 가능한 구체 행동 1개로 써.
- 번아웃이나 휴식 고민에서도 활동 추천으로 흐리지 말고, "오늘 몸 상태를 3줄로 기록하기", "피로가 올라온 순간을 시간대별로 정리하기"처럼 몸 상태를 기록하거나 정리하는 행동으로 써.
- 정확히 2문단만 써. 한 문단이나 세 문단도 실패야.
- 압박, 공포 마케팅, 과장된 예언, 하대 표현을 쓰지 마. 돈이 샌다는 식의 부정적 주머니 비유, 막연한 가능성 칭찬, 자동적인 안심 문구, 대괄호 마커, 흐릿한 활동 추천도 쓰지 마.
- 끝에는 바로 이어서 답할 수 있는 질문을 1개만 남기고, 마지막 문장은 반드시 실제 질문 1문장이어야 하며 물음표로 끝내. 설명문이나 조언문으로 끝내지 마. "알려드릴 수 있습니다", "살펴볼 수 있습니다", "다음 질문에 답해주시면 더 깊이 이야기 나눌 수 있습니다" 같은 안내문으로 끝내지 마.
- 첫 상담에는 마크다운 강조 기호를 쓰지 마. 굵게 표시하려고 별표 두 개로 감싸는 형식도 쓰지 마.
- 사용자는 [사용자 이름] 값으로만 불러. 캐릭터 이름으로 사용자를 부르지 마. 캐릭터명 뒤에 님, 씨, 아, 야를 붙이면 실패야.
- 사용자 이름이 빠진 님 호칭을 쓰면 실패야.
- 이모지와 가벼운 외래어(OK, 체크, 리셋, 플랜, 솔루션, 타이밍, 루틴, 패턴, 밸런스, 리스크, 포인트)는 절대 쓰지 마. 타이밍이라는 단어 자체를 실패로 본다. 타이밍이 아니라 시기라고만 써. "체크"는 "확인"으로, "플랜"은 "계획"으로, "솔루션"은 "방법"으로 바꿔 써. 괄호로 외래어를 병기하지 마.
- 모든 답변은 한국어로만 작성해. "Western Astrology", "Ascendant", "Midheaven", "Children's Palace", "Emperor Star" 같은 영어 번역이나 영어 병기를 절대 넣지 마.
- 태어난 시간은 모른다고 가정하고, 지금 정보로도 큰 흐름은 충분히 볼 수 있다는 톤을 유지해.`;

function evaluateAnswer(text, testCase) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasBlockedPhrase = blockedPatterns.some((pattern) => pattern.test(text));
  const reflectedConcern = testCase.expectedKeywords.some((keyword) => text.includes(keyword));
  const endsWithQuestion = /[?？]\s*$/.test(text.trim());
  const hasFollowUpQuestion = endsWithQuestion || text.includes("어떤 쪽");
  const hasEmoji = /\p{Extended_Pictographic}/u.test(text);
  const hasLightForeignWord = lightForeignWords.some((word) =>
    new RegExp(escapeRegExp(word), "i").test(text),
  ) || parenthesizedForeignWordPattern.test(text);
  const hasEnglishMixing = englishMixingPatterns.some((pattern) => pattern.test(text));
  const characterNameAddressPattern = new RegExp(
    `${escapeRegExp(testCase.character)}\\s*(?:님|씨|아|야)`,
  );
  const hasCharacterNameAddress = characterNameAddressPattern.test(text);
  const hasSajuGroundedFlow = text.includes("사주")
    && sajuGroundingWords.some((word) => text.includes(word));
  const actionParagraph = paragraphs[1] ?? "";
  const hasConcreteTodayAction = concreteTodayActionPattern.test(actionParagraph)
    && concreteActionWords.some((word) => actionParagraph.includes(word));
  const hasExactTwoParagraphs = paragraphs.length === 2;

  return {
    reflectedConcern,
    hasBlockedPhrase,
    hasEmoji,
    hasLightForeignWord,
    hasEnglishMixing,
    hasCharacterNameAddress,
    hasSajuGroundedFlow,
    hasConcreteTodayAction,
    paragraphCount: paragraphs.length,
    hasExactTwoParagraphs,
    endsWithQuestion,
    hasFollowUpQuestion,
  };
}

function isPassingEvaluation(evaluation) {
  return evaluation.reflectedConcern
    && !evaluation.hasBlockedPhrase
    && !evaluation.hasEmoji
    && !evaluation.hasLightForeignWord
    && !evaluation.hasEnglishMixing
    && !evaluation.hasCharacterNameAddress
    && evaluation.hasSajuGroundedFlow
    && evaluation.hasConcreteTodayAction
    && evaluation.hasExactTwoParagraphs
    && evaluation.endsWithQuestion;
}

function buildQualityFeedback(evaluation) {
  const feedback = [];

  if (!evaluation.reflectedConcern) {
    feedback.push("사용자 고민 키워드를 첫 문장과 본문에 자연스럽게 반영해.");
  }
  if (evaluation.hasBlockedPhrase) {
    feedback.push("금지 표현이나 과장된 표현을 모두 빼고 차분한 말로 바꿔.");
  }
  if (evaluation.hasEmoji) {
    feedback.push("이모지와 이모티콘을 모두 빼.");
  }
  if (evaluation.hasLightForeignWord) {
    feedback.push("가벼운 외래어를 모두 한국어 표현으로 바꿔.");
  }
  if (evaluation.hasEnglishMixing) {
    feedback.push("영어 번역, 영어 병기, 영어 설명을 모두 빼고 한국어로만 써.");
  }
  if (evaluation.hasCharacterNameAddress) {
    feedback.push("캐릭터 이름이 아니라 사용자 이름으로만 불러.");
  }
  if (!evaluation.hasSajuGroundedFlow) {
    feedback.push("사주라는 단어를 넣고, 사용자 고민과 사주 흐름을 직접 연결해.");
  }
  if (!evaluation.hasConcreteTodayAction) {
    feedback.push("오늘 바로 할 수 있는 기록, 정리, 비교, 확인 같은 구체 행동 1개를 넣어.");
  }
  if (!evaluation.hasExactTwoParagraphs) {
    feedback.push("빈 줄 기준 정확히 2문단으로 줄여.");
  }
  if (!evaluation.endsWithQuestion) {
    feedback.push("마지막 문장을 실제 질문 1문장으로 바꾸고 물음표로 끝내.");
  }

  return feedback;
}

function buildPrompt(testCase, feedback = []) {
  const basePrompt = `[캐릭터] ${testCase.character}\n[사용자 이름] ${testCase.userName}\n[호칭 규칙] 사용자를 "${testCase.userName}님"으로만 부르고, "${testCase.character}님"이라고 부르지 마.\n[대표 고민] ${testCase.label}\n[사용자 질문] ${testCase.concern}`;

  if (feedback.length === 0) {
    return basePrompt;
  }

  return `${basePrompt}\n\n[품질 기준 미달 항목]\n${feedback.map((item) => `- ${item}`).join("\n")}\n\n위 항목을 모두 고쳐서 처음부터 다시 작성해. 이전 답변의 문장을 그대로 반복하지 마.`;
}

function renderReport(results) {
  const generatedAt = new Date().toISOString();
  const lines = [
    `# Gemini 첫 상담 ${cases.length}케이스 QA`,
    "",
    `- 생성 시각: ${generatedAt}`,
    `- 모델: ${modelId}`,
    "- 목적: 실제 Gemini 응답이 20대 여성 고객 기준으로 차분한 첫 상담 톤을 유지하는지 점검",
    "",
    "## 요약",
    "",
    "| 케이스 | 고민 반영 | 사주 근거 | 구체 행동 | 금지 표현 없음 | 정확히 2문단 | 질문으로 끝남 | 이모지 없음 | 가벼운 외래어 없음 | 영어 혼합 없음 | 캐릭터명 호칭 없음 |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...results.map(({ testCase, evaluation }) =>
      `| ${testCase.label} | ${evaluation.reflectedConcern ? "통과" : "확인필요"} | ${evaluation.hasSajuGroundedFlow ? "통과" : "확인필요"} | ${evaluation.hasConcreteTodayAction ? "통과" : "확인필요"} | ${!evaluation.hasBlockedPhrase ? "통과" : "확인필요"} | ${evaluation.hasExactTwoParagraphs ? "통과" : "확인필요"} | ${evaluation.endsWithQuestion ? "통과" : "확인필요"} | ${!evaluation.hasEmoji ? "통과" : "확인필요"} | ${!evaluation.hasLightForeignWord ? "통과" : "확인필요"} | ${!evaluation.hasEnglishMixing ? "통과" : "확인필요"} | ${!evaluation.hasCharacterNameAddress ? "통과" : "확인필요"} |`,
    ),
    "",
  ];

  for (const { testCase, text, evaluation, attempts } of results) {
    lines.push(`## ${testCase.label}`);
    lines.push("");
    lines.push(`- 캐릭터: ${testCase.character}`);
    lines.push(`- 고민: ${testCase.concern}`);
    lines.push(`- 시도 횟수: ${attempts}`);
    lines.push(`- 평가: ${JSON.stringify(evaluation)}`);
    lines.push("");
    lines.push("### 답변 전문");
    lines.push("");
    lines.push(text.trim());
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function renderFailureReport(error) {
  const generatedAt = new Date().toISOString();
  const errorMessage = getErrorMessage(error);
  const lines = [
    `# Gemini 첫 상담 ${cases.length}케이스 QA 실패`,
    "",
    `- 생성 시각: ${generatedAt}`,
    `- 모델: ${modelId}`,
    "- 상태: 실행 실패",
    "- 원인: 아래 오류 메시지 확인",
    "",
    "## 오류",
    "",
    "```text",
    errorMessage,
    "```",
    "",
    "## 점검 케이스",
    "",
    ...cases.map((testCase) => `- ${testCase.label}: ${testCase.concern}`),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function writeReport(filename, content) {
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, filename);
  writeFileSync(outputPath, content, "utf8");
  return outputPath;
}

function getProviderMode() {
  if (process.env.AI_PROVIDER === "google" || process.env.AI_PROVIDER === "vertex") {
    return process.env.AI_PROVIDER;
  }

  if (process.env.GOOGLE_VERTEX_PROJECT || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return "vertex";
  }

  return "google";
}

function getModel() {
  return getProviderMode() === "vertex"
    ? vertex(modelId)
    : google(modelId);
}

async function main() {
  if (getProviderMode() === "google" && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for live Gemini QA.");
  }

  if (getProviderMode() === "vertex" && !process.env.GOOGLE_VERTEX_PROJECT) {
    throw new Error("GOOGLE_VERTEX_PROJECT is required for Vertex Gemini QA.");
  }

  const results = [];
  for (const testCase of cases) {
    let attempt = 0;
    let feedback = [];
    let text = "";
    let evaluation;

    while (attempt < MAX_QA_ATTEMPTS) {
      attempt += 1;
      const result = await generateText({
        model: getModel(),
        system,
        prompt: buildPrompt(testCase, feedback),
        maxOutputTokens: 500,
      });
      text = result.text;
      evaluation = evaluateAnswer(text, testCase);

      if (isPassingEvaluation(evaluation)) {
        break;
      }

      feedback = buildQualityFeedback(evaluation);
    }

    results.push({
      testCase,
      text,
      evaluation,
      attempts: attempt,
    });
  }

  const filename = `gemini-first-consultation-qa-${new Date().toISOString().slice(0, 10)}.md`;
  const outputPath = writeReport(filename, renderReport(results));
  console.log(outputPath);

  if (results.some(({ evaluation }) => !isPassingEvaluation(evaluation))) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  const filename = `gemini-first-consultation-qa-${new Date().toISOString().slice(0, 10)}-failed.md`;
  const outputPath = writeReport(filename, renderFailureReport(error));
  console.error(`Gemini QA failed. Report written: ${outputPath}`);
  process.exitCode = 1;
}
