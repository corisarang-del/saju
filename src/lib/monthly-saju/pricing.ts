export const FREE_SIGNUP_STARS = 3;

export const STAR_USAGE_SUMMARY = "1별 = 메시지 1회, 가입 후 3회 무료";

export interface StarPack {
  type: "stars30" | "stars70" | "starsPremium";
  stars: number;
  price: number;
  badge?: string;
  description?: string;
}

export const STAR_PACKS: StarPack[] = [
  { type: "stars30", stars: 30, price: 9900 },
  { type: "stars70", stars: 70, price: 19900, badge: "인기" },
  { type: "starsPremium", stars: 250, price: 39900, badge: "최고 가성비" },
];

export const SUPPORT_CONTACT = {
  email: "corisarang@gmail.com",
  mailto: "mailto:corisarang@gmail.com",
} as const;

export function formatWon(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
