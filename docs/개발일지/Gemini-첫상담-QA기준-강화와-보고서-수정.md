# Gemini 첫상담 QA기준 강화와 보고서 수정

## 작업 내용

- `docs/qa/gemini-first-consultation-qa-2026-07-07.md`를 재리뷰 보고서로 수정했어.
  - 기존 형식 기준은 통과였지만, 사주 근거와 구체 행동이 약한 답변을 `보완필요`로 재분류했어.
  - `필수적`, `물이 새는 주머니`, `나쁘지 않은 흐름`, `잠재력은 충분하지만`, `좋아하는 활동` 같은 표현을 리스크로 기록했어.
- `src/lib/saju/initial-analysis.ts` 첫 상담 지시문을 강화했어.
  - 사주 근거를 생활 언어로 설명하게 했어.
  - 오늘 할 일은 기록하기, 비교하기, 나누기 같은 구체 행동 1개로 쓰게 했어.
  - 상투적 가능성 문장과 자책 유발 표현을 금지했어.
- `scripts/qa-gemini-first-consultation.mjs` QA 러너를 강화했어.
  - `hasSajuGroundedFlow` 평가를 추가했어.
  - `hasConcreteTodayAction` 평가를 추가했어.
  - QA 요약 표에 `사주 근거`, `구체 행동` 열을 추가했어.
- 관련 회귀 테스트를 추가/수정했어.

## 검증

```text
pnpm test src/lib/saju/gemini-first-consultation-qa-runner.test.ts src/lib/saju/first-consultation-quality.test.ts
```

- 통과: 2 files / 13 tests

## 다음 확인

- 다음 live Gemini QA는 강화된 러너로 다시 실행해야 해.
- 통과 기준은 기존 형식 기준에 더해 사주 근거와 구체 행동까지 포함해야 해.
