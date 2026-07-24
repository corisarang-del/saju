# 운영 배포 보안 재점검과 Paddle webhook/env 차단 이슈 문서화

## 요청
- 개발자가 수정 후 `https://monthlysaju.vercel.app/`에 다시 배포했다고 알려줬다.
- `codex-security` 스킬은 쓰지 않고 다른 적절한 스킬 또는 인터넷 기준으로 보안점검을 해달라는 요청이었다.
- 실제 운영 계정/DB/provider payload가 필요한 authenticated IDOR QA, 운영 Supabase RLS/RPC 확인, Paddle signed webhook 정합성 QA도 포함해달라고 했다.
- 이후 개발자에게 전달할 수 있게 문서화하고 지금까지 나온 내용을 메모리에 저장해달라는 요청을 받았다.

## 사용한 기준
- `security-review` 스킬
- OWASP IDOR / API1 BOLA
- Supabase 공식 RLS 문서
- Paddle 공식 webhook signature 문서
- MDN Observatory
- Vercel env-vars 스킬 지침

## 수행한 점검
- 운영 URL `/ko` 보안 헤더 확인.
- OAuth 시작 응답의 PKCE cookie 속성 확인.
- OAuth origin spoofing 방어 확인.
- 비인증 민감 API의 401/403 처리 확인.
- 공개 HTML secret 패턴 검사.
- `.env`, `.git/config`, `package.json` 공개 여부 확인.
- MDN Observatory 스캔 상세 확인.
- 운영 Supabase linked DB에서 RLS enabled 메타데이터 확인.
- 운영 Supabase linked DB에서 민감 RPC execute grant 메타데이터 확인.
- 운영 URL 대상으로 `pnpm qa:live-api:free`, `pnpm qa:live-api` 실행.
- `/tmp` 일회용 스크립트로 두 계정 authenticated IDOR QA 실행.
- `/tmp` 일회용 스크립트로 Paddle signed webhook QA 실행.
- 소스코드는 수정하지 않았다.

## 통과한 항목
- `pnpm qa:live-api:free`: 운영 URL 기준 통과.
- `pnpm qa:live-api`: 운영 URL 기준 통과.
- RLS 대상 10개 테이블 모두 RLS enabled.
- 민감 RPC는 `postgres`, `service_role`에만 EXECUTE.
- 핵심 IDOR 경로 `preview`, `analyze`, `deduct-stars`, `chat`, `pdf`는 타인 리딩 접근 시 404.
- 공개 파일 `.env`, `.git/config`, `package.json`은 404.
- 공개 HTML에서 명백한 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴은 발견하지 못했다.
- OAuth PKCE cookie는 `Secure`, `HttpOnly`, `Max-Age=600`, `SameSite=Lax`.
- `x-powered-by`는 노출되지 않았다.
- CSP에서 `unsafe-eval`은 제거됐다.
- COOP/CORP/HSTS가 적용됐다.
- MDN Observatory는 이전 `B / 75`에서 `B+ / 80`으로 개선됐다.

## 남은 이슈
- P1: Paddle 정상 서명 payload가 운영 webhook에서 401로 거부됐다.
- P1: `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate`가 `GOOGLE_VERTEX_RUNTIME_AUTH` production env 검사에서 실패했다.
- P2: CSP에 `unsafe-inline`이 남아 MDN Observatory CSP 항목 1개가 실패한다.
- P3: `update-status`는 타인 리딩에 대해 실제 row 변경은 없지만 200 no-op을 반환한다.

## 개발자 전달 문서
- `docs/pm/운영배포-보안재점검-Paddle-webhook-env-개발자전달-20260724.md`

## 메모리 저장
- `.codex/memory/project.md`: 2026-07-24 운영 배포 보안 재점검 현황 추가.
- `.codex/memory/learnings.md`: Paddle webhook secret과 release gate env 검사의 교훈 추가.
- `.codex/memory/decisions.md`: 결제 포함 배포 전 signed webhook과 production release gate 통과를 필수 조건으로 추가.

## 결론
- 비결제/무료 상담 운영 흐름은 주요 QA가 통과했다.
- 결제 포함 운영 재오픈은 Paddle signed webhook 성공 경로와 payment release gate가 통과하기 전까지 보류해야 한다.
- 개발자는 먼저 Vercel Production env와 Paddle dashboard notification secret 정합성을 맞추고, `GOOGLE_VERTEX_RUNTIME_AUTH` production env 검사를 해결해야 한다.
