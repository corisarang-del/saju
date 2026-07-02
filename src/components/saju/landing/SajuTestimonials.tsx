"use client";

import { MessageCircle } from "lucide-react";
import {
  LANDING_CHAT_REVIEW_MESSAGES,
  LANDING_TESTIMONIALS,
} from "@/lib/content/trust-copy";

export default function SajuTestimonials() {
  return (
    <section className="py-10 px-4 bg-[#0e0e15]">
      <div className="max-w-lg mx-auto">
        <h2 className="text-base font-bold text-gray-100 mb-1.5">
          실제 이용 후기
        </h2>
        <p className="text-xs text-gray-600 mb-6">
          과장보다, 실제 고민에 가까운 반응만 담았어
        </p>

        <div className="mb-6 rounded-2xl bg-[#1a1a25] border border-[#2a2a3a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-purple-300" />
            </div>
            <span className="text-xs font-semibold text-gray-300">친구에게 공유했더니...</span>
            <span className="text-[10px] text-gray-600 ml-auto">사용자 반응</span>
          </div>

          <div className="px-4 py-4 space-y-2.5">
            {LANDING_CHAT_REVIEW_MESSAGES.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.side === "right" ? "items-end" : "items-start"}`}>
                {msg.texts.map((text, j) => (
                  <div
                    key={j}
                    className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed max-w-[75%] ${
                      msg.side === "right"
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-[#2a2a3a] text-gray-200 rounded-bl-md"
                    }`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-[#2a2a3a]">
            <p className="text-[11px] text-gray-500 text-center">
              결정 대신, 지금 확인할 조건을 차분히 정리해주는 상담
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {LANDING_TESTIMONIALS.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {/* 프로필 아바타 */}
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                style={{ background: t.color }}
              >
                {t.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                {/* 이름 + 나이 + 시간 */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-gray-300">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-gray-600">{t.age}</span>
                  <span className="text-[10px] text-gray-700 ml-auto">
                    {t.time}
                  </span>
                </div>

                {/* 말풍선 */}
                <div className="bg-[#1a1a25] rounded-2xl rounded-tl-md px-3.5 py-2.5 w-fit max-w-[92%]">
                  <p className="text-[13px] leading-relaxed text-gray-300">
                    {t.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
