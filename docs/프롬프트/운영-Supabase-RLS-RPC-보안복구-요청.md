# 운영 Supabase RLS RPC 보안복구 요청

## 사용자 입력

운영 Supabase의 RLS/RPC 보안 복구를 요청했다.

## 배경

이전 작업에서 새 가격/코칭 SQL 3개는 운영 DB에 직접 적용했지만, `supabase db advisors --linked` 결과 기존 운영 DB에 다음 문제가 남아 있었다.

- `public.saju_readings` RLS disabled.
- `public.saju_chat_messages` RLS disabled.
- `public.saju_compatibilities` RLS disabled.
- `public.decrement_star(uuid)`가 `anon`/`authenticated`에서 직접 실행 가능.

## 처리 방향

- 기존 운영 DB가 migration history 없이 수동 SQL로 구성된 상태라 `db push`는 쓰지 않았다.
- 보안 복구 전용 migration 파일을 만들고 해당 SQL만 `supabase db query --linked -f`로 직접 적용했다.
- 적용 후 RLS/RPC 권한과 advisors를 다시 검증했다.
