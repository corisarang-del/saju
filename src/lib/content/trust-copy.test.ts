import { describe, expect, it } from "vitest";
import {
  BIRTH_DATE_PRIVACY_NOTICE,
  LANDING_CHAT_REVIEW_MESSAGES,
  LANDING_TESTIMONIALS,
} from "./trust-copy";

describe("trust_copy", () => {
  it("explains_private_birth_data_use_before_the_form", () => {
    expect(BIRTH_DATE_PRIVACY_NOTICE).toEqual({
      title: "처음이라 조심스러울 수 있어서",
      body: "입력한 정보는 사주 계산에만 사용돼. 광고나 다른 목적으로 쓰지 않고, 원하면 언제든 삭제 요청할 수 있어.",
    });
  });

  it("keeps_landing_reviews_natural_without_overclaiming_money_results", () => {
    const reviewText = [
      ...LANDING_TESTIMONIALS.map((review) => review.text),
      ...LANDING_CHAT_REVIEW_MESSAGES.flatMap((message) => message.texts),
    ].join("\n");

    expect(reviewText).not.toContain("에티오피아");
    expect(reviewText).not.toContain("부동산");
    expect(reviewText).not.toContain("금에 투자");
    expect(reviewText).not.toContain("합격했습니다");
    expect(reviewText).not.toContain("체크할 조건");
    expect(reviewText).toContain(
      "이직 고민 중이었는데 무조건 옮기라는 말이 아니라 지금 확인할 조건을 정리해줘서 편했어.",
    );
  });
});
