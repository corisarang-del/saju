'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CharacterType } from '@/lib/saju/characters';
import { createReading, createCompatibility, updateReadingBirthInfo } from '@/services/saju/actions';
import { updateReadingMeta } from '@/services/saju/chat-actions';

const SIJI = [
  { value: 'unknown', label: '모름' },
  { value: 'ja', label: '자시 (23:00~01:00)' },
  { value: 'chuk', label: '축시 (01:00~03:00)' },
  { value: 'in', label: '인시 (03:00~05:00)' },
  { value: 'myo', label: '묘시 (05:00~07:00)' },
  { value: 'jin', label: '진시 (07:00~09:00)' },
  { value: 'sa', label: '사시 (09:00~11:00)' },
  { value: 'o', label: '오시 (11:00~13:00)' },
  { value: 'mi', label: '미시 (13:00~15:00)' },
  { value: 'sin', label: '신시 (15:00~17:00)' },
  { value: 'yu', label: '유시 (17:00~19:00)' },
  { value: 'sul', label: '술시 (19:00~21:00)' },
  { value: 'hae', label: '해시 (21:00~23:00)' },
];

const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null, ja: 23, chuk: 1, in: 3, myo: 5, jin: 7, sa: 9,
  o: 11, mi: 13, sin: 15, yu: 17, sul: 19, hae: 21,
};

const HOUR_TO_SIJI: Record<number, string> = {
  23: 'ja', 0: 'ja', 1: 'chuk', 2: 'chuk', 3: 'in', 4: 'in',
  5: 'myo', 6: 'myo', 7: 'jin', 8: 'jin', 9: 'sa', 10: 'sa',
  11: 'o', 12: 'o', 13: 'mi', 14: 'mi', 15: 'sin', 16: 'sin',
  17: 'yu', 18: 'yu', 19: 'sul', 20: 'sul', 21: 'hae', 22: 'hae',
};

export interface BirthInfoData {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  birthCity?: string;
}

interface BirthInfoCardProps {
  characterId: CharacterType;
  onComplete: (readingId: string) => void;
  editMode?: boolean;
  readingId?: string;
  initialData?: BirthInfoData;
  onCancel?: () => void;
}

const isCompatibility = (id: CharacterType) => id === 'charon_f';

export default function BirthInfoCard({ characterId, onComplete, editMode, readingId, initialData, onCancel }: BirthInfoCardProps) {
  // 궁합 모드: step 1 = 내 정보, step 2 = 상대방 정보
  const [step, setStep] = useState<1 | 2>(1);
  const [createdReadingId, setCreatedReadingId] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name ?? '');
  const [year, setYear] = useState(initialData?.birthYear?.toString() ?? '');
  const [month, setMonth] = useState(initialData?.birthMonth?.toString() ?? '');
  const [day, setDay] = useState(initialData?.birthDay?.toString() ?? '');
  const [time, setTime] = useState(initialData?.birthHour != null ? (HOUR_TO_SIJI[initialData.birthHour] ?? 'unknown') : 'unknown');
  const [gender, setGender] = useState<'male' | 'female' | ''>(initialData?.gender ?? '');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>(initialData?.isLunar ? 'lunar' : 'solar');
  const [birthCity, setBirthCity] = useState(initialData?.birthCity ?? '서울');

  // 상대방 정보 (궁합용)
  const [partnerName, setPartnerName] = useState('');
  const [partnerYear, setPartnerYear] = useState('');
  const [partnerMonth, setPartnerMonth] = useState('');
  const [partnerDay, setPartnerDay] = useState('');
  const [partnerTime, setPartnerTime] = useState('unknown');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female' | ''>('');
  const [partnerCalendar, setPartnerCalendar] = useState<'solar' | 'lunar'>('solar');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDay = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }, [year, month]);

  const partnerMaxDay = useMemo(() => {
    if (!partnerYear || !partnerMonth) return 31;
    return new Date(Number(partnerYear), Number(partnerMonth), 0).getDate();
  }, [partnerYear, partnerMonth]);

  const handleStep1Submit = async () => {
    if (!name.trim()) { setError('이름을 입력해주세요'); return; }
    if (!year || Number(year) < 1940 || Number(year) > 2025) { setError('올바른 년도를 입력해주세요'); return; }
    if (!month || Number(month) < 1 || Number(month) > 12) { setError('올바른 월을 입력해주세요'); return; }
    if (!day || Number(day) < 1 || Number(day) > maxDay) { setError('올바른 일을 입력해주세요'); return; }
    if (!gender) { setError('성별을 선택해주세요'); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      const birthHour = SIJI_TO_HOUR[time] ?? null;

      if (editMode && readingId) {
        const { error: updateError } = await updateReadingBirthInfo(readingId, {
          name: name.trim(),
          gender: gender as 'male' | 'female',
          birthYear: Number(year),
          birthMonth: Number(month),
          birthDay: Number(day),
          birthHour,
          isLunar: calendar === 'lunar',
          birthCity,
        });

        if (updateError) {
          setError(updateError);
          setIsSubmitting(false);
          return;
        }

        onComplete(readingId);
        return;
      }

      const { data, error: createError } = await createReading({
        name: name.trim(),
        gender: gender as 'male' | 'female',
        birthYear: Number(year),
        birthMonth: Number(month),
        birthDay: Number(day),
        birthHour,
        birthMinute: 0,
        isLunar: calendar === 'lunar',
        isLeapMonth: false,
        concerns: ['other'],
      });

      if (createError || !data) {
        setError(createError || '생성에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      await updateReadingMeta(data.id, { birthCity, characterId });

      if (isCompatibility(characterId)) {
        setCreatedReadingId(data.id);
        setStep(2);
        setIsSubmitting(false);
      } else {
        onComplete(data.id);
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!partnerName.trim()) { setError('상대방 이름을 입력해주세요'); return; }
    if (!partnerYear || Number(partnerYear) < 1940 || Number(partnerYear) > 2025) { setError('올바른 년도를 입력해주세요'); return; }
    if (!partnerMonth || Number(partnerMonth) < 1 || Number(partnerMonth) > 12) { setError('올바른 월을 입력해주세요'); return; }
    if (!partnerDay || Number(partnerDay) < 1 || Number(partnerDay) > partnerMaxDay) { setError('올바른 일을 입력해주세요'); return; }
    if (!partnerGender) { setError('상대방 성별을 선택해주세요'); return; }
    if (!createdReadingId) { setError('오류가 발생했습니다. 다시 시도해주세요.'); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      const partnerBirthHour = SIJI_TO_HOUR[partnerTime] ?? null;

      const { error: compatError } = await createCompatibility({
        readingId: createdReadingId,
        partnerName: partnerName.trim(),
        partnerGender: partnerGender as 'male' | 'female',
        partnerBirthYear: Number(partnerYear),
        partnerBirthMonth: Number(partnerMonth),
        partnerBirthDay: Number(partnerDay),
        partnerBirthHour: partnerBirthHour,
        partnerBirthMinute: 0,
        partnerIsLunar: partnerCalendar === 'lunar',
        partnerIsLeapMonth: false,
      });

      if (compatError) {
        setError(compatError);
        setIsSubmitting(false);
        return;
      }

      onComplete(createdReadingId);
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600";

  // 궁합 step 2: 상대방 정보 입력
  if (step === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="ml-2 sm:ml-10 max-w-sm"
      >
        <div className="bg-[#13131a] rounded-2xl border border-[#2a2a3a] p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-pink-200">2</span>
            </div>
            <p className="text-sm font-semibold text-gray-200">상대방 정보</p>
            <span className="text-[11px] text-gray-500 ml-auto">2/2</span>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">이름</label>
            <input type="text" aria-label="상대방 이름" placeholder="상대방 이름" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">생년월일</label>
            <div className="flex gap-1.5">
              <input type="number" aria-label="상대방 태어난 연도" inputMode="numeric" placeholder="1990" min={1940} max={2025} value={partnerYear} onChange={(e) => setPartnerYear(e.target.value)}
                className="flex-[2] border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
              <input type="number" aria-label="상대방 태어난 월" inputMode="numeric" placeholder="월" min={1} max={12} value={partnerMonth} onChange={(e) => setPartnerMonth(e.target.value)}
                className="flex-1 border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
              <input type="number" aria-label="상대방 태어난 일" inputMode="numeric" placeholder="일" min={1} max={partnerMaxDay} value={partnerDay} onChange={(e) => setPartnerDay(e.target.value)}
                className="flex-1 border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">태어난 시간</label>
            <select aria-label="상대방 태어난 시간" value={partnerTime} onChange={(e) => setPartnerTime(e.target.value)} className={`${inputClass} bg-[#0e0e15]`}>
              {SIJI.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
              태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">성별</label>
            <p className="mb-2 text-[11px] leading-relaxed text-gray-500">
              성별은 사주 계산 기준에 필요해서만 사용해.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} type="button" aria-pressed={partnerGender === g} onClick={() => setPartnerGender(g)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    partnerGender === g
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-[#2a2a3a] text-gray-300 hover:border-[#3a3a4a]'
                  }`}>
                  {g === 'male' ? '남' : '여'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 mb-1 block">달력</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solar', 'lunar'] as const).map((c) => (
                <button key={c} type="button" aria-pressed={partnerCalendar === c} onClick={() => setPartnerCalendar(c)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    partnerCalendar === c
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-[#2a2a3a] text-gray-300 hover:border-[#3a3a4a]'
                  }`}>
                  {c === 'solar' ? '양력' : '음력'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setStep(1); setError(null); }}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors border border-[#2a2a3a] text-gray-300 hover:bg-[#1e1e2a]">
              이전
            </button>
            <button onClick={handleStep2Submit} disabled={isSubmitting}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50 bg-pink-600 text-white hover:bg-pink-500">
              {isSubmitting ? '분석 중...' : '궁합 분석 시작'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Step 1 (기본 / 궁합 내 정보)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="ml-2 sm:ml-10 max-w-sm"
    >
      <div className="bg-[#13131a] rounded-2xl border border-[#2a2a3a] p-5 space-y-4">
        {isCompatibility(characterId) && !editMode && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-purple-200">1</span>
            </div>
            <p className="text-sm font-semibold text-gray-200">내 정보</p>
            <span className="text-[11px] text-gray-500 ml-auto">1/2</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">이름</label>
          <input type="text" aria-label="이름" placeholder="이름을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">생년월일</label>
          <div className="flex gap-1.5">
            <input type="number" aria-label="태어난 연도" inputMode="numeric" placeholder="1990" min={1940} max={2025} value={year} onChange={(e) => setYear(e.target.value)}
              className="flex-[2] border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
            <input type="number" aria-label="태어난 월" inputMode="numeric" placeholder="월" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)}
              className="flex-1 border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
            <input type="number" aria-label="태어난 일" inputMode="numeric" placeholder="일" min={1} max={maxDay} value={day} onChange={(e) => setDay(e.target.value)}
              className="flex-1 border border-[#2a2a3a] bg-[#0e0e15] rounded-xl px-2 py-2.5 text-center text-sm text-gray-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none placeholder:text-gray-600" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">태어난 시간</label>
          <select aria-label="태어난 시간" value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} bg-[#0e0e15]`}>
            {SIJI.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
            태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">성별</label>
          <p className="mb-2 text-[11px] leading-relaxed text-gray-500">
            성별은 사주 계산 기준에 필요해서만 사용해.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  gender === g
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-[#2a2a3a] text-gray-300 hover:border-[#3a3a4a]'
                }`}>
                {g === 'male' ? '남' : '여'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">달력</label>
          <div className="grid grid-cols-2 gap-2">
            {(['solar', 'lunar'] as const).map((c) => (
              <button key={c} type="button" aria-pressed={calendar === c} onClick={() => setCalendar(c)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  calendar === c
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-[#2a2a3a] text-gray-300 hover:border-[#3a3a4a]'
                }`}>
                {c === 'solar' ? '양력' : '음력'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 mb-1 block">태어난 곳</label>
          <input type="text" aria-label="태어난 곳" placeholder="서울, 부산, Tokyo 등" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} className={inputClass} />
        </div>

        <div className="flex gap-2">
          {editMode && onCancel && (
            <button onClick={onCancel}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors border border-[#2a2a3a] text-gray-300 hover:bg-[#1e1e2a]">
              취소
            </button>
          )}
          <button onClick={handleStep1Submit} disabled={isSubmitting}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-500">
            {isSubmitting ? '저장 중...' : editMode ? '정보 수정하기' : isCompatibility(characterId) ? '다음 (상대방 정보)' : '사주 분석 시작'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
