# 운영사이트 보안점검 authenticated QA 하드닝 반영

## 참고 문서

- `/Users/apple/Desktop/test_githup/saju/docs/pm/운영사이트-보안점검-authenticated-QA-개발자전달-20260724.md`

## 사용 스킬

- `security-review`
  - Next.js API Route, Supabase SSR 쿠키, OAuth, 보안 헤더, 결제/레이트 리밋 기준을 확인했다.

## TDD

- `src/utils/supabase/cookie-options.test.ts`를 먼저 추가했다.
  - PKCE code verifier 쿠키만 `HttpOnly`, 짧은 TTL, production `Secure`로 강화되는지 확인한다.
  - 일반 Supabase auth cookie는 브라우저 클라이언트 호환을 위해 읽기 가능 상태를 유지하는지 확인한다.
- `src/lib/security/production-security-hardening-regression.test.ts`를 먼저 추가했다.
  - `x-powered-by` 제거, COOP/CORP 추가, CSP `unsafe-eval` 제거, `frame-ancestors 'self'` 최소화.
  - `NEXT_LOCALE` production secure 옵션.
  - Supabase server/middleware/proxy 클라이언트의 hardened cookie option 사용.
  - `deduct-stars`, `update-status`가 인증 확인을 body/status 검증보다 먼저 수행.
  - metadata/JSON-LD가 `NEXT_PUBLIC_APP_URL` 기반 공개 URL을 사용.

## 구현 내용

- `next.config.ts`
  - `poweredByHeader: false` 추가.
  - 일반 경로에 `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` 추가.
  - CSP `script-src`에서 `unsafe-eval` 제거.
  - Paddle은 `frame-src`에만 남기고 `frame-ancestors`는 `'self'`로 최소화.

- `src/utils/supabase/cookie-options.ts`
  - `hardenSupabaseCookieOptions` 추가.
  - `*-auth-token-code-verifier` 쿠키에만 production `Secure`, `HttpOnly`, `maxAge: 600`, `SameSite=Lax`를 적용.
  - 일반 Supabase auth cookie는 기존 옵션을 유지해 브라우저 클라이언트 세션 호환성을 보존.

- `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`, `src/proxy.ts`
  - Supabase SSR cookie set 경로에 `hardenSupabaseCookieOptions` 적용.

- `src/i18n/routing.ts`
  - `NEXT_LOCALE` cookie에 production `secure` 옵션 추가.

- `src/app/api/saju/deduct-stars/route.ts`, `src/app/api/saju/update-status/route.ts`
  - 인증 확인을 `await req.json()`과 입력/status 검증보다 먼저 수행하게 변경.
  - 비인증 요청은 body 내용과 무관하게 먼저 401로 반환된다.

- `src/app/[locale]/layout.tsx`
  - metadata와 JSON-LD URL을 `NEXT_PUBLIC_APP_URL` 기반 `getPublicAppUrl()`로 통일.
  - 기본 fallback은 현재 운영 도메인 `https://monthlysaju.vercel.app`.

## 검증

- 실패 확인:
  - 새 보안 회귀 테스트는 helper/설정 부재로 먼저 실패했다.
- 통과 확인:
  - `./node_modules/.bin/vitest run src/utils/supabase/cookie-options.test.ts src/lib/security/production-security-hardening-regression.test.ts`
  - `./node_modules/.bin/vitest run`: 55 files, 244 tests
  - `./node_modules/.bin/tsc --noEmit`
  - `./node_modules/.bin/eslint .`
  - `./node_modules/.bin/next build`

## 남은 범위

- 실제 로그인 세션 2개를 이용한 타인 데이터 IDOR QA는 아직 운영 계정/세션이 필요하다.
- 운영 Supabase RLS/RPC 정책 상태 확인은 운영 DB SQL 조회가 필요하다.
- Paddle signed webhook 성공/실패/환불/구독 QA는 결제 재오픈 전 `release:gate:payments`와 provider 서명 payload가 필요하다.

