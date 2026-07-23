# Supabase unpause release gate 통과확인 20260724

## 사용자 요청

사용자가 Supabase 프로젝트를 unpause 했다고 알려주고, `RATE_LIMIT_BACKEND=supabase`와 Vercel production env를 넣은 뒤 `release:gate`를 다시 돌려 Supabase DNS/live API QA까지 통과하고 싶다고 요청했어.

## 요청 핵심

- Supabase project host DNS가 살아났는지 확인한다.
- Supabase 프로젝트 상태가 active인지 확인한다.
- 운영 DB 마이그레이션/스키마 상태를 맞춘다.
- `qa:live-api:free`, `qa:live-api`, `release:gate`를 다시 실행한다.
- Vercel production env 업로드는 민감한 비밀값 전송이라 명시 승인이 필요하다.
