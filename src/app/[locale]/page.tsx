import SajuLayout from "@/components/saju/layout/SajuLayout";
import CharacterCards from "@/components/saju/landing/CharacterCards";
import SajuTestimonials from "@/components/saju/landing/SajuTestimonials";
import SajuFAQ from "@/components/saju/landing/SajuFAQ";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import { createClient } from "@/utils/supabase/server";
import type { CharacterType } from "@/lib/saju/characters";
import type { SajuReading } from "@/types/saju";
import {
  formatWon,
  MONTHLY_MEMBERSHIP,
  STAR_PACKS,
  STAR_USAGE_SUMMARY,
} from "@/lib/monthly-saju/pricing";
import { arePaymentsEnabled } from "@/lib/payments/feature-flag";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const paymentsEnabled = arePaymentsEnabled();

  // 로그인 유저면 최근 reading에서 사주 정보 가져오기
  let currentReading;
  if (user) {
    const { data: latestReading } = await supabase
      .from("saju_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestReading) {
      const r = latestReading as SajuReading;
      currentReading = {
        id: r.id,
        characterId: (r.character_id || "charon_m") as CharacterType,
        name: r.name,
        gender: r.gender as "male" | "female",
        birthYear: r.birth_year,
        birthMonth: r.birth_month,
        birthDay: r.birth_day,
        birthHour: r.birth_hour,
        isLunar: r.is_lunar,
        birthCity: r.birth_city ?? undefined,
      };
    }
  }

  return (
    <SajuLayout currentReading={currentReading}>
      {/* 카드 + 이용방법 = 한 영역 */}
      <div className="bg-[radial-gradient(circle_at_top_left,#ede9fe_0,#f7f3ea_36%,#fffaf0_100%)]">
        <div className="mx-auto max-w-5xl px-4 pt-7 md:pt-8">
          <p className="text-sm font-semibold text-purple-800">먼저 챙겨주는 사주친구</p>
          <h1 className="mt-3 max-w-[760px] text-balance text-[2rem] font-bold leading-[1.08] tracking-tight text-slate-950 md:text-[2.65rem]">
            캐릭터를 고르면{" "}
            <span className="inline-block">오늘의 흐름부터</span>{" "}
            <span className="inline-block">먼저 정리해줄게</span>
          </h1>
          <p className="mt-4 max-w-[680px] text-sm leading-6 text-slate-600">
            월간사주는 사주와 대화 기억을 바탕으로 아침, 중요한 선택 전, 관계가 흔들리는 순간에 바로 쓸 수 있는 조언을 건네.
          </p>
        </div>
        <CharacterCards isLoggedIn={!!user} />
        <section className="mx-auto grid max-w-5xl gap-3 px-4 pt-2 md:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-800">무료 맛보기 결과</p>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">오늘의 샘플 한 문단</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              지금은 마음이 먼저 앞서기 쉬운 흐름이야. 특히 답장을 기다리거나 이직 결정을 미룰수록 생각이 더 커질 수 있어. 오늘은 결론을 내리기보다, 내가 원하는 조건을 세 줄로 적고 상대나 회사의 반응을 차분히 확인해봐. 네 사주는 감으로 밀어붙일 때보다 기준을 정해두고 움직일 때 훨씬 덜 흔들려.
            </p>
          </div>
          <div className="rounded-3xl border border-stone-200/30 bg-[#3a332b] p-5 text-white shadow-[0_20px_48px_-34px_rgba(58,51,43,0.55)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-200">가격과 별 사용 기준</p>
            <h2 className="mt-3 text-xl font-bold tracking-tight">{STAR_USAGE_SUMMARY}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-100/80">
              {paymentsEnabled
                ? "가입하면 3회 무료 상담을 먼저 받고, 이후에는 필요한 만큼 별을 충전해서 모든 상담사에게 공통으로 사용할 수 있어."
                : "가입하면 3회 무료 상담을 먼저 받을 수 있어. 유료 충전과 멤버십은 준비 중이야."}
            </p>
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-3 py-3">
              <p className="text-xs font-semibold text-stone-100">
                {paymentsEnabled ? "월간 멤버십" : "월간 멤버십 준비 중"}
              </p>
              <p className="mt-1 text-sm leading-6 text-stone-100/85">
                {paymentsEnabled
                  ? `월 ${formatWon(MONTHLY_MEMBERSHIP.price)}에 매월 별 ${MONTHLY_MEMBERSHIP.stars}개를 받아 자주 상담할 때 부담을 줄일 수 있어.`
                  : `매월 별 ${MONTHLY_MEMBERSHIP.stars}개를 받는 멤버십은 정식 결제 기능 안정화 후 열릴 예정이야.`}
              </p>
            </div>
            <dl className="mt-4 space-y-2">
              {STAR_PACKS.map((pack) => (
                <div
                  key={pack.type}
                  aria-label={`별 ${pack.stars}개${"badge" in pack && pack.badge ? `, ${pack.badge} 상품` : ""}, ${formatWon(pack.price)}`}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 pt-2 text-sm"
                >
                  <dt className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-stone-50">
                    <span>별 {pack.stars}개</span>
                    {"badge" in pack && pack.badge ? (
                      <span aria-hidden="true" className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] text-stone-50">
                        {pack.badge}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="font-bold">{formatWon(pack.price)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
      <SajuTestimonials />
      <SajuFAQ />
      <SajuFooter />
    </SajuLayout>
  );
}
