# Vercel env 업로드 후 release gate 문서화와 푸시

## 일시
- 2026-07-24 00:53 KST

## 요약
- Supabase project `sfpwgywcmhgilrqearsz` unpause 후 DNS와 health 접근이 회복됐다.
- 운영 Supabase에 누락돼 있던 migration history를 맞추기 위해 `supabase db push --linked --yes`로 13개 마이그레이션을 적용했다.
- `pnpm qa:live-api:free`, `pnpm qa:live-api`, `pnpm release:gate`가 통과했다.
- 사용자 승인 후 Vercel `todocori/monthlysaju` production env에 무료 베타 필수 env 15개를 업로드했다.
- Paddle 결제 env는 무료 베타 범위가 아니므로 업로드하지 않았다.

## 확인된 상태
- Supabase status: `ACTIVE_HEALTHY`
- Supabase host DNS: 정상 해석
- 운영 migration history: local/remote 일치
- release gate: 통과
- Vercel production env: 15개 등록 확인
- 직전 커밋: `ef1d371 chore: harden free beta release gate and production env`

## Vercel production env 등록 범위
- Supabase URL/anon/service role 계열
- AI provider/model 및 Google Vertex/Gemini 계열
- app origin 계열
- admin email 계열
- `RATE_LIMIT_BACKEND=supabase`
- 무료 베타 결제 비활성화 flag 계열

## 의도적으로 제외한 것
- Paddle API key, webhook secret, client token, product/price id
- 실제 env 값 원문
- `.env.local`, `.vercel`, `supabase/.temp`

## 남은 주의사항
- Vercel production 런타임에서 `AI_PROVIDER=vertex` 인증이 실제로 작동하는지는 배포 후 production smoke QA로 한 번 더 확인해야 한다.
- Paddle 결제를 다시 열려면 Paddle env 등록 후 `pnpm release:gate:payments`를 별도로 통과해야 한다.
- `pnpm audit --prod` low advisory 1건은 high gate를 막지는 않지만 AI 비용/리소스 리스크로 계속 추적한다.
