import { describe, expect, it } from "vitest";
import {
  calculateStarBalance,
  parseStarAmount,
  toTransactionAmount,
} from "./star-adjustment";

describe("admin_star_adjustment", () => {
  it("adds_stars_when_admin_credits_user", () => {
    expect(calculateStarBalance({ currentBalance: 15, amount: 100, mode: "credit" })).toBe(115);
  });

  it("subtracts_stars_when_admin_debits_user", () => {
    expect(calculateStarBalance({ currentBalance: 15, amount: 5, mode: "debit" })).toBe(10);
  });

  it("rejects_debit_when_amount_exceeds_current_balance", () => {
    expect(() =>
      calculateStarBalance({ currentBalance: 15, amount: 16, mode: "debit" }),
    ).toThrow("잔액보다 많이 차감할 수 없어");
  });

  it("parses_positive_integer_amounts_only", () => {
    expect(parseStarAmount("10000")).toBe(10000);
    expect(() => parseStarAmount("0")).toThrow("1개 이상 입력해줘");
    expect(() => parseStarAmount("1.5")).toThrow("정수로 입력해줘");
  });

  it("stores_negative_transaction_amount_for_debits", () => {
    expect(toTransactionAmount({ mode: "credit", amount: 7 })).toBe(7);
    expect(toTransactionAmount({ mode: "debit", amount: 7 })).toBe(-7);
  });
});
