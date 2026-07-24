"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CHARACTER_LIST } from "@/lib/saju/characters";
import { loginWithGoogle } from "@/services/auth/actions";

interface CharacterCardsProps {
  isLoggedIn?: boolean;
}

export default function CharacterCards({ isLoggedIn = false }: CharacterCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollStoppedRef = useRef(false);
  const autoScrollPausedRef = useRef(false);
  const carouselMaskClass = activeIndex > 0
    ? "md:[mask-image:linear-gradient(to_right,transparent_0,transparent_64px,black_116px,black_calc(100%-28px),transparent_100%)]"
    : "md:[mask-image:linear-gradient(to_right,black_0,black_calc(100%-28px),transparent_100%)]";

  const stopAutoScroll = useCallback(() => {
    autoScrollStoppedRef.current = true;
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const children = el.children;
    if (!children.length) return;
    const firstChild = children[0] as HTMLElement;
    const cardWidth = firstChild.offsetWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const index = Math.round(scrollLeft / (cardWidth + gap));
    if (index >= 0 && index < CHARACTER_LIST.length) {
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = el.children;
    if (!children[index]) return;
    const child = children[index] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      stopAutoScroll();
      return;
    }

    const timer = setInterval(() => {
      if (autoScrollStoppedRef.current || autoScrollPausedRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % CHARACTER_LIST.length;
        scrollTo(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [scrollTo, stopAutoScroll]);

  return (
    <div className="pt-3 md:pt-8 pb-2 md:pb-6 [@media_(min-width:1024px)_and_(max-height:760px)]:pt-3 [@media_(min-width:1024px)_and_(max-height:760px)]:pb-1">
      <div className={`mx-auto max-w-5xl overflow-hidden px-4 md:px-0 ${carouselMaskClass}`}>
        <div
          ref={scrollRef}
          onMouseEnter={() => {
            autoScrollPausedRef.current = true;
          }}
          onMouseLeave={() => {
            autoScrollPausedRef.current = false;
          }}
          onPointerDown={stopAutoScroll}
          onTouchStart={stopAutoScroll}
          onFocusCapture={stopAutoScroll}
          className="grid grid-flow-col auto-cols-[62vw] md:auto-cols-[280px] gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-ps-4 md:scroll-ps-0 px-0 scrollbar-hide"
        >
          {CHARACTER_LIST.map((char, index) => (
            <div key={char.id} className="snap-start md:snap-center max-w-[236px] md:max-w-none">
              <CharacterCard char={char} index={index} isLoggedIn={isLoggedIn} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 py-3">
        {CHARACTER_LIST.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              stopAutoScroll();
              scrollTo(i);
            }}
            aria-label={`${i + 1}번째 상담사 보기`}
            aria-current={i === activeIndex ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-purple-700" : "w-1.5 bg-stone-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({
  char,
  index,
  isLoggedIn = false,
}: {
  char: (typeof CHARACTER_LIST)[number];
  index: number;
  isLoggedIn?: boolean;
}) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  useEffect(() => {
    if (!showLoginPrompt) return;

    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    if (!dialog) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
    const firstFocusable = getFocusableElements()[0];
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLoginPrompt();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = getFocusableElements();
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (!first || !last) {
          event.preventDefault();
          return;
        }

        if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
          return;
        }

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [closeLoginPrompt, showLoginPrompt]);

  const cardContent = (
    <div className="group rounded-[28px] overflow-hidden cursor-pointer bg-white border border-stone-200 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.55)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      {/* 이미지 영역 — 고정 비율 */}
      <div className="aspect-[5/6] md:aspect-[2/3] [@media_(min-width:1024px)_and_(max-height:760px)]:aspect-[3/4] relative flex-shrink-0">
        <Image
          src={char.cardImage}
          alt={char.name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(min-width: 768px) 25vw, 75vw"
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
        <div className="absolute top-3 left-3 z-[1]">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg"
            style={{ backgroundColor: char.color }}
          >
            {char.service}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div
          className="absolute bottom-0 left-0 right-0 p-4 [@media_(min-width:1024px)_and_(max-height:760px)]:p-3"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          <h3 className="text-lg md:text-xl font-bold text-white">{char.name}</h3>
          <p className="text-xs text-white/80 font-medium">{char.title}</p>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-2.5 md:p-4 flex flex-col flex-1">
        <p className="hidden sm:block text-[13px] md:text-sm text-slate-600 italic leading-snug line-clamp-1 md:line-clamp-2">
          &ldquo;{char.quote}&rdquo;
        </p>

        <div className="hidden sm:flex gap-1.5 mt-2.5 overflow-hidden">
          {char.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-1 rounded-full border border-stone-200 text-slate-500 bg-stone-50 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2.5 md:pt-3 border-t border-stone-100 mt-auto">
          {!isLoggedIn && (
            <span className="text-[11px] md:text-xs font-medium text-slate-500 flex flex-col gap-0.5">
              <span className="flex items-center gap-1">
                <span className="text-amber-600">&#9733;</span> 가입하면 3회 무료
              </span>
              <span>1별 = 메시지 1회</span>
            </span>
          )}
          <span className={`text-xs font-bold bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-md transition-colors group-hover:bg-purple-600 ${isLoggedIn ? 'ml-auto' : ''}`}>
            대화하기
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoggedIn) {
    return <Link href={`/chat/${char.id}`} className="block h-full">{cardContent}</Link>;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="block h-full w-full text-left"
        onClick={() => setShowLoginPrompt(true)}
      >
        {cardContent}
      </button>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeLoginPrompt}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-login-title"
            aria-describedby="character-login-description"
            tabIndex={-1}
            className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl text-amber-500">&#9733;</span>
              </div>
                <h3 id="character-login-title" className="text-lg font-bold text-slate-950 mb-1">가입하고 바로 시작하세요</h3>
                <p id="character-login-description" className="text-sm text-slate-500 mb-5">
                가입하면 <span className="text-amber-600 font-semibold">3회 무료 상담</span>을 드려요
                <br />
                1별 = 메시지 1회, 가입 후에도 가격을 확인할 수 있어요
              </p>

              <form action={async () => { await loginWithGoogle(`/chat/${char.id}`); }}>
                <button
                  type="submit"
                  aria-label="Google로 로그인하고 상담 시작하기"
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google로 시작하기
                </button>
              </form>

              <button
                onClick={closeLoginPrompt}
                aria-label="로그인 안내 닫기"
                className="mt-3 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                나중에 할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
