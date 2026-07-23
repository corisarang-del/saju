import { describe, expect, it } from "vitest";
import {
  getChatMessageStarDeduction,
  getFullReportStarDeduction,
  getMonthlyReportStarDeduction,
} from "./star-deduction";

describe("report_star_deduction_policy", () => {
  it("charges_one_star_for_chat_three_for_monthly_report_five_for_full_report", () => {
    expect({
      chat: getChatMessageStarDeduction({ clientAmount: -1000 }),
      monthlyReport: getMonthlyReportStarDeduction({ clientAmount: -1000 }),
      fullReport: getFullReportStarDeduction({ clientAmount: -1000 }),
    }).toEqual({
      chat: { cost: 1, transactionAmount: -1, type: "chat_message" },
      monthlyReport: { cost: 3, transactionAmount: -3, type: "monthly_report" },
      fullReport: { cost: 5, transactionAmount: -5, type: "full_report" },
    });
  });
});
