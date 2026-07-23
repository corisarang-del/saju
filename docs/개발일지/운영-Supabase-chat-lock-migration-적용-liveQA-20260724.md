# 운영 Supabase chat lock migration 적용 live QA

- 일자: 2026-07-24
- 대상 Supabase project ref: `sfpwgywcmhgilrqearsz`
- 대상 migration: `supabase/migrations/202607240030_chat_generation_persistent_lock.sql`

## 진행 내용

- Supabase CLI 2.90.0 확인.
- `supabase migration list --linked`로 remote history 확인.
- `202607240030`만 remote에 비어 있는 것을 확인.
- `supabase db push --linked --dry-run`으로 적용 대상이 `202607240030_chat_generation_persistent_lock.sql` 하나뿐인 것을 확인.
- `supabase db lint --linked`에서 schema error 없음 확인.
- `supabase db push --linked --yes`로 운영 DB에 migration 적용.
- `supabase migration list --linked`에서 `202607240030` remote 적용 확인.
- `supabase db query --linked`로 `public.chat_generation_locks`, `acquire_chat_generation_lock`, `release_chat_generation_lock` 생성 확인.

## live QA 기록

- migration 적용 직후 production 현재 배포본 기준 `QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs` 1회 실행.
- 결과는 paid 동시 상담 status `[200, 200]`으로 실패했다.
- 원인 판단: 운영 DB migration은 적용됐지만, production 사이트는 아직 DB lock helper를 사용하는 새 코드가 배포되지 않은 상태라 live QA 3회 반복은 새 수정 검증이 되지 않는다.
- 조치: 커밋/푸시로 새 production 배포를 유도한 뒤, 배포 완료 후 live QA 3회 재실행이 필요하다.

