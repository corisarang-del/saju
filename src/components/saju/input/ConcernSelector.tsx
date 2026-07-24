"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CONCERN_LABELS, type ConcernType } from "@/types/saju";

const CONCERNS = [
  { id: "love", label: CONCERN_LABELS.love },
  { id: "career", label: CONCERN_LABELS.career },
  { id: "wealth", label: CONCERN_LABELS.wealth },
  { id: "health", label: CONCERN_LABELS.health },
  { id: "relationship", label: CONCERN_LABELS.relationship },
] as const;

type ConcernId = Extract<ConcernType, (typeof CONCERNS)[number]["id"]>;

interface ConcernSelectorProps {
  onSubmit: (concerns: ConcernId[]) => void;
  onBack: () => void;
}

export default function ConcernSelector({
  onSubmit,
  onBack,
}: ConcernSelectorProps) {
  const [selected, setSelected] = useState<ConcernId[]>([]);
  const [error, setError] = useState("");

  const toggle = (id: ConcernId) => {
    setError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError("최소 1개를 선택해주세요");
      return;
    }
    onSubmit(selected);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#191F28]">
          어떤 고민이 있으신가요?
        </h2>
        <p className="mt-2 text-[#8B95A1] text-sm">
          궁금한 분야를 선택하면 더 정확한 분석을 받을 수 있어요
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {CONCERNS.map((concern) => {
          const isSelected = selected.includes(concern.id);
          return (
            <motion.button
              key={concern.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(concern.id)}
              className={`px-5 py-3 rounded-full text-base font-medium transition-colors ${
                isSelected
                  ? "bg-[#8c659f]/[0.10] text-[#5f347f] ring-1 ring-[#8c659f]/25"
                  : "bg-gray-100 text-[#191F28] hover:bg-gray-200"
              }`}
            >
              {concern.label}
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}

      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-[#6f3f93] hover:bg-[#5f347f] text-white rounded-xl py-4 text-lg font-semibold transition-colors"
        >
          분석 시작하기
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-[#8B95A1] hover:text-[#191F28] py-3 text-base transition-colors"
        >
          이전으로
        </button>
      </div>
    </div>
  );
}
