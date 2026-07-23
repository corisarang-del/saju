# 실사용QA DNS차단 production gate 보강

## 배경
- 테스터 피드백에서 `scripts/qa-live-api-check.mjs`가 `sfpwgywcmhgilrqearsz.supabase.co` DNS `ENOTFOUND`로 중단된 상태를 production 승인으로 보면 안 된다고 전달됐다.
- Paddle 결제 QA는 비결제 베타에서 제외 가능하지만, Supabase 기반 무료 상담 QA는 제외할 수 없다.

## 원인 분리
- `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`은 `https://sfpwgywcmhgilrqearsz.supabase.co`다.
- Supabase CLI link도 `sfpwgywcmhgilrqearsz` 프로젝트를 가리킨다.
- `supabase projects list`에서 해당 프로젝트는 `saju`, `Northeast Asia (Seoul)`, linked 상태로 보인다.
- `curl -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health`는 `Could not resolve host`로 실패했다.
- `curl -I https://aws-1-ap-northeast-2.pooler.supabase.com`는 `404`까지 응답하므로 Supabase pooler 도메인은 DNS 해석된다.
- 현재 판단은 project ref 오타보다 Supabase REST/Auth host DNS 또는 현재 resolver 경로 차단 가능성이 더 높다.

## TDD
- `src/lib/security/release-gate-regression.test.ts`
  - `release:gate:code`는 코드/빌드/audit 게이트만 포함해야 한다.
  - `release:gate`는 `release:gate:code`, `qa:live-api:free`, `qa:live-api`를 모두 포함해야 한다.
  - `release:gate:payments`는 결제 재오픈용으로 `REQUIRE_PADDLE_ENV=true`를 유지해야 한다.
- `src/lib/security/payment-disabled-beta-regression.test.ts`
  - 비결제 베타 게이트와 결제 재오픈 게이트 분리를 확인한다.
  - production 승인용 gate가 실제 API QA를 포함하는지 확인한다.

## 구현
- `package.json`
  - `qa:live-api:free`: `QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - `qa:live-api`: `node scripts/qa-live-api-check.mjs`
  - `release:gate:code`: 기존 코드/빌드/audit 게이트
  - `release:gate`: `release:gate:code` 통과 후 무료/전체 실제 API QA 실행
  - `release:gate:payments`: Paddle env까지 요구하는 결제 재오픈 게이트 유지

## 검증
- 실패 확인:
  - `pnpm exec vitest run src/lib/security/release-gate-regression.test.ts src/lib/security/payment-disabled-beta-regression.test.ts`
  - `release:gate:code` 스크립트가 없어 실패했다.
- 수정 후 타깃 테스트:
  - `pnpm exec vitest run src/lib/security/release-gate-regression.test.ts src/lib/security/payment-disabled-beta-regression.test.ts`
  - 2개 파일 / 14개 테스트 통과
- 코드 게이트:
  - `pnpm release:gate:code`
  - `test:env`, 전체 테스트 52개 파일 / 212개 테스트, 타입체크, lint, build, high audit 통과
- production gate:
  - `pnpm release:gate`
  - `release:gate:code`는 통과했지만 `qa:live-api:free`에서 `Supabase DNS lookup failed`로 실패
  - 이 실패는 현재 상태에서 의도된 배포 blocker다.

## 현재 판정
- 코드/빌드/자동 테스트 기준은 통과했다.
- Supabase 실제 DB 기반 상담/별 차감/거래 로그 QA는 DNS 차단으로 미완료다.
- 따라서 production 배포 승인은 아직 불가다.

## 재실행 조건
- Supabase REST/Auth host DNS가 정상인 네트워크에서 아래를 다시 실행해야 한다.
  - `pnpm qa:live-api:free`
  - `pnpm qa:live-api`
  - `pnpm release:gate`
- `pnpm release:gate`가 통과해야 무료 상담형 베타 production 승인으로 볼 수 있다.
