import type { ConcernType } from "@/types/saju";
import type { ConversationMemorySummary } from "./memory";

export interface MonthlyStrategyReadingInput {
  name: string;
  concerns: ConcernType[];
  sajuSummary?: string;
}

export interface MonthlyStrategySnapshotInput {
  concern: string;
  todayDo: string;
  todayAvoid: string;
  relationshipTip: string;
  followUpQuestion: string;
  weeklyFocus: string;
  monthlyFocus: string;
}

export interface MonthlyStrategyReportInput {
  latestReading?: MonthlyStrategyReadingInput | null;
  latestSnapshot?: MonthlyStrategySnapshotInput | null;
  conversationMemory?: ConversationMemorySummary | null;
  recentUserMessages?: string[];
}

export interface MonthlyStrategyReportSection {
  title: string;
  preview: string;
  detail: string;
}

export interface MonthlyStrategyReport {
  previewSummary: string;
  sections: MonthlyStrategyReportSection[];
}

const concernLabels: Record<ConcernType, string> = {
  love: "썸/재회",
  career: "이직/퇴사",
  wealth: "돈 모으기",
  health: "번아웃",
  relationship: "친구/가족관계",
  other: "그 외 고민",
};

function getPrimaryConcern(input: MonthlyStrategyReportInput): string {
  if (input.latestSnapshot?.concern) return input.latestSnapshot.concern;

  const concern = input.latestReading?.concerns?.[0] ?? "other";
  return concernLabels[concern] ?? concernLabels.other;
}

function getDisplayName(input: MonthlyStrategyReportInput): string {
  return input.conversationMemory?.displayName
    || input.latestReading?.name
    || "사용자";
}

function getMemorySummary(input: MonthlyStrategyReportInput): string {
  if (input.conversationMemory?.recentSummary) {
    return input.conversationMemory.recentSummary;
  }

  const recent = input.recentUserMessages
    ?.map((message) => message.trim())
    .filter(Boolean)
    .slice(-8);

  if (recent && recent.length > 0) {
    return recent.join(" ");
  }

  return "아직 쌓인 대화가 적어서 첫 상담 흐름을 기준으로 정리해.";
}

function getSajuSummary(input: MonthlyStrategyReportInput): string {
  return input.latestReading?.sajuSummary
    || "사주 요약이 아직 부족해서 최근 고민과 기본 흐름을 함께 본다.";
}

function getSnapshot(input: MonthlyStrategyReportInput): MonthlyStrategySnapshotInput {
  return input.latestSnapshot ?? {
    concern: getPrimaryConcern(input),
    todayDo: "오늘 몸 상태와 감정 변화를 3줄로 기록하기",
    todayAvoid: "불안해서 큰 결정을 한 번에 내리기",
    relationshipTip: "내 기준을 짧게 말하고 상대 반응을 기록하기",
    followUpQuestion: "이번 달 가장 먼저 정리하고 싶은 선택은 뭐야?",
    weeklyFocus: "이번 주는 반복되는 고민을 한 문장으로 좁혀",
    monthlyFocus: "이번 달은 큰 결론보다 기준을 먼저 세워",
  };
}

export function createMonthlyStrategyReport(
  input: MonthlyStrategyReportInput,
): MonthlyStrategyReport {
  const name = getDisplayName(input);
  const snapshot = getSnapshot(input);
  const primaryConcern = getPrimaryConcern(input);
  const memory = getMemorySummary(input);
  const saju = getSajuSummary(input);

  return {
    previewSummary: `${name}의 이번 달 핵심은 ${primaryConcern} 흐름을 중심으로 ${snapshot.monthlyFocus}`,
    sections: [
      {
        title: "관계",
        preview: "관계 흐름의 방향만 먼저 보여줄게.",
        detail: `${snapshot.relationshipTip}. 최근 대화 기억으로는 ${memory} 관계에서는 결론보다 말의 온도와 거리 조절을 먼저 봐.`,
      },
      {
        title: "일",
        preview: "일의 우선순위를 좁히는 달이야.",
        detail: `${saju} 일에서는 새 일을 늘리기보다 이번 달 기준 하나를 정하고, ${snapshot.weeklyFocus}`,
      },
      {
        title: "돈",
        preview: "돈은 새 결정보다 구조 점검이 먼저야.",
        detail: `${snapshot.todayDo}. ${memory} 돈 흐름은 감정 소비와 실제 지출을 분리해서 보면 더 선명해져.`,
      },
      {
        title: "마음관리",
        preview: "마음 상태를 기록하면 선택의 질이 올라가.",
        detail: `${snapshot.todayAvoid} 이 부분을 조심해. 이번 달 마음관리는 상태를 숨기기보다 기록해서 패턴을 보는 쪽이 맞아.`,
      },
      {
        title: "조심할 시기",
        preview: "급하게 답해야 할 것 같은 날을 조심해.",
        detail: `${snapshot.monthlyFocus}. 특히 피곤하거나 불안한 날에는 돈, 관계, 일 결정을 하루 늦춰서 다시 확인해.`,
      },
      {
        title: "이번 달 선택 3개",
        preview: "상세판에서 선택 기준을 볼 수 있어.",
        detail: `하나, ${snapshot.todayDo}. 둘, ${snapshot.todayAvoid}. 셋, 다음 질문은 "${snapshot.followUpQuestion}"으로 좁혀서 이번 달 선택을 이어가.`,
      },
    ],
  };
}
