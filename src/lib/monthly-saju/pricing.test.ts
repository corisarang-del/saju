import { describe, expect, it } from "vitest";
import {
  FREE_SIGNUP_STARS,
  STAR_PACKS,
  STAR_USAGE_SUMMARY,
  SUPPORT_CONTACT,
} from "./pricing";

describe("monthly_saju_pricing", () => {
  it("explains_one_star_as_one_message_when_showing_signup_offer", () => {
    expect(STAR_USAGE_SUMMARY).toEqual(
      "1별 = 메시지 1회, 가입 후 3회 무료",
    );
    expect(FREE_SIGNUP_STARS).toBe(3);
  });

  it("publishes_the_same_star_packs_sold_in_the_coin_shop", () => {
    expect(STAR_PACKS).toEqual([
      { type: "stars30", stars: 30, price: 9900 },
      { type: "stars70", stars: 70, price: 19900, badge: "인기" },
      { type: "starsPremium", stars: 250, price: 39900, badge: "최고 가성비" },
    ]);
  });

  it("uses_a_real_support_contact_for_refund_requests", () => {
    expect(SUPPORT_CONTACT.email).toBe("corisarang@gmail.com");
    expect(SUPPORT_CONTACT.mailto).toBe("mailto:corisarang@gmail.com");
  });
});
