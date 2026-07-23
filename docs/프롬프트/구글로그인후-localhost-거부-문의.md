# 구글 로그인 후 localhost 거부 문의

- 날짜: 2026-07-03
- 사용자 요청: `corisarang@gmail.com`으로 Google 로그인 시도 후 로컬에서 거부된다는 오류가 뜬다고 알림.
- 확인: 앱의 OAuth 시작 URL은 Cloudflare 터널 콜백을 사용하도록 수정되어 있음.
- 추정 원인: Supabase URL Configuration에서 터널 콜백 URL이 허용되지 않아 기본 Site URL인 `http://localhost:3000`으로 되돌아가는 상황.
