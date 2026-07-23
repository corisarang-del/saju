# production 상담 QA 문제점 개발자 전달

- 작성 시각: 2026-07-24 02:12:05 KST
- 대상 URL: `https://monthlysaju.vercel.app/`
- 요청: 배포 후 실제 상담 동작, 상담 내용, 대화 말투 적절성 분석 QA에서 나온 문제를 개발자가 고칠 수 있게 정리
- 범위: 코드 수정 없음, 배포 사이트 실사용 QA 결과 문서화

## 요약

상담 기능 자체는 production에서 작동한다. 무료 상담 live QA는 통과했고, 전체 live QA도 재실행 기준 통과했다.

다만 아래 4개는 개발자 수정 또는 운영 확인이 필요하다.

1. `P1` paid 동시 상담 요청이 간헐적으로 `409 lock conflict`가 아니라 `503 chat_generation_failed`로 실패한다.
2. `P2` 브라우저 콘솔에 `/api/analytics/track` 404가 남는다.
3. `P2` 상담 응답이 기준은 통과하지만 한자/전문용어가 많고 `별자리 데이터` 표현이 섞여 20대 일반 사용자에게 무겁게 읽힌다.
4. `P2` 비로그인 상태에서 분석 시작 시 `로그인이 필요합니다.`만 보여 다음 행동 CTA가 약하다.

## QA에서 통과한 항목

- `/`는 `/ko`로 307 redirect
- `/ko`는 200
- `/ko/reading`은 200
- `/ko/coin-shop`은 200
- `/api/auth/google?next=/ko/reading`은 Supabase authorize URL로 307 redirect
- 무인증 `POST /api/saju/chat`은 401 JSON 응답
  - body: `{"error":"unauthorized","message":"로그인이 필요해."}`
- 무료 live API QA 통과
  - 명령: `env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - 결과: `ok: true`
  - `freeChatDurationMs`: 26468
  - `transactionTypes`: `chat_message:-1:2`
  - `finalBalance`: 2
- 전체 live API QA는 재실행 기준 통과
  - 명령: `env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs`
  - 재실행 결과: `ok: true`
  - `paidChatDurationMs`: 18286
  - `paidConflictDurationMs`: 2085
  - `freeChatDurationMs`: 9302
  - `transactionTypes`: `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2`
  - `finalBalance`: 2
- Playwright 기준 랜딩/입력 화면 렌더링 정상
- `/ko/reading` 입력 폼 1단계에서 이름, 생년월일, 성별, 양력 입력 후 2단계로 전환됨

## P1. paid 동시 상담 요청이 간헐적으로 503으로 실패

### 재현

```bash
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

### 기대값

paid reading에 같은 payload로 동시 요청 2개가 들어가면 하나는 200, 하나는 409 lock conflict가 되어야 한다.

### 실제값

첫 실행에서 다음처럼 실패했다.

```json
{
  "ok": false,
  "message": "Paid concurrent chat did not return one success and one lock conflict",
  "extra": {
    "statuses": [200, 503],
    "bodies": [
      "data: {\"type\":\"start\",\"messageId\":\"KbBAJbn0YZAmCUhk\"}...",
      "{\"error\":\"chat_generation_failed\",\"message\":\"분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘.\",\"requestId\":\"a60d1bf8-ecb0-4a3d-b6f5-ee965a5\"..."
    ]
  }
}
```

재실행에서는 통과했다. 그래서 항상 실패하는 버그는 아니지만, production에서 간헐적으로 사용자가 503을 볼 수 있는 상태다.

### 개발자 확인 포인트

- requestId `a60d1bf8-ecb0-4a3d-b6f5-ee965a5`의 Vercel/Supabase/Gemini 로그 확인
- 동시 요청 두 번째가 AI 생성까지 가지 않고 즉시 409로 빠지는지 확인
- chat lock 획득 시점이 production latency에서 충분히 빠른지 확인
- Gemini 생성 실패가 lock conflict 응답으로 오인되지 않게 오류 분기 확인
- 사용자가 더블클릭/중복 제출했을 때 버튼 disabled와 서버 lock이 같이 작동하는지 확인

### 권장 테스트

- 같은 readingId로 동시 `POST /api/saju/chat` 2개를 보냈을 때 항상 `200 + 409`인지 regression test 추가
- production-like latency에서 lock 선점이 깨지지 않는지 integration test 추가
- 503이 발생해도 별 차감/채팅 저장/거래 로그가 꼬이지 않는지 확인

## P2. `/api/analytics/track` 404 콘솔 에러

### 재현

```bash
/Users/apple/.codex/skills/playwright/scripts/playwright_cli.sh open https://monthlysaju.vercel.app/ --headed
```

브라우저 콘솔:

```text
Failed to load resource: the server responded with a status of 404 () @ https://monthlysaju.vercel.app/api/analytics/track
```

HTTP 재확인:

```bash
curl -s -D - -o /tmp/monthlysaju-analytics-track.txt \
  -X POST https://monthlysaju.vercel.app/api/analytics/track \
  -H 'Content-Type: application/json' \
  --data '{"event":"qa_test"}'
```

결과: 404

### 기대값

- analytics를 쓸 거면 `/api/analytics/track` route가 200/204로 조용히 처리되어야 한다.
- analytics를 안 쓸 거면 client 호출 자체가 비활성화되어 콘솔 에러가 없어야 한다.

### 영향

사용자 기능은 깨지지 않지만 production 첫 화면 콘솔에 에러가 남는다. QA/운영 모니터링에서 실제 장애와 잡음을 구분하기 어려워진다.

## P2. 상담 말투가 통과 기준은 만족하지만 전문용어가 무거움

### QA 결과

무료 상담 응답은 자동 품질 기준을 통과했다.

- 2문단
- 질문으로 종료
- 사주 근거 있음
- 오늘 할 행동 있음
- 이모지 없음
- 영어 없음
- 가벼운 외래어 없음
- 사용자 고민 반영

### 실제 preview 예시

```text
하늘 씨, 사주와 별자리 데이터를 보니 지금 두 분의 관계에서 조금 더 신중하게 살펴보면 좋을 부분들이 보이네요. 특히, 2026년 丙午(병오, 불)년에는 하늘 씨의 사주에 화(火) 기운이 강하게 들어와서...
```

### 문제

- `사주와 별자리 데이터`는 서비스 정체성과 섞여 보인다. 이 서비스는 사주 상담 중심이므로 별자리 표현은 빼는 게 자연스럽다.
- `丙午`, `화(火)`, `정관(正官)` 같은 한자/전문용어가 초반에 몰리면 20대 일반 사용자에게 딱딱하게 느껴질 수 있다.
- 상담 톤은 차분하지만, “내 고민을 쉽게 정리해주는 친구”보다는 “전문 풀이문”에 가까워지는 순간이 있다.

### 기대 말투

- 한자는 가능하면 쓰지 않거나 1개 이하로 제한
- 전문용어는 바로 쉬운 말로 바꾸기
- 첫 문단은 고민 공감과 현재 흐름 중심
- 두 번째 문단은 오늘 할 행동과 자연스러운 후속 질문 중심
- `별자리 데이터`, `자미두수`, 과도한 한자 병기 같은 혼합 체계 표현 금지

### 권장 테스트

- Gemini QA 게이트에 금지 표현 추가
  - `별자리 데이터`
  - `자미두수`
  - 과도한 한자 패턴
- 응답 preview 200자 안에 한자/괄호 전문용어가 2개 이상 나오면 실패시키는 기준 검토

## P2. 비로그인 분석 시작 후 CTA가 약함

### 재현

1. `https://monthlysaju.vercel.app/ko/reading` 접속
2. 이름/생년월일/성별/양력 입력
3. 2단계에서 `썸/재회` 선택
4. `분석 시작하기` 클릭

### 실제값

화면에 `로그인이 필요합니다.` 안내만 보인다.

### 기대값

비로그인 사용자가 분석 시작을 눌렀다면 즉시 다음 행동을 알 수 있어야 한다.

- Google 로그인 버튼 표시
- 로그인 후 `/ko/reading` 또는 진행 중 입력 상태로 돌아갈 수 있는 안내
- 입력값이 사라질 수 있다면 사전 안내

### 영향

상담 생성 API 보호는 정상이다. 하지만 사용자는 “그래서 어디를 눌러야 하지?”라고 느낄 수 있다. 특히 모바일에서는 로그인 버튼이 화면 바깥에 있으면 이탈 가능성이 있다.

## 수정 완료 후 재검증 체크리스트

```bash
# analytics 404 제거 확인
/Users/apple/.codex/skills/playwright/scripts/playwright_cli.sh open https://monthlysaju.vercel.app/ --headed

# 무료 상담 실제 QA
env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs

# 전체 상담 실제 QA, 최소 3회 반복 권장
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

합격 기준:

- 콘솔 에러 0개
- 전체 live API 3회 연속 통과
- paid 동시 상담은 항상 `200 + 409`
- 503 `chat_generation_failed` 재현 없음
- 첫 상담 응답에 `별자리 데이터` 없음
- 첫 200자 안에 한자/전문용어 과다 노출 없음
- 비로그인 분석 시작 후 로그인 CTA가 명확함
