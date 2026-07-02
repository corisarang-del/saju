# 서버보안 RPC suggestions 잔여이슈 보강

작업 내용:

- `supabase/migrations/202607010020_rpc_suggestions_security.sql` 추가.
- `decrement_star`, `deduct_stars_for_report`, `credit_stars_for_paddle_purchase`의 `authenticated` execute 권한을 revoke하고 `service_role` 전용으로 전환.
- `decrement_star`, `deduct_stars_for_report` 내부에 `auth.uid() <> p_user_id` 방어를 추가해 잘못 다시 grant되더라도 타인 차감을 막게 함.
- `deduct_stars_for_report` 내부에서 `saju_readings.id = p_reading_id` 및 `user_id = p_user_id` 소유권을 확인하게 함.
- `/api/saju/chat`, `/api/saju/deduct-stars`는 인증/소유권 검증 후 서버 전용 `createAdminClient()`로 민감 RPC를 호출하게 변경.
- `/api/saju/suggestions`에 로그인 인증, IP+user 분당 제한, user 일일 quota, 429 로깅, 입력값 검증, Gemini 실패 안전 응답을 추가.

TDD 기록:

- `src/lib/security/p0-hotfix-regression.test.ts`에 민감 RPC service_role 전용/소유권 방어 테스트를 먼저 추가했고 migration 부재로 실패 확인.
- `src/lib/security/suggestions-route-security.test.ts`에 suggestions 인증/rate limit/quota/안전 실패 응답 테스트를 먼저 추가했고 기존 route에서 실패 확인.
- 구현 후 `./node_modules/.bin/vitest run src/lib/security/p0-hotfix-regression.test.ts src/lib/security/suggestions-route-security.test.ts` 통과.

검증:

- `./node_modules/.bin/vitest run` 통과: 32 files, 94 tests.
- `./node_modules/.bin/tsc --noEmit` 통과.
- `./node_modules/.bin/eslint` 통과.
- `./node_modules/.bin/next build` 통과.
- `git diff --check` 통과.

주의:

- 실제 Supabase에는 `202607010020_rpc_suggestions_security.sql` migration을 적용해야 RPC 권한 revoke가 반영됨.
- 이전 migration 파일에는 과거 grant가 남아 있지만, 새 migration이 순서상 뒤에서 revoke함.
