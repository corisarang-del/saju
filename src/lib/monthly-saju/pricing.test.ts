import { describe, expect, it } from "vitest";
import { PADDLE_CONFIG } from "@/lib/paddle/config";
import {
  CHAT_MESSAGE_STAR_COST,
  FREE_SIGNUP_STARS,
  FULL_REPORT_STAR_COST,
  MONTHLY_MEMBERSHIP,
  MONTHLY_MEMBERSHIP_USAGE_EXAMPLE,
  MONTHLY_REPORT_STAR_COST,
  STAR_PACKS,
  STAR_USAGE_SUMMARY,
  SUPPORT_CONTACT,
  buildPricingFaqAnswer,
  buildProductJsonLd,
  getPricingListItems,
} from "./pricing";

describe("monthly_saju_pricing", () => {
  it("explains_one_star_as_one_message_when_showing_signup_offer", () => {
    expect(STAR_USAGE_SUMMARY).toEqual(
      "1별 = 메시지 1회, 가입 후 3회 무료",
    );
    expect(FREE_SIGNUP_STARS).toBe(3);
  });

  it("publishes_starter_price_as_2900_won", () => {
    expect(STAR_PACKS.find((pack) => pack.type === "stars10")).toEqual({
      type: "stars10",
      stars: 10,
      price: 2900,
      badge: "스타터",
      description: "무료 3회 뒤 조금 더 이어보고 싶을 때",
    });
  });

  it("publishes_monthly_membership_with_50_stars", () => {
    expect(MONTHLY_MEMBERSHIP).toEqual({
      type: "monthlyMembership",
      name: "월간 멤버십",
      stars: 50,
      price: 9900,
      description: "매월 50별 지급, 오늘피드/월간 리포트 우선 노출",
      usageExample: "매일 1회 상담 30별 + 월간 리포트 3별 + 후속 질문 17회",
    });
  });

  it("explains_how_monthly_membership_50_stars_can_be_used", () => {
    expect(MONTHLY_MEMBERSHIP_USAGE_EXAMPLE).toBe(
      "매일 1회 상담 30별 + 월간 리포트 3별 + 후속 질문 17회",
    );
    expect(buildPricingFaqAnswer()).toContain(MONTHLY_MEMBERSHIP_USAGE_EXAMPLE);
  });

  it("publishes_starter_existing_and_subscription_products", () => {
    expect(STAR_PACKS).toEqual([
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
    ]);
  });

  it("uses_same_price_policy_for_landing_terms_jsonld_and_paddle_mapping", () => {
    expect(getPricingListItems()).toEqual([
      "10개: 2,900원",
      "30개: 9,900원",
      "70개: 19,900원",
      "250개: 39,900원",
      "월간 멤버십: 월 9,900원, 매월 50별 지급",
    ]);
    expect(buildPricingFaqAnswer()).toContain("별 10개 2,900원");
    expect(buildPricingFaqAnswer()).toContain("월간 멤버십은 월 9,900원");
    expect(buildPricingFaqAnswer()).toContain("매월 별 50개");
    expect(buildProductJsonLd().offers).toEqual({
      "@type": "AggregateOffer",
      lowPrice: "2900",
      highPrice: "39900",
      priceCurrency: "KRW",
      offerCount: 5,
      availability: "https://schema.org/InStock",
    });

    const paddleProducts = Object.fromEntries(
      Object.entries(PADDLE_CONFIG.products).map(([type, product]) => [
        type,
        {
          amount: product.amount,
          chatCredits: product.chatCredits,
          name: product.name,
        },
      ]),
    );

    expect(paddleProducts).toEqual({
      stars10: { amount: 2900, chatCredits: 10, name: "별 10개" },
      stars30: { amount: 9900, chatCredits: 30, name: "별 30개" },
      stars70: { amount: 19900, chatCredits: 70, name: "별 70개" },
      starsPremium: { amount: 39900, chatCredits: 250, name: "별 250개" },
      monthlyMembership: { amount: 9900, chatCredits: 50, name: "월간 멤버십" },
    });
  });

  it("charges_one_star_for_chat_three_for_monthly_report_five_for_full_report", () => {
    expect({
      chat: CHAT_MESSAGE_STAR_COST,
      monthlyReport: MONTHLY_REPORT_STAR_COST,
      fullReport: FULL_REPORT_STAR_COST,
    }).toEqual({
      chat: 1,
      monthlyReport: 3,
      fullReport: 5,
    });
  });

  it("uses_a_real_support_contact_for_refund_requests", () => {
    expect(SUPPORT_CONTACT.email).toBe("corisarang@gmail.com");
    expect(SUPPORT_CONTACT.mailto).toBe("mailto:corisarang@gmail.com");
  });
});
