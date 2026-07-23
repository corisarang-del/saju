import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("monthly_report_regression", () => {
  it("opens_monthly_report_detail_only_after_three_star_server_deduction", () => {
    const route = readProjectFile("src/app/api/monthly-saju/deduct-monthly-report/route.ts");
    const migration = readProjectFile("supabase/migrations/202607070030_monthly_report_star_cost.sql");
    const page = readProjectFile("src/app/[locale]/reports/page.tsx");

    expect(route).toContain("MONTHLY_REPORT_STAR_COST");
    expect(route).toContain("deduct_stars_for_monthly_report");
    expect(route).not.toContain("clientAmount");
    expect(migration).toContain("v_report_cost integer := 3");
    expect(migration).toContain("type = 'monthly_report'");
    expect(page).toContain("MonthlyReportUnlockClient");
  });

  it("renders_monthly_report_from_personalized_domain_builder_instead_of_static_sections", () => {
    const page = readProjectFile("src/app/[locale]/reports/page.tsx");

    expect(page).toContain("createMonthlyStrategyReport");
    expect(page).toContain("coaching_snapshots");
    expect(page).toContain("saju_chat_messages");
    expect(page).toContain("summarizeConversationMemory");
    expect(page).not.toContain("const monthlySections =");
  });
});
