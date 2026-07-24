# 운영사이트 보안점검 authenticated QA 개발자 전달 반영 요청

## 사용자 요청

사용자가 다음 개발자 전달 문서를 공유했다.

- `/Users/apple/Desktop/test_githup/saju/docs/pm/운영사이트-보안점검-authenticated-QA-개발자전달-20260724.md`

## 요청 의도

- 운영 사이트 보안점검 결과에서 코드로 보완할 수 있는 항목을 반영한다.
- OAuth PKCE 쿠키, CSP/보안 헤더, 정보 노출, 인증 필요한 API 상태코드 순서, canonical/JSON-LD 도메인 혼재를 우선 확인한다.
- 로그인 후 IDOR, 운영 RLS/RPC, Paddle webhook 정합성은 별도 authenticated QA 필요 범위로 남긴다.

