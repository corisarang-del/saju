# LTE 폰에서 로컬 Next 서버 접속용 localtunnel 연결

- 날짜: 2026-07-03
- 개발 서버: `pnpm exec next dev -H 0.0.0.0`
- 로컬 주소: `http://localhost:3000`
- 터널 도구: `pnpm dlx localtunnel --port 3000 --print-requests`
- 공개 URL: `https://khaki-facts-crash.loca.lt`
- 확인: `curl -L --max-time 10 https://khaki-facts-crash.loca.lt` 요청으로 Next 페이지 HTML 응답을 확인함.
- 참고: localtunnel이 비밀번호 확인 화면을 띄우면 `219.251.52.220`을 입력하면 됨.

## 접속 불가 후 대체 터널

- 원인 추정: localtunnel URL은 맥에서 정상 응답했지만 LTE 폰에서 접속 실패가 발생해 통신사/브라우저/loca.lt 경로 문제 가능성이 있음.
- 대체 실행: `pnpm dlx cloudflared tunnel --protocol http2 --url http://localhost:3000`
- Cloudflare URL: `https://deeply-incorporated-editorials-ntsc.trycloudflare.com`
- 확인: `curl -I --max-time 15 https://deeply-incorporated-editorials-ntsc.trycloudflare.com` 요청에서 `HTTP/2 307` 및 `/ko` 리다이렉트 응답을 확인함.

## 로그인 후속 수정

- OAuth 콜백 URL이 `localhost`로 생성되던 문제를 수정함.
- Supabase Redirect URLs에 `https://deeply-incorporated-editorials-ntsc.trycloudflare.com/auth/callback` 추가가 필요함.
