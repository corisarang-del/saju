# 운영사이트 보안점검 및 authenticated QA 개발자 전달

## 요약
- 날짜: 2026-07-24
- 대상: `https://monthlysaju.vercel.app/`
- 점검 방식: 비파괴 외부 점검, 비인증 API 요청, 공개 HTML/헤더 확인
- 사용 기준: `security-review` 스킬, OWASP HTTP Headers Cheat Sheet, OWASP Top 10 2021, MDN HTTP Observatory
- 제외: `codex-security` 스킬은 사용하지 않음

## 최종 판정
- 즉시 악용 가능한 공개 시크릿 노출이나 `.env`/`.git` 공개는 발견하지 못했어.
- HTTPS/HSTS와 기본 보안 헤더는 대체로 들어가 있어.
- 주요 민감 API는 비인증 요청을 401/403/400으로 막고 있고, 에러 본문에 스택이나 DB 오류는 보이지 않았어.
- 하지만 운영 보안 기준으로 P1/P2 하드닝 이슈가 남아 있어.
- 로그인 후 실제 계정 데이터 IDOR, Supabase RLS 운영 적용, 결제 성공/실패 webhook 정합성은 authenticated QA로 별도 검증해야 해.

## 외부 기준 참고
- OWASP HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- OWASP Top 10 2021: https://owasp.org/Top10/2021/
- MDN HTTP Observatory scoring: https://developer.mozilla.org/en-US/observatory/docs/tests_and_scoring
- MDN HTTP Observatory FAQ: https://developer.mozilla.org/en-US/observatory/docs/faq

## 실행한 비파괴 점검

### HTTPS / redirect
```bash
curl -I http://monthlysaju.vercel.app/
curl -I https://monthlysaju.vercel.app/
```

확인:
- HTTP는 HTTPS로 `308 Permanent Redirect`.
- `/`는 `/ko`로 `307` redirect.
- HSTS 존재: `strict-transport-security: max-age=63072000; includeSubDomains; preload`

### 주요 보안 헤더
```bash
curl -s -D - -o /dev/null https://monthlysaju.vercel.app/ko
```

확인된 헤더:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

남은 이슈:
- `x-powered-by: Next.js`가 노출돼.
- CSP에 `unsafe-inline`, `unsafe-eval`이 남아 있어.
- `Cross-Origin-Resource-Policy`, `Cross-Origin-Opener-Policy`는 확인되지 않았어.

### MDN HTTP Observatory
```bash
curl -s -X POST 'https://observatory-api.mdn.mozilla.net/api/v2/scan?host=monthlysaju.vercel.app'
```

결과:
- grade: `B`
- score: `75`
- passed: `8 / 10`
- failed: `2 / 10`

해석:
- 기본 헤더 수준은 나쁘지 않지만 A급은 아니야.
- Observatory는 HTTP 헤더 중심 점검이라 IDOR, RLS, 결제 webhook 정합성까지 보증하지 않아.

### 공개 파일 노출
```bash
curl -s -D - -o /dev/null https://monthlysaju.vercel.app/.env
curl -s -D - -o /dev/null https://monthlysaju.vercel.app/.git/config
curl -s -D - -o /dev/null https://monthlysaju.vercel.app/package.json
```

확인:
- `.env`: 404
- `.git/config`: 404
- `package.json`: 404

### 공개 HTML 시크릿 패턴
```bash
curl -s -o /tmp/monthlysaju-ko.html https://monthlysaju.vercel.app/ko
rg -n "SUPABASE_SERVICE_ROLE|SERVICE_ROLE|PADDLE_API_KEY|PADDLE_WEBHOOK_SECRET|GOOGLE_GENERATIVE_AI_API_KEY|sk_live_|sk_test_|AKIA|AIza|DATABASE_URL|password" /tmp/monthlysaju-ko.html
```

확인:
- 명백한 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴은 발견하지 못했어.

### 민감 API 비인증 응답
```bash
curl -s -X POST https://monthlysaju.vercel.app/api/saju/chat -H 'content-type: application/json' --data '{}'
curl -s -X POST https://monthlysaju.vercel.app/api/saju/suggestions -H 'content-type: application/json' --data '{"topic":"career"}'
curl -s -X POST https://monthlysaju.vercel.app/api/webhooks/paddle -H 'content-type: application/json' --data '{}'
curl -s -X POST https://monthlysaju.vercel.app/api/saju/deduct-stars -H 'content-type: application/json' --data '{"amount":-100}'
curl -s -X POST https://monthlysaju.vercel.app/api/saju/update-status -H 'content-type: application/json' --data '{"readingId":"00000000-0000-0000-0000-000000000000","status":"paid"}'
```

확인:
- `/api/saju/chat`: 401, `{"error":"unauthorized","message":"로그인이 필요해."}`
- `/api/saju/suggestions`: 401
- `/api/webhooks/paddle`: 401
- `/api/saju/deduct-stars`: 400, `{"error":"Missing required fields"}`
- `/api/saju/update-status`: 403, `{"error":"Forbidden status transition"}`

해석:
- chat/suggestions/webhook은 비인증 차단이 잘 보여.
- `deduct-stars`, `update-status`는 비인증 상태에서도 입력/상태전이 검증 메시지가 먼저 보일 수 있어. 큰 정보 노출은 아니지만, 인증이 필요한 API는 가능하면 인증 실패를 먼저 401로 통일하는 편이 좋아.

### OAuth origin spoofing
```bash
curl -s -D - -o /dev/null https://monthlysaju.vercel.app/api/auth/google \
  -H 'x-forwarded-host: evil.example' \
  -H 'x-forwarded-proto: https' \
  -H 'origin: https://evil.example'
```

확인:
- Supabase authorize `redirect_to`가 `https://monthlysaju.vercel.app/auth/callback`로 유지됨.
- 공격자 origin/header를 redirect origin으로 쓰지 않음.

### OAuth callback 가짜 code
```bash
curl -s -D - -o /dev/null 'https://monthlysaju.vercel.app/auth/callback?code=fake'
```

확인:
- `307`로 `/login?error=auth-code-error` 이동.
- 스택 trace나 provider 내부 오류 노출 없음.

## Findings

### P1. OAuth PKCE code verifier 쿠키 보안 속성 부족
확인 응답:
```text
set-cookie: sb-sfpwgywcmhgilrqearsz-auth-token-code-verifier=...; Path=/; Expires=Fri, 27 Aug 2027 ...; Max-Age=34560000; SameSite=lax
```

문제:
- `Secure`가 없어.
- `HttpOnly`가 없어.
- `Max-Age=34560000`으로 너무 길어 보여.

위험:
- PKCE code verifier는 인증 흐름에 민감한 값이야.
- XSS와 결합되면 JS에서 읽을 수 있는 쿠키가 인증 흐름 공격 표면이 될 수 있어.
- 인증용 임시 값은 짧은 TTL이 맞아.

수정 요구:
- 가능하면 `Secure`, `HttpOnly`, `SameSite=Lax` 또는 `Strict` 적용.
- 만료는 OAuth flow에 필요한 짧은 시간으로 줄이기.
- Supabase SSR helper가 만든 쿠키라면 `createServerClient` cookie options에서 운영 기본값 확인.

수용 기준:
- `/api/auth/google` 응답의 code verifier cookie에 `Secure`가 붙어.
- 브라우저 JS에서 읽을 수 없도록 `HttpOnly` 적용 가능 여부를 확인해.
- 만료가 분 단위 또는 OAuth flow에 맞는 짧은 TTL로 줄어.

### P1. CSP가 아직 XSS 방어에 느슨함
현재:
```text
script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
style-src 'self' 'unsafe-inline' ...
frame-ancestors 'self' https://*.paddle.com https://buy.paddle.com
```

문제:
- `unsafe-inline`, `unsafe-eval`은 XSS 방어력을 낮춰.
- `frame-ancestors`에 Paddle 도메인을 허용하는 이유가 명확하지 않아. 결제창을 띄우는 건 보통 `frame-src` 쪽이고, `frame-ancestors`는 누가 우리 사이트를 iframe으로 감쌀 수 있는지를 정해.

수정 요구:
- Next/Paddle에 필요한 최소 범위를 분리해서 `unsafe-eval` 제거 가능 여부를 먼저 확인.
- inline script는 nonce/hash 기반 전환 검토.
- `frame-ancestors`는 특별한 필요가 없으면 `'self'`만 남기기.
- CSP report-only를 먼저 적용하고 위반 로그를 보고 단계적으로 강화.

수용 기준:
- MDN Observatory 점수가 B에서 A권으로 올라가거나, 남는 실패 항목에 대한 명시적 사유가 문서화돼.
- `frame-ancestors`가 실제 요구사항 기준으로 최소화돼.

### P2. 운영 정보 노출 하드닝
문제:
- `/ko` 응답에 `x-powered-by: Next.js`가 노출돼.
- `NEXT_LOCALE` 쿠키는 민감 쿠키는 아니지만 `Secure`가 없어.
- 구조화 데이터와 canonical 계열에 `monthly-saju.com`과 `monthlysaju.vercel.app`이 섞여 있어.

수정 요구:
- Next.js `poweredByHeader: false` 확인.
- 운영에서 세팅하는 쿠키 기본값에 `Secure`를 붙일 수 있는지 확인.
- 실제 운영 도메인이 `monthlysaju.vercel.app`인지, 추후 커스텀 도메인인지 정하고 canonical/JSON-LD URL을 맞춰.

## 별도 authenticated QA 필요 범위

아래 항목은 비인증 외부 점검으로는 확인할 수 없어. 테스트 계정 2개 이상과 운영 또는 운영에 준하는 Supabase 환경에서 별도 authenticated QA가 필요해.

### A. 로그인 후 실제 계정 데이터 IDOR

목적:
- 사용자 A가 사용자 B의 사주 리딩, 채팅, 리포트, PDF, 월간 리포트, 마이 분석내역을 읽거나 수정/삭제할 수 없는지 확인.

준비:
- 테스트 계정 A, B 생성.
- A와 B 각각 사주 리딩 1개 이상 생성.
- 각 계정으로 채팅 메시지, 별 잔액, 거래 로그, 리포트 상태를 만든다.
- A 세션 쿠키 또는 bearer token만 사용해 B의 resource id를 요청한다.

필수 시나리오:
- A 세션으로 B의 `/ko/reading/{id}` 접근 시 403 또는 404.
- A 세션으로 B의 `/ko/reading/{id}/result` 접근 시 403 또는 404.
- A 세션으로 B의 `/api/saju/pdf/{id}` 접근 시 403 또는 404.
- A 세션으로 B의 reading id로 `/api/saju/chat` 호출 시 provider 호출 전 실패.
- A 세션으로 B의 reading id를 `/api/saju/analyze`, `/api/saju/update-status`, `/api/saju/deduct-stars`에 넣어도 실패.
- A 세션으로 B의 my-readings 항목 삭제/상태변경 시 실패.
- 실패 후 B의 데이터, 별 잔액, 거래 로그가 변하지 않아야 해.

수용 기준:
- 모든 타인 데이터 접근은 403 또는 404.
- 200과 빈 데이터로 덮지 않는다.
- 실패 응답에 타인의 이름, 생년월일, 상담 내용, DB 오류가 나오지 않는다.
- 서버 로그에는 request id, actor user id, target id, denial reason만 남긴다.

### B. Supabase RLS 운영 적용 확인

목적:
- 저장소 migration과 운영 DB 상태가 일치하는지 확인.
- anon/authenticated 키로 `user_stars`, `star_transactions`, `saju_readings`, `saju_chat_messages`를 직접 조작할 수 없는지 확인.

필수 SQL 확인:
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'user_stars',
    'star_transactions',
    'saju_readings',
    'saju_chat_messages',
    'user_memberships',
    'admin_audit_logs',
    'rate_limits'
  )
order by tablename, policyname;
```

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'reserve_chat_star',
    'refund_chat_star',
    'check_rate_limit',
    'admin_adjust_user_stars'
  );
```

필수 클라이언트 권한 테스트:
- anon key로 민감 테이블 select/insert/update/delete 시도 실패.
- authenticated A로 B의 rows select/update/delete 실패.
- authenticated A로 `user_stars` 직접 insert/update 실패.
- authenticated A로 `star_transactions` 직접 insert 실패.
- authenticated A로 `reserve_chat_star`, `refund_chat_star`, `admin_adjust_user_stars` 직접 RPC 호출 실패.
- service role을 쓰는 서버 API 정상 경로는 계속 성공.

수용 기준:
- 운영 DB에 `202607210010_release_gate_star_reservation_rate_limit.sql`의 함수와 정책 변경이 실제 반영돼.
- 민감 RPC는 `service_role` 중심으로만 실행돼.
- RLS off 테이블이 민감 데이터에 남아 있지 않아.

### C. 결제 성공/실패 webhook 정합성

목적:
- Paddle webhook이 서명 검증, price/product allowlist, idempotency, 실패/환불/구독 상태 전이를 정확히 처리하는지 확인.

전제:
- 현재 무료 베타에서 결제 비활성화 상태라면 production 사용자 UI에서 결제 버튼은 노출하지 않는다.
- 결제 재오픈 전에는 `release:gate:payments`를 반드시 통과시킨다.

필수 시나리오:
- 서명 없는 webhook은 401/400 계열로 실패하고 DB 변경 없음.
- 잘못된 서명 webhook은 실패하고 DB 변경 없음.
- 알려지지 않은 `price_id`는 실패하고 별 지급/멤버십 활성화 없음.
- `product_id`와 `price_id` 불일치는 실패.
- one-time purchase 성공 시 서버 allowlist 기준으로 정확한 별 수만 지급.
- 같은 event id 재전송 시 중복 지급 없음.
- subscription activated/updated/canceled가 `user_memberships`에 정확히 반영.
- subscription webhook에 별 상품 price가 들어오면 멤버십으로 처리하지 않음.
- 결제 실패/취소/환불 이벤트는 별 지급을 하지 않거나 정책에 맞게 회수/상태 변경.

수용 기준:
- event id 또는 transaction id 기반 idempotency unique key가 있다.
- 지급/멤버십 변경/거래 로그/감사 로그가 한 트랜잭션 또는 동등한 원자성으로 처리된다.
- webhook 실패 응답에 내부 secret, provider raw error, stack trace가 나오지 않는다.
- 운영 Paddle endpoint와 sandbox endpoint가 섞이지 않는다.

## 개발자 우선순위
1. OAuth PKCE code verifier cookie 속성/TTL 하드닝.
2. CSP `unsafe-eval`, `unsafe-inline`, `frame-ancestors` 최소화 계획 수립.
3. `x-powered-by` 제거와 canonical/JSON-LD 도메인 정리.
4. authenticated IDOR QA 자동화.
5. 운영 Supabase RLS/RPC 권한 점검 스크립트화.
6. 결제 재오픈 전 Paddle webhook 정합성 QA와 `release:gate:payments` 통과.

## 이번 점검에서 하지 않은 것
- 실제 로그인 세션으로 타인 데이터 접근 시도는 하지 않았어.
- 운영 DB에 직접 SQL을 실행하지 않았어.
- 실제 결제나 Paddle signed webhook 재현은 하지 않았어.
- 외부 npm 보안 CLI 설치/실행은 하지 않았어. 로컬에서 외부 npm 코드를 내려받아 실행하는 방식은 위험해서 거부됐고, 수동 점검과 MDN Observatory API 결과만 사용했어.
