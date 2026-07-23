# 가격 코칭 MVP 구현 리뷰

## 작업 내용

- 개발자가 구현한 가격/코칭 MVP를 PM 리뷰 관점으로 확인했다.
- 소스코드는 수정하지 않았고, 구현 상태와 남은 갭만 문서화했다.
- 가격 정책, Paddle 결제 지급, 별 차감 RPC, 코칭 스냅샷, 오늘피드, 월간 리포트, 관리자 화면, 테스트를 확인했다.

## 확인한 긍정 사항

- `pricing.ts`에 스타터 `10별 3,900원`, 기존 `30/70/250별`, 월간 멤버십 `월 9,900원/40별`이 들어갔다.
- 채팅 1별, 월간 리포트 상세판 3별, 종합 사주 백서 5별 상수가 분리됐다.
- Paddle 지급 로직은 실제 `items.price.id` 기준으로 상품을 판별한다.
- 첫 자동 상담 응답 저장 성공 후 `coaching_snapshots`를 만들고, 오늘피드는 snapshot을 우선 사용한다.
- 월간 리포트 상세판 3별 차감 RPC와 종합 백서 5별 차감 RPC가 추가됐다.

## 주요 미완성

- 월간 전략 리포트가 아직 `coaching_snapshots`, 최근 대화 memory, 사주 요약을 묶어 생성되지 않고 정적 문구를 보여준다.
- 약관과 layout JSON-LD에는 스타터/멤버십 가격 정책이 반영되지 않아 source of truth가 완전히 닫히지 않았다.
- 멤버십은 결제 상품과 40별 지급까지만 있고, 구독 상태 저장/해지/갱신/관리자 표시가 없다.
- 관리자 화면은 별 잔액과 거래 로그만 보여주며 멤버십 상태, 최근 차감 타입 요약, 최근 snapshot 생성 여부가 없다.
- memory summary는 최근 user 메시지 3개를 이어 붙이는 수준이라 계획한 기억 요약과 후속 질문 추천까지는 부족하다.

## 검증

- `pnpm test -- src/lib/monthly-saju/pricing.test.ts src/lib/monthly-saju/coaching-snapshot.test.ts src/lib/monthly-saju/daily-feed.test.ts src/lib/monthly-saju/star-deduction.test.ts src/lib/paddle/credit-grant.test.ts src/lib/monthly-saju/monthly-report-regression.test.ts`
  - 통과: 45 files / 158 tests
- `pnpm exec tsc --noEmit`
  - 통과
- `pnpm build`
  - 샌드박스에서는 Turbopack 포트 바인딩 권한 문제로 실패했다.
  - 권한 있는 재시도는 `.next/lock` 때문에 `Another next build process is already running`으로 막혔다.
  - 생성물 삭제는 하지 않았다.

## 산출물

- 개발자 전달 문서: `docs/pm/가격-코칭-MVP-구현-리뷰-개발자-전달.md`
- 프롬프트 일지: `docs/프롬프트/가격-코칭-MVP-구현-리뷰-요청.md`
- 메모리 업데이트: `.codex/memory/project.md`, `.codex/memory/decisions.md`, `.codex/memory/learnings.md`
