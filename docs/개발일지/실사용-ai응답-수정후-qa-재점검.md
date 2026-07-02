# 실사용 AI응답 수정후 QA 재점검

- 일시: 2026-07-01 01:03:28 KST

## 요청

- 개발자가 빈 AI 응답 문제를 수정한 뒤 실제로 제대로 작동하고 제대로 응답하는지 QA.
- 지금까지 나온 내용을 문서화하고 메모리에 저장.

## 사용한 스킬

- `playwright`: 실제 브라우저 스모크 확인.
- `powerqa`: 테스트, lint, env, build 게이트 재검증.
- `memory`: QA 결과와 학습 내용을 `.codex/memory`에 저장.

## 재검증 대상

- 이전 P1: Gemini quota/provider 실패 상황에서 `/api/saju/chat`이 `200 OK`와 빈 body를 반환할 수 있던 문제.
- 개발자 수정 내용:
  - `/api/saju/chat`이 `toUIMessageStreamResponse({ onError })`를 사용.
  - provider 에러를 사용자용 메시지로 변환.
  - 빈 assistant 응답이면 메시지 저장과 별 차감을 건너뜀.
  - 관련 회귀 테스트 추가.

## 품질 게이트

- `pnpm test`: 통과. 28개 파일, 80개 테스트 통과.
- `pnpm lint`: 통과.
- `pnpm test:env`: 통과.
- `pnpm build`: 통과.

## 실제 API QA

- 임시 Supabase QA 유저, reading, 별 3개를 만들고 인증 쿠키를 붙여 `/api/saju/chat`에 실제 요청을 보냈다.
- 요청 고민: `이직을 고민 중인데 올해 움직여도 괜찮을지 현실적으로 봐줘.`
- 응답:
  - status `200`
  - content-type `text/event-stream`
  - body length `1917`
  - 빈 응답 아님.
  - 이직/커리어 고민을 반영한 실제 AI 답변 확인.
  - quota 안내 문구가 아니라 정상 상담 응답 확인.
- DB 확인:
  - `saju_chat_messages`에 user 메시지 1개와 assistant 메시지 1개 저장 확인.
  - assistant 메시지 길이 약 1003자로 빈 문자열이 아님.
  - `user_stars.balance`가 3에서 2로 차감 확인.

## 실제 화면 스모크 QA

- `/ko` 랜딩 브라우저 확인:
  - 제목 `월간사주 - 먼저 챙겨주는 사주친구` 정상.
  - 캐릭터 카드, 무료 맛보기, 가격, 후기 영역 노출 정상.
  - 콘솔은 React DevTools/HMR 개발 로그만 확인.
- `/ko/reading` 브라우저 확인:
  - 생년월일 입력 1/2 단계 정상 노출.
  - 이름, 태어난 연도/월/일, 태어난 시간, 성별, 달력 구분, 다음 버튼 노출 확인.
  - 콘솔은 React DevTools/HMR 개발 로그만 확인.
- 독립 headless Playwright 스크립트는 로컬 브라우저 바이너리 부재와 시스템 Chrome SIGABRT로 끝까지 실행하지 못했다.

## 정리

- 임시 Supabase QA 유저, reading, 채팅 메시지, 별 잔액 데이터 삭제 완료.
- `/tmp/saju-qa-session.json` 임시 세션 파일 삭제 완료.

## 판단

- 이전 빈 AI 응답 P1은 정상 응답 케이스 기준 해결 확인.
- 현재 릴리즈 차단 수준의 재발 증거는 없다.
- 남은 리스크는 provider quota/rate-limit를 실제로 강제로 재현하는 live failure 테스트가 별도 필요하다는 점이다.
