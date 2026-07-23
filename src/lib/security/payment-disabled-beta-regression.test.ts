import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("payment_disabled_beta_regression", () => {
  it("keeps_non_payment_release_gate_separate_from_paddle_reopen_gate", () => {
    const packageJson = readProjectFile("package.json");
    const scripts = JSON.parse(packageJson).scripts as Record<string, string>;

    expect(packageJson).toContain('"release:gate"');
    expect(packageJson).toContain('"release:gate:code"');
    expect(packageJson).toContain('"release:gate:payments"');
    expect(scripts["release:gate:code"]).toContain("pnpm test:env && pnpm test");
    expect(scripts["release:gate"]).toContain("pnpm qa:live-api:free");
    expect(scripts["release:gate"]).toContain("pnpm qa:live-api");
    expect(scripts["release:gate:payments"]).toContain("REQUIRE_PADDLE_ENV=true pnpm test:env");
  });

  it("blocks_coin_shop_direct_access_when_payments_are_disabled", () => {
    const page = readProjectFile("src/app/[locale]/coin-shop/page.tsx");

    expect(page).toContain("arePaymentsEnabled");
    expect(page).toContain("무료 상담 베타로 운영 중이야");
    expect(page).toContain("정식 결제 기능은 안정화 후 열릴 예정이야");
  });

  it("prevents_paddle_checkout_when_public_payment_flag_is_off", () => {
    const client = readProjectFile("src/lib/paddle/client.ts");
    const wrapper = readProjectFile("src/components/saju/payment/PaddleCheckout.tsx");

    expect(client).toContain("assertPaymentsEnabled");
    expect(client).toContain("areClientPaymentsEnabled");
    expect(wrapper).toContain("areClientPaymentsEnabled");
    expect(wrapper).toContain("결제 기능은 준비 중이야");
  });

  it("hides_charge_entry_points_in_core_user_flows_when_payment_flag_is_off", () => {
    const navbar = readProjectFile("src/components/saju/landing/SajuNavbar.tsx");
    const sidebar = readProjectFile("src/components/saju/landing/LoginSidebar.tsx");
    const chatInput = readProjectFile("src/components/saju/chat/ChatInput.tsx");
    const chatPaywall = readProjectFile("src/components/saju/chat/ChatPaywall.tsx");

    for (const [file, content] of Object.entries({ navbar, sidebar, chatInput, chatPaywall })) {
      expect(content, file).toContain("areClientPaymentsEnabled");
    }
  });

  it("keeps_monthly_and_full_report_purchase_ctas_hidden_when_payments_are_disabled", () => {
    const reportsPage = readProjectFile("src/app/[locale]/reports/page.tsx");
    const monthlyUnlock = readProjectFile("src/components/saju/reports/MonthlyReportUnlockClient.tsx");
    const sajuReportPage = readProjectFile("src/app/[locale]/saju-report/page.tsx");
    const reportClient = readProjectFile("src/components/saju/report/SajuReportClient.tsx");

    expect(reportsPage).toContain("paymentsEnabled={paymentsEnabled}");
    expect(monthlyUnlock).toContain("paymentsEnabled");
    expect(monthlyUnlock).toContain("상세판은 정식 결제 안정화 후 열릴 예정이야");
    expect(sajuReportPage).toContain("arePaymentsEnabled");
    expect(sajuReportPage).toContain("종합 사주 백서는 정식 결제 기능 안정화 후 열릴 예정이야");
    expect(reportClient).toContain("areClientPaymentsEnabled");
  });
});
