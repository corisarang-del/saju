import type { ConcernType } from "@/types/saju";

export interface CoachingSnapshot {
  readingId: string;
  concern: string;
  todayDo: string;
  todayAvoid: string;
  relationshipTip: string;
  followUpQuestion: string;
  weeklyFocus: string;
  monthlyFocus: string;
  sourceMessageId: string;
  createdAt: string;
}

export type CoachingSnapshotInput = {
  readingId: string;
  sourceMessageId: string;
  concern: ConcernType;
  createdAt?: string;
};

type CoachingTemplate = Omit<
  CoachingSnapshot,
  "readingId" | "sourceMessageId" | "createdAt"
>;

const templates: Record<ConcernType, CoachingTemplate> = {
  love: {
    concern: "썸/재회",
    todayDo: "상대 반응보다 내 감정 소모 지점을 먼저 정리",
    todayAvoid: "확답을 재촉하거나 불안해서 장문 보내기",
    relationshipTip: "마지막 연락 흐름을 짧게 복기",
    followUpQuestion: "최근 연락에서 가장 마음이 흔들린 순간은 언제였어?",
    weeklyFocus: "이번 주는 연락 패턴과 감정 소모를 분리해서 봐",
    monthlyFocus: "이번 달은 기다릴지 움직일지 기준을 먼저 세워",
  },
  career: {
    concern: "이직/퇴사",
    todayDo: "지금 직장에서 버틸 이유와 떠날 이유를 각각 3개씩 적기",
    todayAvoid: "감정이 올라온 날 바로 퇴사 결정하기",
    relationshipTip: "상사/동료와 말해야 할 기준을 정리",
    followUpQuestion: "지금 제일 힘든 건 사람, 돈, 성장 중 뭐에 가까워?",
    weeklyFocus: "이번 주는 버틸 조건과 움직일 조건을 분리해",
    monthlyFocus: "이번 달은 결정 전에 준비할 항목을 먼저 채워",
  },
  wealth: {
    concern: "돈 모으기",
    todayDo: "이번 달 고정 지출과 충동 지출을 분리",
    todayAvoid: "불안해서 갑자기 큰 투자나 소비 결정하기",
    relationshipTip: "돈 이야기를 비교나 자책으로 끌고 가지 않기",
    followUpQuestion: "요즘 제일 자주 새는 돈은 식비, 쇼핑, 구독 중 어디야?",
    weeklyFocus: "이번 주는 새는 돈을 찾는 데 집중해",
    monthlyFocus: "이번 달은 지출 기준을 다시 세워",
  },
  health: {
    concern: "번아웃",
    todayDo: "오늘 반드시 하지 않아도 되는 일을 하나 덜어내기",
    todayAvoid: "쉬는 시간을 또 성과로 만들기",
    relationshipTip: "도움 요청을 미루지 않기",
    followUpQuestion: "지금 제일 먼저 줄이고 싶은 건 일, 사람, 생각 중 뭐야?",
    weeklyFocus: "이번 주는 회복 루틴 하나를 작게 고정해",
    monthlyFocus: "이번 달은 다시 시작할 작은 행동만 남겨",
  },
  relationship: {
    concern: "친구/가족관계",
    todayDo: "내가 감당할 수 있는 선을 한 문장으로 정리",
    todayAvoid: "미안해서 바로 다 받아주기",
    relationshipTip: "짧고 부드럽게 선을 말하기",
    followUpQuestion: "지금 필요한 건 더 가까워지는 것보다 거리를 조절하는 쪽이야?",
    weeklyFocus: "이번 주는 말투보다 경계선을 먼저 정리해",
    monthlyFocus: "이번 달은 관계의 거리감을 편하게 조정해",
  },
  other: {
    concern: "그 외 고민",
    todayDo: "오늘 제일 신경 쓰이는 문제를 한 문장으로 좁히기",
    todayAvoid: "모든 문제를 한 번에 결론내리기",
    relationshipTip: "내 기준을 설명하기 전에 감정부터 짧게 인정하기",
    followUpQuestion: "지금 가장 먼저 정리하고 싶은 장면은 뭐야?",
    weeklyFocus: "이번 주는 고민을 작게 나누는 데 집중해",
    monthlyFocus: "이번 달은 큰 결론보다 반복되는 패턴을 확인해",
  },
};

export function createCoachingSnapshot(input: CoachingSnapshotInput): CoachingSnapshot {
  return {
    readingId: input.readingId,
    sourceMessageId: input.sourceMessageId,
    ...templates[input.concern],
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
