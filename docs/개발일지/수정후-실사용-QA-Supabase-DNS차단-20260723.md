# 수정후 실사용 QA Supabase DNS 차단

## 요청
- 개발자가 문제점을 수정한 뒤 실제로 제대로 작동하고 제대로 응답하는지 QA 재검증.
- 지금까지 나온 내용을 문서화하고 메모리에 저장.

## 검증 시간
- 2026-07-23 21:48 KST 기준.

## 사용한 스킬
- `powerqa`: 자동 테스트, 빌드, 라이브 QA, 실제 API QA를 순차 검증.
- `playwright`: `/ko` 실제 브라우저 렌더링과 콘솔 확인.
- `memory`: QA 결과와 다음 검증 포인트를 `.codex/memory`에 저장.

## 결론
- 코드/빌드/브라우저/LLM 단독 QA는 통과했다.
- 하지만 실제 Supabase 인증 유저를 생성해서 `/api/saju/chat`까지 검증하는 실사용 API QA는 Supabase DNS 해석 실패로 완료하지 못했다.
- 따라서 오늘 기준으로 “실제 API까지 완전 통과”라고 말할 수는 없다.

## 통과한 항목
- 타깃 회귀 테스트:
  - 명령: `pnpm exec vitest run src/lib/saju/live-api-qa-runner.test.ts src/lib/ai/chat-completion-guard.test.ts src/lib/saju/first-consultation-quality.test.ts src/lib/saju/chat-generation.test.ts src/lib/saju/chat-concurrency.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts`
  - 결과: 6개 파일, 41개 테스트 통과.
- 환경변수 기본 검사:
  - 명령: `pnpm test:env`
  - 결과: 필수 환경변수 통과. Paddle 검사는 `REQUIRE_PADDLE_ENV=true`일 때만 실행.
- 전체 테스트:
  - 명령: `pnpm test`
  - 결과: 50개 파일, 199개 테스트 통과.
- 린트:
  - 명령: `pnpm lint`
  - 결과: 통과.
- 빌드:
  - 명령: `pnpm build`
  - 결과: Next.js 16.2.11 기준 컴파일, TypeScript, 정적 페이지 생성 통과.
- Gemini 첫 상담 라이브 QA:
  - 명령: `node scripts/qa-gemini-first-consultation.mjs`
  - 리포트: `docs/qa/gemini-first-consultation-qa-2026-07-23.md`
  - 결과: 6케이스 모두 통과.
  - 기준: 고민 반영, 사주 근거, 구체 행동, 금지 표현 없음, 정확히 2문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음, 영어 혼합 없음, 캐릭터명 호칭 없음.
- HTTP `/ko`:
  - 결과: `200 OK`.
- Google OAuth 시작:
  - 명령: `curl -s -D - -o /tmp/saju-google-auth-body.txt 'http://localhost:3000/api/auth/google?next=/ko/reading' | head -20`
  - 결과: Supabase authorize URL로 `307 Temporary Redirect`.
- Playwright `/ko`:
  - 결과: 페이지 제목 `월간사주 - 먼저 챙겨주는 사주친구`.
  - 스냅샷: `.playwright-cli/page-2026-07-23T12-48-16-674Z.yml`.
  - 콘솔: React DevTools 안내와 HMR 연결 정보 로그만 있음.

## 미완료 항목
### 실제 Supabase API QA
- 명령:
  - `env QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - `node scripts/qa-live-api-check.mjs`
- 결과:
  - 둘 다 Supabase 인증 유저 생성 단계에서 실패.
- 오류:
  - `getaddrinfo ENOTFOUND sfpwgywcmhgilrqearsz.supabase.co`
  - `AuthRetryableFetchError`
  - `status: 0`
- 별도 확인:
  - `curl -sf -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health`도 exit code 6으로 실패.

## 해석
- 이번 실패는 앱의 `/api/saju/chat` 로직까지 도달한 실패가 아니다.
- Supabase 도메인 DNS 해석이 안 되어 `scripts/qa-live-api-check.mjs`가 임시 auth user를 만들지 못했다.
- 따라서 무료 첫 상담, 유료 첫 상담 동시성, 별 예약/환불, 채팅 거래 로그, 저장된 assistant 품질은 오늘 실제 DB 기준으로 확인하지 못했다.

## 개발자에게 전달할 내용
- 자동 테스트와 Gemini 단독 QA만 보고 실제 API 통과로 판단하면 안 된다.
- Supabase 네트워크가 정상인 환경에서 아래를 다시 실행해야 한다.
  - `env QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - `node scripts/qa-live-api-check.mjs`
- 재실행 시 반드시 확인할 항목:
  - 무료 첫 상담 200 응답.
  - 저장 assistant가 정확히 2문단, 질문 종료, 사주 근거, 오늘 구체 행동 포함.
  - 별 잔액 3에서 2로 차감.
  - `star_transactions`에 `chat_message:-1` 기록.
  - 유료 첫 상담 동시 요청이 200/409로 처리.
  - 실패 시 별 환불 또는 차감 미발생.

## 최종 판단
- 코드 게이트 기준은 통과.
- LLM 단독 품질 기준도 통과.
- 브라우저 첫 화면도 정상.
- 하지만 실제 Supabase API QA는 DNS 차단으로 미완료라서, 사용자 요청의 “실제 제대로 작동”은 오늘 완전 확인하지 못했다.

## 후속 보강
- `scripts/qa-live-api-check.mjs`에 Supabase DNS preflight를 추가했다.
- 이제 QA 스크립트는 인증 유저 생성 전에 `NEXT_PUBLIC_SUPABASE_URL` host를 먼저 DNS lookup한다.
- 실패 시 `Supabase DNS lookup failed`와 `curl -I https://<host>/auth/v1/health` 확인 명령을 JSON으로 출력한다.
- 이 보강으로 실제 API QA 실패가 앱 로직인지 DNS/환경 차단인지 더 빠르게 구분할 수 있다.
- 검증:
  - `pnpm exec vitest run src/lib/saju/live-api-qa-runner.test.ts` 통과
  - `node scripts/qa-live-api-check.mjs`는 현재 환경에서 예상대로 `Supabase DNS lookup failed` 출력
  - `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` 통과
