'use client';

import { useState } from 'react';
import SajuNavbar from '@/components/saju/landing/SajuNavbar';
import LoginSidebar from '@/components/saju/landing/LoginSidebar';
import type { CharacterType } from '@/lib/saju/characters';
import { Link, usePathname } from '@/i18n/routing';
import { Bot, CalendarDays, FileText, MessageCircle, UserRound } from 'lucide-react';

interface MobileLayoutWrapperProps {
  isLoggedIn: boolean;
  sidebarUser: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  chatHistory: {
    id: string;
    character_id: CharacterType;
    character_name: string;
    character_avatar: string;
    title: string | null;
    reading_name: string;
    updated_at: string;
  }[];
  currentReading?: {
    id: string;
    characterId: CharacterType;
    name: string;
    gender: 'male' | 'female';
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    isLunar: boolean;
    birthCity?: string;
  };
  totalCoins: number;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export default function MobileLayoutWrapper({
  isLoggedIn,
  sidebarUser,
  chatHistory,
  currentReading,
  totalCoins,
  isAdmin = false,
  children,
}: MobileLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const tabs = [
    { href: '/', label: '캐릭터', icon: Bot },
    { href: '/today', label: '오늘피드', icon: CalendarDays },
    { href: currentReading ? `/chat/${currentReading.characterId}` : '/chat/charon_m', label: '채팅', icon: MessageCircle },
    { href: '/reports', label: '리포트', icon: FileText },
    { href: '/my-readings', label: '마이', icon: UserRound },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f7f3ea] text-slate-900">
      <SajuNavbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onMenuToggle={() => setSidebarOpen((v) => !v)} />

      <div className="flex">
        {/* 데스크톱: 기존 사이드바 */}
        <LoginSidebar
          user={sidebarUser}
          chatHistory={chatHistory}
          currentReading={currentReading}
          totalCoins={totalCoins}
        />

        {/* 모바일: 슬라이드 오버레이 사이드바 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <aside
              className="absolute left-0 top-0 h-full w-72 bg-[#0e0e15] border-r border-[#2a2a3a] overflow-y-auto flex flex-col animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <LoginSidebar
                user={sidebarUser}
                chatHistory={chatHistory}
                currentReading={currentReading}
                totalCoins={totalCoins}
                isMobile
              />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200/80 bg-white/92 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 px-2 py-2">
          {tabs.map((tab) => {
            const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  active ? 'bg-purple-700 text-white' : 'text-slate-500 hover:bg-stone-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
