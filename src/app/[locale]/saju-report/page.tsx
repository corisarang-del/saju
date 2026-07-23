import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuReportClient from "@/components/saju/report/SajuReportClient";
import { arePaymentsEnabled } from "@/lib/payments/feature-flag";

export default async function SajuReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ko?login=required");
  }

  if (!arePaymentsEnabled()) {
    return (
      <SajuLayout>
        <main className="min-h-[calc(100vh-48px)] bg-[#fbf7ef] px-4 py-10">
          <section className="mx-auto max-w-lg rounded-[28px] border border-stone-200 bg-white p-6 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-bold text-purple-800">무료 상담 베타 운영 중</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              종합 사주 백서는 정식 결제 기능 안정화 후 열릴 예정이야
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              지금은 첫 상담, 오늘피드, 월간 리포트 미리보기를 먼저 안정화하고 있어.
            </p>
          </section>
        </main>
      </SajuLayout>
    );
  }

  // 별 잔액 조회
  const { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const starBalance = stars?.balance ?? 0;

  // 최근 사주 정보 (내 정보 사용하기 용)
  const { data: latestReading } = await supabase
    .from("saju_readings")
    .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previousBirthInfo = latestReading
    ? {
        name: latestReading.name as string,
        gender: latestReading.gender as "male" | "female",
        birthYear: latestReading.birth_year as number,
        birthMonth: latestReading.birth_month as number,
        birthDay: latestReading.birth_day as number,
        birthHour: latestReading.birth_hour as number | null,
        isLunar: latestReading.is_lunar as boolean,
        birthCity: (latestReading.birth_city as string) ?? undefined,
      }
    : undefined;

  return (
    <SajuLayout>
      <SajuReportClient
        userId={user.id}
        starBalance={starBalance}
        previousBirthInfo={previousBirthInfo}
      />
    </SajuLayout>
  );
}
