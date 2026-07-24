# 운영 배포 보안 재점검 개발자 전달

## 요약
- 날짜: 2026-07-24
- 대상: `https://monthlysaju.vercel.app/`
- 역할: 서버/배포/보안 담당 재점검
- 조건: `codex-security` 스킬은 쓰지 않고 `security-review` 스킬, OWASP, Supabase 공식 RLS 문서, Paddle 공식 webhook signature 문서, MDN Observatory 기준으로 점검했다.
- 소스 수정: 없음

## 최종 판정
- 공개 시크릿 노출, `.env`/`.git`/`package.json` 공개, 비인증 민감 API 오픈은 발견하지 못했다.
- 운영 Supabase RLS/RPC 메타데이터와 실제 운영 API QA는 대체로 통과했다.
- 결제 재오픈 또는 결제 포함 운영 배포 기준에서는 아직 차단 이슈가 있다.

## 반드시 먼저 처리할 이슈

### P1. Paddle signed webhook 운영 정합성 실패

확인 결과:
- `/api/webhooks/paddle`에 오서명 payload를 보내면 `401`로 차단된다.
- 하지만 로컬 QA 환경의 `PADDLE_WEBHOOK_SECRET`으로 서명한 `transaction.completed`, `transaction.payment_failed`, 중복 `transaction.completed` payload도 모두 운영 endpoint에서 `401`이 나왔다.
- QA 사용자 별 잔액과 거래 로그는 변하지 않았다.

해석:
- 운영 Vercel의 `PADDLE_WEBHOOK_SECRET`이 누락됐거나, 로컬 QA secret과 운영 Vercel secret이 다르거나, 실제 Paddle notification destination secret과 운영 secret이 불일치할 가능성이 높다.
- 무서명/오서명 차단은 정상이라 webhook route 자체가 완전히 열린 상태는 아니다.
- 다만 정상 서명 성공 경로가 운영에서 증명되지 않았으므로 결제 성공 후 별 지급/멤버십 반영이 실패할 수 있다.

개발자 조치:
- Vercel Production env에 `PADDLE_WEBHOOK_SECRET`이 실제 Paddle notification destination secret과 같은지 확인한다.
- Paddle webhook destination이 `https://monthlysaju.vercel.app/api/webhooks/paddle`를 바라보는지 확인한다.
- Paddle dashboard의 실제 simulator 또는 sandbox transaction payload로 `transaction.completed`, `transaction.payment_failed`, `subscription.activated`, `subscription.canceled`를 재검증한다.
- secret 값은 로그나 문서에 남기지 않는다.

수용 기준:
- 오서명/무서명 webhook은 `401`.
- `transaction.payment_failed`는 `200 ok`지만 별/멤버십 데이터가 변하지 않는다.
- 정상 서명 `transaction.completed`는 `200 ok`이고 실제 결제 price id 기준 별이 1회만 적립된다.
- 같은 `transaction.id` 재전송은 `200 ok`지만 중복 적립되지 않는다.
- 정상 서명 구독 활성/취소 payload는 `user_memberships`에 upsert되고 상태가 맞게 반영된다.

관련 파일:
- `src/lib/paddle/webhook.ts`
- `src/app/api/webhooks/paddle/route.ts`
- `src/lib/paddle/credit-grant.ts`
- `src/lib/paddle/membership.ts`

### P1. 운영 release gate가 production env 검사에서 중단됨

실행:
```bash
QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate
```

결과:
- `pnpm test`: 55 files / 244 tests 통과
- `pnpm exec tsc --noEmit`: 통과
- `pnpm lint`: 통과
- `pnpm build`: 통과
- `pnpm audit --prod --audit-level high`: low 취약점 1건만 보고되어 high 기준 차단 없음
- `REQUIRE_PRODUCTION_ENV=true pnpm test:env`: 실패

실패 항목:
```text
GOOGLE_VERTEX_RUNTIME_AUTH
```

개발자 조치:
- 운영 Vercel Production env에 `GOOGLE_VERTEX_RUNTIME_AUTH`가 실제 정책값으로 들어가 있는지 확인한다.
- 현재 앱이 Vercel OIDC/Vertex 인증을 쓰는 구조라면 `GOOGLE_VERTEX_RUNTIME_AUTH`의 허용값과 `scripts/check-env.js` 검증 기준이 운영 정책과 같은지 맞춘다.
- env 수정 후 `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate`를 다시 통과시킨다.

수용 기준:
- `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate` 전체 통과.
- 결제 재오픈 시에는 별도로 `pnpm run release:gate:payments` 통과.

### P2. CSP에 `unsafe-inline` 잔여

현재 상태:
- MDN Observatory 최신 스캔: `B+`, score `80`, failed `1 / 10`
- 실패 항목: CSP의 `unsafe-inline`
- `unsafe-eval`은 제거된 상태다.
- `frame-ancestors 'self'`, COOP, CORP, HSTS는 적용되어 있다.

개발자 조치:
- `next.config.ts`의 CSP에서 inline script/style 의존성을 분리한다.
- 가능하면 nonce/hash 기반으로 전환한다.
- `object-src 'none'` 추가도 검토한다.
- Paddle/Google/Supabase 연동이 깨지지 않게 report-only로 먼저 관측 후 enforcing CSP를 강화한다.

수용 기준:
- Observatory CSP 실패가 사라지거나, 남는 `unsafe-inline`의 필요성과 범위가 보안 문서에 명시된다.
- 결제/Google 로그인/채팅/리포트 화면이 CSP 강화 후에도 정상 동작한다.

### P3. `update-status` IDOR no-op 응답 코드

authenticated IDOR QA 결과:
- 사용자 B가 사용자 A의 `readingId`로 `preview`, `analyze`, `deduct-stars`, `chat`, `pdf` 호출 시 `404`.
- `update-status`는 `200`을 반환하지만 실제 사용자 A의 row는 변경되지 않았다.

해석:
- 데이터 변조는 없어서 즉시 유출/변조 취약점은 아니다.
- 하지만 타인 리소스에 대해 `200 ok`를 주면 클라이언트와 감사 로그가 잘못 판단할 수 있다.

개발자 조치:
- `update-status`에서 update 후 affected row가 없으면 `404`를 반환하도록 보완한다.

수용 기준:
- 자기 리딩 상태 변경 성공: `200`.
- 타인 리딩 또는 존재하지 않는 리딩: `404`.
- privileged status 전환은 계속 `403`.

관련 파일:
- `src/app/api/saju/update-status/route.ts`

## 통과 확인된 항목

### 운영 API 실사용 QA

무료 시나리오:
```bash
QA_BASE_URL=https://monthlysaju.vercel.app pnpm qa:live-api:free
```

결과:
- 통과
- QA 계정 생성, 로그인, 무료 첫 상담, 별 차감, 거래 로그 확인, 정리까지 성공
- 최종 잔액: `2`
- 거래 로그: `chat_message:-1:2`

전체 시나리오:
```bash
QA_BASE_URL=https://monthlysaju.vercel.app pnpm qa:live-api
```

결과:
- 통과
- 리포트 5별 차감, 월간 리포트 3별 차감, 유료/무료 채팅, 동시성 200/409, 거래 로그 확인
- 최종 잔액: `2`
- 거래 로그: `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2`

### 운영 Supabase RLS

운영 linked DB 메타데이터 확인 결과, 아래 테이블은 모두 RLS enabled:
- `admin_audit_logs`
- `chat_generation_locks`
- `coaching_snapshots`
- `rate_limits`
- `saju_chat_messages`
- `saju_compatibilities`
- `saju_readings`
- `star_transactions`
- `user_memberships`
- `user_stars`

### 운영 Supabase RPC 권한

아래 민감 RPC는 `postgres`, `service_role`에만 EXECUTE가 있고 `anon`/`authenticated`에는 열려 있지 않았다:
- `acquire_chat_generation_lock`
- `admin_adjust_user_stars`
- `check_rate_limit`
- `credit_stars_for_paddle_purchase`
- `decrement_star`
- `deduct_stars_for_monthly_report`
- `deduct_stars_for_report`
- `refund_chat_star`
- `release_chat_generation_lock`
- `reserve_chat_star`

### authenticated IDOR QA

일회용 QA 스크립트로 운영에서 계정 2개와 A 소유 리딩 1개를 만들고, B 세션으로 A 리딩을 호출했다. 종료 시 QA 사용자와 테스트 row는 삭제했다.

결과:
- `preview`: 404
- `analyze`: 404
- `deduct-stars`: 404
- `chat`: 404
- `pdf`: 404
- `update-status`: 200, 하지만 owner row unchanged

판정:
- 주요 데이터 조회/분석/차감/채팅/PDF IDOR은 막혀 있다.
- `update-status` 응답 코드만 P3로 정리한다.

### 공개면 보안

확인:
- `/ko`: `200`
- `/.env`: `404`
- `/.git/config`: `404`
- `/package.json`: `404`
- 공개 HTML에서 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴 발견 안 됨
- `x-powered-by` 없음
- `NEXT_LOCALE` 쿠키는 `Secure`, `SameSite=Lax`
- OAuth PKCE code verifier cookie는 `Secure`, `HttpOnly`, `Max-Age=600`, `SameSite=Lax`
- OAuth origin spoofing 시 `redirect_to=https://monthlysaju.vercel.app/auth/callback` 유지
- API CORS preflight에 `Access-Control-Allow-Origin` 없음

### 비인증 민감 API

확인:
- `/api/saju/chat`: 401
- `/api/saju/suggestions`: 401
- `/api/webhooks/paddle`: 401
- `/api/saju/deduct-stars`: 401
- `/api/saju/update-status`: 401 또는 privileged status 요청은 403

## 이전 이슈 해결 확인

해결됨:
- OAuth PKCE cookie의 `Secure`/`HttpOnly`/짧은 TTL 문제
- `x-powered-by: Next.js` 노출
- CSP의 `unsafe-eval`
- `frame-ancestors` 과다 허용
- COOP/CORP 부재
- `NEXT_LOCALE` cookie `Secure` 부재
- canonical/JSON-LD의 도메인 혼재
- `deduct-stars`, `update-status` 비인증 요청에서 인증보다 입력 검증이 먼저 보이던 문제

잔여:
- CSP `unsafe-inline`
- `update-status` 타인 리소스 no-op 200
- Paddle signed webhook 운영 성공 경로 미검증/실패
- release gate production env 실패

## 개발자 작업 순서

1. Vercel Production env에서 `PADDLE_WEBHOOK_SECRET`과 Paddle dashboard notification destination secret을 맞춘다.
2. Paddle simulator 또는 sandbox 실제 signed payload로 성공/실패/중복 webhook QA를 통과시킨다.
3. `GOOGLE_VERTEX_RUNTIME_AUTH` production env 또는 env 검사 기준을 운영 정책과 맞춘다.
4. `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate`를 통과시킨다.
5. `update-status` no-op 200을 404로 바꾼다.
6. CSP `unsafe-inline` 제거 또는 허용 사유 문서화와 report-only 강화 계획을 세운다.

## 참고 기준
- OWASP IDOR: https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References
- OWASP API1 BOLA: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Paddle webhook signature: https://developer.paddle.com/webhooks/about/signature-verification/
- MDN Observatory: https://developer.mozilla.org/en-US/observatory/
