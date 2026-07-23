# 가격 코칭 MVP 완성 구현 요청

## 사용자 입력

`docs/pm/가격-코칭-MVP-완성-개발자-전달.md` 문서를 전달하며 가격/코칭 MVP 요구사항을 반영해 달라고 요청했다.

## 핵심 요구

- 가격 정책 source of truth 통합.
- `stars10`, `stars30`, `stars70`, `starsPremium`, `monthlyMembership` Paddle 상품 타입 고정.
- 채팅 1별, 월간 전략 리포트 상세판 3별, 종합 사주 백서 5별 차감.
- 첫 상담 assistant 응답 저장 성공 후 `CoachingSnapshot` 생성.
- 오늘피드는 snapshot 우선 사용.
- 월간 리포트 상세판은 3별 차감 성공 후 열림.
- Paddle 웹훅은 `customData.productType`이 아니라 실제 `items.price.id`를 기준으로 지급.
