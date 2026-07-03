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
];

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const parenthesizedForeignWordPattern = new RegExp(
  `\\((?:${lightForeignWords.map(escapeRegExp).join("|")})\\)`,
  "i",
);

const blockedPatterns = [
  ...blockedPhrases.map((phrase) => new RegExp(escapeRegExp(phrase))),
  new RegExp("(^|[\\s\"'“])니(?=[\\s\"'”])"),
  new RegExp("(^|[\\s\"'“])형이"),
];

const system = `너는 월간사주의 첫 상담 품질 QA용 AI 상담사야.
- 사용자의 고민을 첫 문장에서 직접 받아줘.
- 사주 용어는 생활 언어로 풀어줘.
- 답변은 정확히 2문단으로 써. 1문단은 고민 공감과 핵심 흐름, 2문단은 오늘 할 일과 다음 질문으로 끝내.
- 빈 줄 기준 최대 3문단을 절대 넘기지 마.
- 압박, 공포 마케팅, 과장된 예언, 하대 표현을 쓰지 마.
- 끝에는 바로 이어서 답할 수 있는 질문을 1개만 남기고, 마지막 문장은 반드시 실제 질문 1문장이어야 하며 물음표로 끝내. 설명문이나 조언문으로 끝내지 마. "알려드릴 수 있습니다", "살펴볼 수 있습니다" 같은 안내문으로 끝내지 마.
- 사용자는 [사용자 이름] 값으로만 불러. 캐릭터 이름으로 사용자를 부르지 마. 캐릭터명 뒤에 님, 씨, 아, 야를 붙이면 실패야.
- 이모지와 가벼운 외래어(OK, 체크, 리셋, 플랜, 솔루션, 타이밍)는 절대 쓰지 마. "타이밍"은 "시기"로, "체크"는 "확인"으로, "플랜"은 "계획"으로, "솔루션"은 "방법"으로 바꿔 써. 괄호로 외래어를 병기하지 마.
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
  const characterNameAddressPattern = new RegExp(
    `${escapeRegExp(testCase.character)}\\s*(?:님|씨|아|야)`,
  );
  const hasCharacterNameAddress = characterNameAddressPattern.test(text);

  return {
    reflectedConcern,
    hasBlockedPhrase,
    hasEmoji,
    hasLightForeignWord,
    hasCharacterNameAddress,
    paragraphCount: paragraphs.length,
    mobileFriendlyLength: paragraphs.length >= 1 && paragraphs.length <= 3,
    endsWithQuestion,
    hasFollowUpQuestion,
  };
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
    "| 케이스 | 고민 반영 | 금지 표현 없음 | 1~3문단 | 질문으로 끝남 | 이모지 없음 | 가벼운 외래어 없음 | 캐릭터명 호칭 없음 |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...results.map(({ testCase, evaluation }) =>
      `| ${testCase.label} | ${evaluation.reflectedConcern ? "통과" : "확인필요"} | ${!evaluation.hasBlockedPhrase ? "통과" : "확인필요"} | ${evaluation.mobileFriendlyLength ? "통과" : "확인필요"} | ${evaluation.endsWithQuestion ? "통과" : "확인필요"} | ${!evaluation.hasEmoji ? "통과" : "확인필요"} | ${!evaluation.hasLightForeignWord ? "통과" : "확인필요"} | ${!evaluation.hasCharacterNameAddress ? "통과" : "확인필요"} |`,
    ),
    "",
  ];

  for (const { testCase, text, evaluation } of results) {
    lines.push(`## ${testCase.label}`);
    lines.push("");
    lines.push(`- 캐릭터: ${testCase.character}`);
    lines.push(`- 고민: ${testCase.concern}`);
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
    "# Gemini 첫 상담 5케이스 QA 실패",
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
    const { text } = await generateText({
      model: getModel(),
      system,
      prompt: `[캐릭터] ${testCase.character}\n[사용자 이름] ${testCase.userName}\n[호칭 규칙] 사용자를 "${testCase.userName}님"으로만 부르고, "${testCase.character}님"이라고 부르지 마.\n[대표 고민] ${testCase.label}\n[사용자 질문] ${testCase.concern}`,
      maxOutputTokens: 500,
    });
    results.push({
      testCase,
      text,
      evaluation: evaluateAnswer(text, testCase),
    });
  }

  const filename = `gemini-first-consultation-qa-${new Date().toISOString().slice(0, 10)}.md`;
  const outputPath = writeReport(filename, renderReport(results));
  console.log(outputPath);
}

try {
  await main();
} catch (error) {
  const filename = `gemini-first-consultation-qa-${new Date().toISOString().slice(0, 10)}-failed.md`;
  const outputPath = writeReport(filename, renderFailureReport(error));
  console.error(`Gemini QA failed. Report written: ${outputPath}`);
  process.exitCode = 1;
}
