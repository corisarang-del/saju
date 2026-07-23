# Vercel production env 업로드와 release gate 커밋 20260724

## 진행 내용

- 사용자가 Vercel `monthlysaju` production env 업로드를 명시 승인했다.
- Vercel project `todocori/monthlysaju` production에 무료 베타 필수 env를 업로드했다.
- 업로드한 키:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AI_PROVIDER`
  - `AI_MODEL`
  - `GOOGLE_VERTEX_PROJECT`
  - `GOOGLE_VERTEX_LOCATION`
  - `GOOGLE_GENERATIVE_AI_API_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - `APP_ORIGIN`
  - `ADMIN_EMAILS`
  - `RATE_LIMIT_BACKEND`
  - `PAYMENTS_ENABLED`
  - `NEXT_PUBLIC_PAYMENTS_ENABLED`
  - `REQUIRE_PADDLE_ENV`
- Paddle 결제 env는 무료 베타 배포 범위가 아니라 업로드하지 않았다.
- `pnpm dlx vercel env ls production`으로 production env 15개 등록을 확인했다.

## 검증 상태

- 직전 검증에서 `pnpm release:gate`는 통과했다.
  - 전체 vitest 53개 파일 / 218개 테스트 통과.
  - typecheck, lint, build 통과.
  - high audit 통과.
  - production env gate 통과.
  - 무료/전체 live API QA 통과.
- Vercel env 업로드 후에는 별도 배포를 실행하지 않았다.

## 남은 주의

- 현재 production env의 `AI_PROVIDER`는 `vertex`다.
- Vercel production 런타임에서 Vertex ADC가 로컬처럼 자동 제공되지 않을 수 있으므로, 실제 Vercel 배포 후 AI 호출 QA는 별도로 확인해야 한다.
- 결제 재오픈 전까지 `PAYMENTS_ENABLED=false`, `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, `REQUIRE_PADDLE_ENV=false`를 유지한다.
