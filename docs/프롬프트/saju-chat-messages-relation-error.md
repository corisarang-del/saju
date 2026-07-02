# saju_chat_messages relation 오류

사용자 입력:

> Error: Failed to run sql query: ERROR: 42P01: relation "public.saju_chat_messages" does not exist

처리 방향:

- 핵심 사주 스키마 SQL 실행 중 `saju_chat_messages` 관련 정책 생성에서 관계 참조가 꼬인 것으로 판단했다.
- RLS 정책 내부에서 현재 테이블을 테이블명으로 한정하지 않고, 외부 행 컬럼 `reading_id`를 직접 참조하도록 수정한다.
- 같은 오류가 반복되어 `drop policy if exists ... on public.saju_chat_messages` 자체가 테이블 미존재 상태에서 실패하는 케이스까지 반영한다.
- 이후 `with check` 구문 오류가 발생해, 우선 테이블 생성용 부트스트랩 SQL에서 RLS 정책 DDL을 제거한다.
