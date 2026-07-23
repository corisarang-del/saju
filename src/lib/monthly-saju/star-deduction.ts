import {
  CHAT_MESSAGE_STAR_COST,
  FULL_REPORT_STAR_COST,
  MONTHLY_REPORT_STAR_COST,
} from "./pricing";

function getServerStarDeduction<TType extends string>(
  input: { clientAmount?: unknown } | undefined,
  cost: number,
  type: TType,
) {
  void input;

  return {
    cost,
    transactionAmount: -cost,
    type,
  };
}

export const REPORT_STAR_COST = FULL_REPORT_STAR_COST;

export function getChatMessageStarDeduction(input?: { clientAmount?: unknown }) {
  return getServerStarDeduction(input, CHAT_MESSAGE_STAR_COST, "chat_message" as const);
}

export function getMonthlyReportStarDeduction(input?: { clientAmount?: unknown }) {
  return getServerStarDeduction(input, MONTHLY_REPORT_STAR_COST, "monthly_report" as const);
}

export function getFullReportStarDeduction(input?: { clientAmount?: unknown }) {
  return getServerStarDeduction(input, FULL_REPORT_STAR_COST, "full_report" as const);
}

export function getReportStarDeduction(input?: { clientAmount?: unknown }) {
  return getFullReportStarDeduction(input);
}
