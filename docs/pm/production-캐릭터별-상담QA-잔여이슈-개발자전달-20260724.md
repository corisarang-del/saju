# production 캐릭터별 상담 QA 잔여이슈 개발자 전달

- 작성 시각: 2026-07-24 17:42:19 KST
- 대상 URL: `https://monthlysaju.vercel.app/`
- 요청: 실제 접속 후 상담이 되는지, 상담 내용/대화가 어렵지 않은지, 말투가 적절한지, 캐릭터마다 본인 분야에 맞게 답하는지 QA
- 범위: production 실사용 QA 결과 문서화. 코드 수정 없음.

## 결론

production 기본 상담 기능은 살아 있다. `/`는 `/ko`로 redirect되고, `/ko`는 정상 렌더링되며, 무인증 `/api/saju/chat`은 401 JSON으로 응답한다. 무료/전체 live API QA도 통과했다.

다만 “캐릭터마다 자기 분야에 맞고, 어렵지 않고, 말투까지 적절하다” 기준으로는 전체 합격이 아니다. 인영(`haeun`)은 2회 연속 품질 기준을 실패했고, 도윤(`doyun`)은 1차에서 50초 뒤 503이 발생한 뒤 재시도에서만 통과했다.

## 통과 확인

- `/` -> `/ko` 307 redirect
- `/ko` HTTP 200
- 페이지 title: `월간사주 - 먼저 챙겨주는 사주친구`
- 캐릭터 카드 7개 표시: 현우, 하나, 민준, 인영, 지안, 서준, 도윤
- 무인증 `POST /api/saju/chat`:
  - HTTP 401
  - body: `{"error":"unauthorized","message":"로그인이 필요해."}`
- `/api/analytics/track` 404는 수정됨:
  - `POST /api/analytics/track` HTTP 200
- 비로그인 `/ko/reading` 분석 시작 흐름은 수정됨:
  - `로그인이 필요해.`
  - `입력한 정보는 로그인 후 이어서 쓸 수 있게 주소에 담아둘게.`
  - `Google로 로그인하고 분석 계속하기` CTA 표시
  - CTA 클릭 시 Google 로그인으로 이동하고 redirect URL에 입력값 포함
- 무료 live API QA 통과:
  - `env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - `ok: true`
  - `transactionTypes`: `chat_message:-1:2`
  - `finalBalance`: 2
- 전체 live API QA 3회 연속 통과:
  - `env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs`
  - `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2` 기록 확인

## 캐릭터별 QA 결과

| 캐릭터 | id | 분야 | 결과 | 메모 |
|---|---|---|---|---|
| 현우 | `charon_m` | 종합 사주 | 통과 | 분야/사주근거/오늘 행동/질문 마무리 통과. 단, 48.8초로 느림 |
| 하나 | `charon_f` | 궁합·연애 | 통과 | 관계/연애 톤과 쉬운 말 기준 통과 |
| 민준 | `minjun` | 재물·수입 | 통과 | 돈 흐름/수입/지출 중심 응답 통과 |
| 인영 | `haeun` | 2026 운세·시기 | 실패 | 한자/전문용어 과다, 오늘 행동 부족, 문단/마무리 불안정 |
| 지안 | `jian` | 재회·마음정리 | 통과 | 재회/마음정리 톤 통과 |
| 서준 | `seojun` | 커리어·이직 | 통과 | 커리어 분야 통과. 단, 39.1초로 느림 |
| 도윤 | `doyun` | 사업·창업 | 부분 실패 | 1차 503, 재시도 통과. 간헐 실패 확인 필요 |

## P1. 인영(`haeun`) 상담 품질 미통과

### 증상

인영은 2026 운세·시기 분야 자체는 맞게 답하지만, 답변이 어렵고 기술적으로 느껴진다. 2회 모두 한자/전문용어가 초반에 몰렸고, “오늘 바로 할 행동”이 부족했다.

### 1차 결과

- status: 200
- durationMs: 5596
- 실패 기준:
  - `hasConcreteAction: false`
  - `endsWithQuestion: false`
  - `hasDenseHanja: true`
  - `easyEnough: false`
- preview:

```text
하늘 씨, 2026년 병오(丙午)년의 흐름을 보았는데요. 올해는 하늘 씨의 사주에서 큰 재물운과 함께 변동성이 커지는 시기가 될 것으로 보이네요. 특히 7월은...
```

### 재시도 결과

- status: 200
- durationMs: 6201
- 실패 기준:
  - `paragraphs: 3`
  - `hasConcreteAction: false`
  - `hasDenseHanja: true`
  - `easyEnough: false`
- preview:

```text
하늘 씨, 2026년 병오(丙午)년의 큰 흐름을 함께 살펴볼까요. 올해는 하늘 씨의 일간인 경(庚, 쇠)에 비견(比肩, 동료, 경쟁자)의 기운이 강하게 들어오는 해인데요...
```

### 기대값

- 첫 상담은 2문단 고정
- 첫 200자 안에 한자 병기와 전문용어 과다 노출 금지
- `병오(丙午)`, `경(庚)`, `비견(比肩)`처럼 어려운 표기는 쉬운 말로 풀어쓰기
- 2026년/이번 달/이번 주 흐름을 일반 사용자가 이해하는 말로 설명
- 마지막에는 자연스러운 후속 질문으로 끝내기
- 반드시 오늘 할 수 있는 구체 행동 1개 포함

### 개발자 확인 포인트

- `haeun`/인영 전용 initial analysis prompt가 다른 캐릭터처럼 품질 게이트를 강하게 타는지 확인
- 기존 `getInitialAnalysisPrompt` 계열에 `doctor` 같은 캐릭터별 분기가 있다면, `haeun` 분기도 별도로 추가하는 방향 검토
- 금지 패턴:
  - 초반 한자 병기 2개 이상
  - `비견`, `일간`, `정관`, `병오` 같은 용어를 설명 없이 나열
  - “흐름을 보았는데요” 뒤 전문 풀이문으로 길게 전개
- 품질 게이트에 `haeun` first consultation regression 추가

## P1. 도윤(`doyun`) 상담 생성 간헐 503

### 증상

도윤 사업·창업 상담은 1차 전체 캐릭터 QA에서 약 50초 대기 후 503으로 실패했다. 같은 조건 재시도에서는 200으로 통과했다.

### 1차 결과

- status: 503
- durationMs: 50479
- streamExtracted: false
- savedAssistant: false
- 응답 preview: 없음

### 재시도 결과

- status: 200
- durationMs: 7839
- 분야/말투/쉬운 말/오늘 행동/질문 마무리 통과
- preview:

```text
하늘아, 네 사주를 보니 사업가로서 뚝심 있는 면모가 돋보여. 쇠처럼 강하고 원칙을 지키는 '경(庚)' 일간의 에너지가 사업의 기반을 탄탄하게 잡아줄 거야...
```

### 기대값

- 사용자가 50초 기다린 뒤 503만 받는 상황은 없어야 한다.
- 모델 생성 실패 시 사용자 친화적인 fallback 또는 짧은 재시도 경로가 필요하다.
- 실패한 요청에서 별 차감, 채팅 저장, 거래 로그가 꼬이지 않아야 한다.

### 개발자 확인 포인트

- Vercel function timeout, Gemini/Vertex timeout, streaming 중단 로그 확인
- `doyun` prompt가 다른 캐릭터보다 생성 지연/실패를 유발하는지 확인
- 503 발생 시 requestId와 provider error를 서버 로그에 남기는지 확인
- 1회 자동 재시도 또는 안전 fallback 적용 가능성 검토
- QA에서 같은 캐릭터를 최소 3회 반복해 간헐 실패율 확인

## P2. 일부 정상 응답도 응답 시간이 길다

### 관찰값

- 현우(`charon_m`): 48760ms
- 서준(`seojun`): 39066ms
- 도윤(`doyun`) 실패 케이스: 50479ms
- 하나(`charon_f`): 21373ms
- 민준(`minjun`): 18116ms
- 지안(`jian`): 22197ms

### 영향

답변 내용이 통과하더라도 30~50초 대기는 실사용에서 이탈을 만들 수 있다. 특히 첫 상담은 사용자가 서비스 신뢰도를 판단하는 구간이라 체감 속도가 중요하다.

### 개발자 확인 포인트

- 캐릭터별 prompt 길이와 provider latency 비교
- 스트리밍 첫 토큰 시간 측정
- 긴 응답 생성 전 loading copy/timeout copy가 충분히 안심되는지 확인
- 목표: 첫 의미 있는 응답은 15초 안쪽, 전체 완료는 30초 안쪽 권장

## P2. 캐릭터별 시작 문장이 반복적으로 느껴진다

### 증상

하나, 민준, 서준 등 여러 캐릭터에서 시작 문장이 비슷한 구조로 반복된다.

예시 패턴:

```text
지금은 ... 확인하고 싶은 마음이 큰 시기예요. 사주 흐름으로 보면 당장 결론을 정하기보다...
```

### 영향

분야 키워드는 맞지만 캐릭터가 진짜 다르게 상담한다는 느낌이 약해진다. 무료 베타 기본 기능으로는 통과 가능하지만, 유료 상담 전환 기준에서는 캐릭터 가치가 흐려진다.

### 기대값

- 현우: 종합 정리형, 친한 사주친구 톤
- 하나: 관계 감정과 상대방 맥락 중심
- 민준: 돈 흐름, 지출/수입 행동 중심
- 인영: 시기/월별 흐름을 쉬운 말로 압축
- 지안: 재회/마음정리, 감정 안정 중심
- 서준: 커리어 판단, 선택지 정리 중심
- 도윤: 사업/창업 리스크와 실행 판단 중심

## 권장 재검증

기존 core flow:

```bash
env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

캐릭터별 회귀 기준:

- 7개 캐릭터 각각 3회 이상 호출
- status는 모두 200
- 저장된 assistant message 존재
- 별 차감 정상
- 첫 응답 200자 안에 한자/전문용어 과다 없음
- 2문단 유지
- 오늘 할 행동 1개 포함
- 질문으로 마무리
- 캐릭터 분야 키워드가 실제 답변의 중심에 있음
- 동일한 시작 문장 반복 감소

현재 캐릭터별 QA는 임시 Node 실행으로 수행했고 repo에 QA 스크립트를 추가하지 않았다. 개발자가 수정할 때는 `LIVE_TEST=true` 또는 `RUN_EXPENSIVE=1` 같은 env gate 뒤에 production-like 캐릭터별 regression 스크립트를 정식으로 추가하는 걸 권장한다.
