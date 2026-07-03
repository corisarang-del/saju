# Vertex 실사용 상담응답 QA

- 일시: 2026-07-03 00:39:46 KST

## 요청

- 실제로 제대로 작동하고 제대로 응답하는지 QA.
- 지금까지 나온 내용을 문서화하고 메모리에 저장.

## 사용한 스킬

- `powerqa`: 테스트, lint, env, build 게이트 확인.
- `playwright`: 실제 브라우저 화면과 입력 흐름 확인.
- `memory`: QA 결과와 학습 내용을 `.codex/memory`에 저장.

## 품질 게이트

- `pnpm test`: 통과.
  - 36개 파일 / 118개 테스트.
- `pnpm lint`: 통과.
- `pnpm test:env`: 통과.
- `pnpm build`:
  - 일반 샌드박스에서는 Turbopack의 내부 포트 바인딩 권한 문제로 실패.
  - 권한 상승 환경에서는 통과.
  - Next.js 16.2.9, static pages 14개 생성 완료.

## 서버 상태

- `pnpm dev`로 로컬 Next dev 서버 실행.
- `http://localhost:3000/ko` HEAD 요청 200 OK 확인.
- 현재 AI 환경:
  - `AI_PROVIDER=vertex`
  - `AI_MODEL=gemini-2.5-flash-lite`
  - Vertex 프로젝트 설정 존재.

## 실제 화면 QA

- `/ko`:
  - 페이지 제목 `월간사주 - 먼저 챙겨주는 사주친구` 정상.
  - 랜딩 렌더링 정상.
  - 콘솔은 React DevTools/HMR/Fast Refresh 개발 로그만 확인.
- `/ko/reading`:
  - 1/2 생년월일 입력 화면 정상.
  - 이름, 연도, 월, 일, 성별 입력 정상.
  - `다음` 클릭 후 2/2 고민 선택 화면 전환 정상.
  - `이직/퇴사` 선택 후 비로그인 상태에서 `분석 시작하기` 클릭 시 `로그인이 필요합니다.` 정상 표시.

## 실제 인증 채팅 API QA

- 임시 Supabase QA 유저, reading, 별 3개를 생성했다.
- 인증 쿠키를 만들어 `/api/saju/chat`에 실제 POST 요청을 보냈다.
- 요청 고민: `이직을 고민 중인데 올해 움직여도 괜찮을지 현실적으로 봐줘.`
- 응답:
  - status `200`
  - content-type `text/event-stream`
  - body length `1456`
  - quota 메시지 없음.
  - 이직/커리어 고민 반영 확인.
- DB/과금 확인:
  - `saju_chat_messages`에 user 1건, assistant 1건 저장.
  - assistant content length `691`.
  - `user_stars.balance` 3에서 2로 차감.
  - `saju_readings.chat_used` 1로 증가.
  - title `이직운세` 생성 확인.
- 정리:
  - 임시 QA 유저, reading, 채팅 메시지, 별 데이터는 스크립트 finally에서 삭제 완료.

## 실제 Gemini 첫 상담 5케이스 QA

- `node scripts/qa-gemini-first-consultation.mjs` 실행.
- 성공 보고서 생성: `docs/qa/gemini-first-consultation-qa-2026-07-02.md`
- 요약:
  - 고민 반영: 5/5 통과.
  - 금지 표현 없음: 5/5 통과.
  - 1~3문단: 2/5 통과, 3/5 확인 필요.
  - 다음 질문: 4/5 통과, 1/5 확인 필요.

## 발견한 문제

### P1: 첫 상담 답변 품질 기준 일부 미달

- 5케이스 live QA에서 3개 답변이 4문단으로 생성되어 모바일 첫 상담 기준인 1~3문단을 넘었다.
- 1개 답변은 너무 짧고 다음 질문이 없어 대화 이어가기 기준을 만족하지 못했다.
- 실제 인증 채팅 API 응답에는 불필요한 이모지와 외래어가 섞여 상담형 톤을 해칠 수 있었다.

## 판단

- 이전 Gemini quota 차단 상태는 Vertex 전환 후 해결된 것으로 보인다.
- 실제 상담 생성, DB 저장, 별 차감, chat_used 증가까지 핵심 기능은 정상 작동한다.
- 다만 답변 품질은 완전 통과가 아니며, 첫 상담 프롬프트/후처리에서 문단 수, 다음 질문, 불필요한 이모지와 외래어를 더 강하게 제한해야 한다.
