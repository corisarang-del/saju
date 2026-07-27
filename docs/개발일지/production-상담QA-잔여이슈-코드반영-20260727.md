# production 상담 QA 잔여이슈 코드반영

- 작성 시각: 2026-07-27 23:25:35 KST
- 작업 유형: production 상담 QA 잔여이슈 수정, 회귀 테스트 보강
- 참고 문서: `docs/pm/production-상담QA-수정후재검증-잔여이슈-개발자전달-20260727.md`

## 작업 내용

production 재검증에서 남은 live QA 실패 원인을 기준으로 상담 첫 응답 경로를 보강했다.

- `scripts/qa-live-api-check.mjs`의 중복 초기 프롬프트를 제거하고 `src/lib/saju/initial-analysis-prompts.mjs` 공용 소스를 import하게 했다.
- 하나(`charon_f`) 초기 질문은 `내 정보와 상대방 정보`, `두 사람의 관계와 궁합 흐름`을 포함하는 최신 문구로 통일했다.
- `/api/saju/chat`은 첫 assistant turn이면 구버전 질문이나 캐시된 클라이언트 질문도 첫 상담 품질 게이트와 fallback 경로를 타게 했다.
- 캐릭터별 안전 fallback 문장을 분리해 현우/민준/서준/도윤 반말 캐릭터의 존댓말 혼합과 반복 opening을 줄였다.
- `지금은 지금`, `관계의 거리을` 같은 문장 오류가 재발하지 않도록 fallback 회귀 테스트를 추가했다.
- 쉬운 말 기준에서 `아웃풋`을 차단 외래어 목록에 추가했다.

## 검증

- `./node_modules/.bin/tsc --noEmit` 통과
- `./node_modules/.bin/vitest run` 통과: 58 files, 274 tests
- `./node_modules/.bin/eslint .` 통과
- `git diff --check` 통과
- `./node_modules/.bin/next build` 통과

## 주의

- `pnpm build` 래퍼는 기존 관찰 포인트와 동일하게 `fetch failed`로 실패했다. 앱 빌드 자체는 Next 직접 실행으로 통과했다.
- production live QA는 이번 로컬 수정이 배포된 뒤 다시 돌려야 의미가 있다.
