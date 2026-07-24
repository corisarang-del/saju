'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { openCheckout } from '@/lib/paddle/client';
import type { ProductType } from '@/lib/paddle/config';
import {
  formatWon,
  MONTHLY_MEMBERSHIP,
  MONTHLY_MEMBERSHIP_USAGE_EXAMPLE,
  STAR_PACKS,
} from '@/lib/monthly-saju/pricing';
import { areClientPaymentsEnabled } from '@/lib/payments/feature-flag';
import { trackClientEvent } from '@/lib/analytics/client';

interface CoinShopClientProps {
  totalCoins: number;
  userId: string;
  userEmail?: string;
}

function getStarPackAriaLabel(pack: (typeof STAR_PACKS)[number]) {
  const badge = pack.badge ? `, ${pack.badge} 상품` : '';
  const description = pack.description ? `, ${pack.description}` : '';
  return `별 ${pack.stars}개${badge}, ${formatWon(pack.price)}${description}`;
}

export default function CoinShopClient({ totalCoins, userId, userEmail }: CoinShopClientProps) {
  const searchParams = useSearchParams();
  const isPaidRedirect = searchParams.get('paid') === 'true';
  const paymentsEnabled = areClientPaymentsEnabled();
  const [selected, setSelected] = useState<ProductType>('stars10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(isPaidRedirect);

  useEffect(() => {
    trackClientEvent('coin_shop_view', { paymentsEnabled });
    if (!paymentsEnabled) {
      trackClientEvent('payment_disabled_notice_view', { source: 'coin_shop' });
    }
  }, [paymentsEnabled]);

  useEffect(() => {
    if (!isPaidRedirect) return;

    // URL에서 paid 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname);
    // 5초 후 자동 닫기
    const timer = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [isPaidRedirect]);

  const handlePurchase = async () => {
    if (!paymentsEnabled) {
      setError('지금은 무료 상담 베타로 운영 중이야. 정식 결제 기능은 안정화 후 열릴 예정이야.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await openCheckout({
        productType: selected,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/ko/coin-shop?paid=true`,
      });
    } catch {
      setError('결제 시스템을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0a0a0f] flex flex-col items-center px-4 py-10">
      {/* 결제 완료 알림 */}
      {showSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 px-5 py-3.5 rounded-2xl shadow-lg shadow-green-500/10 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="font-semibold text-sm">결제가 완료되었습니다! 별이 충전되었어요.</span>
            <button onClick={() => setShowSuccess(false)} className="ml-1 text-green-500/60 hover:text-green-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 현재 보유 코인 */}
      <div className="text-center mb-10">
        <p className="text-sm text-gray-400 mb-2">현재 보유 별</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-3xl">&#9733;</span>
          <span className="text-4xl font-bold text-white">{totalCoins}</span>
        </div>
      </div>

      {!paymentsEnabled && (
        <div className="w-full max-w-md rounded-2xl border border-stone-700 bg-[#13131a] p-5 text-center mb-8">
          <p className="text-sm font-bold text-gray-100">무료 상담 베타로 운영 중이야</p>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            추가 상담권과 월간 멤버십은 정식 결제 기능 안정화 후 열릴 예정이야.
          </p>
        </div>
      )}

      {/* 충전 패키지 */}
      <div className="w-full max-w-md space-y-3 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">상담권 선택</h2>
        {STAR_PACKS.map((pack) => (
          <button
            key={pack.type}
            onClick={() => paymentsEnabled && setSelected(pack.type as ProductType)}
            aria-label={getStarPackAriaLabel(pack)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm transition-all ${
              selected === pack.type
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-[#2a2a3a] bg-[#13131a] hover:border-[#3a3a4a]'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-yellow-400 text-xl">&#9733;</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="shrink-0 font-semibold text-gray-200 text-base">별 {pack.stars}개</span>
                  {pack.badge && (
                    <span aria-hidden="true" className="shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border border-white/10 bg-stone-200/10 text-stone-200 font-medium">
                      {pack.badge}
                    </span>
                  )}
                </div>
                {pack.description && (
                  <span className="text-[11px] text-purple-400">{pack.description}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-200 text-base">
                {formatWon(pack.price)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-md space-y-3 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">월간 멤버십</h2>
        <button
            onClick={() => paymentsEnabled && setSelected(MONTHLY_MEMBERSHIP.type)}
          aria-label={`${MONTHLY_MEMBERSHIP.name}, 매월 별 ${MONTHLY_MEMBERSHIP.stars}개, ${formatWon(MONTHLY_MEMBERSHIP.price)}, ${MONTHLY_MEMBERSHIP_USAGE_EXAMPLE}`}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm transition-all ${
            selected === MONTHLY_MEMBERSHIP.type
              ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10'
              : 'border-[#2a2a3a] bg-[#13131a] hover:border-[#3a3a4a]'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-yellow-400 text-xl">&#9733;</span>
            <div className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="shrink-0 font-semibold text-gray-200 text-base">{MONTHLY_MEMBERSHIP.name}</span>
                <span aria-hidden="true" className="shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border border-amber-300/20 bg-amber-300/10 text-amber-100 font-medium">
                  매월 {MONTHLY_MEMBERSHIP.stars}별
                </span>
              </div>
              <span className="text-[11px] text-amber-200/80">{MONTHLY_MEMBERSHIP.description}</span>
              <span className="mt-1 block text-[11px] leading-5 text-amber-100/65">
                예: {MONTHLY_MEMBERSHIP_USAGE_EXAMPLE}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-gray-200 text-base">
              월 {formatWon(MONTHLY_MEMBERSHIP.price)}
            </span>
          </div>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {/* 충전 버튼 */}
      <div className="w-full max-w-md">
        <button
          onClick={handlePurchase}
          disabled={loading || !paymentsEnabled}
          className="w-full py-4 rounded-2xl bg-purple-600 text-white text-base font-semibold
            hover:bg-purple-500 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : paymentsEnabled ? '충전하기' : '결제 준비 중'}
        </button>
      </div>
    </div>
  );
}
