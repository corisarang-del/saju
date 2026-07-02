# Gemini 쿼터초과 오류part 빈응답 오판 수정

## 원인

- 실제 Gemini 짧은 호출 확인 결과 `gemini-2.5-flash-lite` 무료 요청 한도 20회를 초과했다.
- 서버는 `toUIMessageStreamResponse`의 `onError`로 quota/rate-limit를 사용자용 문구로 변환할 수 있었다.
- 하지만 클라이언트 완료 판정의 `getFinishedAssistantText`가 AI SDK `error` part의 `errorText`를 읽지 못했다.
- 그 결과 quota 메시지가 있어도 assistant 텍스트를 빈 문자열로 오판했고, `응답을 받지 못했어...` fallback이 반복됐다.
- 또한 `isError` 상황에서 이미 사용자용으로 변환된 실패 문구를 `분석 응답이 중간에 끊겼어...`로 덮을 수 있었다.

## 변경

- `getChatMessagePlainText`가 `text` part뿐 아니라 `error`, `tool-input-error`, `tool-output-error`, `data-*`의 사용자용 메시지를 읽게 했다.
- `getChatCompletionFailureMessage`가 이미 사용자에게 보여줄 수 있는 실패 문구를 그대로 보존하게 했다.

## 검증

- 실패 테스트를 먼저 추가해 기존 코드에서 다음 2개 케이스가 실패함을 확인했다.
  - stream 완료 메시지가 `errorText`만 가진 경우 텍스트를 추출해야 한다.
  - quota/rate-limit 사용자용 문구는 `isError`여도 그대로 보여줘야 한다.
- 수정 후 `./node_modules/.bin/vitest run src/lib/ai/chat-finished-message.test.ts src/lib/ai/chat-completion-guard.test.ts --pool=forks --maxWorkers=1` 통과.

## 운영 참고

- 현재 환경의 실제 AI 미응답 원인은 Gemini free tier quota 초과다.
- 별 차감 방지는 유지되고, 이제 반복 재시도 시 빈 응답 fallback 대신 AI 응답 한도 메시지가 보이게 된다.
