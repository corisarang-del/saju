import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("design_audit_regression", () => {
  it("keeps_cookie_banner_from_covering_mobile_bottom_actions", () => {
    const content = readProjectFile("src/components/ui/cookie-consent.tsx");

    expect(content).toContain("role=\"region\"");
    expect(content).toContain("mx-auto max-w-5xl");
    expect(content).toContain('localStorage.setItem("cookie_consent", "dismissed")');
    expect(content).toContain("로그인과 서비스 이용에 필요한 쿠키만 사용해");
    expect(content).not.toContain("fixed");
    expect(content).not.toContain("top-[calc(env(safe-area-inset-top)+0.75rem)]");
    expect(content).not.toContain("fixed bottom-4 left-4 right-4");
    expect(content).not.toContain("bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]");
  });

  it("keeps_cookie_privacy_link_locale_aware", () => {
    const content = readProjectFile("src/components/ui/cookie-consent.tsx");

    expect(content).toContain('import { Link } from "@/i18n/routing";');
    expect(content).toContain('href="/privacy-policy"');
    expect(content).not.toContain('import Link from "next/link";');
  });

  it("prioritizes_only_the_first_landing_character_image_for_lcp", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("<CharacterCard char={char} index={index} isLoggedIn={isLoggedIn} />");
    expect(content).toContain("index: number;");
    expect(content).toContain("priority={index === 0}");
    expect(content).toContain('loading={index === 0 ? "eager" : "lazy"}');
    expect(content).toContain('fetchPriority={index === 0 ? "high" : "auto"}');
    expect(content).not.toContain("priority={true}");
  });

  it("uses_brand_primary_tokens_instead_of_toss_blue_for_core_ctas", () => {
    const files = [
      "src/components/saju/input/BirthDateForm.tsx",
      "src/components/saju/input/ConcernSelector.tsx",
      "src/components/saju/preview/PaywallOverlay.tsx",
      "src/components/saju/result/PdfDownloadButton.tsx",
      "src/components/saju/upsell/CompatibilityUpsell.tsx",
      "src/components/saju/payment/PaddleCheckout.tsx",
      "src/components/saju/payment/PaymentSuccess.tsx",
      "src/app/[locale]/reading/page.tsx",
      "src/app/[locale]/my-readings/page.tsx",
    ].filter((file) => existsSync(join(process.cwd(), file)));

    for (const file of files) {
      const content = readProjectFile(file);
      expect(content, `${file} still uses Toss blue`).not.toMatch(
        /#3182F6|#1B64DA|#E8F3FF|#F2F7FF|#1E40AF/,
      );
    }
  });

  it("names_character_carousel_controls_and_keeps_first_entry_user_controlled", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("aria-label={`${i + 1}번째 상담사 보기`}");
    expect(content).toContain("aria-current={i === activeIndex ? \"true\" : undefined}");
    expect(content).toContain("el.scrollLeft = 0");
    expect(content).not.toContain("setInterval");
    expect(content).not.toContain("autoScrollPausedRef");
    expect(content).not.toContain("onTouchEnd={() => { isHoveredRef.current = false; }}");
  });

  it("keeps_chat_birth_info_inputs_accessible_and_aligned_with_reading_form", () => {
    const content = readProjectFile("src/components/saju/chat/BirthInfoCard.tsx");

    expect(content).toContain('aria-label="이름"');
    expect(content).toContain('aria-label="태어난 연도"');
    expect(content).toContain('aria-label="태어난 월"');
    expect(content).toContain('aria-label="태어난 일"');
    expect(content).not.toContain("lastName");
    expect(content).not.toContain("firstName");
    expect(content).not.toMatch(/👤|💕/);
  });

  it("explains_gender_use_next_to_saju_gender_inputs", () => {
    const files = [
      "src/components/saju/input/BirthDateForm.tsx",
      "src/components/saju/chat/BirthInfoCard.tsx",
      "src/components/saju/landing/LoginSidebar.tsx",
    ];

    for (const file of files) {
      const content = readProjectFile(file);
      expect(content, `${file} should explain gender usage`).toContain(
        "성별은 사주 계산 기준에 필요해서만 사용해",
      );
    }
  });

  it("keeps_star_pack_badges_separate_for_screen_readers", () => {
    const coinShop = readProjectFile("src/components/saju/coin-shop/CoinShopClient.tsx");
    const landing = readProjectFile("src/app/[locale]/page.tsx");

    expect(coinShop).toContain('aria-label={getStarPackAriaLabel(pack)}');
    expect(coinShop).toContain('aria-hidden="true"');
    expect(landing).toContain('aria-label={`별 ${pack.stars}개');
    expect(landing).toContain('aria-hidden="true"');
  });

  it("keeps_landing_free_trial_copy_as_three_free_sessions", () => {
    const files = [
      "src/components/saju/landing/CharacterCards.tsx",
      "src/components/saju/landing/SajuFAQ.tsx",
      "src/app/[locale]/page.tsx",
      "src/app/[locale]/layout.tsx",
    ];

    for (const file of files) {
      const content = readProjectFile(file);
      expect(content, `${file} should explain free benefit as sessions`).toContain(
        "3회 무료",
      );
      expect(content, `${file} still says three free stars`).not.toMatch(
        /3별|별\s*3개[^\\n]*(무료|드려요|제공)/,
      );
    }
  });

  it("explains_unknown_birth_time_is_allowed_near_all_entry_forms", () => {
    const files = [
      "src/components/saju/input/BirthDateForm.tsx",
      "src/components/saju/chat/BirthInfoCard.tsx",
      "src/components/saju/landing/LoginSidebar.tsx",
      "src/components/saju/report/SajuReportClient.tsx",
    ];

    for (const file of files) {
      const content = readProjectFile(file);
      expect(content, `${file} should reduce birth-time pressure`).toContain(
        "태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.",
      );
    }
  });

  it("keeps_star_pack_badges_visually_separated_from_star_counts", () => {
    const coinShop = readProjectFile("src/components/saju/coin-shop/CoinShopClient.tsx");
    const landing = readProjectFile("src/app/[locale]/page.tsx");

    expect(coinShop).toContain("flex flex-wrap items-center gap-x-3 gap-y-1");
    expect(coinShop).toContain("rounded-full border border-white/10 bg-stone-200/10");
    expect(landing).toContain("flex flex-wrap items-center gap-x-3 gap-y-1");
    expect(landing).toContain("rounded-full border border-white/15 bg-white/10");
  });

  it("uses_warm_neutral_support_surfaces_for_long_reading_comfort", () => {
    const landing = readProjectFile("src/app/[locale]/page.tsx");
    const faq = readProjectFile("src/components/saju/landing/SajuFAQ.tsx");

    expect(landing).toContain("bg-[#3a332b]");
    expect(landing).not.toContain("bg-purple-950 p-5 text-white");
    expect(faq).toContain("bg-[#f6f1e8]");
    expect(faq).not.toContain("bg-[#0e0e15]");
  });

  it("keeps_login_sidebar_secondary_to_free_trial_value", () => {
    const content = readProjectFile("src/components/saju/landing/LoginSidebar.tsx");

    expect(content).toContain("무료 3회로 먼저 확인하기");
    expect(content).toContain("대화 기록은 로그인 후 자동으로 저장돼");
    expect(content).not.toContain("대화 기록을 저장하세요");
  });

  it("keeps_pc_landing_character_carousel_clear_of_the_sidebar_with_intentional_edge_fade", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("max-w-5xl");
    expect(content).toContain("md:px-0");
    expect(content).toContain("md:[mask-image:linear-gradient");
    expect(content).toContain("transparent_64px");
    expect(content).toContain("black_116px");
    expect(content).toContain("scroll-ps-4 md:scroll-ps-0");
    expect(content).toContain("snap-start md:snap-center");
  });

  it("keeps_first_desktop_character_card_fully_visible_before_left_edge_fade_starts", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("activeIndex > 0");
    expect(content).toContain("black_0,black_calc(100%-28px),transparent_100%");
    expect(content).toContain("transparent_64px,black_116px");
  });

  it("keeps_mobile_first_character_cta_reachable_above_the_fold", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("auto-cols-[62vw]");
    expect(content).toContain("max-w-[236px]");
    expect(content).toContain("aspect-[5/6]");
    expect(content).toContain("p-2.5 md:p-4");
    expect(content).toContain("hidden sm:block");
    expect(content).toContain("pt-2.5 md:pt-3");
    expect(content).toContain("pt-3 md:pt-8 pb-2 md:pb-6");
  });

  it("keeps_pc_720h_character_name_line_above_the_fold_when_cookie_banner_is_visible", () => {
    const characterCards = readProjectFile("src/components/saju/landing/CharacterCards.tsx");
    const landing = readProjectFile("src/app/[locale]/page.tsx");

    expect(characterCards).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:pt-3");
    expect(characterCards).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:pb-1");
    expect(characterCards).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:aspect-[7/8]");
    expect(characterCards).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:p-2.5");
    expect(landing).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:pt-4");
    expect(landing).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:text-[2.35rem]");
    expect(landing).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:mt-2");
  });

  it("keeps_pc_720h_character_action_area_with_breathing_room", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:auto-cols-[244px]");
    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:aspect-[7/8]");
    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:hidden");
    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:p-2.5");
    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:mt-2");
    expect(content).toContain("[@media_(min-width:1024px)_and_(max-height:760px)]:pt-2");
  });

  it("keeps_landing_character_cards_as_premium_double_bezel_surfaces", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("p-1.5 rounded-[30px] bg-white/55 ring-1 ring-white/75");
    expect(content).toContain("rounded-[24px] overflow-hidden bg-white");
    expect(content).toContain("shadow-[0_22px_52px_-38px_rgba(91,76,58,0.42)]");
    expect(content).toContain("shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]");
    expect(content).toContain("border-t border-[#eee7dd]");
    expect(content).not.toContain("shadow-md");
    expect(content).not.toContain("shadow-lg");
  });

  it("keeps_landing_accent_hierarchy_muted_outside_primary_ctas", () => {
    const characterCards = readProjectFile("src/components/saju/landing/CharacterCards.tsx");
    const landing = readProjectFile("src/app/[locale]/page.tsx");

    expect(characterCards).toContain("i === activeIndex ? \"w-6 bg-[#7b5d87]\"");
    expect(characterCards).toContain("bg-white/90 text-[var(--character-accent)] ring-1 ring-white/70");
    expect(characterCards).toContain("bg-[#6f3f93] text-white");
    expect(characterCards).not.toContain("bg-purple-700");
    expect(characterCards).not.toContain("text-white shadow-lg");
    expect(landing).toContain("text-[#6f5f74]");
    expect(landing).toContain("text-[#76607b]");
    expect(landing).not.toContain("text-purple-800");
  });

  it("keeps_reading_flow_progress_muted_while_primary_cta_stays_dominant", () => {
    const reading = readProjectFile("src/app/[locale]/reading/page.tsx");
    const birthForm = readProjectFile("src/components/saju/input/BirthDateForm.tsx");
    const concern = readProjectFile("src/components/saju/input/ConcernSelector.tsx");

    expect(reading).toContain("bg-[#eee8df]");
    expect(reading).toContain("bg-[#c7b2d2]");
    expect(reading).toContain("border-[#eadfe8] bg-[#fbf7f1]");
    expect(reading).not.toContain("border border-purple-100 bg-purple-50");
    expect(birthForm).toContain("border-[#8c659f] bg-[#8c659f]/[0.06] text-[#6f3f93]");
    expect(birthForm).toContain("bg-[#6f3f93] hover:bg-[#5f347f]");
    expect(concern).toContain("bg-[#8c659f]/[0.10] text-[#5f347f] ring-1 ring-[#8c659f]/25");
    expect(concern).toContain("bg-[#6f3f93] hover:bg-[#5f347f]");
  });

  it("prevents_pc_landing_h1_widow_line_breaks_with_a_wider_measure_and_balanced_wrap", () => {
    const content = readProjectFile("src/app/[locale]/page.tsx");

    expect(content).toContain("max-w-[760px]");
    expect(content).toContain("text-balance");
    expect(content).toContain("md:text-[2.65rem]");
    expect(content).toContain('<span className="inline-block">캐릭터를 고르면</span>');
    expect(content).toContain('<span className="inline-block">오늘의 흐름부터</span>');
    expect(content).toContain('<span className="inline-block">먼저 정리해줄게</span>');
  });

  it("raises_mobile_reading_form_placeholder_and_helper_text_contrast", () => {
    const content = readProjectFile("src/components/saju/input/BirthDateForm.tsx");

    expect(content).toContain("placeholder:text-[#667085]");
    expect(content).toContain("data-[placeholder]:text-[#4E5968]");
    expect(content).toContain("data-[placeholder]:font-medium");
    expect(content).toContain('placeholder="시간을 선택하세요 (선택)"');
    expect(content).toContain("text-[#4E5968]");
    expect(content).toContain("text-[#6B7280]");
    expect(content).not.toContain("text-[#8B95A1]\">예:");
  });

  it("provides_an_analytics_track_route_so_production_page_views_do_not_404", () => {
    const routePath = "src/app/api/analytics/track/route.ts";
    const content = readProjectFile(routePath);

    expect(content).toContain("export async function POST");
    expect(content).toContain("trackEvent");
    expect(content).toContain("Response.json({ ok: true })");
  });
});
