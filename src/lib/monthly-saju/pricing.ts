export const FREE_SIGNUP_STARS = 3;

export const STAR_USAGE_SUMMARY = "1별 = 메시지 1회, 가입 후 3회 무료";

export const CHAT_MESSAGE_STAR_COST = 1;
export const MONTHLY_REPORT_STAR_COST = 3;
export const FULL_REPORT_STAR_COST = 5;

export type StarPackType = "stars10" | "stars30" | "stars70" | "starsPremium";
export type MembershipProductType = "monthlyMembership";
export type MonthlySajuProductType = StarPackType | MembershipProductType;

export interface StarPack {
  type: StarPackType;
  stars: number;
  price: number;
  badge?: string;
  description?: string;
}

export const STAR_PACKS: StarPack[] = [
  {
    type: "stars10",
    stars: 10,
    price: 2900,
    badge: "스타터",
    description: "무료 3회 뒤 조금 더 이어보고 싶을 때",
  },
  { type: "stars30", stars: 30, price: 9900 },
  { type: "stars70", stars: 70, price: 19900, badge: "인기" },
  { type: "starsPremium", stars: 250, price: 39900, badge: "최고 가성비" },
];

export const MONTHLY_MEMBERSHIP = {
  type: "monthlyMembership",
  name: "월간 멤버십",
  stars: 50,
  price: 9900,
  description: "매월 50별 지급, 오늘피드/월간 리포트 우선 노출",
} as const;

export const SUPPORT_CONTACT = {
  email: "corisarang@gmail.com",
  mailto: "mailto:corisarang@gmail.com",
} as const;

export function formatWon(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function getPricingListItems(): string[] {
  return [
    ...STAR_PACKS.map((pack) => `${pack.stars}개: ${formatWon(pack.price)}`),
    `${MONTHLY_MEMBERSHIP.name}: 월 ${formatWon(MONTHLY_MEMBERSHIP.price)}, 매월 ${MONTHLY_MEMBERSHIP.stars}별 지급`,
  ];
}

export function buildPricingFaqAnswer(): string {
  const packs = STAR_PACKS
    .map((pack) => `별 ${pack.stars}개 ${formatWon(pack.price)}`)
    .join(", ");

  return `${packs} 패키지가 있고, ${MONTHLY_MEMBERSHIP.name}은 월 ${formatWon(MONTHLY_MEMBERSHIP.price)}에 매월 별 ${MONTHLY_MEMBERSHIP.stars}개가 지급돼요.`;
}

export function buildProductJsonLd() {
  const productPrices = [
    ...STAR_PACKS.map((pack) => pack.price),
    MONTHLY_MEMBERSHIP.price,
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "월간사주 상담권",
    description:
      "오늘피드, 캐릭터 상담, 월간 리포트를 위한 월간사주 상담권과 멤버십.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: String(Math.min(...productPrices)),
      highPrice: String(Math.max(...productPrices)),
      priceCurrency: "KRW",
      offerCount: productPrices.length,
      availability: "https://schema.org/InStock",
    },
  };
}
