# Vercel Vertex WIF 인증전환과 production 상담복구

## 문제

Google 로그인은 정상화됐지만 production에서 사주상담이 6번 연속 실패했다.

## 원인

- production env는 `AI_PROVIDER=vertex`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`을 사용하고 있었다.
- 로컬은 Google ADC 파일이 있어 Vertex 호출이 가능했지만, Vercel Function 런타임은 로컬 ADC 파일을 볼 수 없다.
- `REQUIRE_PRODUCTION_ENV=true node scripts/check-env.js`를 보강하기 전에는 이 런타임 인증 누락을 잡지 못했다.
- Google API key provider도 403으로 실패했고, 서비스 계정 키 생성은 조직 정책 `constraints/iam.disableServiceAccountKeyCreation` 때문에 막혔다.

## 수정

- `google-auth-library@10.9.0`을 직접 dependency로 추가했다.
- `src/lib/ai/model.ts`에 Vertex provider 설정 헬퍼를 추가했다.
  - `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`
  - `GOOGLE_VERTEX_CREDENTIALS_JSON`
  - Vercel `x-vercel-oidc-token` + Google Workload Identity Federation
- `/api/saju/chat`에서 Vercel Function 요청 헤더의 `x-vercel-oidc-token`을 읽어 `getChatModel`로 전달했다.
- `scripts/check-env.js` production gate가 Vertex 사용 시 `GOOGLE_VERTEX_RUNTIME_AUTH` 누락을 잡게 했다.
- 공개 env에 Vertex 인증 관련 값을 넣으면 실패하도록 금지 목록을 보강했다.

## Google Cloud 설정

- 서비스 계정 생성:
  - `monthlysaju-vertex@project-3473cfe3-7869-4a96-855.iam.gserviceaccount.com`
- 서비스 계정 권한:
  - `roles/aiplatform.user`
  - `roles/iam.workloadIdentityUser`
- Workload Identity Pool:
  - pool id: `vercel`
  - provider id: `vercel`
  - issuer: `https://oidc.vercel.com/todocori`
  - allowed audience: `https://vercel.com/todocori`
  - subject 제한: `owner:todocori:project:monthlysaju:environment:production`
- IAM Credentials API를 활성화했다.

## Vercel env

production에 다음 env를 추가했다.

- `GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE`
- `GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL`

두 값은 Vercel CLI에서 Sensitive로 저장됐다. 비밀키는 저장하지 않았다.

## 배포

- production deployment id: `dpl_3pQhZyoQg5fRF3EUBT4nUUmCuK9x`
- deployment URL: `https://monthlysaju-lc6rl8iuw-todocori.vercel.app`
- alias: `https://monthlysaju.vercel.app`

## 검증

- `./node_modules/.bin/vitest run src/lib/ai/model.test.ts scripts/check-env.test.mjs src/lib/ai/chat-completion-guard.test.ts src/lib/saju/chat-stream-failure-regression.test.ts`
  - 4개 파일, 51개 테스트 통과
- `./node_modules/.bin/vitest run`
  - 53개 파일, 228개 테스트 통과
- `./node_modules/.bin/tsc --noEmit`
  - 통과
- `./node_modules/.bin/eslint src/lib/ai/model.ts src/lib/ai/model.test.ts src/app/api/saju/chat/route.ts scripts/check-env.js scripts/check-env.test.mjs`
  - 통과
- `pnpm build`
  - 통과
- `curl -sf -I https://monthlysaju.vercel.app/ko`
  - HTTP 200
- `QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - 통과
  - 무료 첫 상담 응답 저장, 별 차감, 거래 로그 확인
  - `freeChatDurationMs`: 11112
- `QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs`
  - 통과
  - 유료/무료 첫 상담, 리포트 차감, 동시 요청 방어, 거래 로그 확인
  - `paidChatDurationMs`: 13930
  - `freeChatDurationMs`: 13717

## 남은 주의점

- Vercel OIDC issuer mode가 `todocori` team issuer로 유지되어야 한다.
- OIDC 설정을 Global issuer로 바꾸면 Google provider issuer와 맞지 않아 다시 실패할 수 있다.
- 서비스 계정 키 생성은 조직 정책상 금지되어 있으므로, 운영 인증은 WIF를 유지한다.
