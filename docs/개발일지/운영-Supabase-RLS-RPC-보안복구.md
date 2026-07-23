# 운영 Supabase RLS RPC 보안복구

## 작업 내용

- 운영 project ref `sfpwgywcmhgilrqearsz`에 RLS/RPC 보안 복구 SQL을 직접 적용했다.
- 새 로컬 migration 파일:
  - `supabase/migrations/20260707060209_operational_rls_rpc_security_repair.sql`
- 적용 명령:
  - `supabase db query --linked -f supabase/migrations/20260707060209_operational_rls_rpc_security_repair.sql`

## 복구한 항목

- `public.saju_readings` RLS 활성화와 owner 기반 select/insert/update/delete 정책 추가.
- `public.saju_chat_messages` RLS 활성화와 reading owner 기반 select/insert/delete 정책 추가.
- `public.saju_compatibilities` RLS 활성화와 owner/reading owner 기반 select/insert/update/delete 정책 추가.
- `public.decrement_star(uuid)`를 재정의하고 `anon`/`authenticated` 실행 권한 제거.
- 운영에 없던 `public.credit_stars_for_paddle_purchase(uuid, integer, text, text)`를 복구하고 service_role 전용으로 제한.
- `deduct_stars_for_report`, `deduct_stars_for_monthly_report`도 service_role 전용 권한을 다시 확인하도록 revoke/grant를 재적용.

## 검증 결과

- 단일 검증 쿼리 결과 모두 `true`:
  - `saju_readings`, `saju_chat_messages`, `saju_compatibilities`, `user_stars`, `star_transactions`, `coaching_snapshots` RLS 활성화.
  - 핵심 사주 테이블 정책 수 정상.
  - `decrement_star`, `credit_stars_for_paddle_purchase`, `deduct_stars_for_report`, `deduct_stars_for_monthly_report`는 `anon/authenticated` 실행 불가, `service_role` 실행 가능.
- `supabase db advisors --linked`
  - 기존 P0였던 핵심 사주 테이블 RLS disabled 경고와 `decrement_star` public executable 경고는 사라졌다.
  - 남은 경고:
    - Auth leaked password protection disabled.
    - 기존 `user_stars`, `star_transactions`, `coaching_snapshots` RLS 정책의 `auth_rls_initplan` 성능 WARN.

## 주의사항

- 원격 `supabase_migrations` history는 여전히 비어 있다.
- 운영 DB가 기존에 수동 SQL로 구성되어 있어 `db push`는 요청 범위를 넘는 대량 적용 위험이 있다.
- 이후 운영 DB 정리는 migration history repair 전략을 별도로 세워야 한다.
