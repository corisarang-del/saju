# Cloudflare 터널 재개설 20260707

- 일시: 2026-07-07 08:46:59 KST

## 원인

- 기존 `https://equally-brochures-ratio-palestinian.trycloudflare.com` quick tunnel 도메인이 만료되어 `DNS_PROBE_FINISHED_NXDOMAIN` 상태가 됐다.
- 로컬 `localhost:3000`도 처음에는 응답하지 않았고, Next dev 서버 PID가 stale 상태로 남아 있었다.

## 작업

- stale Next dev 프로세스 `24037`을 종료했다.
- `pnpm exec next dev -H 0.0.0.0`로 Next 개발 서버를 다시 실행했다.
- `pnpm dlx cloudflared tunnel --protocol http2 --url http://localhost:3000`으로 새 Cloudflare quick tunnel을 생성했다.
- 새 터널 URL: `https://carbon-generator-farms-initiated.trycloudflare.com`
- `next.config.ts`의 `allowedDevOrigins`에 `carbon-generator-farms-initiated.trycloudflare.com`을 추가했다.
- Next 개발 서버를 재시작해 설정을 반영했다.

## 검증

- `curl -I --max-time 15 http://localhost:3000/ko`
  - 결과: `HTTP/1.1 200 OK`
- `curl -I --max-time 30 https://carbon-generator-farms-initiated.trycloudflare.com/ko`
  - 결과: `HTTP/2 200`
- `curl -I --max-time 30 'https://carbon-generator-farms-initiated.trycloudflare.com/api/auth/google?next=%2Fko%2Ftoday'`
  - 결과: `HTTP/2 307`
  - Supabase authorize URL의 `redirect_to`가 `https://carbon-generator-farms-initiated.trycloudflare.com/auth/callback?next=%2Fko%2Ftoday`를 포함함.

## 남은 주의

- Google 로그인까지 테스트하려면 Supabase Dashboard > Authentication > URL Configuration > Redirect URLs에 `https://carbon-generator-farms-initiated.trycloudflare.com/auth/callback`을 추가해야 한다.
- Cloudflare quick tunnel은 임시 주소라 프로세스가 종료되거나 시간이 지나면 다시 만료될 수 있다.
