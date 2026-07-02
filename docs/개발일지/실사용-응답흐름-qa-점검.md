# 실사용 응답흐름 QA 점검

## 일시

- 2026-07-01 00:48:29 KST

## 요청

- 실제로 제대로 작동하고 제대로 응답하는지 QA.

## 사용한 스킬

- `playwright`: 실제 브라우저에서 랜딩, 캐릭터 선택, 사주 입력 흐름 점검.
- `powerqa`: 검증 게이트와 실패 진단 기준으로 QA 수행.

## 수행한 QA

- 로컬 dev 서버 확인: 기존 `http://localhost:3000` 서버 사용.
- 랜딩 페이지 `/ko` 브라우저 확인.
- 비로그인 캐릭터 카드 클릭 확인.
- 비로그인 사주 입력 `/ko/reading` 1단계/2단계 흐름 확인.
- 미로그인 분석 시작 시 보호 메시지 확인.
- 임시 Supabase QA 유저와 reading을 만들어 인증 API 응답 확인.
- Gemini SDK 직접 호출로 외부 AI 응답 가능 여부 확인.
- QA 후 임시 Supabase 유저, reading, 별 데이터 정리.

## 통과한 항목

- `/ko` 랜딩 렌더링 정상.
- 캐릭터 카드 클릭 시 로그인 유도 패널 노출 정상.
- `/ko/reading` 입력 폼 접근 정상.
- 이름, 생년월일, 성별, 양력 입력 후 고민 선택 단계로 이동 정상.
- 미로그인 상태에서 분석 시작 시 `로그인이 필요합니다.` 메시지 노출.
- `pnpm test`: 통과, 24 files / 68 tests.
- `pnpm lint`: 통과.
- `pnpm test:env`: 통과.
- `pnpm build`: 통과.
- 임시 QA 데이터 정리 완료.

## 발견한 문제

### P1: Gemini 쿼터 초과 시 채팅 API가 200 + 빈 응답을 반환

- `/api/saju/chat`에 인증 쿠키와 유효한 `readingId`를 붙여 실제 요청을 보냈다.
- 응답 status는 `200`, content-type은 `text/plain; charset=utf-8`였지만 body length는 `0`이었다.
- DB의 `saju_chat_messages`에도 사용자 메시지와 assistant 메시지가 저장되지 않았다.
- 서버 로그에는 `[saju/chat] stream error {}`만 남았다.
- 같은 환경변수로 Gemini SDK를 직접 호출하니 `AI_RetryError`가 발생했고 원인은 Gemini free tier quota 초과였다.

## 사용자 영향

- 사용자는 요청이 성공한 것처럼 보이지만 실제 답변이 비어 있을 수 있다.
- 화면에서는 “응답 없음/멈춤”처럼 느껴질 가능성이 높다.
- 운영 로그의 에러 정보가 `{}`라 원인 파악이 늦어진다.

## 추가 관찰

- dev 로그에 캐릭터 이미지 비율 경고와 LCP 이미지 eager 권장 경고가 반복된다.
- 핵심 기능 차단은 아니지만, 이미지 렌더링 품질과 성능 QA에서 별도 개선 후보로 남긴다.
