/**
 * Paddle 결제 설정
 * 환경변수: NEXT_PUBLIC_PADDLE_ENVIRONMENT, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
 *
 * 상품 ID 환경변수 설정 필요:
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10, NEXT_PUBLIC_PADDLE_PRICE_STAR_10
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30, NEXT_PUBLIC_PADDLE_PRICE_STAR_30
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70, NEXT_PUBLIC_PADDLE_PRICE_STAR_70
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM, NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM
 * - NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP, NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP
 */
import { MONTHLY_MEMBERSHIP, STAR_PACKS } from "@/lib/monthly-saju/pricing";

const starPackByType = Object.fromEntries(
  STAR_PACKS.map((pack) => [pack.type, pack]),
) as Record<(typeof STAR_PACKS)[number]["type"], (typeof STAR_PACKS)[number]>;

export const PADDLE_CONFIG = {
  environment:
    (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') ||
    'sandbox',
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || '',
  apiKey: process.env.PADDLE_API_KEY || '',
  products: {
    stars10: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10 || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_10 || '',
      name: '별 10개',
      amount: starPackByType.stars10.price,
      currency: 'KRW',
      chatCredits: starPackByType.stars10.stars,
      badge: starPackByType.stars10.badge,
    },
    stars30: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30 || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_30 || '',
      name: '별 30개',
      amount: starPackByType.stars30.price,
      currency: 'KRW',
      chatCredits: starPackByType.stars30.stars,
    },
    stars70: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70 || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_70 || '',
      name: '별 70개',
      amount: starPackByType.stars70.price,
      currency: 'KRW',
      chatCredits: starPackByType.stars70.stars,
      badge: starPackByType.stars70.badge,
    },
    starsPremium: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM || '',
      name: '별 250개',
      amount: starPackByType.starsPremium.price,
      currency: 'KRW',
      chatCredits: starPackByType.starsPremium.stars,
      badge: starPackByType.starsPremium.badge,
    },
    monthlyMembership: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP || '',
      name: MONTHLY_MEMBERSHIP.name,
      amount: MONTHLY_MEMBERSHIP.price,
      currency: 'KRW',
      chatCredits: MONTHLY_MEMBERSHIP.stars,
      badge: '멤버십',
    },
  },
} as const;

/** 상품 타입 */
export type ProductType = keyof typeof PADDLE_CONFIG.products;

/** 상품 ID로 상품 타입 조회 */
export function getProductByPriceId(
  priceId: string,
): ProductType | null {
  for (const [key, product] of Object.entries(PADDLE_CONFIG.products)) {
    if (product.priceId === priceId) {
      return key as ProductType;
    }
  }
  return null;
}
