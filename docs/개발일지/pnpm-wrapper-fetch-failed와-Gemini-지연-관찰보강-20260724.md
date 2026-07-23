# pnpm wrapper fetch failed와 Gemini 지연 관찰 보강

## 일시
- 2026-07-24 01:11 KST

## 진단
- sandbox 안에서 `pnpm test`, `pnpm lint`, `pnpm test:env`는 출력 없이 대기하다가 중단 시 `[ERROR] fetch failed`를 반환했다.
- 같은 sandbox에서 직접 실행한 `node scripts/check-env.js`, `./node_modules/.bin/eslint`, `./node_modules/.bin/vitest run`은 통과했다.
- 권한 있는 실제 실행 환경에서는 `pnpm --version`, `pnpm test:env`, `pnpm lint`, `pnpm test`가 모두 통과했다.
- 따라서 현재 재현 기준으로는 앱 코드 실패가 아니라 Codex sandbox의 pnpm fetch 경로 제한 문제로 본다.

## 구현
- `scripts/qa-live-api-check.mjs`의 `postJson` 결과에 `durationMs`를 추가했다.
- live API QA 결과에 `freeChatDurationMs`, `paidChatDurationMs`, `paidConflictDurationMs`를 출력하게 했다.
- `scripts/qa-gemini-first-consultation.mjs`가 케이스별 `attemptDurationsMs`, `totalDurationMs`를 리포트에 기록하게 했다.
- 운영 UX 관찰을 위해 QA 리포트에 `시도별 소요`, `전체 소요`가 남는다.

## 검증
- 실패 확인: `./node_modules/.bin/vitest run src/lib/saju/live-api-qa-runner.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts`
  - duration 기대치 추가 직후 2개 테스트가 실패했다.
- 수정 후 통과:
  - `./node_modules/.bin/vitest run src/lib/saju/live-api-qa-runner.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts`
  - 2 files / 12 tests 통과
- 직접 검증:
  - `node scripts/check-env.js` 통과
  - `./node_modules/.bin/eslint` 통과
  - `./node_modules/.bin/vitest run` 통과, 53 files / 218 tests
- 권한 있는 pnpm 검증:
  - `pnpm test:env` 통과
  - `pnpm lint` 통과
  - `pnpm test` 통과, 53 files / 218 tests

## 남은 관찰
- production 배포 후 실제 Vercel 런타임에서 Vertex 인증, 첫 상담 응답 시간, 재시도율을 smoke QA로 확인해야 한다.
- Gemini 2~3회 재시도 자체는 품질 게이트가 작동한다는 뜻이지만, 40~110초 응답은 사용자 이탈 위험이라 운영 로그/QA 리포트로 계속 본다.
