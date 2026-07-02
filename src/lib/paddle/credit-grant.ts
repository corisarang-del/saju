import { PADDLE_CONFIG, type ProductType } from "./config";
import type { PaddleWebhookPayload } from "./webhook";

type PaddleProductPrice = {
  priceId: string;
  chatCredits: number;
};

type PaddleProducts = Record<ProductType, PaddleProductPrice>;

export type PaddleCreditGrant =
  | {
      userId: string;
      transactionId: string;
      productType: ProductType;
      priceId: string;
      credits: number;
    }
  | {
      error: "MISSING_USER_ID" | "MISSING_PRICE_ID" | "UNKNOWN_PRICE_ID";
      priceId?: string;
    };

function findProductByPriceId(
  priceId: string,
  products: PaddleProducts,
): { productType: ProductType; product: PaddleProductPrice } | null {
  for (const [productType, product] of Object.entries(products)) {
    if (product.priceId === priceId) {
      return { productType: productType as ProductType, product };
    }
  }

  return null;
}

export function resolvePaddleCreditGrant(
  event: PaddleWebhookPayload,
  products: PaddleProducts = PADDLE_CONFIG.products,
): PaddleCreditGrant {
  const userId = event.data.custom_data?.userId;
  if (!userId) {
    return { error: "MISSING_USER_ID" };
  }

  const item = event.data.items?.[0];
  const priceId = item?.price.id;
  if (!priceId) {
    return { error: "MISSING_PRICE_ID" };
  }

  const matched = findProductByPriceId(priceId, products);
  if (!matched) {
    return { error: "UNKNOWN_PRICE_ID", priceId };
  }

  return {
    userId,
    transactionId: event.data.id,
    productType: matched.productType,
    priceId,
    credits: matched.product.chatCredits * Math.max(1, item.quantity ?? 1),
  };
}
