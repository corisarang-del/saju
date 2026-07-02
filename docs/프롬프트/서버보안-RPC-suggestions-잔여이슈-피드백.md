# 서버보안 RPC suggestions 잔여이슈 피드백

사용자는 서버개발자와 보안담당자 피드백을 개발자에게 전달할 수 있게 정리하고, 지금까지 나온 내용을 문서화하고 메모리에 저장해 달라고 요청했어. 핵심은 기존 `decrement_star` grant와 새 `deduct_stars_for_report` grant가 `authenticated`에 열려 있어 RPC 직접 호출 위험이 남았고, 최소한 함수 내부에서 `auth.uid() = p_user_id`와 reading 소유권을 강제해야 한다는 점이야. 또 `/api/saju/suggestions`는 인증/rate limit/daily quota 없이 Gemini를 호출해서 공개 API 비용 폭탄 경로가 남아 있어.
