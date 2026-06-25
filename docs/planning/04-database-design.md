# 월간사주 데이터베이스 설계

## 기존 유지
- `saju_readings`
- `saju_chat_messages`
- `saju_compatibility`
- `user_stars`

## 추가 후보
- `daily_agent_feeds`: 날짜별 캐릭터 피드 캐시
- `conversation_memories`: 사용자별 대화 요약과 반복 고민
- `monthly_reports`: 월간 전략 리포트와 대화 요약 리포트
- `ai_model_settings`: 관리자 선택형 AI provider 설정

## 원칙
- v1에서는 순수 도메인 모듈을 먼저 만들고, DB 마이그레이션은 실제 Supabase 스키마 확인 후 적용한다.
- 날짜별 피드는 같은 날짜와 같은 캐릭터에 대해 재사용 가능하게 설계한다.

