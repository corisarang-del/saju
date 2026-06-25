export type PaymentOptionKind = "subscription" | "one_time";

export interface PaymentPromptInput {
  freeQuotaRemaining: number;
}

export interface PaymentOption {
  kind: PaymentOptionKind;
  label: string;
  description: string;
}

export interface PaymentPromptState {
  shouldPrompt: boolean;
  options: PaymentOption[];
}

export function getPaymentPromptState(
  input: PaymentPromptInput,
): PaymentPromptState {
  if (input.freeQuotaRemaining > 0) {
    return {
      shouldPrompt: false,
      options: [],
    };
  }

  return {
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
  };
}

