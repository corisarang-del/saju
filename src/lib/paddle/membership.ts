import type { PaddleWebhookPayload } from "./webhook";
import { PADDLE_CONFIG, type ProductType } from "./config";

export type PaddleMembershipStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "canceled"
  | "unpaid"
  | "unknown";

export type PaddleMembershipUpdate =
  | {
      userId: string;
      provider: "paddle";
      subscriptionId: string;
      productType: "monthlyMembership";
      priceId: string;
      productId: string;
      status: PaddleMembershipStatus;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      canceledAt: string | null;
    }
  | {
      error:
        | "MISSING_USER_ID"
        | "MISSING_SUBSCRIPTION_ID"
        | "MISSING_PRICE_ID"
        | "UNKNOWN_PRICE_ID"
        | "PRODUCT_PRICE_MISMATCH"
        | "NON_MEMBERSHIP_PRICE";
      priceId?: string;
      productId?: string;
    };

type PaddleProductPrice = {
  productId: string;
  priceId: string;
};

type PaddleProducts = Record<ProductType, PaddleProductPrice>;

function normalizeStatus(status: string | undefined): PaddleMembershipStatus {
  if (
    status === "active"
    || status === "trialing"
    || status === "past_due"
    || status === "paused"
    || status === "canceled"
    || status === "unpaid"
  ) {
    return status;
  }

  return "unknown";
}

export function resolvePaddleMembershipUpdate(
  event: PaddleWebhookPayload,
  products: PaddleProducts = PADDLE_CONFIG.products,
): PaddleMembershipUpdate {
  const userId = event.data.custom_data?.userId;
  if (!userId) {
    return { error: "MISSING_USER_ID" };
  }

  const subscriptionId = event.data.id?.trim();
  if (!subscriptionId) {
    return { error: "MISSING_SUBSCRIPTION_ID" };
  }

  const item = event.data.items?.[0];
  const priceId = item?.price.id;
  if (!priceId) {
    return { error: "MISSING_PRICE_ID" };
  }

  const productId = item.price.product_id;
  const matchedProduct = Object.entries(products).find(
    ([, product]) => product.priceId === priceId,
  );

  if (!matchedProduct) {
    return { error: "UNKNOWN_PRICE_ID", priceId };
  }

  const [productType, product] = matchedProduct as [ProductType, PaddleProductPrice];
  if (product.productId !== productId) {
    return { error: "PRODUCT_PRICE_MISMATCH", priceId, productId };
  }

  if (productType !== "monthlyMembership") {
    return { error: "NON_MEMBERSHIP_PRICE", priceId };
  }

  return {
    userId,
    provider: "paddle",
    subscriptionId,
    productType,
    priceId,
    productId,
    status: normalizeStatus(event.data.status),
    currentPeriodStart: event.data.current_billing_period?.starts_at ?? null,
    currentPeriodEnd: event.data.current_billing_period?.ends_at ?? null,
    canceledAt: event.data.canceled_at ?? null,
  };
}
