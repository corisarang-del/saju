# Supabase Google 로그인 버튼 무반응

- 서버 로그에서 `Supabase env is not configured` 에러가 반복되는 것을 확인했다.
- `.env.local`이 없고 실제 Supabase 키가 `.env.example`에 들어가 있어 Next.js 런타임에서 읽히지 않는 것이 근본 원인이었다.
- 현재 값을 `.env.local`로 옮기고, `.env.example`은 placeholder로 되돌렸다.
- 로그인 실패 시 무반응처럼 보이지 않도록 `/ko/login?error=...`로 이동하고 오류 메시지를 표시하게 했다.
- 인증 오류 메시지 helper와 테스트를 추가했다.
