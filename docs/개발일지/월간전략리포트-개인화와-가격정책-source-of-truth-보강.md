# 월간전략리포트 개인화와 가격정책 source of truth 보강

## 날짜
2026-07-07

## 배경
`docs/pm/가격-코칭-MVP-구현-리뷰-개발자-전달.md`에서 월간 전략 리포트가 정적 문구 중심이라 3별 유료 상세판 가치가 약하다는 P0가 전달됐다. 약관/JSON-LD 가격 문구가 `pricing.ts`와 완전히 연결되지 않은 P1도 함께 확인됐다.

## 수정
- `src/lib/monthly-saju/monthly-strategy-report.ts`
  - `createMonthlyStrategyReport` 도메인 빌더를 추가했다.
  - 최신 reading, coaching snapshot, conversation memory, 최근 user 메시지 fallback을 입력으로 받아 6개 섹션을 만든다.
  - snapshot이 없으면 최신 reading과 최근 user 메시지 8개 기반 fallback을 쓴다.
- `src/app/[locale]/reports/page.tsx`
  - 정적 `monthlySections`를 제거했다.
  - 최신 `saju_readings`, `coaching_snapshots`, `saju_chat_messages`를 조회한다.
  - `summarizeConversationMemory`와 `createMonthlyStrategyReport`로 무료 미리보기와 3별 상세판을 만든다.
- `src/lib/monthly-saju/pricing.ts`
  - `getPricingListItems`, `buildPricingFaqAnswer`, `buildProductJsonLd`를 추가했다.
  - 가격 노출 문구와 JSON-LD가 `STAR_PACKS`, `MONTHLY_MEMBERSHIP`를 참조하게 했다.
- `src/app/[locale]/(marketing)/terms/page.tsx`
  - 별 충전 상품 목록을 `getPricingListItems()` 기반으로 표시한다.
- `src/app/[locale]/layout.tsx`
  - Product JSON-LD와 FAQ 가격 답변을 `pricing.ts` builder로 생성한다.

## 테스트
```bash
pnpm test src/lib/monthly-saju/monthly-strategy-report.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts src/lib/monthly-saju/pricing.test.ts src/lib/monthly-saju/coaching-snapshot.test.ts src/lib/monthly-saju/daily-feed.test.ts src/lib/monthly-saju/memory.test.ts src/lib/paddle/credit-grant.test.ts
pnpm exec tsc --noEmit
pnpm lint
pnpm build
git diff --check
```

## 결과
- 월간/가격 관련 테스트: 7 files / 20 tests 통과.
- TypeScript 통과.
- ESLint 통과.
- production build 통과.
- diff 공백 검사 통과.

## 남은 후속 과제
- Paddle subscription 이벤트 기반 `user_memberships` 상태 저장.
- 관리자 화면에 멤버십 상태, 최근 차감 타입, 최근 snapshot 생성 여부 표시.
- chat 차감 RPC를 거래 로그 기반으로 전환.
- memory summary를 최근 user 메시지 8개와 assistant 요약까지 확장.
