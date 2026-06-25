# 구글 로그인 Supabase 연동

- Supabase OAuth 콜백 URL과 로그인 후 이동 경로 계산을 순수 함수로 분리했다.
- 외부 URL 또는 protocol-relative `next` 값을 거부해서 로그인 후 오픈 리다이렉트 위험을 줄였다.
- 서버 액션 기반 Google 로그인과 `/api/auth/google` 라우트가 같은 Supabase OAuth 흐름을 사용하게 했다.
- 결제 성공 화면의 오래된 `/api/auth/google` 호출을 실제 구현된 라우트와 파라미터로 연결했다.
- Supabase placeholder 환경값을 감지해서 설정 전에는 mock/fallback 클라이언트를 쓰게 보강했다.
- `.env.example`에 Supabase Google OAuth 설정 위치와 콜백 URL을 기록했다.

