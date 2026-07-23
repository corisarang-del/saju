# 운영 Supabase 가격코칭 마이그레이션 직접 적용

## 작업 시각

- 2026-07-07 14:39:16 KST

## 적용 대상

- 운영 Supabase project ref: `sfpwgywcmhgilrqearsz`
- 적용 파일:
  - `supabase/migrations/202607070010_coaching_snapshots.sql`
  - `supabase/migrations/202607070020_full_report_star_cost.sql`
  - `supabase/migrations/202607070030_monthly_report_star_cost.sql`

## 실행한 작업

- `supabase link --project-ref sfpwgywcmhgilrqearsz`
- `supabase migration list --linked`
  - 원격 migration history가 비어 있는 상태를 확인했다.
- `supabase db push --dry-run`
  - 새 3개가 아니라 기존 6개 포함 총 9개를 적용하려는 상태를 확인했다.
  - 범위 초과 위험 때문에 `db push --yes`는 진행하지 않았다.
- 아래 3개 파일만 직접 실행했다.
  - `supabase db query --linked -f supabase/migrations/202607070010_coaching_snapshots.sql`
  - `supabase db query --linked -f supabase/migrations/202607070020_full_report_star_cost.sql`
  - `supabase db query --linked -f supabase/migrations/202607070030_monthly_report_star_cost.sql`

## 적용 검증

읽기 전용 검증 쿼리에서 모두 `true`를 확인했다.

- `public.coaching_snapshots` 테이블 존재.
- `public.coaching_snapshots` RLS 활성화.
- `public.deduct_stars_for_report(uuid, uuid)` 존재.
- `public.deduct_stars_for_monthly_report(uuid)` 존재.
- 종합 백서 RPC 내부 비용 `v_report_cost integer := 5`.
- 월간 리포트 RPC 내부 비용 `v_report_cost integer := 3`.
- `deduct_stars_for_report`와 `deduct_stars_for_monthly_report`는 `service_role` 실행 가능.
- 두 RPC는 `authenticated` 직접 실행 불가.

## 남은 주의사항

- 원격 `supabase_migrations` history는 여전히 비어 있다.
  - 이유: `db push`가 총 9개를 적용하려 해 요청 범위를 넘었기 때문이다.
  - 이번 작업은 기능 SQL 직접 적용이며 migration history 기록은 아니다.
- `supabase db advisors --linked` 결과 기존 운영 DB에서 P0 보안 문제가 확인됐다.
  - `public.saju_readings` RLS disabled.
  - `public.saju_chat_messages` RLS disabled.
  - `public.saju_compatibilities` RLS disabled.
- advisors에서 기존 `decrement_star`가 `anon`/`authenticated` 실행 가능하다는 경고도 확인됐다.
- 위 보안 이슈는 이번 요청 범위인 새 3개 마이그레이션 적용을 넘어서는 운영 DB 복구 작업이라 추가 적용하지 않았다.
