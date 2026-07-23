# 구글로그인 production origin 수정과 재배포

## 일시
- 2026-07-24 KST

## 문제
- 사용자가 Google 로그인 시 예전 Cloudflare quick tunnel인 `equally-brochures-ratio-palestinian.trycloudflare.com`로 이동해 `DNS_PROBE_FINISHED_NXDOMAIN`을 봤다.
- production `/api/auth/google?next=%2Fko%2Ftoday`를 직접 확인하니 Supabase authorize URL의 `redirect_to`가 `http://localhost:3000/auth/callback?...`로 생성되고 있었다.

## 원인
- Vercel production env의 `APP_ORIGIN`, `NEXT_PUBLIC_APP_URL`이 운영 URL이 아니라 로컬 개발 URL로 들어가 있었다.
- Cloudflare quick tunnel 주소는 임시 주소라 만료되면 DNS에서 사라진다.

## 조치
- Vercel production env에서 기존 `APP_ORIGIN`, `NEXT_PUBLIC_APP_URL`을 제거했다.
- 두 값을 `https://monthlysaju.vercel.app`로 다시 등록했다.
- production 재배포를 실행했다.

## 결과
- 새 deployment id: `dpl_2RQtu5AdMpL9VTBXBnREHUztucb1`
- `https://monthlysaju.vercel.app/api/auth/google?next=%2Fko%2Ftoday`가 생성하는 `redirect_to`는 `https://monthlysaju.vercel.app/auth/callback?next=%2Fko%2Ftoday`로 수정됐다.
- Supabase authorize URL은 production `redirect_to`를 받아 Google accounts URL로 HTTP 302 redirect한다.
- `/ko`는 HTTP 200이다.

## 남은 안내
- 브라우저가 이미 예전 OAuth URL을 열어둔 상태라면 새 탭에서 `https://monthlysaju.vercel.app/ko`로 다시 시작해야 한다.
- 계속 예전 터널로 간다면 기존 탭/캐시/쿠키에 남은 OAuth flow일 가능성이 있어 사이트 쿠키 삭제 후 다시 시도한다.
