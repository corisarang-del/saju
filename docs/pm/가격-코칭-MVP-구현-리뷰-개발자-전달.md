# 가격 코칭 MVP 구현 리뷰 개발자 전달

## 결론

개발자가 가격/코칭 MVP의 뼈대는 많이 넣었어. 가격 상수, 스타터/멤버십 상품, Paddle price id 기준 지급, 월간 리포트 3별 차감, 종합 백서 5별 차감, 코칭 스냅샷 테이블, 오늘피드 스냅샷 우선 사용은 확인됐어.

다만 원래 계획의 핵심인 “유료 전환 가능한 코칭형 사주앱 MVP” 기준으로는 아직 완료가 아니야. 특히 월간 전략 리포트가 개인화 코칭 결과가 아니라 정적 문구 중심이라, 사용자가 3별을 내고 열어도 자기 사주/대화/스냅샷 기반 리포트라고 보기 어려워.

## 확인된 구현

- `src/lib/monthly-saju/pricing.ts`
  - `10별 3,900원`, `30별 9,900원`, `70별 19,900원`, `250별 39,900원`이 들어갔어.
  - 월간 멤버십 `월 9,900원`, 매월 `40별` 지급도 상수로 들어갔어.
  - 채팅 1별, 월간 리포트 상세판 3별, 종합 사주 백서 5별이 분리됐어.
- `src/lib/paddle/config.ts`, `src/lib/paddle/credit-grant.ts`
  - `stars10`, `monthlyMembership`이 추가됐어.
  - 웹훅 지급량은 `customData.productType`이 아니라 실제 `items.price.id`로 결정돼.
- `src/app/api/monthly-saju/deduct-monthly-report/route.ts`
  - 월간 리포트 상세판은 서버 RPC로 3별 차감하게 됐어.
- `src/app/api/saju/deduct-stars/route.ts`
  - 종합 사주 백서는 `REPORT_STAR_COST = 5` 흐름으로 맞춰졌어.
- `src/lib/monthly-saju/coaching-snapshot.ts`, `supabase/migrations/202607070010_coaching_snapshots.sql`
  - `CoachingSnapshot` 모델과 대표 고민 템플릿 5개가 들어갔어.
- `src/app/api/saju/chat/route.ts`
  - 첫 자동 상담 응답 저장 성공 뒤 `coaching_snapshots`를 생성해.
  - 빈 응답/부분 응답이면 저장, 스냅샷, 별 차감, `chat_used` 증가가 이어지지 않게 가드가 있어.
- `src/app/[locale]/today/page.tsx`, `src/lib/monthly-saju/daily-feed.ts`
  - 오늘피드는 최신 `coaching_snapshots`를 우선 사용하고 없으면 reading/memory fallback을 써.

## Findings

### P0. 월간 전략 리포트가 아직 개인화 코칭 리포트가 아니야

- 위치:
  - `src/app/[locale]/reports/page.tsx:8`
  - `src/app/[locale]/reports/page.tsx:23`
  - `src/app/[locale]/reports/page.tsx:60`
  - `src/components/saju/reports/MonthlyReportUnlockClient.tsx:71`
- 문제:
  - `monthlySections`가 파일 상단 정적 배열이야.
  - 리포트 페이지는 별 잔액과 월간 unlock 거래만 조회하고, 최신 reading, `coaching_snapshots`, 최근 대화 memory, 사주 요약을 조회하지 않아.
  - 무료 미리보기와 유료 상세판 모두 사용자의 실제 고민/사주/첫 상담 결과와 연결되지 않아.
- 왜 중요한가:
  - 원래 요구사항은 “snapshot + 최근 대화 기억 + 사주 요약”을 묶은 월간 전략 리포트였어.
  - 지금 상태는 `3별 차감 후 정적 상세 문구 열기`라서 유료 전환 핵심 가치가 약해.
- 개발 요청:
  - `createMonthlyStrategyReport` 같은 도메인 빌더를 만들고, 입력으로 `latestReading`, `latestSnapshot`, `conversationMemory`, `sajuSummary`를 받아.
  - 무료 미리보기는 전체 흐름 1문단 + 섹션 제목만 보여줘.
  - 3별 차감 상세판은 관계/일/돈/마음관리/조심할 시기/이번 달 선택 3개를 snapshot과 memory 기반으로 채워.
  - snapshot이 없으면 최신 reading + 최근 user 메시지 8개 기반 fallback으로 채워.

### P1. 가격 source of truth가 약관과 JSON-LD까지 닫히지 않았어

- 위치:
  - `src/app/[locale]/(marketing)/terms/page.tsx:149`
  - `src/app/[locale]/(marketing)/terms/page.tsx:151`
  - `src/app/[locale]/layout.tsx:157`
  - `src/app/[locale]/layout.tsx:159`
  - `src/app/[locale]/layout.tsx:197`
  - `src/lib/monthly-saju/pricing.test.ts:38`
- 문제:
  - 약관은 아직 `30/70/250`만 하드코딩돼 있고 `10별 3,900원`, 월간 멤버십이 빠져 있어.
  - layout JSON-LD Product도 `lowPrice 9900`, `offerCount 3`으로 남아 있어 스타터/멤버십이 반영되지 않아.
  - 테스트 이름은 `landing_terms_jsonld_and_paddle_mapping`인데 실제로는 Paddle mapping만 검증해.
- 개발 요청:
  - 약관, 환불정책, 랜딩 FAQ, 코인샵, JSON-LD가 전부 `pricing.ts`의 정책을 참조하게 정리해.
  - JSON-LD는 `STAR_PACKS`와 `MONTHLY_MEMBERSHIP` 기반으로 생성해.
  - 테스트는 파일 문자열이 아니라 실제 export된 pricing view model 또는 JSON-LD builder 결과를 검증하게 바꿔.

### P1. 멤버십은 상품처럼 보이지만 구독 상태가 없어

- 위치:
  - `src/app/api/webhooks/paddle/route.ts:22`
  - `src/app/api/webhooks/paddle/route.ts:23`
  - `src/lib/paddle/webhook.ts:71`
  - `src/services/admin/stars.ts:18`
  - `src/app/[locale]/admin/page.tsx:128`
- 문제:
  - 웹훅 타입에는 `subscription.activated`, `subscription.canceled`, `subscription.updated`가 있지만 route는 `transaction.completed`만 처리해.
  - 월간 멤버십 결제는 현재 40별 지급 transaction으로만 남고, 활성/해지/갱신 상태를 저장하는 테이블이나 서비스가 없어.
  - 관리자 화면도 멤버십 상태를 표시하지 않아.
- 왜 중요한가:
  - 계획은 `monthlyMembership` 결제 시 “별 지급 또는 멤버십 활성화”였고, 관리자 화면에도 멤버십 상태 표시가 요구됐어.
  - 지금은 recurring 결제에서 40별 지급은 가능할 수 있지만, 멤버십 상태 기반 우선 노출/해지 대응/운영 확인은 못 해.
- 개발 요청:
  - `user_memberships` 또는 동등한 테이블을 추가해 `user_id`, `provider`, `subscription_id`, `status`, `current_period_start`, `current_period_end`, `canceled_at`을 저장해.
  - Paddle subscription 이벤트를 처리해 활성/취소/갱신 상태를 반영해.
  - 멤버십 결제 transaction과 구독 상태 업데이트를 idempotent하게 처리해.

### P1. 관리자 운영 화면이 요구 정보까지 못 보여줘

- 위치:
  - `src/services/admin/stars.ts:18`
  - `src/services/admin/stars.ts:98`
  - `src/app/[locale]/admin/page.tsx:128`
  - `src/app/[locale]/admin/page.tsx:145`
- 문제:
  - 관리자 프로필은 별 잔액과 최근 거래만 가져와.
  - 요구사항이었던 멤버십 상태, 최근 차감 타입 요약, 최근 snapshot 생성 여부가 없어.
  - 채팅 별 차감은 `decrement_star`만 호출하고 거래 로그를 남기지 않아서, “최근 차감 타입” 관찰성이 약해.
- 개발 요청:
  - 관리자 조회에 `membershipStatus`, `latestDeductionType`, `latestSnapshotCreatedAt`을 추가해.
  - 채팅 차감도 transaction log를 남기는 RPC로 옮겨서 운영자가 `chat_message`, `monthly_report`, `full_report`, `purchase`, `monthlyMembership` 흐름을 볼 수 있게 해.

### P2. 대화 기억 요약과 후속 질문 연결이 아직 얕아

- 위치:
  - `src/lib/monthly-saju/memory.ts:33`
  - `src/lib/monthly-saju/memory.ts:35`
  - `src/components/saju/chat/ChatRoom.tsx:82`
  - `src/components/saju/chat/ChatRoom.tsx:139`
- 문제:
  - memory는 최근 user 메시지 3개를 이어 붙이는 정도야.
  - 계획의 “최근 user 메시지 8개와 assistant 요약, 반복 고민, 자주 묻는 기준, 다음 질문, 캐릭터 친근도 톤”까지는 구현되지 않았어.
  - 후속 질문 추천도 snapshot의 `followUpQuestion`과 최근 memory를 함께 쓰기보다 기존 suggestions API 중심이야.
- 개발 요청:
  - memory summary 모델을 명확히 만들고 최근 user 메시지 8개 + assistant 답변 요약을 반영해.
  - 오늘피드/월간 리포트/후속 질문 추천이 같은 memory summary를 공유하게 해.

### P2. 이번 리뷰에서 production build는 최종 확인하지 못했어

- 확인:
  - `pnpm test -- src/lib/monthly-saju/pricing.test.ts src/lib/monthly-saju/coaching-snapshot.test.ts src/lib/monthly-saju/daily-feed.test.ts src/lib/monthly-saju/star-deduction.test.ts src/lib/paddle/credit-grant.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts`
    - 결과: 45 files / 158 tests 통과
  - `pnpm exec tsc --noEmit`
    - 결과: 통과
- 제한:
  - 샌드박스에서 `pnpm build`는 Turbopack 포트 바인딩 권한 문제로 실패했어.
  - 권한 있는 재시도는 이전 실패가 남긴 `.next/lock` 때문에 `Another next build process is already running`으로 막혔어.
  - 생성물 삭제는 하지 않았어.

## 다음 개발 우선순위

1. 월간 전략 리포트 개인화 도메인 빌더와 테스트를 먼저 닫아.
2. 약관/JSON-LD/FAQ/코인샵 가격 정책을 `pricing.ts` source of truth로 완전히 묶어.
3. 멤버십 상태 저장과 Paddle subscription 이벤트 처리를 추가해.
4. 관리자 화면에 멤버십 상태, 최근 차감 타입, 최근 snapshot 여부를 보여줘.
5. memory summary와 후속 질문 추천을 snapshot 중심으로 연결해.

## 릴리즈 판단

현재 상태는 “가격/코칭 MVP 일부 구현”이야. 결제 상품과 차감 뼈대는 좋아졌지만, 월간 리포트가 정적이라 아직 “유료 전환 가능한 코칭형 사주앱 MVP 완료”로 보긴 어려워. 특히 3별 유료 상세판은 출시 전에 반드시 개인화해야 해.

## 2026-07-07 후속 처리

### 완료
- P0 월간 전략 리포트 개인화 보강
  - `src/lib/monthly-saju/monthly-strategy-report.ts`에 `createMonthlyStrategyReport` 도메인 빌더를 추가했어.
  - 입력은 최신 reading, 최신 coaching snapshot, conversation memory, 최근 user 메시지 fallback이야.
  - `src/app/[locale]/reports/page.tsx`에서 정적 `monthlySections`를 제거하고 `saju_readings`, `coaching_snapshots`, `saju_chat_messages`를 읽어 리포트를 만들게 했어.
  - 무료 미리보기와 3별 상세판 모두 같은 개인화 리포트 모델을 사용해.
- P1 가격 source of truth 보강
  - `src/lib/monthly-saju/pricing.ts`에 `getPricingListItems`, `buildPricingFaqAnswer`, `buildProductJsonLd`를 추가했어.
  - 약관 별 상품 목록과 layout Product JSON-LD/FAQ 가격 답변이 `STAR_PACKS`, `MONTHLY_MEMBERSHIP` 기반으로 생성돼.

### 검증
- `pnpm test src/lib/monthly-saju/monthly-strategy-report.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts src/lib/monthly-saju/pricing.test.ts src/lib/monthly-saju/coaching-snapshot.test.ts src/lib/monthly-saju/daily-feed.test.ts src/lib/monthly-saju/memory.test.ts src/lib/paddle/credit-grant.test.ts`
  - 7 files / 20 tests 통과.
- `pnpm exec tsc --noEmit`
  - 통과.
- `pnpm lint`
  - 통과.
- `pnpm build`
  - 권한 있는 실행에서 통과.
- `git diff --check`
  - 통과.

### 남은 항목
- P1 멤버십 상태 저장과 Paddle subscription 이벤트 처리는 아직 남아 있어.
- P1 관리자 화면의 멤버십 상태, 최근 차감 타입, 최근 snapshot 여부도 아직 남아 있어.
- P2 memory summary 고도화와 후속 질문 추천 연결도 후속 과제로 남아 있어.
