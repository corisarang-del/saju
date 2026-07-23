# 운영 env release gate 재실행 요청 20260724

## 사용자 요청

사용자가 `RATE_LIMIT_BACKEND=supabase`와 Vercel production env를 먼저 넣고, 그 다음 `release:gate`를 다시 돌려 Supabase DNS/live API QA까지 통과하고 싶다고 요청했어.

## 작업 목표

- 로컬 `.env.local`에 무료 베타 production gate 필수 env를 보강한다.
- Vercel `todocori/monthlysaju` production env 상태를 확인한다.
- Supabase DNS/live API QA 실패 원인을 재확인한다.
- release gate를 다시 통과시키기 위해 남은 외부 조치를 정리한다.
