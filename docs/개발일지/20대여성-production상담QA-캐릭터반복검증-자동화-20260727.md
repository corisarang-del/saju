# 20대 여성 production 상담 QA 캐릭터 반복검증 자동화

- 작성 시각: 2026-07-27 23:52:44 KST
- 작업 유형: QA 자동화, production live QA, 문서화, 메모리 저장
- 참고 문서: `docs/pm/20대-여성-유저관점-production상담QA-수정후-재리뷰-개발자전달-20260727.md`

## 작업 내용

20대 여성 유저 관점 재리뷰에서 요구한 P0/P1 산출물을 개발자가 반복해서 확인할 수 있도록 캐릭터별 production live QA 스크립트를 추가했다.

- `scripts/qa-character-live-check.mjs` 추가
- `package.json`에 `qa:characters:live` 추가
- `scripts/qa-live-api-check.mjs`의 외래어 검사에 `아웃풋` 추가
- `src/lib/saju/live-api-qa-runner.test.ts`에 캐릭터 반복 QA 스크립트 회귀 테스트 추가

새 스크립트는 다음을 확인한다.

- 7개 캐릭터 각각 기본 3회 반복
- HTTP 200
- assistant 저장
- `chat_used` 증가
- 2문단
- 마지막 질문
- 사주 근거
- 오늘 할 행동
- 이모지/영어/혼합 점술/한자 과다/외래어 없음
- `지금은 지금`, `관계의 거리을` 재발 없음
- 반말 캐릭터 존댓말 혼합 없음
- latency summary
- fallback 추정 summary
- 30초 초과 건수

## production live QA 결과

명령:

```bash
env QA_BASE_URL=https://monthlysaju.vercel.app QA_CHARACTER_REPEAT=3 node scripts/qa-character-live-check.mjs
```

총괄:

- 결과: 통과
- total: 21
- passed: 21
- failed: 0
- p50DurationMs: 33238
- p95DurationMs: 46825
- maxDurationMs: 66591
- slowOver30sCount: 13
- fallbackSummary count: 15

캐릭터별:

| 캐릭터 | 통과 | fallback 추정 | 30초 초과 | p50 | p95 | max |
|---|---:|---:|---:|---:|---:|---:|
| 현우 | 3/3 | 3 | 2 | 33238 | 42907 | 42907 |
| 하나 | 3/3 | 2 | 3 | 44222 | 44986 | 44986 |
| 민준 | 3/3 | 1 | 2 | 36352 | 42688 | 42688 |
| 인영 | 3/3 | 3 | 3 | 46825 | 66591 | 66591 |
| 지안 | 3/3 | 2 | 1 | 29037 | 33906 | 33906 |
| 서준 | 3/3 | 1 | 2 | 32401 | 33393 | 33393 |
| 도윤 | 3/3 | 3 | 0 | 22557 | 28769 | 28769 |

## 판정

품질 기준의 P0는 통과했다. 7개 캐릭터 모두 저장된 assistant와 stream assistant가 2문단, 질문 마무리, 오늘 행동, 쉬운 말, 말투 기준을 통과했다.

하지만 P1 속도와 fallback 비율은 아직 닫히지 않았다. 21회 중 13회가 30초를 넘었고, fallback 추정도 15회였다. 특히 인영은 3회 모두 fallback 추정이고 최대 66.6초가 걸렸다. 무료 베타 운영은 가능하지만 유료 오픈은 계속 보류하는 게 맞다.

## 검증

- `./node_modules/.bin/tsc --noEmit` 통과
- `./node_modules/.bin/vitest run` 통과: 58 files, 275 tests
- `./node_modules/.bin/eslint .` 통과
- `node --check scripts/qa-character-live-check.mjs` 통과
- `git diff --check` 통과
- `./node_modules/.bin/next build` 통과
