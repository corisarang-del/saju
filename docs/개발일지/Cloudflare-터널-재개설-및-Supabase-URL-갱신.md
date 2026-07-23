# Cloudflare 터널 재개설 및 Supabase URL 갱신

- 날짜: 2026-07-04
- 새 터널 URL: `https://equally-brochures-ratio-palestinian.trycloudflare.com`
- 작업: `pnpm exec next dev -H 0.0.0.0`로 Next 개발 서버를 재실행함.
- 작업: `pnpm dlx cloudflared tunnel --protocol http2 --url http://localhost:3000`로 새 Cloudflare quick tunnel을 생성함.
- 작업: `next.config.ts`의 `allowedDevOrigins`에 새 터널 호스트를 추가함.
- 작업: Supabase Auth `site_url`과 `additional_redirect_urls`를 새 터널 URL 기준으로 임시 갱신함.
- 검증: `/ko`가 `HTTP/2 200`으로 응답함.
- 검증: `/api/auth/google?next=%2Fko%2Ftoday`가 새 터널 콜백을 `redirect_to`로 포함함.
- 정리 필요: 폰 원격접속 종료 시 Supabase Auth URL 설정에서 새 터널 URL을 제거해야 함.
