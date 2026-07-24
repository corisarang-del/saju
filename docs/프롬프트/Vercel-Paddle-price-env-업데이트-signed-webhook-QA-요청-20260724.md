# Vercel Paddle price env 업데이트 signed webhook QA 요청

## 사용자 요청
- Vercel production env의 실제 price id를 `2,900원 스타터`, `9,900원/50별 멤버십` 상품으로 맞춘다.
- 그 뒤 signed webhook live QA를 다시 돌린다.

## 작업 중 확인
- Vercel CLI 인증과 `monthlysaju` project 연결은 확인했다.
- production env 목록에는 Paddle 관련 필수 env가 아직 없었다.
- 로컬 `.env.local`의 `PADDLE_API_KEY`는 실제 키가 아니라 placeholder라 Paddle API에서 실제 price id를 조회할 수 없었다.
