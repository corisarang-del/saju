# Vercel production 첫 배포와 deployment not found 해결

## 일시
- 2026-07-24 KST

## 문제
- `https://monthlysaju.vercel.app`가 `404 DEPLOYMENT_NOT_FOUND`를 반환했다.
- Vercel CLI로 `todocori/monthlysaju` 배포 목록을 조회했을 때 배포가 하나도 없었다.

## 원인
- Vercel production env는 등록돼 있었지만, 실제 production deployment가 아직 생성되지 않았다.
- 따라서 production alias가 가리킬 배포가 없어 Vercel 레벨의 `DEPLOYMENT_NOT_FOUND`가 발생했다.

## 조치
- `pnpm build`로 로컬 production build 통과를 확인했다.
- `pnpm dlx vercel env ls production`으로 production env 15개가 유지되어 있음을 확인했다.
- `pnpm dlx vercel --prod --yes`로 첫 production deployment를 생성했다.

## 결과
- deployment id: `dpl_2J9XPVLtPK4DucMCAc6fFxybCQJr`
- production deployment: `https://monthlysaju-et2xuqhl4-todocori.vercel.app`
- production alias: `https://monthlysaju.vercel.app`
- `https://monthlysaju.vercel.app`는 `/ko`로 307 redirect를 반환한다.
- `https://monthlysaju.vercel.app/ko`는 HTTP 200을 반환한다.

## 검증
- `pnpm build`: 통과
- `pnpm dlx vercel ls monthlysaju`: `Ready`, `Production`
- `curl -I https://monthlysaju.vercel.app`: 307 `/ko`
- `curl -I https://monthlysaju.vercel.app/ko`: 200

## 남은 확인
- 실제 브라우저에서 `/ko` 렌더링, Google OAuth, 첫 상담 API, Vertex 인증을 production URL 기준으로 smoke QA 해야 한다.
