import SajuLayout from "@/components/saju/layout/SajuLayout";
import MonthlyReportUnlockClient from "@/components/saju/reports/MonthlyReportUnlockClient";
import { Link } from "@/i18n/routing";
import { getPaymentPromptState } from "@/lib/monthly-saju/billing";
import { summarizeConversationMemory } from "@/lib/monthly-saju/memory";
import { createMonthlyStrategyReport } from "@/lib/monthly-saju/monthly-strategy-report";
import { FULL_REPORT_STAR_COST, MONTHLY_REPORT_STAR_COST } from "@/lib/monthly-saju/pricing";
import { arePaymentsEnabled } from "@/lib/payments/feature-flag";
import { extractSajuSummary } from "@/lib/saju/calculator";
import { createClient } from "@/utils/supabase/server";
import type { ConcernType, FiveElementDistribution } from "@/types/saju";
import type { FourPillarsDetail } from "manseryeok";

type ReadingRow = {
  id: string;
  name: string;
  concerns: ConcernType[] | null;
  four_pillars: unknown;
  five_elements: unknown;
};

type SnapshotRow = {
  concern: string;
  today_do: string;
  today_avoid: string;
  relationship_tip: string;
  follow_up_question: string;
  weekly_focus: string;
  monthly_focus: string;
};

type ChatMessageRow = {
  role: "user" | "assistant" | "system";
  content: string;
};

function buildSajuSummary(reading: ReadingRow | null): string | undefined {
  if (!reading?.four_pillars || !reading.five_elements) {
    return undefined;
  }

  try {
    const summary = extractSajuSummary(
      reading.four_pillars as FourPillarsDetail,
      reading.five_elements as FiveElementDistribution,
    );

    return `일간은 ${summary.dayMaster.stem}이고 ${summary.dayMaster.element} 기운을 중심으로 봐. 가장 강한 오행은 ${summary.elementStrength.strongest}, 약한 오행은 ${summary.elementStrength.weakest}야.`;
  } catch {
    return undefined;
  }
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const paymentsEnabled = arePaymentsEnabled();
  let freeQuotaRemaining = 0;
  let monthlyReportUnlocked = false;
  let latestReading: ReadingRow | null = null;
  let latestSnapshot: SnapshotRow | null = null;
  let recentMessages: ChatMessageRow[] = [];

  if (user) {
    const { data: stars } = await supabase
      .from("user_stars")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    freeQuotaRemaining = Math.max(0, Number(stars?.balance ?? 0));

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthlyUnlock } = await supabase
      .from("star_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "monthly_report")
      .gte("created_at", monthStart.toISOString())
      .limit(1)
      .maybeSingle();
    monthlyReportUnlocked = Boolean(monthlyUnlock);

    const { data: reading } = await supabase
      .from("saju_readings")
      .select("id,name,concerns,four_pillars,five_elements")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    latestReading = (reading as ReadingRow | null) ?? null;

    if (latestReading) {
      const { data: snapshot } = await supabase
        .from("coaching_snapshots")
        .select("concern,today_do,today_avoid,relationship_tip,follow_up_question,weekly_focus,monthly_focus")
        .eq("user_id", user.id)
        .eq("reading_id", latestReading.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      latestSnapshot = (snapshot as SnapshotRow | null) ?? null;

      const { data: messages } = await supabase
        .from("saju_chat_messages")
        .select("role,content,created_at")
        .eq("reading_id", latestReading.id)
        .order("created_at", { ascending: false })
        .limit(16);
      recentMessages = ((messages ?? []) as ChatMessageRow[]).reverse();
    }
  }

  const paymentState = getPaymentPromptState({ freeQuotaRemaining, paymentsEnabled });
  const recentUserMessages = recentMessages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .slice(-8);
  const concerns = latestReading?.concerns ?? [];
  const conversationMemory = latestReading
    ? summarizeConversationMemory({
        sajuProfile: {
          name: latestReading.name,
          concerns,
        },
        messages: recentMessages,
      })
    : null;
  const monthlyReport = createMonthlyStrategyReport({
    latestReading: latestReading
      ? {
          name: latestReading.name,
          concerns,
          sajuSummary: buildSajuSummary(latestReading),
        }
      : null,
    latestSnapshot: latestSnapshot
      ? {
          concern: latestSnapshot.concern,
          todayDo: latestSnapshot.today_do,
          todayAvoid: latestSnapshot.today_avoid,
          relationshipTip: latestSnapshot.relationship_tip,
          followUpQuestion: latestSnapshot.follow_up_question,
          weeklyFocus: latestSnapshot.weekly_focus,
          monthlyFocus: latestSnapshot.monthly_focus,
        }
      : null,
    conversationMemory,
    recentUserMessages,
  });

  return (
    <SajuLayout>
      <main className="min-h-[calc(100dvh-48px)] bg-[#fbf7ef] px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-purple-800">월간 전략 리포트</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">이번 달은 감으로 버티지 말고 흐름표를 들고 가자</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              {monthlyReport.previewSummary}
            </p>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            {monthlyReport.sections.slice(0, 4).map((section) => (
              <article key={section.title} className="rounded-3xl border border-stone-200 bg-white p-5">
                <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{section.preview}</p>
              </article>
            ))}
          </section>

          <MonthlyReportUnlockClient
            initialUnlocked={monthlyReportUnlocked}
            initialStarBalance={freeQuotaRemaining}
            monthlyReportCost={MONTHLY_REPORT_STAR_COST}
            paymentsEnabled={paymentsEnabled}
            sections={monthlyReport.sections}
          />

          <section className="rounded-[28px] border border-purple-900/15 bg-purple-950 p-6 text-white">
            <p className="text-sm font-semibold text-purple-100">유료 종합 사주 백서</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">대운, 세운, 관계 패턴까지 깊게 읽는 확장 리포트</h2>
            <p className="mt-4 text-sm leading-6 text-purple-50/80">
              {paymentsEnabled
                ? `기본 월간 리포트는 무료 흐름을 제공하고, 종합 백서는 별 ${FULL_REPORT_STAR_COST}개로 열 수 있어.`
                : "기본 월간 리포트는 무료 미리보기로 제공하고, 종합 백서는 정식 결제 기능 안정화 후 열릴 예정이야."}
            </p>
            {paymentState.shouldPrompt && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {paymentState.options.map((option) => (
                  <div key={option.kind} className="rounded-2xl bg-white/10 p-4">
                    <p className="font-bold">{option.label}</p>
                    <p className="mt-2 text-sm leading-5 text-purple-50/75">{option.description}</p>
                  </div>
                ))}
              </div>
            )}
            {paymentsEnabled && (
              <Link href="/coin-shop" className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-purple-950 transition-transform active:scale-[0.98]">
                결제 옵션 보기
              </Link>
            )}
          </section>
        </div>
      </main>
    </SajuLayout>
  );
}
