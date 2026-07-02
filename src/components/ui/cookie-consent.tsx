"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Cookie, XIcon } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("cookie_consent") === null,
  );

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "false");
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem("cookie_consent", "dismissed");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="쿠키 안내"
      className="bg-[#fffaf0] px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-stone-200/80 bg-white/90 p-3 shadow-[0_14px_35px_-30px_rgba(58,51,43,0.45)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
              <Cookie className="h-4 w-4 text-purple-700" />
            </div>
            <p className="min-w-0 text-[13px] leading-relaxed text-slate-600">
              로그인과 서비스 이용에 필요한 쿠키만 사용해.{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-purple-700 underline underline-offset-2 transition-colors hover:text-purple-600"
              >
                개인정보처리방침
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-1.5 pl-11 sm:pl-0">
            <button
              onClick={decline}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]"
            >
              거부
            </button>
            <button
              onClick={accept}
              className="rounded-lg bg-purple-700 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-600 active:scale-[0.98]"
            >
              동의
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-stone-100 hover:text-purple-700 active:scale-[0.98]"
              aria-label="닫기"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
