# production live QA 상담 잔여이슈 수정후 통과

- 작성 시각: 2026-07-27 23:34:21 KST
- 작업 유형: 커밋/푸시, Vercel production 배포 확인, production live API QA
- 대상 URL: `https://monthlysaju.vercel.app`

## 배포 확인

- 커밋: `f01beba 상담 QA 잔여이슈 보강`
- push 대상: `fork/main`
- Vercel 최신 production deployment: `https://monthlysaju-i1db2v8zv-todocori.vercel.app`
- Vercel 상태: Ready, Production

## 실행한 QA

```bash
env QA_BASE_URL=https://monthlysaju.vercel.app QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs
env QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-live-api-check.mjs
```

## 결과

### free-only

- 결과: 통과
- `ok`: `true`
- userId: `278c1dfb-277f-4db1-ae6e-6816a9834757`
- freeReadingId: `e0cfa6dc-b5e6-4af7-b650-07afb609a57b`
- paragraphs: 2
- endsWithQuestion: true
- hasSaju: true
- hasConcreteAction: true
- hasEmoji: false
- hasLightForeign: false
- hasEnglish: false
- hasMixedAstrology: false
- hasDenseHanjaTerms: false
- mentionsConcern: true
- freeStreamExtracted: true
- freeChatDurationMs: 70288
- finalBalance: 2
- transactionTypes: `chat_message:-1:2`

### full

- 결과: 통과
- `ok`: `true`
- userId: `824154a9-ac48-4d27-bea1-27736e031f13`
- reportReadingId: `700f4d45-f638-449d-ae1a-2ca8ca50a56f`
- paidReadingId: `fd546cdd-e696-442e-87fb-9ead22a711b1`
- freeReadingId: `a39d04e1-fd6d-4286-b29b-29bc79e32059`
- paid paragraphs: 2
- paid endsWithQuestion: true
- paid hasConcreteAction: true
- paidChatDurationMs: 12165
- paidConflictDurationMs: 2986
- freeChatDurationMs: 34332
- finalBalance: 2
- transactionTypes: `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2`

## 판정

이전 production live QA 실패였던 free-only/full 시나리오는 수정 배포 후 둘 다 통과했다. 첫 상담 품질 기준인 2문단, 질문 마무리, 사주 근거, 오늘 행동, 이모지 없음, 영어 없음, 혼합 점술 없음, 한자/전문용어 과다 없음도 통과했다.

다만 free-only 표본에서 `freeChatDurationMs=70288`이 나와 속도는 여전히 P1 관찰 포인트다. full 표본의 paid 응답은 12.2초로 안정적이었지만, 무료 응답은 34.3초였다.
