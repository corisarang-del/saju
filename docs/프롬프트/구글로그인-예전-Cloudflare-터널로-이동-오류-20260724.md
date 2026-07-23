# 구글로그인 예전 Cloudflare 터널 이동 오류

## 일시
- 2026-07-24 KST

## 사용자 입력
> 구글로그인을 할려고 하니
> **사이트에 연결할 수 없음**
> equally-brochures-ratio-palestinian.trycloudflare.com에 오타가 있는지 확인하세요.
> DNS_PROBE_FINISHED_NXDOMAIN

## 해석
- `equally-brochures-ratio-palestinian.trycloudflare.com`는 만료된 Cloudflare quick tunnel 주소다.
- Google/Supabase OAuth 콜백 또는 앱 origin 설정 어딘가가 예전 임시 터널 또는 로컬 URL을 참조하는지 확인해야 했다.
