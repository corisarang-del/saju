import { describe, expect, it } from "vitest";
import type { ProductType } from "./config";
import { resolvePaddleCreditGrant } from "./credit-grant";
import type { PaddleWebhookPayload } from "./webhook";

const products = {
  stars30: { priceId: "pri_30", chatCredits: 30 },
  stars70: { priceId: "pri_70", chatCredits: 70 },
  starsPremium: { priceId: "pri_250", chatCredits: 250 },
} as Record<ProductType, { priceId: string; chatCredits: number }>;

function makeEvent(priceId: string, customProductType = "starsPremium"): PaddleWebhookPayload {
  return {
    event_type: "transaction.completed",
    event_id: "evt_123",
    occurred_at: "2026-07-01T00:00:00Z",
    data: {
      id: "txn_123",
      status: "completed",
      custom_data: {
        userId: "user_123",
        productType: customProductType,
      },
      items: [
        {
          price: {
            id: priceId,
            product_id: "pro_123",
          },
          quantity: 1,
        },
      ],
    },
  };
}

describe("paddle_credit_grant", () => {
  it("uses_actual_paid_price_id_even_when_custom_data_is_tampered", () => {
    expect(resolvePaddleCreditGrant(makeEvent("pri_30"), products)).toEqual({
      userId: "user_123",
      transactionId: "txn_123",
      productType: "stars30",
      priceId: "pri_30",
      credits: 30,
    });
  });

  it("rejects_unknown_price_ids_without_crediting_stars", () => {
    expect(resolvePaddleCreditGrant(makeEvent("pri_unknown"), products)).toEqual({
      error: "UNKNOWN_PRICE_ID",
      priceId: "pri_unknown",
    });
  });
});
