# 터널 환경 OAuth 콜백 도메인 수정

- 날짜: 2026-07-03
- 수정 파일: `src/lib/auth/oauth.ts`, `src/services/auth/actions.ts`, `src/app/api/auth/google/route.ts`, `src/lib/auth/oauth.test.ts`, `next.config.ts`
- 구현: `Origin` 헤더가 없을 때 `x-forwarded-host`와 `x-forwarded-proto`로 사이트 URL을 계산하도록 `getSiteUrlFromRequestHeaders`를 추가함.
- 구현: 서버 액션 로그인과 `/api/auth/google` 경로가 새 헬퍼를 사용하도록 변경함.
- 구현: Next dev 터널 도메인을 `allowedDevOrigins`에 추가함.
- 검증: `pnpm test src/lib/auth/oauth.test.ts` 통과.
- 검증: 터널에서 `/api/auth/google?next=%2Fko%2Ftoday` 요청 시 `redirect_to=https%3A%2F%2Fdeeply-incorporated-editorials-ntsc.trycloudflare.com%2Fauth%2Fcallback...`로 생성되는 것을 확인함.
- 참고: Supabase Dashboard > Authentication > URL Configuration > Redirect URLs에 `https://deeply-incorporated-editorials-ntsc.trycloudflare.com/auth/callback` 추가가 필요함.

## localhost 거부 후속 확인

- 현상: Google 계정 선택 후 브라우저가 `localhost` 접속 거부를 표시함.
- 재확인: `curl -I 'https://deeply-incorporated-editorials-ntsc.trycloudflare.com/api/auth/google?next=%2Fko%2Ftoday'` 응답의 Supabase authorize URL은 터널 콜백을 포함함.
- 판단: 앱 코드의 콜백 생성은 정상이고, Supabase URL Configuration에서 터널 URL 허용 또는 Site URL 임시 변경이 필요함.

## Supabase CLI 임시 허용 적용

- `gotbang333@gmail.com` 계정으로 Supabase CLI 로그인을 완료함.
- `sfpwgywcmhgilrqearsz` 프로젝트 Auth 설정에 Cloudflare 터널 URL을 임시 허용함.
- 적용 후 Google OAuth 시작 URL이 터널 콜백을 가리키는 것을 다시 확인함.
