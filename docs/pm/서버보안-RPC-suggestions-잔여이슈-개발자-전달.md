# 서버보안 RPC suggestions 잔여이슈 개발자 전달

## 배경
- 서버개발자와 보안담당자 리뷰에서 보안 핫픽스 이후에도 남은 위험 경로가 확인됐어.
- 핵심은 `authenticated`에 열린 RPC 직접 호출 위험과 인증/rate limit 없는 Gemini suggestions 비용 폭탄 경로야.
- 이 둘은 공개 전까지 닫아야 하는 서버 신뢰 경계 문제야.

## 우선순위 요약
1. P0/P1: `decrement_star`, `deduct_stars_for_report` RPC 직접 호출 방어
2. P1: `/api/saju/suggestions` 인증/rate limit/daily quota 적용

## P0/P1. RPC 직접 호출 위험

### 발견 위치
- `supabase/migrations/202606260050_star_credit_schema.sql:89`
- `supabase/migrations/202607010010_p0_security_hotfix.sql:207`

### 문제
- 기존 `decrement_star` grant와 새 `deduct_stars_for_report` grant가 `authenticated`에 열려 있어.
- 인증된 사용자가 Supabase RPC를 직접 호출할 수 있으면 앱 서버 정책을 우회할 수 있어.
- 최소한 함수 내부에서 `auth.uid() = p_user_id`를 강제해야 해.
- report/reading 기반 차감 함수라면 reading 소유권도 함수 내부에서 반드시 확인해야 해.

### 위험
- 타인 `p_user_id`나 `readingId`를 넣어 별 차감/거래 이력을 오염시킬 수 있어.
- 서버에서 정한 결제/분석 플로우를 거치지 않고 RPC를 직접 호출할 수 있어.
- `security definer` 함수라면 RLS를 우회할 수 있으니 grant와 내부 검증이 특히 중요해.

### 개발 요구사항
- 클라이언트에서 직접 호출할 필요가 없는 별/결제/차감 RPC는 `authenticated` execute 권한을 제거하고 `service_role` 전용으로 둬.
- 클라이언트 직접 호출이 필요한 RPC라면 함수 시작부에서 `auth.uid() = p_user_id`를 검증해.
- `deduct_stars_for_report`는 대상 reading/report가 현재 사용자 소유인지 함수 내부에서 확인해.
- 권한 실패 시 별 차감, 거래 이력 생성, 상태 변경이 전혀 일어나지 않아야 해.
- `decrement_star`가 더 이상 쓰이지 않는 legacy 함수라면 revoke하거나 제거 후보로 올려.

### 수용 기준
- 사용자 A가 사용자 B의 `p_user_id`로 `decrement_star` 또는 `deduct_stars_for_report`를 호출해도 실패해.
- 사용자 A가 사용자 B의 reading/report id로 별 차감을 시도해도 실패해.
- 권한 실패 시 star balance와 transaction row가 변하지 않아.
- 함수 내부에 `auth.uid()` 검증과 reading 소유권 검증이 있어.
- SQL 회귀 테스트 또는 migration 검증에서 민감 RPC의 `grant execute to authenticated`가 안전한지 확인해.

### 테스트 제안
- 사용자 A/B를 만들고 A 세션으로 B의 user id와 reading id를 넣어 RPC 직접 호출을 시도해.
- 실패 후 B의 별 잔액과 transaction table이 변하지 않는지 확인해.
- 정상 사용자가 자기 reading으로 호출할 때만 차감되는지 확인해.
- 가능한 경우 함수 권한 테스트는 SQL integration test로 두고, 앱 API 테스트는 서버 action/API 경로를 따로 검증해.

## P1. suggestions 비용 폭탄 경로 남음

### 발견 위치
- `src/app/api/saju/suggestions/route.ts:4`

### 문제
- `/api/saju/suggestions`가 인증, rate limit, daily quota 없이 Gemini를 호출해.
- 공개 API라 외부에서 반복 호출하면 Gemini 비용과 quota를 빠르게 소모할 수 있어.
- 기존 `checkRateLimit` 유틸이 있어도 실제 route에 적용되지 않으면 방어가 아니야.

### 개발 요구사항
- `/api/saju/suggestions`에 인증 또는 IP/user 기준 rate limit을 적용해.
- 비로그인 허용이 필요하다면 IP 기준 짧은 window limit과 daily quota를 둬.
- 로그인 사용자는 user id 기준 daily quota를 둬.
- quota 초과 시 Gemini를 호출하지 말고 `429`와 사용자 친화적 메시지를 반환해.
- rate limit 로그에는 IP/user id, route, quota key, request id를 남겨.

### 수용 기준
- 비인증 사용자가 `/api/saju/suggestions`를 무제한 호출할 수 없어.
- quota 초과 요청은 Gemini 호출 전에 차단돼.
- 정상 사용자는 제한 안에서 suggestions를 받을 수 있어.
- 실패 UI는 빈 응답이 아니라 명확한 안내를 보여줘.
- abuse/429 로그로 원인을 추적할 수 있어.

### 테스트 제안
- 동일 IP 또는 동일 user id로 quota 초과 요청을 보내 `429`를 확인해.
- quota 초과 시 Gemini mock/provider가 호출되지 않았는지 boundary fake로 확인해.
- 정상 요청은 suggestions 응답을 반환하는지 확인해.
- 비인증 정책이 “허용”이면 IP limit, “불허”면 `401`을 기준으로 고정해.

## 릴리즈 게이트
- 공개 전 민감 RPC 직접 호출 테스트를 통과해야 해.
- 공개 전 `/api/saju/suggestions` 비용 방어 테스트를 통과해야 해.
- P0/P1 보안 이슈가 남아 있으면 결제 포함 공개 배포는 보류해야 해.

## 개발 원칙
- 개발자는 TDD 방식으로 실패 재현 테스트를 먼저 작성해.
- 테스트는 내부 구현 호출 횟수보다 실제 보안 결과를 검증해야 해.
- Codex는 PM 역할만 수행해. 소스코드 수정은 개발자가 진행해.
