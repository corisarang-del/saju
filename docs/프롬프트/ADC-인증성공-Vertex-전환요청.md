# ADC 인증성공 Vertex 전환요청

사용자는 Agent Platform ADC 설정이 성공했다고 공유했다.

원문 요약:

- `SUCCESS! Your Model API access is fully working.`
- ADC Credentials 경로: `/Users/apple/.config/gcloud/application_default_credentials.json`

처리 방향:

- 기존 Gemini API key provider를 유지하면 ADC를 쓰지 못하므로 Vertex provider로 전환한다.
- `gemini-2.5-flash-lite` 모델 ID는 유지한다.
- 로컬 `.env.local`에는 `AI_PROVIDER=vertex`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`을 추가한다.
- 실제 Vertex ADC 짧은 호출과 첫 상담 QA 스크립트로 동작을 확인한다.
