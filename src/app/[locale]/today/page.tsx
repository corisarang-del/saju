import SajuLayout from "@/components/saju/layout/SajuLayout";
import { Link } from "@/i18n/routing";
import { CHARACTERS, type CharacterType } from "@/lib/saju/characters";
import { createDailyAgentFeed, type DailyFeedElement } from "@/lib/monthly-saju/daily-feed";
import { summarizeConversationMemory } from "@/lib/monthly-saju/memory";
import { createClient } from "@/utils/supabase/server";
import type { ConcernType, FiveElementDistribution, SajuReading } from "@/types/saju";

function getElementExtremes(elements: FiveElementDistribution | null | undefined): {
  strongestElement: DailyFeedElement;
  weakestElement: DailyFeedElement;
} {
  if (!elements) {
    return { strongestElement: "wood", weakestElement: "metal" };
  }

  const entries = Object.entries(elements) as Array<[DailyFeedElement, number]>;
  const strongestElement = entries.reduce((best, current) => current[1] > best[1] ? current : best)[0];
  const weakestElement = entries.reduce((best, current) => current[1] < best[1] ? current : best)[0];

  return { strongestElement, weakestElement };
}

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let latestReading: SajuReading | null = null;
  let currentReading;
  let chatMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

  if (user) {
    const { data } = await supabase
      .from("saju_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    latestReading = data as SajuReading | null;

    if (latestReading) {
      const { data: messages } = await supabase
        .from("saju_chat_messages")
        .select("role, content")
        .eq("reading_id", latestReading.id)
        .order("created_at", { ascending: false })
        .limit(8);

      chatMessages = ((messages ?? []) as typeof chatMessages).reverse();
      currentReading = {
        id: latestReading.id,
        characterId: latestReading.character_id as CharacterType,
        name: latestReading.name,
        gender: latestReading.gender,
        birthYear: latestReading.birth_year,
        birthMonth: latestReading.birth_month,
        birthDay: latestReading.birth_day,
        birthHour: latestReading.birth_hour,
        isLunar: latestReading.is_lunar,
        birthCity: latestReading.birth_city ?? undefined,
      };
    }
  }

  const characterId = (latestReading?.character_id ?? "charon_m") as CharacterType;
  const character = CHARACTERS[characterId] ?? CHARACTERS.charon_m;
  const extremes = getElementExtremes(latestReading?.five_elements);
  const memory = summarizeConversationMemory({
    sajuProfile: {
      name: latestReading?.name ?? "오늘의 사용자",
      concerns: (latestReading?.concerns ?? ["career", "love"]) as ConcernType[],
    },
    messages: chatMessages,
  });
  const feed = createDailyAgentFeed({
    date: new Date().toISOString().slice(0, 10),
    characterId,
    characterName: character.name,
    dayMasterElement: "water",
    strongestElement: extremes.strongestElement,
    weakestElement: extremes.weakestElement,
    concerns: memory.recurringConcerns,
    recentMemory: memory.recentSummary,
  });

  return (
    <SajuLayout currentReading={currentReading}>
      <main className="min-h-[calc(100dvh-48px)] bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f7f3ea_34%,#fffaf0_100%)] px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-sm font-semibold text-teal-800">{character.name}의 오늘피드</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">오늘은 먼저 정리하고 움직이는 날이야</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{feed.openingMessage}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-900">대화 {memory.messageCount}회</span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">친근도 {memory.toneLevel}</span>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            {feed.actionCards.map((card) => (
              <article key={card.kind} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{card.kind}</p>
                <h2 className="mt-3 text-lg font-bold text-slate-950">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.message}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">아침부터 저녁까지</h2>
            <div className="mt-4 divide-y divide-stone-100">
              {feed.timeline.map((item) => (
                <div key={item.period} className="grid gap-2 py-4 sm:grid-cols-[120px_1fr]">
                  <p className="text-sm font-bold text-teal-800">{item.title}</p>
                  <p className="text-sm leading-6 text-slate-600">{item.message}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/chat/${characterId}`} className="rounded-2xl bg-teal-900 px-5 py-4 text-center text-sm font-bold text-white transition-transform active:scale-[0.98]">
              {character.name}에게 더 묻기
            </Link>
            <Link href="/reports" className="rounded-2xl border border-teal-900/20 bg-white px-5 py-4 text-center text-sm font-bold text-teal-950 transition-transform active:scale-[0.98]">
              월간 리포트 보기
            </Link>
          </div>
        </div>
      </main>
    </SajuLayout>
  );
}

