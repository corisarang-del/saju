# Vertex 실사용 QA 첫상담 품질보완

## 배경

- Vertex ADC 전환 후 실제 상담 생성과 과금 흐름은 정상으로 확인됐다.
- 남은 문제는 첫 상담 답변 품질이다.
- live QA 5케이스에서 3개 답변이 4문단으로 길어졌고, 1개 답변은 질문 없이 끝났다.
- 실제 인증 채팅 응답에는 상담형 톤을 해칠 수 있는 이모지와 가벼운 외래어가 섞일 수 있었다.

## 처리 방향

- 첫 상담 품질 테스트를 먼저 보강한다.
- 첫 상담 프롬프트에 빈 줄 기준 최대 3문단, 마지막 물음표, 질문 1개, 이모지/가벼운 외래어 금지를 명시한다.
- 첫 상담 전용 생성 토큰 상한을 일반 무료 후속 답변보다 낮춘다.
- Gemini live QA 스크립트가 이모지, 가벼운 외래어, 질문으로 끝남 여부를 표로 표시하게 한다.

## 구현

- `src/lib/saju/initial-analysis.ts` 첫 상담 규칙을 정확히 2문단 중심으로 좁혔다.
- `/api/saju/chat`의 첫 상담 규칙에도 정확히 2문단, 마지막 물음표, 이모지/가벼운 외래어 금지를 반영했다.
- `getChatMaxOutputTokens`에 `isFirstAssistantTurn` 옵션을 추가해 첫 상담은 550 tokens로 제한했다.
- `scripts/qa-gemini-first-consultation.mjs` 평가 항목에 `endsWithQuestion`, `hasEmoji`, `hasLightForeignWord`를 추가했다.
- QA 스크립트의 live generation 상한을 500 tokens로 낮췄다.

## 검증

- 실패 확인:
  - `pnpm exec vitest run src/lib/saju/first-consultation-quality.test.ts src/lib/saju/chat-generation.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts --pool=forks --maxWorkers=1`
  - 첫 실행에서 문단/질문/이모지·외래어 테스트 3개가 의도대로 실패했다.
- 구현 후 같은 테스트 통과: 3 files, 13 tests.
- Vertex live QA 1차 재실행:
  - 질문 종료와 이모지는 개선됐지만 문단 수 3건, 외래어 1건이 남았다.
- 프롬프트를 정확히 2문단으로 더 좁힌 뒤 Vertex live QA 2차 재실행:
  - `docs/qa/gemini-first-consultation-qa-2026-07-02.md`
  - 5케이스 모두 고민 반영, 금지 표현 없음, 1~3문단, 질문으로 끝남, 이모지 없음, 가벼운 외래어 없음 통과.
- `pnpm test` 통과: 36 files, 121 tests.
- `pnpm lint` 통과.
- `pnpm test:env` 통과.
- `pnpm build` 통과.
