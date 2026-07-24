# Vercel Paddle price env 업데이트 signed webhook QA 차단

## 시도한 작업
- `.vercel/project.json`에서 Vercel project 연결을 확인했다.
  - project: `monthlysaju`
  - projectId: `prj_hoPchkeS8llgYuho7Cwb4qVmjcnW`
  - orgId: `team_r9PU4uNe4a1AJ4ilkj5AVz5j`
- `pnpm dlx vercel env ls production`으로 production env 목록을 확인했다.
- `QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-paddle-webhook-check.mjs`로 signed webhook QA를 production endpoint 대상으로 실행했다.

## 확인 결과
- Vercel production env에는 Paddle 필수 env가 아직 등록되어 있지 않았다.
  - `PADDLE_API_KEY`
  - `PADDLE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
  - `NEXT_PUBLIC_PADDLE_ENVIRONMENT`
  - `NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10`
  - `NEXT_PUBLIC_PADDLE_PRICE_STAR_10`
  - `NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP`
  - `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP`
- 로컬 `.env.local`에는 `PADDLE_API_KEY`가 placeholder라 Paddle API 조회가 `authentication_malformed`로 실패했다.
- signed webhook QA는 아래 env 누락으로 실행 전 차단됐다.
  - `NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10`
  - `NEXT_PUBLIC_PADDLE_PRICE_STAR_10`
  - `NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP`
  - `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP`

## 필요한 다음 입력
- Paddle sandbox 기준 실제 값이 필요하다.
  - 2,900원 스타터 product id
  - 2,900원 스타터 price id
  - 9,900원/50별 멤버십 product id
  - 9,900원/50별 멤버십 price id
- 또는 실제 `PADDLE_API_KEY`를 제공하면 Paddle API에서 해당 price/product id를 조회해 Vercel env에 반영할 수 있다.

## 다음 실행 명령 기준
- Vercel env 등록 후:
  - `QA_BASE_URL=https://monthlysaju.vercel.app node scripts/qa-paddle-webhook-check.mjs`
- QA 통과 조건:
  - 무서명 transaction webhook은 401.
  - signed `transaction.payment_failed`는 200이고 별 잔액 변화 없음.
  - signed `transaction.completed`는 200이고 `stars10` 10별 1회만 지급.
  - duplicate transaction은 중복 지급 없음.
  - signed subscription activated/canceled는 membership 상태를 active/canceled로 전환.
