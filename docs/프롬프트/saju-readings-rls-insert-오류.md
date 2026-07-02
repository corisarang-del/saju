# saju_readings RLS insert 오류

사용자 입력:

> new row violates row-level security policy for table "saju_readings"

처리 방향:

- Supabase의 `saju_readings` 테이블에 RLS가 켜져 있고 insert 정책이 없어 신규 사주 생성이 막힌 상태로 판단한다.
- 개발/로컬 복구용으로 핵심 사주 테이블 3개의 RLS를 끄는 별도 SQL을 제공한다.
