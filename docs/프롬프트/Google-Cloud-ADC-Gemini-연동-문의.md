# Google Cloud ADC Gemini 연동 문의

사용자는 Google Cloud 무료 300달러 크레딧을 받았고, 조직 보안 정책상 API 키가 허용되지 않아 애플리케이션 기본 사용자 인증 정보(ADC)를 사용해야 하는 상황을 공유했다.

질문:

- 이 크레딧을 `gemini-2.5-flash-lite`와 어떻게 연동하는지.
- 현재 프로젝트의 Gemini API key 방식 대신 ADC 방식으로 연결하려면 무엇을 해야 하는지.

핵심 답변 방향:

- Google AI Studio API key가 아니라 Google Cloud Agent Platform/Vertex AI provider를 사용한다.
- 모델 ID는 `gemini-2.5-flash-lite`를 유지한다.
- 프로젝트에는 `@ai-sdk/google-vertex`와 `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`, ADC 인증 설정이 필요하다.
