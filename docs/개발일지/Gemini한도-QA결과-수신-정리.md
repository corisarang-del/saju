# Gemini한도 QA결과 수신 정리

## 확인한 QA 결과

- `/api/saju/chat` 실제 API QA에서 Gemini quota 초과 시 `200 text/event-stream`으로 사용자용 한도 메시지가 전달됐다.
- 실패 상태에서 `saju_chat_messages` 저장, assistant 저장, `chat_used` 증가, 별 차감이 모두 막혔다.
- 실제 Gemini 첫 상담 5케이스 QA는 `gemini-2.5-flash-lite` free tier 요청 한도 20회 초과로 실패했다.
- 브라우저 화면 QA에서 `/ko`, `/ko/reading` 기본 흐름과 비로그인 보호 메시지는 정상 확인됐다.

## 현재 판단

- 앱의 과금/저장 방어는 정상이다.
- 실제 상담 답변 생성 실패의 1차 원인은 코드가 아니라 Gemini quota/billing 운영 이슈다.
- 사용자가 본 `응답을 받지 못했어...` 반복 메시지는 QA 이후 추가 확인에서 AI SDK `errorText`를 클라이언트 완료 판정이 읽지 못한 UI 오판까지 겹친 문제로 확인했고, 별도 수정했다.

## 다음 운영 조치

- Google AI Studio에서 billing/quota가 열린 키로 교체하거나 quota 리셋 후 실사용 QA를 재실행한다.
- 새 키 적용 후 `node scripts/qa-gemini-first-consultation.mjs`와 실제 `/api/saju/chat` QA를 다시 돌린다.
- 실패 처리 검증뿐 아니라 실제 첫 상담 답변의 톤/분량/사주 반영 품질을 다시 확인해야 한다.
