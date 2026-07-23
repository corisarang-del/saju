# 사주상담 production 실사용 정상확인

## 배경

Google 로그인은 정상화됐지만, production에서 사주상담이 6번 연속 실패했다.

## 원인 요약

- production AI provider는 Vertex였다.
- 로컬은 ADC 인증으로 작동했지만 Vercel Function 런타임에는 로컬 ADC가 없다.
- Google API key provider는 403으로 실패했다.
- 서비스 계정 키 생성은 조직 정책 때문에 막혔다.
- 그래서 Vercel OIDC와 Google Workload Identity Federation으로 전환했다.

## 적용 내용

- `src/lib/ai/model.ts`
  - Vertex provider가 서비스 계정 env, credentials JSON, Vercel OIDC WIF를 받을 수 있게 했다.
  - Vercel 요청 헤더 `x-vercel-oidc-token`을 Vertex 인증에 사용할 수 있게 했다.
- `src/app/api/saju/chat/route.ts`
  - 채팅 요청에서 Vercel OIDC 토큰을 읽어 `getChatModel`로 전달했다.
- `scripts/check-env.js`
  - production Vertex 사용 시 런타임 인증 누락을 `GOOGLE_VERTEX_RUNTIME_AUTH`로 차단하게 했다.
- Google Cloud
  - `vercel` Workload Identity Pool과 provider를 만들었다.
  - issuer는 `https://oidc.vercel.com/todocori`다.
  - subject는 `owner:todocori:project:monthlysaju:environment:production`으로 제한했다.
  - `monthlysaju-vertex` 서비스 계정에 Vertex 호출과 WIF impersonation 권한을 부여했다.
- Vercel
  - `GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE`
  - `GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL`
  - 두 production env를 추가했다.

## 배포

- deployment id: `dpl_3pQhZyoQg5fRF3EUBT4nUUmCuK9x`
- production alias: `https://monthlysaju.vercel.app`

## 검증 결과

- 전체 테스트: 53개 파일 / 228개 통과.
- 타입체크 통과.
- 관련 파일 lint 통과.
- `pnpm build` 통과.
- `https://monthlysaju.vercel.app/ko` HTTP 200.
- production 무료 live API QA 통과.
- production 전체 live API QA 통과.
- 무료/유료 첫 상담, 별 차감, 거래 로그, 동시 요청 방어가 실제 production에서 확인됐다.
- 사용자 실사용 기준으로도 상담이 정상 동작한다고 확인됐다.

## 현재 상태

- Google 로그인 정상.
- production 사주상담 정상.
- Vertex production 인증은 서비스 계정 키 없이 Vercel OIDC + Google WIF로 처리한다.

## 운영 주의점

- Vercel OIDC issuer mode를 바꾸면 Google WIF issuer와 불일치할 수 있다.
- 현재 구성은 team issuer `https://oidc.vercel.com/todocori` 기준이다.
- `AI_PROVIDER=vertex` production 검증은 project/location뿐 아니라 런타임 인증까지 확인해야 한다.
- 서비스 계정 키 방식은 조직 정책상 불가하므로 다시 시도하지 않는다.
