# Supabase unpause 운영마이그레이션 release gate 통과 20260724

## 진행 내용

- Supabase 프로젝트 `sfpwgywcmhgilrqearsz` unpause 후 DNS를 확인했다.
  - `dig +short sfpwgywcmhgilrqearsz.supabase.co`: Cloudflare IP 응답 확인.
  - `curl -I https://sfpwgywcmhgilrqearsz.supabase.co/auth/v1/health`: Supabase gateway 응답 확인.
- Supabase 프로젝트 상태를 확인했다.
  - 처음에는 `COMING_UP`.
  - 이후 `ACTIVE_HEALTHY`.
- 로컬 Next dev 서버를 `pnpm dev`로 띄워 live API QA 대상 `http://localhost:3000`을 준비했다.
- `pnpm qa:live-api:free` 첫 실행에서 `user_stars` schema cache/table 누락으로 실패했다.
- `supabase migration list --linked` 확인 결과 remote migration history가 비어 있었다.
- `supabase db push --linked --dry-run`으로 적용 대상 13개 마이그레이션을 확인했다.
- `supabase db push --linked --yes`로 운영 Supabase에 마이그레이션을 적용했다.
- 적용 후 `supabase migration list --linked`에서 local/remote migration history가 일치했다.
- 핵심 RPC 존재를 확인했다.
  - `reserve_chat_star`
  - `refund_chat_star`
  - `check_rate_limit`
  - `admin_adjust_user_stars`
  - `deduct_stars_for_report`
  - `deduct_stars_for_monthly_report`

## 검증 결과

- `REQUIRE_PRODUCTION_ENV=true pnpm test:env`: 통과.
- `pnpm qa:live-api:free`: 통과.
  - 신규 유저 무료 상담 생성 성공.
  - 최종 별 잔액 2 확인.
  - `chat_message:-1:2` 거래 로그 확인.
  - assistant 품질 기준 통과.
- `pnpm qa:live-api`: 통과.
  - 무료/유료 첫 상담 품질 기준 통과.
  - 종합 리포트 5별 차감 확인.
  - 월간 리포트 3별 차감 확인.
  - 동시 요청 409 방어 확인.
  - 거래 로그 `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2` 확인.
- `pnpm release:gate`: 통과.
  - `release:gate:code` 통과.
  - 전체 vitest 53개 파일 / 218개 테스트 통과.
  - 타입체크, lint, build 통과.
  - high audit 통과. low 취약점 1개는 남아 있다.
  - production env gate 통과.
  - 무료 live API QA 통과.
  - 전체 live API QA 통과.

## 남은 작업

- Vercel `todocori/monthlysaju` production env는 아직 비어 있다.
- Vercel production env 업로드는 `SUPABASE_SERVICE_ROLE_KEY`, AI 자격증명 등 민감한 비밀값을 외부 SaaS에 전송하는 작업이라 사용자의 명시 승인이 필요하다.
- 현재 production AI 설정은 `AI_PROVIDER=vertex`, `AI_MODEL=gemini-2.5-flash-lite`다. Vercel에서 Vertex ADC를 로컬처럼 자동 사용할 수 없으므로, production 배포 후 AI 호출은 별도 인증 전략 또는 실제 QA로 다시 확인해야 한다.
- QA에 사용한 로컬 dev 서버는 종료했다.
