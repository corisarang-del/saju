# 실사용 QA Supabase DNS 차단 보고

## 사용자 요청
- 실사용 QA가 `scripts/qa-live-api-check.mjs`에서 Supabase DNS 문제로 막혔다고 전달했다.
- 에러는 `getaddrinfo ENOTFOUND sfpwgywcmhgilrqearsz.supabase.co`였다.
- 무료/유료 첫 상담, 별 차감, 거래 로그, 저장된 assistant 품질을 오늘 실제 DB 기준으로 끝까지 확인하지 못했다고 보고했다.

## 처리 방향
- 앱 로직 실패인지 외부 DNS/환경 차단인지 분리했다.
- QA 스크립트가 다음부터 인증 유저 생성 단계에서 애매하게 죽지 않고, Supabase DNS 차단을 사전 진단으로 명확히 보여주도록 보강했다.
