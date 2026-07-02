# 실사용 QA 빈 AI응답 개발자 전달

## 배경

- 실제 QA에서 랜딩, 입력 폼, 로그인 보호 흐름은 대체로 정상으로 확인됐다.
- 다만 실제 채팅 API가 외부 AI 실패 상황에서 성공 status와 빈 본문을 반환하는 문제가 확인됐다.
- 이 문제는 사용자가 “분석이 멈췄다”거나 “답변이 안 온다”고 느끼는 핵심 원인이 될 수 있다.

## 개발자 전달 문구

Gemini 실패/쿼터 초과 시 `/api/saju/chat`이 빈 문자열 body와 `200 OK`를 반환하면 안 된다. 사용자가 성공으로 오해하지 않게 명확한 실패 UI를 보여주고, 서버 로그에는 quota/rate-limit 원인을 추적 가능한 형태로 남겨야 한다.

## 우선순위

- P1: 공개 전 수정 권장.
- 첫 상담 답변 품질 검증 전에 반드시 해결해야 하는 응답 안정성 이슈다.

## 재현 조건

- Gemini API가 quota exceeded 상태.
- 인증된 사용자와 유효한 `saju_readings.id`가 있음.
- `/api/saju/chat`에 메시지를 전송.

## 실제 결과

- HTTP status: `200`.
- response body length: `0`.
- `saju_chat_messages` 저장 없음.
- 서버 로그: `[saju/chat] stream error {}`.
- Gemini 직접 호출 에러: quota exceeded, free tier request limit 초과.

## 기대 결과

- 외부 AI 호출 실패 시 사용자가 이해할 수 있는 오류 응답 또는 스트림 오류 메시지가 반환돼야 한다.
- HTTP status가 성공처럼 보이지 않아야 한다.
- UI는 “지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.” 같은 복구 가능한 메시지를 보여줘야 한다.
- 서버 로그에는 에러 name/message/cause/status 정도가 남아야 한다.

## 요구사항

- `streamText`의 `onError`에서 `{}`가 아닌 의미 있는 에러 정보를 로깅한다.
- 스트림 시작 전 또는 스트림 실패 시 quota/rate limit 에러를 사용자가 볼 수 있는 상태로 전달한다.
- 빈 assistant 메시지를 성공으로 취급하지 않는다.
- 응답 본문이 비어 있으면 클라이언트가 실패 UI를 보여주고 재시도 버튼을 제공한다.

## 수용 기준

- Gemini quota exceeded 상태에서 사용자는 빈 응답 대신 명확한 에러 메시지를 본다.
- API 또는 클라이언트 로그에 quota/rate-limit 원인이 남는다.
- 같은 요청이 성공하는 정상 상태에서는 assistant 메시지가 DB에 저장되고 별 차감이 한 번만 일어난다.
- 실패 상태에서는 별이 차감되지 않는다.
- 실패 상태에서는 사용자 메시지/assistant 메시지가 어중간하게 저장되지 않거나, 저장 정책이 있다면 실패 상태를 명확히 구분한다.
- 클라이언트는 `200 + empty body`를 성공 완료로 처리하지 않는다.

## QA 체크리스트

- Gemini quota exceeded 또는 mocked provider failure.
- 정상 Gemini 응답.
- 네트워크 실패.
- 읽기 권한 없는 `readingId`.
- 별 잔액 0.
- 첫 메시지 실패 후 `다시 분석하기` 클릭.

## 참고

- QA 기록: `docs/개발일지/실사용-응답흐름-qa-점검.md`

## 릴리즈 게이트

- 공개 전 `/api/saju/chat`의 provider failure, quota exceeded, network failure 회귀 테스트가 필요하다.
- 빈 `200 OK` 응답이 재발하면 출시 차단으로 본다.
