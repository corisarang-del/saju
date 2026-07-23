# pnpm wrapper fetch failed와 Gemini 지연 관찰 포인트

## 일시
- 2026-07-24 01:11 KST

## 사용자 입력
> 남은 관찰 포인트는 두 개야:
> pnpm test, pnpm lint, pnpm test:env 래퍼가 아직 fetch failed로 실패함. 같은 도구를 직접 실행하면 통과해서 앱 코드 실패는 아님.
> Gemini 응답이 일부 케이스에서 2~3회 재시도되고 live chat이 40~110초까지 걸려서 운영 UX 관찰 필요.

## 해석
- pnpm 래퍼 실패가 앱 코드 실패인지 실행 환경 문제인지 분리한다.
- Gemini 품질 게이트 통과 여부와 별개로 재시도율/응답 시간을 운영 UX 관찰 항목으로 남긴다.
- 다음 QA에서 사람이 수동으로 시간을 재지 않도록 QA 스크립트에 duration 출력 보강을 검토한다.
