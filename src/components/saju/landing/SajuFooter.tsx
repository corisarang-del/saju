import { Link } from "@/i18n/routing";
import { SUPPORT_CONTACT } from "@/lib/monthly-saju/pricing";
import { areClientPaymentsEnabled } from "@/lib/payments/feature-flag";

export default function SajuFooter() {
  const paymentsEnabled = areClientPaymentsEnabled();

  return (
    <footer className="bg-[#0a0a0f] border-t border-[#2a2a3a] py-5 px-5">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* 왼쪽: 사업자 정보 */}
        <div className="text-[11px] text-gray-600 leading-relaxed space-y-0.5">
          <p>월간사주</p>
          <p>고객지원 및 환불 문의: {SUPPORT_CONTACT.email}</p>
          <p>
            {paymentsEnabled
              ? "정식 결제는 Paddle 시스템을 통해 처리됩니다."
              : "지금은 무료 상담 베타로 운영 중입니다."}
          </p>
        </div>

        {/* 오른쪽: 링크 + 카피라이트 */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-3">
            <a
              href={SUPPORT_CONTACT.mailto}
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              문의
            </a>
            <Link
              href="/terms"
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy-policy"
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/refund-policy"
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              환불정책
            </Link>
          </div>
          <p className="text-[11px] text-gray-700">
            &copy; 2026 월간사주
          </p>
        </div>
      </div>
    </footer>
  );
}
