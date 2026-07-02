# Agent Platform ADC API키금지 재확인

사용자는 Agent Platform의 API 액세스 인증 화면을 다시 공유했다.

핵심 내용:

- 인증 방식은 API 키와 애플리케이션 기본 사용자 인증 정보(ADC)가 있다.
- 현재 조직 보안 정책에서는 API 키가 허용되지 않는다.
- 대신 ADC를 사용해야 한다.
- 사용자는 `setup_adc.sh` 안내가 있는 화면을 보고 있다.

처리 방향:

- API 키 방식이 아니라 Vertex/Agent Platform ADC 방식으로 연동해야 한다고 재확인한다.
- 현재 프로젝트의 `@ai-sdk/google` + `GOOGLE_GENERATIVE_AI_API_KEY` 방식과 맞지 않는다는 점을 설명한다.
- `@ai-sdk/google-vertex`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`, ADC 설정이 필요하다고 안내한다.
