"use client";

import Link from "next/link";
import { useState } from "react";

interface MonthlyReportSection {
  title: string;
  preview: string;
  detail: string;
}

interface MonthlyReportUnlockClientProps {
  initialUnlocked: boolean;
  initialStarBalance: number;
  monthlyReportCost: number;
  paymentsEnabled: boolean;
  sections: MonthlyReportSection[];
}

export default function MonthlyReportUnlockClient({
  initialUnlocked,
  initialStarBalance,
  monthlyReportCost,
  paymentsEnabled,
  sections,
}: MonthlyReportUnlockClientProps) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [starBalance, setStarBalance] = useState(initialStarBalance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monthly-saju/deduct-monthly-report", {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 402) {
          setError(`별이 부족해. 상세판은 별 ${monthlyReportCost}개가 필요해.`);
          return;
        }

        setError("월간 리포트를 여는 데 실패했어. 잠시 후 다시 시도해줘.");
        return;
      }

      setStarBalance(Number(data.balance ?? starBalance));
      setUnlocked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-purple-800">상세판</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            이번 달 선택을 여섯 갈래로 정리했어
          </h2>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          보유 별 {starBalance}개
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-base font-bold text-slate-950">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {unlocked ? section.detail : section.preview}
            </p>
          </article>
        ))}
      </div>

      {!unlocked && (
        <div className="mt-5 rounded-2xl border border-purple-900/10 bg-purple-50 p-4">
          <p className="text-sm leading-6 text-purple-950">
            {paymentsEnabled
              ? "무료 미리보기는 흐름만 보여줘. 상세판을 열면 관계, 일, 돈, 마음관리, 조심할 시기, 이번 달 선택 3개를 구체적으로 볼 수 있어."
              : "무료 미리보기는 계속 볼 수 있어. 상세판은 정식 결제 안정화 후 열릴 예정이야."}
          </p>
          {error && (
            <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
          )}
          {paymentsEnabled && (
            <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUnlock}
              disabled={loading}
              className="rounded-2xl bg-purple-700 px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "여는 중..." : `상세판 열기 (별 ${monthlyReportCost}개)`}
            </button>
            {starBalance < monthlyReportCost && (
              <Link href="/ko/coin-shop" className="rounded-2xl border border-purple-900/20 bg-white px-5 py-3 text-sm font-bold text-purple-950">
                상담권 확인하기
              </Link>
            )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
