# production 캐릭터별 상담 QA 잔여이슈 문서화

- 작성 시각: 2026-07-24 17:42:19 KST
- 작업 유형: QA 결과 문서화, 메모리 저장
- 코드 수정: 없음

## 작업 내용

production `https://monthlysaju.vercel.app/`에서 수행한 캐릭터별 상담 QA 결과를 개발자 전달 문서로 정리했다.

새 문서:

- `docs/pm/production-캐릭터별-상담QA-잔여이슈-개발자전달-20260724.md`

메모리 업데이트:

- `.codex/memory/project.md`
- `.codex/memory/learnings.md`

프롬프트 기록:

- `docs/프롬프트/production-캐릭터별-상담QA-잔여이슈-문서화-메모리저장-요청-20260724.md`

## QA 결론

기본 production 상담 기능은 정상이다. 무료 live API와 전체 live API 3회 반복은 통과했고, analytics 404와 비로그인 분석 시작 CTA 이슈도 수정 확인됐다.

캐릭터별 상담 품질 기준에서는 전체 합격이 아니다. 인영(`haeun`)이 2회 연속 쉬운 말/한자 과다/오늘 행동 기준을 실패했고, 도윤(`doyun`)은 1차에서 50초 뒤 503으로 실패한 뒤 재시도에서 통과했다.

## 개발자에게 넘긴 핵심 이슈

1. `P1` 인영(`haeun`) 첫 상담 품질 미통과
   - 2026 운세·시기 분야는 맞지만 `병오(丙午)`, `경(庚)`, `비견(比肩)` 등 한자/전문용어가 초반에 몰림
   - 오늘 할 행동이 부족하고 문단 수/질문 마무리가 불안정함
   - `haeun` 전용 initial analysis prompt와 품질 게이트 regression 필요

2. `P1` 도윤(`doyun`) 상담 생성 간헐 503
   - 1차 QA에서 status 503, durationMs 50479
   - 재시도에서는 status 200, durationMs 7839로 통과
   - Vercel/Gemini timeout, provider error logging, fallback/retry 필요

3. `P2` 상담 응답 시간이 긴 캐릭터 존재
   - 현우 48760ms
   - 서준 39066ms
   - 도윤 실패 케이스 50479ms
   - 첫 의미 있는 응답 15초 안쪽, 전체 완료 30초 안쪽을 목표로 제안

4. `P2` 캐릭터별 시작 문장 반복감
   - 하나/민준/서준 일부 응답이 `지금은 ... 확인하고 싶은 마음이 큰 시기예요` 계열로 반복됨
   - 캐릭터별 분야 키워드는 맞지만 유료 전환 기준에서는 차별감 보강 필요

## 검증 근거

- production URL: `https://monthlysaju.vercel.app/`
- `/` -> `/ko` redirect 확인
- `/ko` title: `월간사주 - 먼저 챙겨주는 사주친구`
- 캐릭터 카드 7개 확인: 현우, 하나, 민준, 인영, 지안, 서준, 도윤
- 무인증 `/api/saju/chat` 401 JSON 확인
- `/api/analytics/track` HTTP 200 확인
- 비로그인 `/ko/reading` 분석 시작 후 Google 로그인 CTA 표시 확인
- `scripts/qa-live-api-check.mjs` production 무료/전체 시나리오 통과 확인
- 캐릭터별 QA는 임시 Node 실행으로 수행했고 repo 파일은 추가하지 않음

## 다음 확인 기준

개발자 수정 후에는 7개 캐릭터 각각 최소 3회 이상 production-like QA를 반복해야 한다. 특히 인영은 첫 200자 안 한자/전문용어 과다, 2문단 유지, 오늘 행동 포함, 질문 마무리를 반드시 통과해야 한다. 도윤은 503이 재현되지 않는지 반복 호출로 확인해야 한다.
