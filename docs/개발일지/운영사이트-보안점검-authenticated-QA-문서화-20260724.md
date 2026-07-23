# 운영사이트 보안점검 authenticated QA 문서화

## 요청
- `https://monthlysaju.vercel.app/`에 배포된 운영 사이트의 보안 문제를 점검해달라는 요청을 받았어.
- `codex-security` 스킬은 쓰지 말고 다른 적절한 스킬이나 인터넷의 보안점검 기준을 찾아서 해달라는 조건이 있었어.
- 이후 개발자에게 전달할 수 있게 문서화하고, 로그인 후 실제 계정 데이터 IDOR, Supabase RLS 운영 적용, 결제 성공/실패 webhook 정합성 authenticated QA까지 추가해달라는 요청을 받았어.

## 사용한 기준
- `security-review` 스킬
- OWASP HTTP Headers Cheat Sheet
- OWASP Top 10 2021
- MDN HTTP Observatory scoring/FAQ

## 수행한 점검
- HTTP → HTTPS redirect 확인.
- `/`, `/ko`, `/robots.txt`, 주요 API의 response headers 확인.
- MDN HTTP Observatory API로 `monthlysaju.vercel.app` 스캔.
- `.env`, `.git/config`, `package.json` 공개 여부 확인.
- 공개 HTML에 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴 노출 여부 확인.
- `/api/saju/chat`, `/api/saju/suggestions`, `/api/webhooks/paddle`, `/api/saju/deduct-stars`, `/api/saju/update-status`의 비인증 응답 확인.
- OAuth origin spoofing 헤더를 넣었을 때 `redirect_to`가 운영 도메인으로 유지되는지 확인.
- OAuth callback 가짜 code가 안전하게 실패하는지 확인.

## 확인된 좋은 점
- HTTPS redirect와 HSTS가 적용돼 있어.
- CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy가 있다.
- `.env`, `.git/config`, `package.json`은 공개되지 않는다.
- 공개 HTML에서 명백한 secret 패턴은 발견하지 못했다.
- chat/suggestions/webhook 비인증 요청은 401로 막힌다.
- OAuth redirect는 공격자 `origin`/`x-forwarded-host`를 신뢰하지 않고 `https://monthlysaju.vercel.app/auth/callback`을 유지한다.
- 가짜 OAuth callback code는 `/login?error=auth-code-error`로 이동하며 스택을 노출하지 않는다.

## 남은 이슈
- P1: Supabase OAuth PKCE code verifier cookie가 `Secure`, `HttpOnly` 없이 매우 긴 만료로 내려온다.
- P1: CSP에 `unsafe-inline`, `unsafe-eval`이 남아 있고 `frame-ancestors`가 Paddle 도메인까지 넓게 열려 있다.
- P2: `/ko` 응답에 `x-powered-by: Next.js`가 노출된다.
- P2: `Cross-Origin-Resource-Policy`, `Cross-Origin-Opener-Policy`가 보이지 않는다.
- P2: canonical/JSON-LD URL에 `monthly-saju.com`과 `monthlysaju.vercel.app`이 섞여 있다.

## authenticated QA 추가
- 로그인 후 실제 계정 데이터 IDOR QA.
- Supabase RLS 운영 적용 QA.
- Paddle 결제 성공/실패 webhook 정합성 QA.
- 상세 시나리오와 수용 기준은 `docs/pm/운영사이트-보안점검-authenticated-QA-개발자전달-20260724.md`에 작성했다.

## 결론
- 비인증 외부 점검 기준으로 치명적인 공개 시크릿 노출이나 민감 API 무단 열림은 발견하지 못했다.
- 운영 보안 완성도를 위해 OAuth cookie, CSP, fingerprint 제거를 먼저 보완해야 한다.
- 계정 데이터/DB RLS/결제 webhook은 반드시 authenticated QA로 별도 닫아야 한다.
