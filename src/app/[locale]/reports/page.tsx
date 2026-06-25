import SajuLayout from "@/components/saju/layout/SajuLayout";
import { Link } from "@/i18n/routing";
import { getPaymentPromptState } from "@/lib/monthly-saju/billing";
import { createClient } from "@/utils/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let freeQuotaRemaining = 0;

  if (user) {
    const { data: stars } = await supabase
      .from("user_stars")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    freeQuotaRemaining = Math.max(0, Number(stars?.balance ?? 0));
  }

  const paymentState = getPaymentPromptState({ freeQuotaRemaining });

  return (
    <SajuLayout>
      <main className="min-h-[calc(100dvh-48px)] bg-[#fbf7ef] px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-teal-800">월간 전략 리포트</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">이번 달은 감으로 버티지 말고 흐름표를 들고 가자</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              월간사주는 사주 원국, 최근 대화 요약, 반복 고민을 묶어서 커리어, 돈, 관계, 건강의 우선순위를 정리해.
            </p>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            {[
              ["커리어", "중요한 결정을 미루기보다 선택지를 줄이는 달이야."],
              ["돈", "새 투자보다 지출 구조를 먼저 정리하는 쪽이 안정적이야."],
              ["관계", "확신을 요구하기보다 서로의 속도를 확인하는 대화가 필요해."],
              ["건강", "피로 신호를 넘기지 말고 수면 리듬을 먼저 회복해."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-stone-200 bg-white p-5">
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[28px] border border-teal-900/15 bg-teal-950 p-6 text-white">
            <p className="text-sm font-semibold text-teal-100">유료 종합 사주 백서</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">대운, 세운, 관계 패턴까지 깊게 읽는 확장 리포트</h2>
            <p className="mt-4 text-sm leading-6 text-teal-50/80">
              기본 월간 리포트는 무료 흐름을 제공하고, 종합 백서는 단품 구매나 멤버십으로 열 수 있어.
            </p>
            {paymentState.shouldPrompt && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {paymentState.options.map((option) => (
                  <div key={option.kind} className="rounded-2xl bg-white/10 p-4">
                    <p className="font-bold">{option.label}</p>
                    <p className="mt-2 text-sm leading-5 text-teal-50/75">{option.description}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/coin-shop" className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-teal-950 transition-transform active:scale-[0.98]">
              결제 옵션 보기
            </Link>
          </section>
        </div>
      </main>
    </SajuLayout>
  );
}

