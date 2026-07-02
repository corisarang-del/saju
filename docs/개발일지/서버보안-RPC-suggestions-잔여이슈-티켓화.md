# 서버보안 RPC suggestions 잔여이슈 티켓화

- 소스코드는 수정하지 않고 PM 관점에서 서버개발자/보안담당자 피드백을 개발자 전달 문서로 정리했어.
- `docs/pm/서버보안-RPC-suggestions-잔여이슈-개발자-전달.md`에 RPC 직접 호출 위험과 suggestions 비용 폭탄 경로를 정리했어.
- `decrement_star`와 `deduct_stars_for_report`가 `authenticated`에 열려 있으면 앱 서버 정책을 우회할 수 있으므로 `auth.uid() = p_user_id`와 reading 소유권 검증을 수용 기준으로 잡았어.
- 클라이언트 직접 호출이 필요 없는 민감 RPC는 `service_role` 전용으로 두라고 기록했어.
- `/api/saju/suggestions`는 인증 또는 IP/user 기준 rate limit과 daily quota가 필요하다고 정리했어.
- 누적 보안 결정과 학습 내용을 `.codex/memory/`에 업데이트했어.
