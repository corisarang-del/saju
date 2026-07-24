"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIRTH_DATE_PRIVACY_NOTICE } from "@/lib/content/trust-copy";

const SIJI = [
  { value: "unknown", label: "모름" },
  { value: "ja", label: "자시 (23:00~01:00)" },
  { value: "chuk", label: "축시 (01:00~03:00)" },
  { value: "in", label: "인시 (03:00~05:00)" },
  { value: "myo", label: "묘시 (05:00~07:00)" },
  { value: "jin", label: "진시 (07:00~09:00)" },
  { value: "sa", label: "사시 (09:00~11:00)" },
  { value: "o", label: "오시 (11:00~13:00)" },
  { value: "mi", label: "미시 (13:00~15:00)" },
  { value: "sin", label: "신시 (15:00~17:00)" },
  { value: "yu", label: "유시 (17:00~19:00)" },
  { value: "sul", label: "술시 (19:00~21:00)" },
  { value: "hae", label: "해시 (21:00~23:00)" },
];

function getDaysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

export interface BirthDateFormData {
  name: string;
  year: string;
  month: string;
  day: string;
  time: string;
  gender: "male" | "female";
  calendar: "solar" | "lunar";
}

interface BirthDateFormProps {
  onSubmit: (data: BirthDateFormData) => void;
}

export default function BirthDateForm({ onSubmit }: BirthDateFormProps) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxDay = useMemo(() => {
    return getDaysInMonth(Number(year), Number(month));
  }, [year, month]);

  const handleYearChange = (nextYear: string) => {
    setYear(nextYear);
    const nextMaxDay = getDaysInMonth(Number(nextYear), Number(month));
    if (day && Number(day) > nextMaxDay) {
      setDay("");
    }
  };

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth);
    const nextMaxDay = getDaysInMonth(Number(year), Number(nextMonth));
    if (day && Number(day) > nextMaxDay) {
      setDay("");
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!year) newErrors.year = "년도를 선택해주세요";
    if (!month) newErrors.month = "월을 선택해주세요";
    if (!day) newErrors.day = "일을 선택해주세요";
    if (!gender) newErrors.gender = "성별을 선택해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      year,
      month,
      day,
      time: time || "unknown",
      gender: gender as "male" | "female",
      calendar,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#191F28]">
          생년월일을 알려주세요
        </h2>
        <p className="mt-2 text-[#6B7280] text-sm">
          정확한 사주 분석을 위해 정보를 입력해주세요
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5EDF8] bg-[#F7FAFF] px-4 py-3 text-left">
        <p className="text-[13px] font-semibold text-[#191F28]">
          {BIRTH_DATE_PRIVACY_NOTICE.title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#4E5968]">
          {BIRTH_DATE_PRIVACY_NOTICE.body}
        </p>
      </div>

      {/* 이름 */}
      <div>
        <Label
          htmlFor="name"
          className="text-sm font-medium text-[#191F28] mb-1.5 block"
        >
          이름
        </Label>
        <Input
          id="name"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border-gray-200 text-base placeholder:text-[#667085]"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* 생년월일 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          생년월일
        </Label>
        <div className="grid grid-cols-[1.35fr_1fr_1fr] gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="birth-year" className="text-xs text-[#4E5968]">
              태어난 연도
            </Label>
            <div className="relative">
              <input
                id="birth-year"
                aria-label="태어난 연도"
                type="number"
                inputMode="numeric"
                placeholder="1990"
                min={1940}
                max={2010}
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 pr-8 text-center text-lg placeholder:text-[#667085] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                년
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birth-month" className="text-xs text-[#4E5968]">
              월
            </Label>
            <div className="relative">
              <input
                id="birth-month"
                aria-label="태어난 월"
                type="number"
                inputMode="numeric"
                placeholder="03"
                min={1}
                max={12}
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 pr-7 text-center text-lg placeholder:text-[#667085] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                월
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birth-day" className="text-xs text-[#4E5968]">
              일
            </Label>
            <div className="relative">
              <input
                id="birth-day"
                aria-label="태어난 일"
                type="number"
                inputMode="numeric"
                placeholder="21"
                min={1}
                max={maxDay}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 pr-7 text-center text-lg placeholder:text-[#667085] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                일
              </span>
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-[#6B7280]">예: 1998 / 03 / 21</p>
        {(errors.year || errors.month || errors.day) && (
          <p className="text-red-500 text-xs mt-1">생년월일을 입력해주세요</p>
        )}
      </div>

      {/* 태어난 시간 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          태어난 시간
        </Label>
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base text-[#191F28] data-[placeholder]:font-medium data-[placeholder]:text-[#4E5968]">
            <SelectValue placeholder="시간을 선택하세요 (선택)" />
          </SelectTrigger>
          <SelectContent>
            {SIJI.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs leading-relaxed text-[#4E5968]">
          태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.
        </p>
      </div>

      {/* 성별 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          성별
        </Label>
        <p className="mb-2 text-xs leading-relaxed text-[#4E5968]">
          성별은 사주 계산 기준에 필요해서만 사용해.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              gender === "male"
                ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            남
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              gender === "female"
                ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            여
          </button>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
        )}
      </div>

      {/* 음력/양력 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          달력 구분
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCalendar("solar")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              calendar === "solar"
                ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            양력
          </button>
          <button
            type="button"
            onClick={() => setCalendar("lunar")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              calendar === "lunar"
                ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            음력
          </button>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        type="submit"
        className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl py-4 text-lg font-semibold transition-colors mt-2"
      >
        다음
      </button>
    </form>
  );
}
