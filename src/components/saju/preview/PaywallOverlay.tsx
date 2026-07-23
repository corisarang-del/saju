"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PaywallOverlayProps {
  onPayClick: () => void;
  paymentsEnabled?: boolean;
}

export default function PaywallOverlay({ onPayClick, paymentsEnabled = true }: PaywallOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/0 pt-16 pb-8 px-5 -mt-24"
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#F2F4F6] flex items-center justify-center mb-4">
          <Lock className="w-5 h-5 text-[#8B95A1]" />
        </div>
        <h3 className="text-lg font-bold text-[#191F28] mb-1">
          {paymentsEnabled ? "전체 분석 결과 보기" : "전체 분석은 준비 중이야"}
        </h3>
        <p className="text-[#8B95A1] text-sm mb-5">
          {paymentsEnabled ? "철학관 평균 30,000~50,000원" : "지금은 무료 상담 베타로 먼저 운영하고 있어"}
        </p>
        {paymentsEnabled && (
          <button
            onClick={onPayClick}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-[0.98] text-white font-semibold text-base py-4 rounded-xl transition-all"
          >
            19,900원에 전체 분석 보기
          </button>
        )}
        <p className="text-xs text-[#8B95A1] mt-3">
          {paymentsEnabled
            ? "결제 즉시 전체 분석 PDF를 받아보세요"
            : "정식 결제 기능은 안정화 후 열릴 예정이야"}
        </p>
      </div>
    </motion.div>
  );
}
