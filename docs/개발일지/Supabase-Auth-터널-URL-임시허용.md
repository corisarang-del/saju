# Supabase Auth 터널 URL 임시 허용

- 날짜: 2026-07-03
- Supabase CLI: `gotbang333-temp` 이름으로 `gotbang333@gmail.com` 계정 인증을 완료함.
- 프로젝트: `sfpwgywcmhgilrqearsz` (`saju`)
- 적용: Supabase Auth `site_url`을 임시로 `https://deeply-incorporated-editorials-ntsc.trycloudflare.com`로 설정함.
- 적용: Supabase Auth `additional_redirect_urls`에 `https://deeply-incorporated-editorials-ntsc.trycloudflare.com/auth/callback`을 설정함.
- 복구: 확인 중 CLI 기본 config가 일부 Auth 값을 기본값으로 낮춘 것을 감지하고, MFA TOTP와 이메일 확인 관련 값을 원래 수준으로 되돌려 다시 적용함.
- 검증: `/api/auth/google?next=%2Fko%2Ftoday`의 Supabase authorize URL이 터널 콜백을 `redirect_to`로 포함하는 것을 확인함.
- 정리 필요: 폰 원격접속 종료 시 Supabase Auth 설정에서 위 터널 `site_url`과 `additional_redirect_urls`를 제거하고 운영/로컬 기준 URL로 되돌려야 함.

## 콜백 후 0.0.0.0 리다이렉트 수정

- 현상: Google 로그인 후 브라우저가 `0.0.0.0`로 이동해 연결 거부가 발생함.
- 조치: 앱 콜백 최종 리다이렉트도 터널 도메인을 사용하도록 수정함.

## 2026-07-04 터널 갱신

- 기존 Cloudflare quick tunnel 도메인이 만료되어 새 터널을 생성함.
- Supabase Auth 임시 허용 URL을 `https://equally-brochures-ratio-palestinian.trycloudflare.com` 기준으로 갱신함.
