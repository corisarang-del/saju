# Gemini QA 금지표현 변형 게이트 보강

- 일시: 2026-07-10 15:40:11 KST

## 원인

- 2026-07-10 Gemini QA 리포트는 6케이스 모두 자동 통과였지만 전문 재리뷰에서 품질 리스크가 보였다.
- `물이 새는 주머니`는 금지어였지만 실제 답변은 `물이 조금씩 새는 주머니`라 정확 일치 기반 검사를 피했다.
- `사업/창업` 답변의 `[사주]`는 모델용 마커처럼 보이는 표현인데 기존 기준에 없었다.
- `걱정 마세요`는 20대 여성 신뢰 톤에서 상투적 안심 문구로 보일 수 있는데 기존 금지 기준에 없었다.

## 수정

- `chat-completion-guard` 저장 전 게이트에 금지 표현 변형 정규식을 추가했다.
- `scripts/qa-gemini-first-consultation.mjs` QA 러너에도 같은 기준을 추가했다.
- 첫 상담 프롬프트와 실제 chat route 지시문에 `[사주]` 같은 대괄호 마커, `걱정 마세요`, `물이 조금씩 새는 주머니` 금지를 추가했다.
- QA 리포트에는 보강 전 생성물이라는 재리뷰 메모를 남겼다.

## 검증

- 실패 확인:
  - `pnpm test src/lib/ai/chat-completion-guard.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts`
- 통과:
  - `pnpm test src/lib/ai/chat-completion-guard.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts src/lib/saju/first-consultation-quality.test.ts`
  - `pnpm exec tsc --noEmit`
  - `pnpm test`
  - `pnpm lint`
  - `pnpm build`

## 남은 확인

- 이번에는 live Gemini QA를 재실행하지 않았다.
- 다음 live QA에서 위 변형 표현이 다시 나오면 `금지 표현 없음`이 확인필요로 떨어지는지 확인해야 한다.

