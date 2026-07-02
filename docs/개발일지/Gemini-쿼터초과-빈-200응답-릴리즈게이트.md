# Gemini 쿼터초과 빈 200응답 릴리즈게이트

- 소스코드는 수정하지 않고 PM 관점에서 실사용 QA에서 발견된 빈 AI 응답 문제를 릴리즈 게이트로 기록했다.
- 기존 문서 `docs/pm/실사용-qa-빈-ai응답-개발자-전달.md`에 개발자 전달 문구, 수용 기준 보강, 릴리즈 게이트를 추가했다.
- 핵심 문제는 Gemini quota exceeded 상태에서 `/api/saju/chat`이 `200 OK`와 빈 body를 반환해 사용자가 성공으로 오해할 수 있다는 점이다.
- DB에는 사용자/AI 메시지가 저장되지 않았고, 서버 로그는 `[saju/chat] stream error {}`만 남아 원인 추적이 어렵다.
- 개발자에게는 provider failure/quota/network failure에서 명확한 실패 UI, 구조화된 로그, 별 차감 방지, 빈 200 회귀 테스트를 요구해야 한다.
- 누적 장애 리스크와 결정 사항을 `.codex/memory/`에 업데이트했다.
