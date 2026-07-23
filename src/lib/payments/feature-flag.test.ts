import { describe, expect, it } from "vitest";
import {
  areClientPaymentsEnabled,
  arePaymentsEnabled,
  assertPaymentsEnabled,
} from "./feature-flag";

describe("payments_feature_flag", () => {
  it("keeps_payments_disabled_by_default_when_env_is_missing", () => {
    expect(arePaymentsEnabled({})).toBe(false);
    expect(areClientPaymentsEnabled({})).toBe(false);
  });

  it("enables_server_payment_routes_only_when_server_flag_is_true", () => {
    expect(arePaymentsEnabled({ PAYMENTS_ENABLED: "true" })).toBe(true);
    expect(arePaymentsEnabled({ PAYMENTS_ENABLED: "false" })).toBe(false);
    expect(arePaymentsEnabled({ PAYMENTS_ENABLED: "1" })).toBe(true);
  });

  it("enables_browser_checkout_only_when_public_flag_is_true", () => {
    expect(areClientPaymentsEnabled({ PAYMENTS_ENABLED: "true" })).toBe(false);
    expect(areClientPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "true" })).toBe(true);
  });

  it("throws_before_checkout_when_public_payment_flag_is_off", () => {
    expect(() => assertPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "false" })).toThrow(
      "결제 기능은 현재 비활성화되어 있어.",
    );
  });
}
);
