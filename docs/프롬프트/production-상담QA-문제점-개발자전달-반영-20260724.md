# production 상담 QA 문제점 개발자전달 반영

- 일자: 2026-07-24
- 사용자 요청: `[개발자 전달 문서](/Users/apple/Desktop/test_githup/saju/docs/pm/production-상담QA-문제점-개발자전달-20260724.md)`

## 요청 요약

배포 후 실제 상담 QA 문서에서 나온 문제를 확인하고 수정할 부분을 반영해달라는 요청.

## 반영 대상

- paid 동시 상담 요청이 간헐적으로 `409 lock conflict` 대신 `503 chat_generation_failed`가 되는 문제.
- `/api/analytics/track` 404 문제 확인.
- 첫 상담 응답에 `별자리 데이터`, `자미두수`, 과도한 한자/전문용어가 섞이는 문제.
- 비로그인 분석 시작 후 로그인 CTA가 약한 문제.

