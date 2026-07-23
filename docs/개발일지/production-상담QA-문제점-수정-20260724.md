# production 상담 QA 문제점 수정

- 일자: 2026-07-24
- PM 문서: `docs/pm/production-상담QA-문제점-개발자전달-20260724.md`
- 사용 스킬: `systematic-debugging`

## 원인 분석

- production paid 동시 상담에서 `200 + 503`이 나온 핵심 원인은 서버리스 환경에서 메모리 `Map` 기반 lock이 인스턴스 사이에 공유되지 않는 구조로 판단했다.
- 같은 readingId 중복 제출은 두 번째 요청이 AI 호출까지 가면 안 되므로 DB 기반 원자 lock이 필요하다.
- 첫 상담 말투는 `advancedContext`에 자미두수/서양 점성술/한자 원문이 들어가고, 기존 프롬프트가 이를 적극 활용하라고 지시해 모델이 초반에 전문용어를 그대로 노출할 수 있었다.
- 비로그인 `/ko/reading` 흐름은 server action이 `로그인이 필요합니다.`만 반환해 다음 행동이 약했다.

## 수정 내용

- `supabase/migrations/202607240030_chat_generation_persistent_lock.sql` 추가.
  - `public.chat_generation_locks` 테이블 추가.
  - `public.acquire_chat_generation_lock`, `public.release_chat_generation_lock` RPC 추가.
  - 실행 권한은 `service_role` 전용으로 제한.
- `src/lib/saju/chat-concurrency.ts`에 persistent lock RPC helper 추가.
- `src/app/api/saju/chat/route.ts`에서 메모리 lock을 reading 단위 보조 lock으로 바꾸고, AI 호출/별 예약 전에 Supabase persistent lock을 먼저 잡게 했다.
- `src/lib/ai/chat-completion-guard.ts`에서 `별자리 데이터`, `자미두수`, `서양 점성술`, 영어 점성술 표현, 첫 200자 안 한자 과다 노출을 첫 상담 품질 실패로 처리했다.
- `src/lib/saju/initial-analysis.ts`와 chat route 프롬프트에서 첫 상담은 고급 분석 원문을 그대로 노출하지 말고 사주 중심 생활 언어로만 정리하도록 지시했다.
- `scripts/qa-live-api-check.mjs`에도 혼합 점술 체계 표현과 첫 200자 한자 과다 검사를 추가했다.
- `src/app/[locale]/reading/page.tsx`에서 비로그인 분석 시작 실패 시 Google 로그인 CTA와 입력값 복귀용 `/ko/reading?...` next 경로를 보여주게 했다.
- `/api/analytics/track` 404는 직전 작업에서 route 추가로 코드상 해결된 상태라 이번 검증에서 빌드 route 목록에 포함됨을 다시 확인했다.

## 검증

- 실패 확인: 신규 회귀 테스트 추가 후 대상 테스트 4개 실패 확인.
- 통과 확인: `./node_modules/.bin/vitest run src/lib/ai/chat-completion-guard.test.ts src/lib/saju/chat-concurrency.test.ts src/lib/security/release-gate-regression.test.ts src/lib/security/free-beta-qa-regression.test.ts`
- 통과 확인: `./node_modules/.bin/vitest run` 53 files / 236 tests.
- 통과 확인: `./node_modules/.bin/tsc --noEmit`.
- 통과 확인: `./node_modules/.bin/eslint .`.
- 통과 확인: sandbox 밖 `./node_modules/.bin/next build`.

## 배포 주의

- 이번 코드는 새 RPC에 의존하므로 production 배포 전에 운영 Supabase에 `202607240030_chat_generation_persistent_lock.sql`을 먼저 적용해야 한다.
- 적용 후 `env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs`를 최소 3회 반복해 paid 동시 상담이 항상 `200 + 409`로 나오는지 확인해야 한다.

