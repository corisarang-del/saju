# Gemini QA 첫상담 품질게이트 재시도 보강

## 배경

- `docs/qa/gemini-first-consultation-qa-2026-07-10.md`에서 첫 상담 라이브 QA 일부 케이스가 품질 기준을 놓쳤다.
- 최초 확인 이슈는 `타이밍` 같은 가벼운 외래어, 마크다운 굵게 표시, 안내문형 마무리였다.
- 후속 라이브 QA에서는 `질문으로 끝남` 누락과 `나쁘지 않은`, 부정적 주머니 비유 같은 금지 표현 복사가 추가로 확인됐다.

## 원인

- 첫 상담 프롬프트가 금지 단어를 직접 길게 나열해서, 모델이 `쓰지 마` 문맥의 단어를 그대로 복사할 여지가 있었다.
- 저장 전 게이트가 이모지, 문단 수, 질문형 마무리, 일부 금지 표현은 잡았지만 가벼운 외래어와 남은 과장 표현 일부는 잡지 못했다.
- 라이브 QA 러너가 평가 실패를 리포트에 남기기만 하고, 실패 항목을 모델에게 되돌려 재작성시키는 구조가 없었다.

## 수정

- `src/lib/ai/chat-completion-guard.ts`
  - 첫 상담 저장 전 게이트에 가벼운 외래어 차단을 추가했다.
  - `나쁘지 않은`, `무조건`, `반드시 후회`, 안내문형 후속 유도 등 남은 금지 표현을 확장했다.
- `src/lib/ai/chat-completion-guard.test.ts`
  - 외래어, 마크다운 강조, 안내문형 마무리, 남은 금지 표현 회귀 테스트를 추가했다.
- `scripts/qa-gemini-first-consultation.mjs`
  - `MAX_QA_ATTEMPTS = 3` 재시도 루프를 추가했다.
  - 평가 실패 시 `buildQualityFeedback`으로 미달 항목을 프롬프트에 넣어 재생성한다.
  - 최종 품질 미달이 남으면 종료 코드 1로 실패하게 했다.
  - 모델에게 보이는 시스템 프롬프트에서는 복사 위험이 큰 금지 문구 나열을 줄이고, 평가기 내부 목록으로만 검사하게 정리했다.
- `src/lib/saju/initial-analysis.ts`, `src/app/api/saju/chat/route.ts`
  - 운영 첫 상담 지침에서도 복사 위험이 큰 실패 문구 직접 노출을 줄였다.
- `src/lib/saju/first-consultation-quality.test.ts`
  - 운영 프롬프트가 위험 문구를 직접 포함하지 않는 방향으로 기대값을 갱신했다.

## 검증

- `pnpm test src/lib/saju/first-consultation-quality.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts src/lib/ai/chat-completion-guard.test.ts src/lib/saju/initial-analysis.test.ts` 통과.
- `node scripts/qa-gemini-first-consultation.mjs` 통과.
- 최종 `docs/qa/gemini-first-consultation-qa-2026-07-10.md`는 6개 케이스 모든 평가 항목 `통과`.
- 금지 문구 검색에서 `확인필요`, 가벼운 외래어, 영어 혼합, 마크다운 강조, 안내문형 마무리 재현 없음.
- `pnpm test` 통과: 49 files / 182 tests.
- `pnpm exec tsc --noEmit` 통과.
- `pnpm lint` 통과.
- `pnpm build` 통과.

## 남은 주의

- Gemini live QA는 확률적이라 이후 모델 응답이 다시 흔들릴 수 있다.
- 운영 API는 저장 전 게이트로 실패 응답 저장과 별 차감을 막지만, 첫 상담을 스트리밍으로 먼저 보여주는 구조에서는 사용자에게 이미 일부 텍스트가 보일 수 있다.
- 완전한 사용자 경험 안정화를 위해서는 첫 상담만 비스트리밍 생성 후 검수, 필요 시 재작성하고 통과본을 스트리밍처럼 전달하는 구조를 다음 단계로 검토할 수 있다.
