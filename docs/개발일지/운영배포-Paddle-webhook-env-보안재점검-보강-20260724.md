# 운영배포 Paddle webhook env 보안재점검 보강 20260724

## 배경

PM 보안 재점검 문서에서 production Paddle webhook signed payload가 401로 거부되는 운영 설정 불일치 가능성, `GOOGLE_VERTEX_RUNTIME_AUTH` release gate 실패, CSP 잔여 위험, `update-status` IDOR no-op 200 문제가 남아 있었다.

## TDD

- `src/lib/security/release-gate-regression.test.ts`에 `update-status`가 update 후 `.select('id').maybeSingle()`로 실제 영향 row를 확인하고, 미존재/타인 row는 `Reading not found` 404를 반환해야 한다는 회귀 기대를 먼저 추가했다.
- 같은 테스트에 Paddle signed webhook QA 스크립트와 결제 live release gate 스크립트가 있어야 한다는 기대를 추가했다.
- `scripts/check-env.test.mjs`에 `GOOGLE_VERTEX_RUNTIME_AUTH=vercel-oidc`는 production Vertex auth 정책으로 허용하고, 알 수 없는 값은 계속 실패해야 한다는 테스트를 먼저 추가했다.
- 실패 확인 후 구현했다.

## 구현

- `src/app/api/saju/update-status/route.ts`
  - 본인 소유 reading만 update한 뒤 `select('id').maybeSingle()`로 실제 갱신 row를 확인한다.
  - 타인 reading이나 존재하지 않는 reading은 더 이상 `{ ok: true }`가 아니라 404 `Reading not found`를 반환한다.
- `scripts/check-env.js`
  - `GOOGLE_VERTEX_RUNTIME_AUTH` 허용값 allowlist를 추가했다.
  - `vercel-oidc`, `workload-identity`, `wif`, `adc`, `service-account`, `service-account-json`만 명시 정책으로 인정한다.
  - `plain-text-key` 같은 알 수 없는 값은 여전히 production auth missing으로 실패한다.
- `scripts/qa-paddle-webhook-check.mjs`
  - Paddle webhook 서명 HMAC QA 스크립트를 추가했다.
  - 무서명 `transaction.completed`는 401이어야 한다.
  - 정상 서명 `transaction.payment_failed`는 200이지만 별 잔액을 바꾸지 않아야 한다.
  - 정상 서명 `transaction.completed`는 stars10 상품 기준으로 1회만 별을 지급해야 한다.
  - 같은 transaction 재전송은 200이지만 중복 지급되면 안 된다.
  - `subscription.activated`, `subscription.canceled`는 멤버십 상태를 upsert해야 한다.
  - 정상 서명 completed가 401이면 Vercel `PADDLE_WEBHOOK_SECRET`과 Paddle Notification Destination secret 불일치 가능성을 힌트로 출력한다.
- `package.json`
  - `qa:paddle-webhook:signed`를 추가했다.
  - `release:gate:payments:live`를 추가해 기존 결제 게이트 뒤에 signed webhook QA를 이어 붙였다.
- `next.config.ts`
  - CSP에 `object-src 'none'`를 추가했다.

## 남은 운영 확인

- production 결제 재오픈 전에는 Vercel production `PADDLE_WEBHOOK_SECRET`과 Paddle Dashboard Notification Destination secret이 같은지 반드시 맞춰야 한다.
- production에서 실행할 때는 `QA_BASE_URL=https://monthlysaju.vercel.app pnpm qa:paddle-webhook:signed`로 확인한다.
- `unsafe-inline`은 Next/스타일/JSON-LD 영향 때문에 이번 hotfix에서 제거하지 않았다. nonce/hash 전환은 별도 단계로 진행해야 한다.

## 검증

- `./node_modules/.bin/vitest run` 통과: 55 files, 246 tests
- `./node_modules/.bin/tsc --noEmit` 통과
- `./node_modules/.bin/eslint .` 통과
- 샌드박스 내 `next build`는 Turbopack 포트 바인딩 제한으로 실패했지만, 권한 밖 재실행 `./node_modules/.bin/next build`는 통과
