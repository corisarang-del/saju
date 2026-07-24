# 운영배포 Paddle webhook env 보안재점검 반영 요청 20260724

## 사용자 요청

`docs/pm/운영배포-보안재점검-Paddle-webhook-env-개발자전달-20260724.md` 문서를 전달했고, 운영 배포 보안 재점검에서 남은 Paddle webhook env, Vertex runtime auth, CSP, update-status IDOR 잔여 이슈를 확인해 수정할 것을 요청했다.

## 핵심 요구

- Paddle signed webhook 운영 정합성 실패를 재현/검증할 수 있는 QA 경로 보강
- `GOOGLE_VERTEX_RUNTIME_AUTH` production env 검사와 Vercel OIDC/WIF 운영 방침 정렬
- CSP 잔여 위험 보강
- 다른 사용자의 reading status 업데이트 no-op이 200으로 보이는 문제 수정
- TDD 방식으로 회귀 테스트를 먼저 보강하고 구현
