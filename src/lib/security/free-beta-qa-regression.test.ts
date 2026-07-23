import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("free_beta_qa_regression", () => {
  it("returns_json_unauthorized_response_from_chat_api", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(route).toContain('error: "unauthorized"');
    expect(route).toContain('message: "로그인이 필요해."');
    expect(route).toContain("Response.json");
    expect(route).not.toContain('new Response("Unauthorized"');
  });

  it("keeps_free_beta_public_copy_from_implying_payment_is_open", () => {
    const layout = readProjectFile("src/app/[locale]/layout.tsx");
    const footer = readProjectFile("src/components/saju/landing/SajuFooter.tsx");
    const koMessages = readProjectFile("messages/ko.json");
    const terms = readProjectFile("src/app/[locale]/(marketing)/terms/page.tsx");
    const privacy = readProjectFile("src/app/[locale]/(marketing)/privacy-policy/page.tsx");
    const coinShopPage = readProjectFile("src/app/[locale]/coin-shop/page.tsx");
    const coinShopClient = readProjectFile("src/components/saju/coin-shop/CoinShopClient.tsx");
    const chatInput = readProjectFile("src/components/saju/chat/ChatInput.tsx");
    const chatPaywall = readProjectFile("src/components/saju/chat/ChatPaywall.tsx");
    const monthlyUnlock = readProjectFile("src/components/saju/reports/MonthlyReportUnlockClient.tsx");
    const reportClient = readProjectFile("src/components/saju/report/SajuReportClient.tsx");

    expect(layout).toContain("arePaymentsEnabled");
    expect(layout).toContain("유료 충전과 멤버십은 정식 결제 기능 안정화 후 열릴 예정입니다.");
    expect(layout).not.toContain("이후에는 별을 충전하여 계속 상담할 수 있습니다.");
    expect(layout).not.toContain("별 충전으로 상담을 이어갈 수 있습니다.");
    expect(footer).toContain("areClientPaymentsEnabled");
    expect(footer).toContain("지금은 무료 상담 베타로 운영 중입니다.");
    expect(koMessages).toContain("유료 충전과 멤버십은 정식 결제 기능 안정화 후 열릴 예정입니다.");
    expect(terms).toContain("정식 결제 기능 안정화 후 열릴 예정입니다.");
    expect(privacy).toContain("결제 기능이 열리는 경우");

    for (const [file, content] of Object.entries({
      layout,
      footer,
      coinShopPage,
      coinShopClient,
      chatInput,
      chatPaywall,
      monthlyUnlock,
      reportClient,
    })) {
      expect(content, file).not.toContain("결제는 Paddle의 안전한 결제 시스템을 통해 처리됩니다");
      expect(content, file).not.toContain("별을 충전해주세요");
      expect(content, file).not.toContain("별 충전하러 가기");
      expect(content, file).not.toContain("별 충전하기");
    }
  });

  it("keeps_login_sidebar_visual_text_from_joining_words_in_snapshots", () => {
    const sidebar = readProjectFile("src/components/saju/landing/LoginSidebar.tsx");

    expect(sidebar).toContain("로그인하면 모든 대화 기록을 저장하고 다시 볼 수 있어요");
    expect(sidebar).not.toContain("로그인하면 모든 대화 기록을\n");
    expect(sidebar).not.toContain("대화 기록을저장");
  });
});
