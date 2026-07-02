# 실사용 QA Gemini한도 응답검증

- 일시: 2026-07-02 23:27:36 KST

## 요청

- 실제로 제대로 작동하고 제대로 응답하는지 QA.
- 지금까지 나온 내용을 문서화하고 메모리에 저장.

## 사용한 스킬

- `powerqa`: 테스트, lint, env, build 게이트 확인.
- `playwright`: 실제 브라우저 화면 스모크와 입력 흐름 확인.
- `memory`: QA 결과와 학습 내용을 `.codex/memory`에 저장.

## 품질 게이트

- `pnpm test`: pnpm 11의 `allowBuilds` 설정 미확정으로 실행 전 install 검사가 실패했다.
  - 메시지: `Ignored build scripts: @parcel/watcher, @swc/core, esbuild, sharp, unrs-resolver`
  - 코드 실패가 아니라 pnpm 실행 환경/정책 문제로 분리했다.
- 로컬 바이너리 직접 검증:
  - `./node_modules/.bin/vitest run`: 통과, 35개 파일 / 110개 테스트.
  - `./node_modules/.bin/eslint`: 통과.
  - `node scripts/check-env.js`: 통과.
  - `./node_modules/.bin/next build`: 샌드박스에서는 Turbopack 포트 바인딩 권한 문제로 실패했지만, 권한 상승 환경에서 통과.

## 실제 API QA

- 임시 Supabase QA 유저, reading, 별 3개를 생성했다.
- 인증 쿠키를 만들어 `/api/saju/chat`에 실제 POST 요청을 보냈다.
- 요청 고민: `이직을 고민 중인데 올해 움직여도 괜찮을지 현실적으로 봐줘.`
- 응답:
  - status `200`
  - content-type `text/event-stream`
  - body length `111`
  - 응답 내용은 실제 상담이 아니라 `지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.`
- DB/과금 확인:
  - `saju_chat_messages` 저장 0건.
  - assistant 저장 없음.
  - `user_stars.balance` 3 유지.
  - `saju_readings.chat_used` 0 유지.
- 판단:
  - 이전의 빈 `200 OK`는 재발하지 않았다.
  - provider 실패가 사용자에게 보이는 메시지로 전달된다.
  - 실패 상태에서 메시지 저장, 별 차감, chat_used 증가가 모두 막힌다.
  - 단, 현재 환경에서는 Gemini quota 초과로 실제 상담 답변 생성은 불가하다.

## 실제 Gemini 첫 상담 QA

- `node scripts/qa-gemini-first-consultation.mjs` 실행.
- 결과: 실패 보고서 생성.
- 보고서: `docs/qa/gemini-first-consultation-qa-2026-07-02-failed.md`
- 실패 원인:
  - `generate_content_free_tier_requests` quota 초과.
  - `gemini-2.5-flash-lite` free tier limit 20 초과.

## 실제 화면 QA

- `/ko`:
  - 페이지 제목 `월간사주 - 먼저 챙겨주는 사주친구` 정상.
  - 로그인, 무료 3회, 캐릭터 카드, 무료 맛보기, 가격표, 후기 영역 노출 정상.
  - 콘솔은 React DevTools/HMR 개발 로그만 확인.
- `/ko/reading`:
  - 1/2 생년월일 입력 화면 정상 노출.
  - 이름, 연도, 월, 일, 성별 입력 후 `다음` 클릭 정상.
  - 2/2 고민 선택 화면으로 전환 정상.
  - `이직/퇴사` 선택 후 비로그인 분석 시작 시 `로그인이 필요합니다.` 노출 정상.
  - 콘솔은 React DevTools/HMR/Fast Refresh 개발 로그만 확인.

## 정리

- 임시 Supabase QA 유저, reading, 채팅 메시지, 별 데이터는 스크립트 finally에서 삭제 완료.
- API 에러 응답/과금 방어는 정상.
- 실제 상담 생성은 현재 Gemini quota 때문에 통과하지 못했다.

## 릴리즈 판단

- 앱의 실패 처리 품질은 이전보다 좋아졌다.
- 하지만 “실제 상담 답변을 생성해서 사용자가 받는가” 기준은 현재 실패다.
- 운영 전에는 Gemini billing/quota 또는 대체 모델/키를 정리한 뒤, 같은 실사용 QA를 다시 돌려야 한다.
