export const REPORT_STAR_COST = 1;

export function getReportStarDeduction(input?: { clientAmount?: unknown }) {
  void input;

  return {
    cost: REPORT_STAR_COST,
    transactionAmount: -REPORT_STAR_COST,
    type: "report" as const,
  };
}
