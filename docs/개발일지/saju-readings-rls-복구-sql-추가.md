# saju_readings RLS 복구 SQL 추가

## 배경

사주 분석 시작 시 `new row violates row-level security policy for table "saju_readings"` 오류가 발생했다. 이전 스키마 실행 과정에서 `saju_readings`의 RLS가 켜졌지만 insert 허용 정책이 없거나 적용되지 않아, 로그인 사용자의 신규 row 생성이 막힌 상태로 판단했다.

## 작업

- `supabase/migrations/202606300030_disable_core_saju_rls.sql` 추가.
- 개발/로컬 복구용으로 `saju_readings`, `saju_chat_messages`, `saju_compatibilities`의 RLS를 비활성화한다.
- PostgREST schema reload 알림을 포함했다.
- `src/lib/database/core-saju-rls-recovery.test.ts`로 복구 SQL 내용을 검증했다.

## 검증

- `./node_modules/.bin/vitest run src/lib/database/core-saju-rls-recovery.test.ts src/lib/database/core-saju-schema.test.ts` 통과.
