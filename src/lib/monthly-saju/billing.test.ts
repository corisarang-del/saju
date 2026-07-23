import { describe, expect, it } from "vitest";
import { getPaymentPromptState } from "./billing";

describe("getPaymentPromptState", () => {
  it("offers_no_payment_prompt_by_default_for_free_beta", () => {
    expect(getPaymentPromptState({ freeQuotaRemaining: 0 })).toEqual({
      shouldPrompt: false,
      options: [],
    });
  });

  it("offers_no_payment_prompt_when_free_quota_remains", () => {
    expect(getPaymentPromptState({ freeQuotaRemaining: 2, paymentsEnabled: true })).toEqual({
      shouldPrompt: false,
      options: [],
    });
  });

  it("offers_subscription_and_one_time_options_when_free_quota_is_exhausted", () => {
    expect(getPaymentPromptState({ freeQuotaRemaining: 0, paymentsEnabled: true })).toEqual({
      shouldPrompt: true,
      options: [
        {
          kind: "subscription",
          label: "월간 멤버십",
          description: "매일 피드와 캐릭터 상담을 계속 이용",
        },
        {
          kind: "one_time",
          label: "상담권 단품",
          description: "필요할 때만 추가 상담권 구매",
        },
      ],
    });
  });
});
