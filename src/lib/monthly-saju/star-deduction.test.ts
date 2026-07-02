import { describe, expect, it } from "vitest";
import { getReportStarDeduction } from "./star-deduction";

describe("report_star_deduction_policy", () => {
  it("ignores_client_amount_and_uses_the_server_report_cost", () => {
    expect(getReportStarDeduction({ clientAmount: -1000 })).toEqual({
      cost: 1,
      transactionAmount: -1,
      type: "report",
    });
  });
});
