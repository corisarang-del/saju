# 운영 env release gate 재실행 점검 20260724

## 진행 내용

- 로컬 `.env.local`에 무료 베타 production gate 기준 값을 보강했다.
  - `RATE_LIMIT_BACKEND=supabase`
  - `PAYMENTS_ENABLED=false`
  - `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
  - `REQUIRE_PADDLE_ENV=false`
  - `APP_ORIGIN`은 비어 있을 경우 `NEXT_PUBLIC_APP_URL`과 같은 값으로 채웠다.
- Vercel 연결 프로젝트를 확인했다.
  - project: `todocori/monthlysaju`
  - projectId: `prj_hoPchkeS8llgYuho7Cwb4qVmjcnW`
  - orgId: `team_r9PU4uNe4a1AJ4ilkj5AVz5j`
- `pnpm dlx vercel env ls` 결과 production env는 아직 하나도 없었다.
- Vercel production env 업로드를 시도했지만, `.env.local`의 Supabase service role과 AI 자격증명을 Vercel로 전송하는 민감 작업이라 자동 승인에서 차단됐다.
- 로컬 production env gate는 통과했다.
- `pnpm qa:live-api:free`는 여전히 Supabase DNS lookup failed로 실패했다.
- Supabase CLI 확인 결과 프로젝트 상태가 `INACTIVE`였다.
- `supabase link --project-ref sfpwgywcmhgilrqearsz`는 `project is paused`로 실패했다.
- 공용 DNS `1.1.1.1`, `8.8.8.8`에서도 `sfpwgywcmhgilrqearsz.supabase.co`는 해석되지 않았다.
- Supabase pooler 도메인은 정상 해석되어, 네트워크 전체 문제가 아니라 프로젝트 paused 상태가 핵심 원인으로 확인됐다.

## 검증 결과

- `REQUIRE_PRODUCTION_ENV=true pnpm test:env`: 통과.
- `pnpm qa:live-api:free`: 실패.
  - host: `sfpwgywcmhgilrqearsz.supabase.co`
  - code: `ENOTFOUND`
  - 원인: Supabase project paused/inactive.
- `supabase projects list -o json`: `status: "INACTIVE"`.
- `supabase link --project-ref sfpwgywcmhgilrqearsz`: `project is paused`.

## 남은 작업

1. Supabase Dashboard에서 `sfpwgywcmhgilrqearsz` 프로젝트를 unpause 해야 한다.
   - dashboard: `https://supabase.com/dashboard/project/sfpwgywcmhgilrqearsz`
2. Vercel production env 업로드는 사용자의 명시 승인이 필요하다.
3. Supabase unpause 후 `pnpm qa:live-api:free`를 다시 실행한다.
4. Vercel env 등록 후 `pnpm release:gate`를 다시 실행한다.

## 주의

Vercel production에 올릴 무료 베타 env는 Paddle 결제 env를 제외한 필수 runtime env다. 결제 재오픈 전까지 `PAYMENTS_ENABLED=false`, `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, `REQUIRE_PADDLE_ENV=false`를 유지한다.
