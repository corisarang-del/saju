# production 상담 QA 문제점 개발자 전달

- 작성 시각: 2026-07-24 02:12:05 KST
- 작업 유형: 배포 QA 결과 문서화
- 코드 수정: 없음

## 작업 내용

`https://monthlysaju.vercel.app/` production 배포 QA에서 나온 문제를 개발자가 수정할 수 있도록 `docs/pm/production-상담QA-문제점-개발자전달-20260724.md`에 정리했다.

## 정리한 문제

- `P1`: paid 동시 상담 요청이 간헐적으로 `409`가 아니라 `503 chat_generation_failed`로 실패
- `P2`: `/api/analytics/track` 404 콘솔 에러
- `P2`: 상담 응답에 한자/전문용어와 `별자리 데이터` 표현이 섞여 20대 일반 사용자에게 무거움
- `P2`: 비로그인 분석 시작 후 `로그인이 필요합니다.`만 보여 로그인 CTA가 약함

## QA 기준으로 확인된 정상 항목

- `/`에서 `/ko` 리다이렉트
- `/ko`, `/ko/reading`, `/ko/coin-shop` 200
- OAuth 시작 307
- 무인증 채팅 401 JSON 응답
- 무료 live API 통과
- 전체 live API 재실행 기준 통과
- 입력 폼 1단계에서 2단계 전환 정상

## 다음 액션

개발자는 analytics route/call 정리, 동시 상담 lock 안정화, Gemini 프롬프트/품질 게이트의 전문용어 제한, 비로그인 CTA 개선을 진행하면 된다.
