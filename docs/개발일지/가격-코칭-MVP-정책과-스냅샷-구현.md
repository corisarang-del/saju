# 가격 코칭 MVP 정책과 스냅샷 구현

## 작업 내용

- `src/lib/monthly-saju/pricing.ts`를 가격 정책 source of truth로 확장했다.
  - 가입 후 무료 3회, 채팅 1별, 월간 전략 리포트 3별, 종합 사주 백서 5별.
  - 별 패키지 `10/30/70/250`과 `월간 멤버십 월 9,900원/40별`을 추가했다.
- `src/lib/paddle/config.ts`가 가격 정책 상수를 참조하도록 바꾸고 Paddle 상품 타입에 `stars10`, `monthlyMembership`을 추가했다.
- `scripts/check-env.js`와 테스트에 스타터/멤버십 Paddle env 검증을 추가했다.
- `src/lib/monthly-saju/coaching-snapshot.ts`를 추가해 대표 고민 5개 코칭 템플릿을 구조화했다.
- `/api/saju/chat`에서 첫 상담 assistant 메시지 저장 성공 후에만 `coaching_snapshots`를 생성하게 했다.
  - 빈 응답, 부분 응답, provider error, assistant 저장 실패에서는 snapshot, `chat_used`, 별 차감이 이어지지 않는다.
  - snapshot 생성 실패는 로그만 남기고 채팅 응답 성공 흐름은 막지 않는다.
- 오늘피드가 `coaching_snapshots` 최신 데이터를 우선 사용하도록 연결했다.
- 코인샵에 스타터 상품과 월간 멤버십 카드를 추가했다.
- 월간 전략 리포트 상세판을 3별 차감 후 여는 최소 클라이언트/서버 흐름을 추가했다.
- 종합 사주 백서 RPC 차감 비용을 5별로 맞추는 Supabase 마이그레이션을 추가했다.

## DB 변경

- `202607070010_coaching_snapshots.sql`
  - `coaching_snapshots` 테이블, 인덱스, owner 기반 RLS 정책 추가.
- `202607070020_full_report_star_cost.sql`
  - `deduct_stars_for_report`를 5별 차감으로 갱신.
- `202607070030_monthly_report_star_cost.sql`
  - `deduct_stars_for_monthly_report` RPC 추가.
  - 이번 달 이미 연 상세판은 중복 차감하지 않는다.

## 검증

- `pnpm test src/lib/monthly-saju/pricing.test.ts src/lib/monthly-saju/star-deduction.test.ts src/lib/monthly-saju/daily-feed.test.ts src/lib/monthly-saju/coaching-snapshot.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts src/lib/paddle/credit-grant.test.ts scripts/check-env.test.mjs src/lib/saju/chat-stream-failure-regression.test.ts`
  - 통과: 8 files / 27 tests.
- `pnpm test`
  - 통과: 43 files / 150 tests.
- `pnpm lint`
  - 통과.
- `pnpm build`
  - 통과.
- `git diff --check`
  - 통과.

## 남은 주의사항

- 운영 Supabase에 새 마이그레이션 3개를 적용해야 실제 오늘피드 snapshot과 월간 리포트 3별 차감이 동작한다.
- Paddle 대시보드에 `stars10`, `monthlyMembership` 상품/가격 ID를 만들고 env를 채워야 한다.
- 멤버십은 웹훅에서 40별 지급까지 반영했지만, 구독 상태 UI/관리자 상세 표시는 다음 단계에서 더 다듬어야 한다.
