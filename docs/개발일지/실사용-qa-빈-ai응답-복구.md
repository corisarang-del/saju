# 실사용 QA 빈 AI응답 복구

- 일시: 2026-07-01 00:53:01 KST

## 원인

- `/api/saju/chat`이 `streamText().toTextStreamResponse()`를 반환하고, 클라이언트는 `TextStreamChatTransport`를 사용하고 있었다.
- AI SDK 문서와 타입을 확인한 결과 `toTextStreamResponse()`는 스트림 중 provider 에러를 사용자에게 안전한 에러 메시지로 전달하는 훅이 없었다.
- Gemini quota/rate-limit 에러가 스트림 시작 후 발생하면 클라이언트가 빈 텍스트 스트림을 성공처럼 볼 수 있었다.
- 기존 `onError` 로그는 원본 에러 객체를 그대로 넣어 `{}`로 보일 수 있었다.

## 작업 내용

- `src/lib/ai/chat-error-handling.ts`를 추가해 provider 에러를 구조화된 로그 객체로 직렬화했다.
- quota/rate-limit/429 계열 에러는 사용자에게 `지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.`로 전달하게 했다.
- `/api/saju/chat` 응답을 `toTextStreamResponse()`에서 `toUIMessageStreamResponse({ onError })`로 전환했다.
- 클라이언트를 `TextStreamChatTransport`에서 `DefaultChatTransport`로 전환해 UI message stream error를 받을 수 있게 했다.
- `onFinish`에서 AI 응답이 빈 문자열이면 사용자 메시지 저장, assistant 저장, 별 차감을 모두 건너뛰게 했다.
- 클라이언트 `onError`는 서버가 전달한 `error.message`를 우선 보여주고, 자동 첫 분석 재시도를 위해 sessionStorage auto-start key를 제거한다.

## TDD 기록

- 먼저 실패 확인:
  - `./node_modules/.bin/vitest run src/lib/ai/chat-error-handling.test.ts src/lib/saju/chat-stream-failure-regression.test.ts src/lib/saju/chat-room-error-recovery.test.ts`
  - 에러 핸들링 helper 부재, `toTextStreamResponse` 사용, `TextStreamChatTransport` 사용, 빈 assistant 저장/차감 방지 부재로 실패 확인.
- 구현 후 통과:
  - 같은 타깃 테스트 3개 파일 8개 테스트 통과.
- `./node_modules/.bin/tsc --noEmit`: 통과.
- 최종 검증:
  - `pnpm test`: 28개 파일 80개 테스트 통과.
  - `pnpm lint`: 통과.
  - `pnpm build`: 통과.
  - `git diff --check`: 통과.
  - `toTextStreamResponse`, `TextStreamChatTransport` 위험 패턴은 금지 assertion 테스트 안에서만 발견됨.

## 수정 파일

- `src/lib/ai/chat-error-handling.ts`
- `src/lib/ai/chat-error-handling.test.ts`
- `src/lib/saju/chat-stream-failure-regression.test.ts`
- `src/app/api/saju/chat/route.ts`
- `src/components/saju/chat/ChatRoom.tsx`
