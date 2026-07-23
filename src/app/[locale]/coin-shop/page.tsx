import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CoinShopClient from "@/components/saju/coin-shop/CoinShopClient";
import { arePaymentsEnabled } from "@/lib/payments/feature-flag";

export default async function CoinShopPage() {
  if (!arePaymentsEnabled()) {
    return (
      <SajuLayout>
        <main className="min-h-[calc(100vh-48px)] bg-[#fbf7ef] px-4 py-10">
          <section className="mx-auto max-w-md rounded-[28px] border border-stone-200 bg-white p-6 text-center shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-bold text-purple-800">무료 상담 베타로 운영 중이야</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              추가 상담권은 잠시 준비 중이야
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              지금은 가입 후 3회 무료 상담과 오늘피드 중심으로 먼저 안정화하고 있어.
              정식 결제 기능은 안정화 후 열릴 예정이야.
            </p>
          </section>
        </main>
      </SajuLayout>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ko?login=required");
  }

  // user_stars에서 잔액 조회 (없으면 신규 유저 → 3개 보너스로 생성)
  let { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!stars) {
    await supabase
      .from("user_stars")
      .insert({ user_id: user.id, balance: 3 });
    stars = { balance: 3 };
  }

  return (
    <SajuLayout>
      <CoinShopClient
        totalCoins={stars.balance}
        userId={user.id}
        userEmail={user.email}
      />
    </SajuLayout>
  );
}
