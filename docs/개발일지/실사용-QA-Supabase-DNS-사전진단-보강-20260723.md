# 실사용 QA Supabase DNS 사전진단 보강

## 배경
- 실사용 API QA가 Supabase 인증 유저 생성 전 단계에서 막혔다.
- 오류는 `getaddrinfo ENOTFOUND sfpwgywcmhgilrqearsz.supabase.co`였다.
- 이 상태에서는 `/api/saju/chat` 로직까지 도달하지 못하므로 무료/유료 첫 상담, 별 차감, 거래 로그, 저장된 assistant 품질을 실제 DB 기준으로 검증할 수 없다.

## 원인 분리
- `curl -I https://supabase.co`는 `307` 응답으로 도메인 접근이 가능했다.
- `curl -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health`는 `Could not resolve host`로 실패했다.
- 따라서 현재 증상은 앱 채팅 로직 실패가 아니라 Supabase 프로젝트 호스트 DNS 해석 실패다.
- 가능한 원인은 현재 네트워크의 DNS 차단, 잘못된/비활성 project ref, 운영 Supabase 프로젝트 상태 문제다.

## TDD
- `src/lib/saju/live-api-qa-runner.test.ts`에 DNS preflight 회귀 테스트를 먼저 추가했다.
- 실패 확인:
  - `pnpm exec vitest run src/lib/saju/live-api-qa-runner.test.ts`
  - `import { lookup } from "node:dns/promises";`가 없어 실패했다.

## 수정 내용
- `scripts/qa-live-api-check.mjs`
  - `node:dns/promises`의 `lookup`을 사용해 Supabase host를 사전 해석한다.
  - `NEXT_PUBLIC_SUPABASE_URL`이 URL로 파싱되지 않으면 `Invalid NEXT_PUBLIC_SUPABASE_URL`로 실패한다.
  - DNS 해석 실패 시 `Supabase DNS lookup failed`와 함께 host, error code, 재확인용 curl 명령, 다음 조치 목록을 JSON으로 출력한다.
  - 이 preflight는 auth user 생성보다 먼저 실행되어 DB에 QA 데이터가 생기기 전에 실패한다.

## 확인한 출력
```json
{
  "ok": false,
  "message": "Supabase DNS lookup failed",
  "extra": {
    "host": "sfpwgywcmhgilrqearsz.supabase.co",
    "code": "ENOTFOUND",
    "syscall": "getaddrinfo",
    "command": "curl -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health"
  }
}
```

## 검증
- `pnpm exec vitest run src/lib/saju/live-api-qa-runner.test.ts`
  - 1개 파일 / 2개 테스트 통과
- `node scripts/qa-live-api-check.mjs`
  - 예상대로 `Supabase DNS lookup failed`로 빠르게 실패
- `pnpm test`
  - 50개 파일 / 202개 테스트 통과
- `pnpm lint`
  - 통과
- `pnpm exec tsc --noEmit`
  - 통과
- `pnpm build`
  - Next.js 16.2.11 프로덕션 빌드 통과

## 남은 작업
- DNS가 정상인 네트워크에서 아래 QA를 다시 실행해야 한다.
  - `QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`
  - `node scripts/qa-live-api-check.mjs`
- Supabase Dashboard에서 project ref `sfpwgywcmhgilrqearsz`가 현재 운영 프로젝트와 일치하고 active 상태인지 확인해야 한다.
- 운영 DNS가 계속 실패하면 Vercel production env의 `NEXT_PUBLIC_SUPABASE_URL`도 같은 ref를 보고 있는지 확인해야 한다.
