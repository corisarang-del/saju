# 수정후 실사용 QA Supabase live API 통과

- 작성 시각: 2026-07-24 01:00:19 KST
- 역할: 테스터 QA
- 요청: 개발자 수정 후 실제로 제대로 작동하고 제대로 응답하는지 재검증하고, 결과를 문서화/메모리 저장

## 결론

이번 재검증에서는 이전 blocker였던 Supabase DNS 문제가 사라졌고, 실제 인증 사용자 기반 무료/전체 live API QA가 모두 통과했다.

코드 게이트, 빌드, env 검사, Gemini 첫 상담 실제 응답 QA, 랜딩/코인샵/입력 페이지 HTTP 응답, OAuth 시작, Playwright 렌더링, 무인증 API 보호까지 확인했다.

배포 전 남은 관찰 포인트는 `pnpm` 래퍼의 `fetch failed`와 Gemini 첫 상담 생성 지연/재시도다.

## 통과한 항목

- Supabase host 연결:
  - `curl -sf -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health`
  - 결과: DNS 해석 성공, Supabase gateway 응답 확인
  - `-sf` 기준 exit code는 401 때문에 실패지만, 이전 `ENOTFOUND`는 재현되지 않음
- 전체 테스트 직접 실행:
  - 명령: `./node_modules/.bin/vitest run`
  - 결과: 53개 파일 / 218개 테스트 통과
- lint 직접 실행:
  - 명령: `./node_modules/.bin/eslint`
  - 결과: 통과
- env 검사 직접 실행:
  - 명령: `node scripts/check-env.js`
  - 결과: 필수 환경변수 검사 통과
- production build 직접 실행:
  - 명령: `./node_modules/.bin/next build`
  - 결과: Next.js 16.2.11 기준 build 통과
- Gemini 첫 상담 실제 응답 QA:
  - 명령: `node scripts/qa-gemini-first-consultation.mjs`
  - 결과: 6케이스 모두 통과
  - 리포트: `docs/qa/gemini-first-consultation-qa-2026-07-23.md`
  - 생성 시각은 UTC 기준 `2026-07-23T15:57:38.274Z`이며 KST로는 2026-07-24 실행분이다.
- 무료 live API QA:
  - 명령: `env QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - 결과: 통과
  - 실제 생성 user: `a280799a-ccd9-4c45-967f-50a507ef2670`
  - reading: `b2dcdd79-6ddf-4f88-8829-62c5d746b445`
  - 첫 상담 스트림 추출: 성공
  - 최종 별 잔액: 2
  - 거래 로그: `chat_message:-1:2`
- 전체 live API QA:
  - 명령: `node scripts/qa-live-api-check.mjs`
  - 결과: 통과
  - 실제 생성 user: `2713f478-3273-44b1-b98d-e5ff99ee3e35`
  - report reading: `16450c43-b398-49f5-bb73-b08ee8b0dfa4`
  - paid reading: `864e455f-5b90-4d37-b88f-e95190a4ae46`
  - free reading: `c277cfbc-829f-47b1-b6c7-269f3b06917a`
  - paid/free 첫 상담 스트림 추출: 성공
  - 최종 별 잔액: 2
  - 거래 로그: `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2`
- 공개 페이지 HTTP:
  - `/ko`: 200
  - `/ko/coin-shop`: 200
  - `/ko/reading`: 200
- Google OAuth 시작:
  - `/api/auth/google?next=/ko/reading`
  - 결과: Supabase authorize URL로 307 redirect
- 무인증 채팅 API:
  - `POST /api/saju/chat`
  - 결과: 401
  - 본문: `{"error":"unauthorized","message":"로그인이 필요해."}`
  - 이전 plain text `Unauthorized` 문제는 해결됨
- Playwright 렌더링:
  - URL: `http://localhost:3000/ko`
  - title: `월간사주 - 먼저 챙겨주는 사주친구`
  - 콘솔: React DevTools/HMR 안내만 있고 런타임 에러 없음
  - 이전 `기록을저장하고` 띄어쓰기 문제는 `기록을 저장하고`로 해결됨
- 무료 베타 문구:
  - 런타임 화면에서는 `유료 충전과 멤버십은 준비 중이야`, `지금은 무료 상담 베타로 운영 중입니다.`로 노출됨
  - 검색상 남은 결제 문구는 `paymentsEnabled`가 true일 때만 나오는 조건부 분기라 현재 무료 베타 화면에서는 노출되지 않음
- `git diff --check`: 통과

## 관찰된 리스크

### P2. pnpm 래퍼가 `fetch failed`로 불안정함

다음 명령이 이번 라운드에서도 공통으로 `fetch failed`를 반환했다.

- `pnpm test`
- `pnpm lint`
- `pnpm test:env`

같은 검증을 로컬 실행 파일과 node로 직접 돌리면 모두 통과했다. 따라서 앱 코드 실패로 보기는 어렵지만, CI나 릴리즈 게이트가 pnpm 스크립트에 의존한다면 별도 확인이 필요하다.

### P2. Gemini 첫 상담 생성 지연과 재시도 관찰 필요

서버 로그 기준 첫 상담 생성이 길게 걸리는 케이스가 있었다.

- 무료 live API chat: 약 55초
- paid live API chat: 약 110초
- Gemini 6케이스 QA에서도 일부 케이스가 2~3회 시도 후 통과했다.

품질 게이트는 통과하지만, 운영 UX 관점에서는 응답 지연/재시도율을 계속 관찰해야 한다.

## 개발자에게 전달할 요약

- 이전 P1 blocker였던 Supabase DNS/live API 미완료는 이번 QA에서 해소됐다.
- 무료/전체 live API가 실제 Supabase user/reading/transaction 기준으로 통과했다.
- 무인증 채팅 API JSON 오류 응답, 무료 베타 띄어쓰기/문구 문제도 해결 확인했다.
- 남은 이슈는 기능 차단이 아니라 운영 안정성 관찰 항목이다.
  - pnpm 래퍼 `fetch failed`
  - Gemini 응답 지연/재시도

## 다음 QA 권장

1. production 배포 후 실제 Vercel URL에서 `/ko`, OAuth 시작, 무료 live API smoke를 다시 확인한다.
2. Vertex 인증이 Vercel 런타임에서 정상인지 첫 상담 API로 확인한다.
3. Gemini 응답 시간이 60초 이상 걸리는 케이스를 로그/메트릭으로 추적한다.
