# 운영사이트 공격형 보안점검 invalid JSON과 env 반영

## 시간
- 2026-07-24 16:38 KST

## 배경
- 운영 공격형 보안점검에서 일부 사주 API가 `text/plain not-json` payload에 500 또는 빈 body 500을 반환했다.
- 스택 trace나 민감 DB 오류 노출은 없었지만, 악성 invalid body로 5xx 로그와 알람을 오염시킬 수 있는 하드닝 이슈였다.
- production env gate는 `GOOGLE_VERTEX_RUNTIME_AUTH` 누락으로 실패했다.

## 수정
- `src/lib/http/safe-json.ts`를 추가해 `req.json()` parse 예외를 공통으로 잡고 `400` 구조화 JSON을 반환하게 했다.
- `/api/saju/preview`, `/api/saju/analyze`, `/api/saju/compatibility`, `/api/saju/chat`에서 직접 `req.json()`을 호출하지 않고 `safeJson`을 사용하게 했다.
- `/api/saju/chat` invalid JSON 응답에는 기존 request id를 포함하게 했다.
- `/api/saju/compatibility` catch 블록에서 `req.clone().json()`을 다시 파싱하던 복구 로직을 제거하고, 미리 보관한 `compatibilityId`와 `userId`로 실패 복구를 수행하게 했다.
- Vercel production env에 `GOOGLE_VERTEX_RUNTIME_AUTH=vercel-oidc`를 non-sensitive 값으로 등록했다.

## 테스트
- TDD로 먼저 추가한 회귀 테스트:
  - `src/lib/http/safe-json.test.ts`
  - `src/lib/security/invalid-json-api-regression.test.ts`
- 실패 확인:
  - `safe-json` 모듈 부재
  - 네 API route가 `safeJson`을 쓰지 않고 직접 `req.json()`/`req.clone().json()`을 호출함
- 수정 후 검증:
  - `./node_modules/.bin/vitest run src/lib/http/safe-json.test.ts src/lib/security/invalid-json-api-regression.test.ts` 통과
  - 로컬 HTTP PoC에서 네 API 모두 `400 {"error":"invalid_json","message":"요청 본문은 올바른 JSON이어야 해."}` 반환
  - chat은 `requestId` 포함

## 전체 검증
- `./node_modules/.bin/vitest run`: 57 files, 257 tests 통과
- `./node_modules/.bin/tsc --noEmit`: 통과
- `./node_modules/.bin/eslint .`: 통과
- `./node_modules/.bin/next build`: sandbox 포트 제한으로 1회 실패 후, 승인 경로에서 통과
- `pnpm audit --prod --audit-level high`: high 이상 없음, low 1개만 보고
- `GOOGLE_VERTEX_RUNTIME_AUTH=vercel-oidc REQUIRE_PRODUCTION_ENV=true node scripts/check-env.js`: 통과
- `pnpm test:env`: 기존 래퍼 문제인 `fetch failed`로 실패
- `QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-paddle-webhook-check.mjs`: Paddle product/price id 4개 누락으로 차단

## 남은 리스크
- Paddle signed webhook 정상 서명 401은 실제 `PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`, Paddle product/price id가 등록돼야 닫을 수 있다.
- Vercel env 변경은 다음 production 배포부터 런타임에 반영된다.
- CSP `unsafe-inline` 제거는 Google login, Paddle checkout, Next/theme inline script 영향이 커서 report-only와 nonce/hash 전략으로 별도 작업해야 한다.
