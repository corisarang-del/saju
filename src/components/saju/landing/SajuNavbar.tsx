"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { loginWithGoogle } from "@/services/auth/actions";
import ReferralSection from "@/components/saju/referral/ReferralSection";

interface SajuNavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onMenuToggle?: () => void;
}

export default function SajuNavbar({ isLoggedIn = false, isAdmin = false, onMenuToggle }: SajuNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/88 backdrop-blur-lg border-b border-stone-200 shadow-lg shadow-stone-300/20"
            : "bg-[#f7f3ea] border-b border-stone-200"
        }`}
      >
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-1.5 -ml-1 text-gray-400 hover:text-white transition-colors"
                aria-label="메뉴"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/characters/hyunwoo-avatar-v3.jpg"
                alt="월간사주"
                width={28}
                height={28}
                className="rounded-full ring-1 ring-teal-900/10"
              />
              <span className="text-lg font-extrabold text-slate-950">월간사주</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <form action={async () => { await loginWithGoogle('/'); }}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-teal-900 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  로그인
                </button>
              </form>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/analytics/overview"
                    className="flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors px-2 py-1.5 rounded-lg"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                    </svg>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => setShowReferral(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors px-2.5 py-1.5 rounded-lg"
                >
                  <span>&#9733;</span>
                  친구초대하고 1별 받기
                </button>
                <Link
                  href="/coin-shop"
                  className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800 transition-colors"
                >
                  <span>&#9733;</span>
                  <span className="font-medium">충전</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 친구 초대 모달 */}
      <ReferralSection isOpen={showReferral} onClose={() => setShowReferral(false)} />
    </>
  );
}
