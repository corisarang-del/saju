import type { ConcernType } from "@/types/saju";

export type DailyFeedCardKind = "do" | "avoid" | "relationship";
export type DailyFeedPeriod = "morning" | "afternoon" | "evening";
export type DailyFeedElement = "wood" | "fire" | "earth" | "metal" | "water";

export interface DailyFeedInput {
  date: string;
  characterId: string;
  characterName: string;
  dayMasterElement: DailyFeedElement;
  strongestElement: DailyFeedElement;
  weakestElement: DailyFeedElement;
  concerns: ConcernType[];
  recentMemory?: string;
}

export interface DailyActionCard {
  kind: DailyFeedCardKind;
  title: string;
  message: string;
}

export interface DailyTimelineItem {
  period: DailyFeedPeriod;
  title: string;
  message: string;
}

export interface DailyAgentFeed {
  characterId: string;
  date: string;
  openingMessage: string;
  actionCards: DailyActionCard[];
  timeline: DailyTimelineItem[];
}

const elementTone: Record<DailyFeedElement, string> = {
  wood: "새로 시작하는 힘",
  fire: "표현과 속도",
  earth: "정리와 균형",
  metal: "판단과 기준",
  water: "관찰과 유연함",
};

function concernHint(concerns: ConcernType[]): string {
  if (concerns.includes("career")) return "일과 선택의 우선순위를 한 번 더 좁혀봐";
  if (concerns.includes("love")) return "관계에서는 반응보다 확인을 먼저 해봐";
  if (concerns.includes("wealth")) return "돈은 새 결정보다 새는 지점을 먼저 막아봐";
  if (concerns.includes("health")) return "몸이 보내는 작은 신호를 미루지 마";
  return "오늘은 큰 결론보다 작은 실행 하나가 더 중요해";
}

export function createDailyAgentFeed(input: DailyFeedInput): DailyAgentFeed {
  const strongest = elementTone[input.strongestElement];
  const weakest = elementTone[input.weakestElement];
  const hint = concernHint(input.concerns);
  const memoryLine = input.recentMemory ? ` 최근 흐름까지 보면 ${input.recentMemory}` : "";

  return {
    characterId: input.characterId,
    date: input.date,
    openingMessage: `${input.characterName}가 ${input.date} 흐름을 먼저 봤어.${memoryLine}`,
    actionCards: [
      {
        kind: "do",
        title: "오늘 밀어붙일 것",
        message: `${strongest}이 강한 날이야. ${hint}`,
      },
      {
        kind: "avoid",
        title: "오늘 피할 것",
        message: `${weakest}이 약하게 흔들릴 수 있어서 즉흥적인 확답은 피하는 게 좋아.`,
      },
      {
        kind: "relationship",
        title: "관계에서 챙길 것",
        message: "말을 더 많이 하기보다 상대가 놓친 감정을 한 번 짚어줘.",
      },
    ],
    timeline: [
      {
        period: "morning",
        title: "아침",
        message: "오늘 해야 할 일을 하나만 먼저 정해.",
      },
      {
        period: "afternoon",
        title: "점심 이후",
        message: "사람을 설득해야 한다면 근거를 짧고 분명하게 말해.",
      },
      {
        period: "evening",
        title: "저녁",
        message: "오늘의 감정 찌꺼기를 대화나 메모로 정리해.",
      },
    ],
  };
}

