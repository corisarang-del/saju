export const BIRTH_DATE_PRIVACY_NOTICE = {
  title: "처음이라 조심스러울 수 있어서",
  body: "입력한 정보는 사주 계산에만 사용돼. 광고나 다른 목적으로 쓰지 않고, 원하면 언제든 삭제 요청할 수 있어.",
} as const;

export const LANDING_TESTIMONIALS = [
  {
    name: "김*현",
    age: "20대 여성",
    color: "#34d399",
    text: "요즘 답장 하나에도 너무 흔들렸는데, 일단 내 기준부터 보라는 말이 좋았어.",
    time: "오후 9:08",
  },
  {
    name: "정*아",
    age: "20대 여성",
    color: "#fbbf24",
    text: "사주앱인데 생각보다 말투가 부담스럽지 않아서 계속 물어보게 됐어.",
    time: "오전 1:55",
  },
  {
    name: "박*우",
    age: "30대 남성",
    color: "#a78bfa",
    text: "성격을 단정하지 않고 지금 조심할 패턴을 같이 짚어줘서 보기 편했어.",
    time: "오후 3:42",
  },
  {
    name: "변*희",
    age: "40대 여성",
    color: "#f472b6",
    text: "좋은 말만 하는 게 아니라 무리하지 말아야 할 시기를 알려줘서 현실적이었어.",
    time: "오후 5:17",
  },
  {
    name: "이*호",
    age: "30대 남성",
    color: "#60a5fa",
    text: "궁합을 봤는데 누가 맞고 틀리다가 아니라 싸움 포인트를 정리해줘서 납득됐어.",
    time: "오후 11:23",
  },
] as const;

export const LANDING_CHAT_REVIEW_MESSAGES = [
  { side: "left" as const, texts: ["방금 봤는데", "생각보다 차분해서 좋다"] },
  { side: "right" as const, texts: ["뭐가 제일 와닿았어?"] },
  {
    side: "left" as const,
    texts: [
      "이직 고민 중이었는데 무조건 옮기라는 말이 아니라 지금 확인할 조건을 정리해줘서 편했어.",
      "괜히 겁주는 느낌도 없고",
    ],
  },
  { side: "right" as const, texts: ["그건 좀 믿음 간다"] },
  {
    side: "left" as const,
    texts: ["응 나한테 필요한 말만 골라서 보는 느낌이었어"],
  },
] as const;
