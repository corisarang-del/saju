# 운영 Supabase 새 마이그레이션 3개 적용 요청

## 사용자 입력

운영 Supabase에 새 마이그레이션 3개를 적용해 달라고 요청했다. Supabase CLI가 설치되어 있다고 알려줬다.

## 대상 마이그레이션

- `202607070010_coaching_snapshots.sql`
- `202607070020_full_report_star_cost.sql`
- `202607070030_monthly_report_star_cost.sql`

## 처리 방향

- 로컬 Supabase 프로젝트가 link되어 있지 않아 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`에서 project ref `sfpwgywcmhgilrqearsz`를 확인했다.
- `supabase link --project-ref sfpwgywcmhgilrqearsz`로 연결했다.
- `supabase db push --dry-run` 결과 원격 migration history가 비어 있어 새 3개가 아니라 기존 6개 포함 총 9개를 적용하려고 했다.
- 범위 초과 위험 때문에 `db push` 대신 사용자가 요청한 새 3개 SQL만 `supabase db query --linked -f`로 직접 실행했다.
