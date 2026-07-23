import { describe, expect, it } from "vitest";
import {
  resolvePaddleMembershipUpdate,
  type PaddleMembershipUpdate,
} from "./membership";
import type { PaddleWebhookPayload } from "./webhook";

const products = {
  stars10: { productId: "pro_star_10", priceId: "pri_star_10", chatCredits: 10 },
  stars30: { productId: "pro_star_30", priceId: "pri_star_30", chatCredits: 30 },
  stars70: { productId: "pro_star_70", priceId: "pri_star_70", chatCredits: 70 },
  starsPremium: { productId: "pro_star_250", priceId: "pri_star_250", chatCredits: 250 },
  monthlyMembership: { productId: "pro_monthly", priceId: "pri_monthly", chatCredits: 40 },
};

function subscriptionEvent(
  overrides: Partial<PaddleWebhookPayload["data"]> = {},
): PaddleWebhookPayload {
  return {
    event_id: "evt_123",
    event_type: "subscription.activated",
    occurred_at: "2026-07-07T00:00:00Z",
    data: {
      id: "sub_123",
      status: "active",
      custom_data: { userId: "user_123" },
      current_billing_period: {
        starts_at: "2026-07-07T00:00:00Z",
        ends_at: "2026-08-07T00:00:00Z",
      },
      items: [
        {
          price: {
            id: "pri_monthly",
            product_id: "pro_monthly",
          },
          quantity: 1,
        },
      ],
      ...overrides,
    },
  };
}

describe("paddle_membership", () => {
  it("resolves_subscription_activation_into_membership_upsert", () => {
    const result = resolvePaddleMembershipUpdate(subscriptionEvent(), products);

    expect(result).toEqual<PaddleMembershipUpdate>({
      userId: "user_123",
      provider: "paddle",
      subscriptionId: "sub_123",
      productType: "monthlyMembership",
      priceId: "pri_monthly",
      productId: "pro_monthly",
      status: "active",
      currentPeriodStart: "2026-07-07T00:00:00Z",
      currentPeriodEnd: "2026-08-07T00:00:00Z",
      canceledAt: null,
    });
  });

  it("maps_subscription_canceled_to_canceled_status_and_canceled_at", () => {
    const result = resolvePaddleMembershipUpdate({
      ...subscriptionEvent({
        status: "canceled",
        canceled_at: "2026-07-20T00:00:00Z",
      }),
      event_type: "subscription.canceled",
    }, products);

    expect(result).toEqual(
      expect.objectContaining({
        subscriptionId: "sub_123",
        status: "canceled",
        canceledAt: "2026-07-20T00:00:00Z",
      }),
    );
  });

  it("rejects_subscription_events_without_user_id_or_subscription_id", () => {
    expect(resolvePaddleMembershipUpdate(subscriptionEvent({ custom_data: {} }), products)).toEqual({
      error: "MISSING_USER_ID",
    });
    expect(resolvePaddleMembershipUpdate(subscriptionEvent({ id: "" }), products)).toEqual({
      error: "MISSING_SUBSCRIPTION_ID",
    });
  });

  it("rejects_subscription_events_without_membership_price_or_product_allowlist_match", () => {
    expect(resolvePaddleMembershipUpdate(subscriptionEvent({ items: [] }), products)).toEqual({
      error: "MISSING_PRICE_ID",
    });
    expect(
      resolvePaddleMembershipUpdate(
        subscriptionEvent({
          items: [{ price: { id: "pri_unknown", product_id: "pro_monthly" }, quantity: 1 }],
        }),
        products,
      ),
    ).toEqual({
      error: "UNKNOWN_PRICE_ID",
      priceId: "pri_unknown",
    });
    expect(
      resolvePaddleMembershipUpdate(
        subscriptionEvent({
          items: [{ price: { id: "pri_monthly", product_id: "pro_wrong" }, quantity: 1 }],
        }),
        products,
      ),
    ).toEqual({
      error: "PRODUCT_PRICE_MISMATCH",
      priceId: "pri_monthly",
      productId: "pro_wrong",
    });
    expect(
      resolvePaddleMembershipUpdate(
        subscriptionEvent({
          items: [{ price: { id: "pri_star_10", product_id: "pro_star_10" }, quantity: 1 }],
        }),
        products,
      ),
    ).toEqual({
      error: "NON_MEMBERSHIP_PRICE",
      priceId: "pri_star_10",
    });
  });
});
