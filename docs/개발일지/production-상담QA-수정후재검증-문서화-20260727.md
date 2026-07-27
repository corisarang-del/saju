# production 상담 QA 수정후재검증 문서화

- 작성 시각: 2026-07-27 23:13:23 KST
- 작업 유형: QA 재검증, 개발자 전달 문서 작성, 메모리 저장
- 코드 수정: 없음

## 작업 내용

개발자 수정 후 `https://monthlysaju.vercel.app/` production을 다시 실제 QA했다.

확인한 범위:

- HTTP redirect/200
- 무인증 chat API 401
- analytics track API 200
- Playwright 홈 렌더링
- Playwright `/ko/reading` 비로그인 입력 흐름
- Google 로그인 CTA 이동과 redirect query 보존
- 로컬 saju focused regression test
- production 인증 live API free/full 시나리오
- production 인증 7명 캐릭터별 실제 상담 응답

## 결과 요약

기본 사이트와 비로그인 흐름은 정상이다. 캐릭터별 최신 초기 프롬프트 직접 호출은 7명 모두 200/저장/구조 기준을 통과했다.

하지만 전체 합격은 아니다. 기존 `scripts/qa-live-api-check.mjs` free/full 시나리오가 여전히 실패했고, 7명 캐릭터 상담 응답 시간이 37.9초~52.9초로 느리다. 또한 여러 캐릭터가 같은 fallback 문장 구조를 반복해 말투/분야 차별감이 약하다.

## 주요 발견

- 통과: `/` -> `/ko`, `/ko` 200
- 통과: 무인증 chat 401 JSON
- 통과: analytics track 200
- 통과: 비로그인 분석 시작 후 Google 로그인 CTA 표시
- 통과: Google 로그인 URL에 입력값 query 보존
- 통과: focused vitest 6개 파일/48개 테스트
- 통과: 캐릭터별 직접 호출 7명 모두 HTTP 200, assistant 저장
- 실패: `QA_SCENARIO=free-only` live QA
- 실패: full live QA
- 잔여 P1: 응답 시간 37.9초~52.9초
- 잔여 P2: fallback형 반복 문장과 말투 혼합
- 잔여 P2: live QA script와 앱 초기 프롬프트 source of truth 불일치

## 개발자 전달 문서

- `docs/pm/production-상담QA-수정후재검증-잔여이슈-개발자전달-20260727.md`

## 메모리 저장

- `.codex/memory/project.md`
- `.codex/memory/learnings.md`
