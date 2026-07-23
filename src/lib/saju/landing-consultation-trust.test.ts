import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("landing_consultation_trust", () => {
  it("shows_free_trial_and_price_context_before_or_inside_character_login_flow", () => {
    const characterCards = readProjectFile("src/components/saju/landing/CharacterCards.tsx");
    const landingPage = readProjectFile("src/app/[locale]/page.tsx");
    const authForm = readProjectFile("src/components/features/auth/AuthForm.tsx");

    expect(characterCards).toContain("가입하면 3회 무료");
    expect(characterCards).toContain("1별 = 메시지 1회");
    expect(characterCards).toContain("가입 후에도 가격을 확인할 수 있어요");
    expect(landingPage).toContain("MONTHLY_MEMBERSHIP");
    expect(landingPage).toContain("월간 멤버십");
    expect(landingPage).toContain("매월");
    expect(authForm).toContain("3회 무료 상담");
    expect(authForm).toContain("1별 = 메시지 1회");
  });

  it("keeps_sidebar_login_help_readable_for_assistive_technology", () => {
    const sidebar = readProjectFile("src/components/saju/landing/LoginSidebar.tsx");

    expect(sidebar).toContain('aria-label="로그인하면 모든 대화 기록을 저장하고 다시 볼 수 있어요"');
    expect(sidebar).not.toContain("대화 기록을저장");
  });

  it("keeps_mobile_price_badges_visually_separate_from_star_counts", () => {
    const coinShop = readProjectFile("src/components/saju/coin-shop/CoinShopClient.tsx");

    expect(coinShop).toContain("gap-x-3 gap-y-1");
    expect(coinShop).toContain("shrink-0");
    expect(coinShop).toContain("min-w-0");
    expect(coinShop).toContain("aria-hidden=\"true\"");
  });
});
