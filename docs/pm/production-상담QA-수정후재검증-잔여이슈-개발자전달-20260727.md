# production 상담 QA 수정후재검증 잔여이슈 개발자 전달

- 작성 시각: 2026-07-27 23:13:23 KST
- 대상 URL: `https://monthlysaju.vercel.app/`
- 요청: 개발자 수정 후 실제 작동/응답/상담 품질 QA
- 범위: production 실사용 QA, 브라우저 UI, 비로그인 흐름, 인증 live API, 캐릭터별 실제 상담 응답
- 코드 수정: 없음. 문서와 메모리만 작성.

## 결론

production 기본 기능은 살아 있다. 홈, 비로그인 보호, analytics, 비로그인 입력 후 Google 로그인 CTA, Google OAuth 이동은 정상이다.

캐릭터별 최신 초기 프롬프트 경로로 직접 호출한 7명 상담은 모두 HTTP 200, assistant 저장, 별 차감, 2문단, 질문 마무리, 오늘 행동, 한자/전문용어 과다 없음 기준을 통과했다. 직전 인영(`haeun`) 한자/전문용어 문제와 도윤(`doyun`) 503은 이번 표본에서는 재현되지 않았다.

하지만 전체 합격은 아니다. 기존 live QA 스크립트의 무료/전체 시나리오가 모두 실패했고, 7명 캐릭터 상담 응답 시간이 37.9초~52.9초로 너무 길다. 또한 여러 캐릭터 답변이 같은 fallback 문장 구조를 반복해 “캐릭터마다 자기 분야에 맞게 깊게 상담한다”는 느낌은 아직 약하다.

## 통과 항목

### HTTP/API 기본

- `curl -L -I https://monthlysaju.vercel.app/`
  - `/` HTTP 307
  - `location: /ko`
  - `/ko` HTTP 200
  - title: `월간사주 - 먼저 챙겨주는 사주친구`
- 무인증 `POST /api/saju/chat`
  - HTTP 401
  - body: `{"error":"unauthorized","message":"로그인이 필요해."}`
- `POST /api/analytics/track`
  - HTTP 200
  - body: `{"ok":true}`

### 브라우저 홈

Playwright로 `https://monthlysaju.vercel.app/` 접속 확인.

- 카드 7개 표시: 현우, 하나, 민준, 인영, 지안, 서준, 도윤
- 각 카드에 `가입하면 3회 무료`, `1별 = 메시지 1회`, `대화하기` 표시
- 가격 섹션 표시:
  - 별 10개 2,900원
  - 별 30개 9,900원
  - 별 70개 19,900원
  - 별 250개 39,900원
  - 월간 멤버십 준비 중, 50별 사용 예시 표시

### 비로그인 `/ko/reading` 흐름

입력값:

- 이름: 김하늘
- 생년월일: 1994-05-17
- 성별: 여
- 달력: 양력
- 고민: 썸/재회

결과:

- 1/2 입력 화면 정상
- 2/2 고민 선택 화면 정상 전환
- `분석 시작하기` 클릭 후 로그인 CTA 표시
  - `로그인이 필요해.`
  - `입력한 정보는 로그인 후 이어서 쓸 수 있게 주소에 담아둘게.`
  - `Google로 로그인하고 분석 계속하기`
- CTA 클릭 후 Google 로그인 페이지로 이동
- Google URL의 redirect에 `name`, `year=1994`, `month=5`, `day=17`, `hour=unknown`, `gender=female`, `calendar=solar` 포함

### 로컬 회귀 테스트

```bash
./node_modules/.bin/vitest run \
  src/lib/saju/initial-analysis.test.ts \
  src/lib/saju/first-consultation-quality.test.ts \
  src/lib/saju/chat-stream-failure-regression.test.ts \
  src/lib/saju/characters.test.ts \
  src/lib/saju/gemini-first-consultation-qa-runner.test.ts \
  src/lib/saju/live-api-qa-runner.test.ts
```

결과:

- Test Files: 6 passed
- Tests: 48 passed

### 캐릭터별 실제 production 상담

임시 Supabase 인증 사용자로 7명 캐릭터를 각각 호출했다. QA 후 test user/readings/messages/stars/transactions는 cleanup했다.

| 캐릭터 | id | 분야 | HTTP | 저장 | 시간 | 구조 판정 |
|---|---|---|---:|---|---:|---|
| 현우 | `charon_m` | 종합 사주 | 200 | O | 46113ms | 통과 |
| 하나 | `charon_f` | 궁합·연애 | 200 | O | 37985ms | 통과 |
| 민준 | `minjun` | 재물·수입 | 200 | O | 38115ms | 통과 |
| 인영 | `haeun` | 2026 운세·시기 | 200 | O | 52861ms | 통과 |
| 지안 | `jian` | 재회·마음정리 | 200 | O | 49323ms | 통과 |
| 서준 | `seojun` | 커리어·이직 | 200 | O | 51741ms | 통과 |
| 도윤 | `doyun` | 사업·창업 | 200 | O | 45644ms | 통과 |

구조 판정 기준:

- 2문단
- 마지막 문장 질문
- `사주` 근거 포함
- 오늘 할 구체 행동 포함
- 이모지 없음
- 영어 없음
- `별자리 데이터`, `자미두수` 없음
- 첫 200자 한자/전문용어 과다 없음
- 캐릭터 분야 키워드 포함
- 캐릭터 말투 대략 통과

## P1. 기존 live QA 스크립트 무료/전체 시나리오 실패

### 재현 명령

```bash
env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

### free-only 실패 결과

```json
{
  "ok": false,
  "message": "free saved assistant: 마지막 문장이 질문으로 끝나지 않음",
  "extra": {
    "paragraphs": 2,
    "endsWithQuestion": false,
    "hasSaju": true,
    "hasConcreteAction": false,
    "hasEmoji": false,
    "hasLightForeign": false,
    "hasEnglish": false,
    "hasMixedAstrology": false,
    "hasDenseHanjaTerms": false,
    "mentionsConcern": true
  }
}
```

preview:

```text
하늘 씨, 사주를 봤는데요. 하늘 씨의 사주 에너지는 꽤나 균형 잡혀 있어서 웬만한 상황은 잘 헤쳐나가실 수 있는 힘이 있어요. 결단력 있고 책임감 강한, 쇠(金, 쇠 금)처럼 단단한 기운을 가지고 계시거든요. 하지만 지금 관계 흐름을 볼 때...
```

### full 실패 결과

```json
{
  "ok": false,
  "message": "free saved assistant: 마지막 문장이 질문으로 끝나지 않음",
  "extra": {
    "paragraphs": 2,
    "endsWithQuestion": false,
    "hasSaju": true,
    "hasConcreteAction": false,
    "hasDenseHanjaTerms": false,
    "mentionsConcern": true
  }
}
```

preview:

```text
하늘 씨, 사주를 바탕으로 하늘 씨의 현재 관계운과 연애에서 조금 조심하면 좋을 부분들을 먼저 차분히 짚어드릴게요.

사주 흐름으로 볼 때, 하늘 씨는 겉으로는 강하고 단단해 보이지만 속으로는 감정적인 부분을 섬세하게 느끼는 편이거든요...
```

### 원인 추정

`scripts/qa-live-api-check.mjs` 안의 `getInitialAnalysisPrompt("charon_f")`가 현재 앱 코드와 다르다.

현재 스크립트:

```text
내 사주를 바탕으로 지금 관계운과 연애에서 조심할 점을 먼저 차분히 정리해줘.
```

현재 앱 코드의 최신 방향은 `내 정보와 상대방 정보`, `두 사람의 관계와 궁합 흐름`을 포함한다. 즉 기존 live QA 스크립트가 구버전 초기 질문을 보내고 있고, production API는 이 구버전 질문에서 첫 상담 품질 게이트를 안정적으로 보장하지 못한다.

### 개발자 조치

둘 다 필요하다.

- `scripts/qa-live-api-check.mjs`가 초기 프롬프트를 중복 정의하지 말고 `src/lib/saju/initial-analysis.ts`의 source of truth를 사용하게 수정
- production API가 구버전 초기 질문이나 캐시된 클라이언트 요청을 받아도 첫 상담 품질 게이트 또는 fallback을 타게 보강

## P1. 응답 시간이 여전히 너무 느림

### 관찰값

캐릭터별 실제 상담 7회 모두 37초 이상 걸렸다.

- 가장 빠름: 하나 37985ms
- 가장 느림: 인영 52861ms
- 평균 체감: 45초대

### 영향

내용이 구조 기준을 통과해도 사용자는 첫 상담에서 “멈췄나?”라고 느낄 수 있다. 특히 무료 첫 경험과 결제 전환 전 신뢰도에 직접 영향을 준다.

### 개발자 조치

- 첫 토큰 도착 시간과 전체 완료 시간을 분리 측정
- provider timeout/fallback이 실제로 25초 안쪽에 작동하는지 확인
- fallback으로 성공하더라도 40~50초 뒤에 오면 UX상 실패로 봐야 함
- 목표:
  - 첫 의미 있는 표시: 15초 안쪽
  - 전체 저장/완료: 30초 안쪽

## P2. 캐릭터별 답변이 안전 fallback처럼 반복됨

### 증상

7명 중 다수가 같은 구조로 시작한다.

```text
지금은 ...을 차분히 확인하고 싶은 마음이 큰 시기예요.
사주 흐름으로 보면 당장 결론을 정하기보다, 먼저 기준을 세우고 흔들리는 부분을 분리해야 안정되는 흐름이에요.
오늘은 ...을 세 가지로 기록하고...
```

### 예시

현우:

```text
하늘아, 지금은 지금 중요한 흐름과 조심할 점을 차분히 확인하고 싶은 마음이 큰 시기예요.
```

지안:

```text
하늘 씨, 지금은 재회와 마음 정리, 관계의 거리을 차분히 확인하고 싶은 마음이 큰 시기예요.
```

서준:

```text
하늘아, 지금은 일과 회사, 이직 판단을 차분히 확인하고 싶은 마음이 큰 시기예요.
```

도윤:

```text
하늘아, 지금은 사업과 창업, 의사결정의 흐름을 차분히 확인하고 싶은 마음이 큰 시기예요.
```

### 문제

- 현우 문장 `지금은 지금 중요한 흐름`은 어색하다.
- 지안 문장 `관계의 거리을`은 조사 오류다.
- 현우/서준/도윤은 반말 캐릭터인데 `시기예요`, `해보세요`가 섞여 말투가 흐린다.
- 분야 키워드는 맞지만 상담사별 사고방식이 뚜렷하지 않다.
- 민준 응답 preview에는 `아웃풋`이 들어갔다. 현재 자동 검사에는 안 걸렸지만 20대 일반 사용자가 보기 쉬운 한국어 기준에는 덜 맞다.

### 개발자 조치

- fallback을 캐릭터별로 완전히 다른 opening/행동 구조로 분리
- 반말 캐릭터 fallback은 끝까지 반말 유지
- 존댓말 캐릭터 fallback은 끝까지 존댓말 유지
- 조사 오류를 만들 수 있는 fallback 템플릿 조합 제거
- 금지 외래어에 `아웃풋` 추가 검토

## P2. latest live QA와 캐릭터별 QA 기준 불일치

### 현상

- `scripts/qa-live-api-check.mjs`: 실패
- 최신 앱 초기 프롬프트로 직접 7명 호출: 구조 기준 통과

### 영향

개발자와 테스터가 서로 다른 기준으로 합격/불합격을 판단할 수 있다. release gate가 신뢰를 잃는다.

### 개발자 조치

- live QA script와 앱 초기 프롬프트 source of truth 통합
- `charon_f`, `haeun`, `doyun`만 보는 게 아니라 7개 캐릭터 모두 보는 정식 live QA 추가
- live QA 결과에 latency, fallback 여부, provider timeout 여부를 포함

## 재검증 기준

수정 후 다음을 통과해야 한다.

```bash
./node_modules/.bin/vitest run \
  src/lib/saju/initial-analysis.test.ts \
  src/lib/saju/first-consultation-quality.test.ts \
  src/lib/saju/chat-stream-failure-regression.test.ts \
  src/lib/saju/characters.test.ts \
  src/lib/saju/gemini-first-consultation-qa-runner.test.ts \
  src/lib/saju/live-api-qa-runner.test.ts

env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

추가로 production-like 7명 캐릭터 QA를 최소 3회 반복한다.

합격 기준:

- 기존 live QA free/full 모두 `ok: true`
- 7명 캐릭터 모두 HTTP 200
- assistant 저장 O
- 별 차감 정상
- 응답 30초 안쪽
- 2문단
- 마지막 질문
- 오늘 행동 포함
- 한자/전문용어 과다 없음
- 외래어 과다 없음
- 캐릭터별 말투 일관
- fallback처럼 같은 문장 구조 반복 없음
