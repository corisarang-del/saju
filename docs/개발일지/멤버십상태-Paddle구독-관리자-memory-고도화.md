# 멤버십 상태 Paddle 구독 관리자 memory 고도화

- 일시: 2026-07-07 20:46:23 KST

## 작업 내용

- `user_memberships` 테이블 마이그레이션을 추가해 Paddle 구독 ID, 상태, 현재 기간, 취소 시각을 저장하게 했다.
- Paddle 웹훅에서 `subscription.activated`, `subscription.updated`, `subscription.canceled` 이벤트를 받아 `provider, subscription_id` 기준으로 멤버십 상태를 upsert하게 했다.
- `decrement_star` RPC가 채팅 차감 시 `star_transactions`에 `chat_message` 거래 로그를 남기도록 새 마이그레이션에 반영했다.
- 관리자 서비스와 `/ko/admin` 화면에 멤버십 상태, 최근 차감 유형, 최근 코칭 스냅샷 시각을 추가했다.
- `summarizeConversationMemory`가 최근 사용자 메시지 8개와 assistant 상담 요약, follow-up seed를 함께 반환하게 했다.
- `.next/types` 중복 생성물 때문에 `tsc`가 충돌하지 않도록 `tsconfig.json`의 기존 exclude 규칙을 `3`번 복제 파일까지 확장했다.

## TDD 및 검증

- 먼저 `membership.test.ts`, `membership-admin-regression.test.ts`, `memory.test.ts`로 실패 기준을 잡은 뒤 구현했다.
- 통과:
  - `pnpm test src/lib/paddle/membership.test.ts src/lib/security/membership-admin-regression.test.ts src/lib/monthly-saju/memory.test.ts`
  - `pnpm test src/lib/paddle/membership.test.ts src/lib/security/membership-admin-regression.test.ts src/lib/monthly-saju/memory.test.ts src/lib/monthly-saju/monthly-strategy-report.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts src/lib/paddle/credit-grant.test.ts src/lib/monthly-saju/pricing.test.ts src/lib/ai/chat-completion-guard.test.ts`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test`

## 주의

- 새 마이그레이션 `supabase/migrations/202607070900_user_memberships_and_chat_transaction_log.sql`은 운영 Supabase에 별도 적용해야 실제 구독 상태 저장이 동작한다.
- Paddle production env와 실제 subscription 웹훅 payload는 운영 적용 후 라이브 웹훅 로그로 한 번 더 검증해야 한다.

