'use client';

import { useState } from 'react';
import { createReading } from '@/services/saju/actions';
import { Link } from '@/i18n/routing';

const REPORT_COST = 10;

const SIJI_OPTIONS = [
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

interface PreviousBirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  birthCity?: string;
}

const HOUR_TO_SIJI: Record<number, string> = {
  23: 'ja', 0: 'ja', 1: 'chuk', 2: 'chuk', 3: 'in', 4: 'in',
  5: 'myo', 6: 'myo', 7: 'jin', 8: 'jin', 9: 'sa', 10: 'sa',
  11: 'o', 12: 'o', 13: 'mi', 14: 'mi', 15: 'sin', 16: 'sin',
  17: 'yu', 18: 'yu', 19: 'sul', 20: 'sul', 21: 'hae', 22: 'hae',
};

interface SajuReportClientProps {
  userId: string;
  starBalance: number;
  previousBirthInfo?: PreviousBirthInfo;
}

type Step = 'input' | 'generating' | 'done' | 'error';

export default function SajuReportClient({
  userId,
  starBalance,
  previousBirthInfo,
}: SajuReportClientProps) {
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthTime, setBirthTime] = useState('unknown');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [usedMyInfo, setUsedMyInfo] = useState(false);

  const fillMyInfo = () => {
    if (!previousBirthInfo) return;
    setName(previousBirthInfo.name);
    setGender(previousBirthInfo.gender);
    setBirthYear(previousBirthInfo.birthYear.toString());
    setBirthMonth(previousBirthInfo.birthMonth.toString());
    setBirthDay(previousBirthInfo.birthDay.toString());
    setBirthTime(previousBirthInfo.birthHour != null ? (HOUR_TO_SIJI[previousBirthInfo.birthHour] ?? 'unknown') : 'unknown');
    setCalendar(previousBirthInfo.isLunar ? 'lunar' : 'solar');
    setUsedMyInfo(true);
  };

  const handleGenerate = async () => {
    // Validation
    if (!name.trim()) { setError('이름을 입력해주세요'); return; }
    if (!birthYear || Number(birthYear) < 1940 || Number(birthYear) > 2025) { setError('올바른 년도를 입력해주세요'); return; }
    if (!birthMonth || Number(birthMonth) < 1 || Number(birthMonth) > 12) { setError('올바른 월을 입력해주세요'); return; }
    if (!birthDay || Number(birthDay) < 1 || Number(birthDay) > 31) { setError('올바른 일을 입력해주세요'); return; }
    if (starBalance < REPORT_COST) { setError(`별이 부족합니다. (필요: ${REPORT_COST}개, 보유: ${starBalance}개)`); return; }

    setError(null);
    setStep('generating');

    try {
      // 1. Reading 생성 (만세력 계산 포함)
      const { data: reading, error: createError } = await createReading({
        name: name.trim(),
        gender,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        birthDay: Number(birthDay),
        birthHour: SIJI_TO_HOUR[birthTime] ?? null,
        birthMinute: 0,
        isLunar: calendar === 'lunar',
        isLeapMonth: false,
        concerns: ['career', 'love', 'wealth'],
      });

      if (createError || !reading) {
        throw new Error(createError || '분석 생성에 실패했습니다.');
      }

      // 2. 별 차감
      const deductRes = await fetch('/api/saju/deduct-stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: REPORT_COST, readingId: reading.id }),
      });

      if (!deductRes.ok) {
        throw new Error('별 차감에 실패했습니다.');
      }

      // 3. Status를 paid로 변경
      const statusRes = await fetch('/api/saju/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: reading.id, status: 'paid' }),
      });

      if (!statusRes.ok) {
        throw new Error('상태 업데이트에 실패했습니다.');
      }

      // 4. AI 종합 분석 생성
      const analyzeRes = await fetch('/api/saju/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: reading.id }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'AI 분석 생성에 실패했습니다.');
      }

      // 4. PDF 다운로드
      const pdfRes = await fetch(`/api/saju/pdf/${reading.id}`);
      if (!pdfRes.ok) throw new Error('PDF 생성에 실패했습니다.');

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `월간사주_${name.trim()}_종합분석리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setStep('error');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">종합 분석 리포트 생성 중...</h2>
          <p className="text-sm text-gray-400">AI가 사주를 분석하고 있어요. 잠시만 기다려주세요.</p>
          <p className="text-xs text-gray-600 mt-4">보통 30초~1분 정도 소요됩니다</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">리포트가 생성되었습니다!</h2>
          <p className="text-sm text-gray-400 mb-8">PDF 파일이 자동으로 다운로드됩니다.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStep('input'); setUsedMyInfo(false); }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
            >
              다른 사람 리포트 받기
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#2a2a3a] text-gray-300 text-sm font-medium hover:bg-[#1e1e2a] transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0a0a0f] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">종합 사주 리포트</h1>
          <p className="text-sm text-gray-400">
            AI가 분석한 상세 사주 리포트를 PDF로 받아보세요
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-yellow-400">&#9733;</span>
            <span className="text-sm text-gray-300">{REPORT_COST}개 사용</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">보유: {starBalance}개</span>
          </div>
        </div>

        {/* 내 정보 사용하기 */}
        {previousBirthInfo && !usedMyInfo && (
          <button
            onClick={fillMyInfo}
            className="w-full mb-4 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-purple-300">내 정보 사용하기</p>
              <p className="text-[11px] text-gray-500">{previousBirthInfo.name} · {previousBirthInfo.birthYear}.{previousBirthInfo.birthMonth}.{previousBirthInfo.birthDay}</p>
            </div>
          </button>
        )}

        {usedMyInfo && (
          <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-xs text-purple-400">내 정보가 입력되었습니다</span>
            <button
              onClick={() => {
                setUsedMyInfo(false);
                setName(''); setBirthYear(''); setBirthMonth(''); setBirthDay('');
                setBirthTime('unknown'); setGender('male'); setCalendar('solar');
              }}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* 입력 폼 */}
        <div className="space-y-4">
          {/* 에러 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full border border-[#2a2a3a] bg-[#13131a] rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-purple-500/50 outline-none placeholder:text-gray-600"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">생년월일</label>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" placeholder="1990" min={1940} max={2025}
                value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                className="flex-[2] border border-[#2a2a3a] bg-[#13131a] rounded-xl px-3 py-3 text-center text-sm text-gray-200 focus:border-purple-500/50 outline-none placeholder:text-gray-600"
              />
              <input type="number" inputMode="numeric" placeholder="월" min={1} max={12}
                value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                className="flex-1 border border-[#2a2a3a] bg-[#13131a] rounded-xl px-3 py-3 text-center text-sm text-gray-200 focus:border-purple-500/50 outline-none placeholder:text-gray-600"
              />
              <input type="number" inputMode="numeric" placeholder="일" min={1} max={31}
                value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
                className="flex-1 border border-[#2a2a3a] bg-[#13131a] rounded-xl px-3 py-3 text-center text-sm text-gray-200 focus:border-purple-500/50 outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* 태어난 시간 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">태어난 시간</label>
            <select
              value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
              className="w-full border border-[#2a2a3a] bg-[#13131a] rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-purple-500/50 outline-none"
            >
              {SIJI_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.
            </p>
          </div>

          {/* 성별 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">성별</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    gender === g
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-[#2a2a3a] text-gray-400 hover:border-[#3a3a4a]'
                  }`}
                >
                  {g === 'male' ? '남' : '여'}
                </button>
              ))}
            </div>
          </div>

          {/* 달력 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">달력</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solar', 'lunar'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCalendar(c)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    calendar === c
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-[#2a2a3a] text-gray-400 hover:border-[#3a3a4a]'
                  }`}
                >
                  {c === 'solar' ? '양력' : '음력'}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={starBalance < REPORT_COST}
            className="w-full mt-4 py-4 rounded-2xl bg-purple-600 text-white text-base font-semibold
              hover:bg-purple-500 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starBalance < REPORT_COST ? (
              '별이 부족합니다'
            ) : (
              <>종합 리포트 생성하기 (&#9733; {REPORT_COST}개)</>
            )}
          </button>

          {starBalance < REPORT_COST && (
            <Link
              href="/coin-shop"
              className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
            >
              별 충전하러 가기 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
