# 운영사이트 보안점검 authenticated QA 문서화 메모리저장 요청

## 사용자 요청 요약
- `https://monthlysaju.vercel.app/`에 배포된 운영 사이트 보안점검 결과를 개발자에게 전달할 수 있게 문서화해달라고 요청했어.
- 로그인 후 실제 계정 데이터 IDOR, Supabase RLS 운영 적용, 결제 성공/실패 webhook 정합성은 별도 authenticated QA 항목으로 추가해달라고 요청했어.
- 지금까지 나온 내용을 문서화하고 `.codex/memory/`에 저장해달라고 요청했어.

## 처리 내용
- 개발자 전달 문서 작성: `docs/pm/운영사이트-보안점검-authenticated-QA-개발자전달-20260724.md`
- 개발일지 작성: `docs/개발일지/운영사이트-보안점검-authenticated-QA-문서화-20260724.md`
- 프롬프트 기록 작성: `docs/프롬프트/운영사이트-보안점검-authenticated-QA-문서화-메모리저장-요청-20260724.md`
- 메모리 갱신: `.codex/memory/project.md`, `.codex/memory/decisions.md`, `.codex/memory/learnings.md`

## 핵심 기록
- 비인증 외부 점검에서는 공개 시크릿 노출이나 주요 민감 API 무단 열림은 발견하지 못했어.
- OAuth PKCE code verifier cookie 속성/TTL, CSP 느슨함, `x-powered-by` 노출은 보완 필요로 기록했어.
- authenticated QA 범위로 IDOR, 운영 RLS/RPC, Paddle webhook 정합성을 추가했어.
