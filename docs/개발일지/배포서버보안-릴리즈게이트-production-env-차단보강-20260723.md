# 배포서버보안 릴리즈게이트 production env 차단보강 20260723

## 배경

배포 서버보안 문서에서 production 배포 승인은 계속 보류라고 전달됐어. 핵심은 `release:gate:code`가 통과해도 실제 무료 상담 API QA와 production env 검증을 대체하지 못한다는 점이야.

기존 스크립트는 `release:gate`에 live API QA를 포함하고 있었지만, live QA 전에 production 필수 env인 canonical origin, 공유 rate limit backend, 무료 베타 payment-off 상태를 별도 env gate로 강제하지 않았어.

## 수정 내용

- `scripts/check-env.test.mjs`에 production env 회귀 테스트를 먼저 추가했어.
  - `REQUIRE_PRODUCTION_ENV=true`에서 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL`이 없으면 실패.
  - `REQUIRE_PRODUCTION_ENV=true`에서 `RATE_LIMIT_BACKEND=supabase`가 아니면 실패.
  - 결제 제외 무료 베타 production gate에서 `PAYMENTS_ENABLED` 또는 `NEXT_PUBLIC_PAYMENTS_ENABLED`가 true면 실패.
- `scripts/check-env.js`에 `REQUIRE_PRODUCTION_ENV` 검사를 추가했어.
- `package.json`의 `release:gate`를 `release:gate:code` 다음에 `REQUIRE_PRODUCTION_ENV=true pnpm test:env`를 실행하도록 바꿨어.
- `release:gate:payments`는 `REQUIRE_PRODUCTION_ENV=true REQUIRE_PADDLE_ENV=true pnpm test:env`로 시작하게 바꿨어.
- `.env.example`에 production release gate용 `RATE_LIMIT_BACKEND=supabase` 안내를 추가했어.

## 검증

- TDD 실패 확인:
  - `scripts/check-env.test.mjs`
  - `src/lib/security/release-gate-regression.test.ts`
  - 기존 구현에서는 production env/rate-limit/payment-off 검사와 release script 검사가 실패했어.
- 수정 후 `pnpm exec vitest run scripts/check-env.test.mjs src/lib/security/release-gate-regression.test.ts`: 2개 파일 / 19개 테스트 통과.
- `pnpm test:env`: 통과.
- `REQUIRE_PRODUCTION_ENV=true pnpm test:env`: 현재 로컬 env 기준 실패. 원인은 `RATE_LIMIT_BACKEND=supabase` 누락이야.
- `pnpm release:gate`: 코드 게이트는 통과했지만, 새 production env gate에서 `RATE_LIMIT_BACKEND=supabase` 누락으로 실패했어.
  - 전체 vitest 53개 파일 / 218개 테스트 통과.
  - 타입체크, lint, build, high audit 통과.
  - high audit gate는 통과했고 low 취약점 1개가 남아 있어.
- `pnpm release:gate:payments`: Paddle 필수 env와 `RATE_LIMIT_BACKEND=supabase` 누락으로 실패했어.
- `pnpm audit --prod`: `@ai-sdk/provider-utils` low advisory 1건 확인.
  - advisory: `GHSA-866g-f22w-33x8`
  - vulnerable: `<=3.0.97`
  - patched versions: `<0.0.0`, 현재 패치 가능한 버전 없음.
  - 주요 경로: `@ai-sdk/google-vertex@3.0.146` 경유 `@ai-sdk/provider-utils@3.0.28`.

## 남은 상태

코드로 보강 가능한 릴리즈 게이트 해석 문제는 닫았어. 이제 `release:gate`는 코드 게이트만으로 배포 승인처럼 보이지 않고, production env가 안전하지 않으면 live API QA 전에 먼저 실패해.

남은 blocker는 외부 환경이야.

- Vercel production env 등록 필요.
- 로컬/CI/Vercel production에 `RATE_LIMIT_BACKEND=supabase` 설정 필요.
- Supabase DNS `sfpwgywcmhgilrqearsz.supabase.co ENOTFOUND` 해결 후 `pnpm release:gate` 재실행 필요.
- 결제 재오픈 전 Paddle env 등록 후 `pnpm release:gate:payments` 통과 필요.
