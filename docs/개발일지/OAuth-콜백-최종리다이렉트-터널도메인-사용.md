# OAuth 콜백 최종 리다이렉트 터널 도메인 사용

- 날짜: 2026-07-03
- 수정 파일: `src/lib/auth/oauth.ts`, `src/lib/auth/oauth.test.ts`, `src/app/auth/callback/route.ts`
- 구현: `buildAuthRedirectUrl`을 추가해 콜백 이후 최종 이동도 `x-forwarded-host`와 `x-forwarded-proto` 기반 도메인을 사용하도록 함.
- 수정: `/auth/callback`이 개발환경에서도 `origin`의 `0.0.0.0` 대신 Cloudflare 터널 도메인으로 리다이렉트하도록 변경함.
- 검증: `pnpm test src/lib/auth/oauth.test.ts` 통과.
- 확인: 터널 `/api/auth/google?next=%2Fko%2Ftoday`가 계속 Cloudflare 콜백을 `redirect_to`로 생성함.
- 참고: `pnpm exec tsc --noEmit`은 기존 `.next/types` 중복 생성 파일 문제로 실패함.
