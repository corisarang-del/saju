# Gemini QA 리포트 영어 혼합 기준 보강

## 날짜
2026-07-07

## 작업
- `docs/qa/gemini-first-consultation-qa-2026-07-07.md`를 재확인했다.
- 기존 기준은 사주 근거, 구체 행동, 상투/단정 표현 금지를 다루지만 영어 혼합 여부는 별도 평가하지 않았다.
- `scripts/qa-gemini-first-consultation.mjs`에 `englishMixingPatterns`와 `hasEnglishMixing` 평가값을 추가했다.
- QA 리포트 요약 표에 `영어 혼합 없음` 열을 추가했다.
- live QA 시스템 지시문에 모든 답변 한국어 전용, 영어 번역/영어 병기 금지를 추가했다.

## 테스트
```bash
pnpm test src/lib/saju/gemini-first-consultation-qa-runner.test.ts
```

결과: 1 file / 7 tests 통과.
