# saju_readings 스키마 캐시 오류

사용자 입력:

> Could not find the table 'public.saju_readings' in the schema cache

처리 방향:

- Supabase에 별 크레딧 스키마만 적용되고 핵심 사주 테이블이 빠진 상태로 판단했다.
- 앱 코드가 기대하는 `saju_readings`, `saju_chat_messages`, 궁합 테이블/뷰 스키마를 추가한다.
- 단수/복수 궁합 테이블명 혼용은 복수형 테이블과 단수형 뷰 별칭으로 맞춘다.
