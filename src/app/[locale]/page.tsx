import SajuLayout from "@/components/saju/layout/SajuLayout";
import CharacterCards from "@/components/saju/landing/CharacterCards";
import SajuTestimonials from "@/components/saju/landing/SajuTestimonials";
import SajuFAQ from "@/components/saju/landing/SajuFAQ";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import { createClient } from "@/utils/supabase/server";
import type { CharacterType } from "@/lib/saju/characters";
import type { SajuReading } from "@/types/saju";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      <div className="bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f7f3ea_34%,#fffaf0_100%)]">
        <div className="mx-auto max-w-5xl px-4 pt-8">
          <p className="text-sm font-semibold text-teal-800">먼저 챙겨주는 사주친구</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-950">
            캐릭터를 고르면 오늘의 흐름부터 먼저 정리해줄게
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            월간사주는 사주와 대화 기억을 바탕으로 아침, 중요한 선택 전, 관계가 흔들리는 순간에 바로 쓸 수 있는 조언을 건네.
          </p>
        </div>
        <CharacterCards isLoggedIn={!!user} />
      </div>
      <SajuTestimonials />
      <SajuFAQ />
      <SajuFooter />
    </SajuLayout>
  );
}
