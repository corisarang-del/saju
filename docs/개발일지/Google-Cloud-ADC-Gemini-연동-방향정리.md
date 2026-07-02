# Google Cloud ADC Gemini 연동 방향정리

## 확인

- 현재 프로젝트는 `@ai-sdk/google`과 `GOOGLE_GENERATIVE_AI_API_KEY`를 사용한다.
- 사용자의 Google Cloud 조직 정책은 API 키를 허용하지 않아 기존 방식으로는 무료 크레딧/조직 프로젝트와 연결하기 어렵다.
- 공식 문서 기준 `gemini-2.5-flash-lite`는 Agent Platform/Vertex AI에서 사용할 수 있는 GA 모델 ID다.

## 방향

- `@ai-sdk/google-vertex` provider로 전환한다.
- Node 런타임에서는 ADC 또는 `GOOGLE_APPLICATION_CREDENTIALS` 기반 서비스 계정을 사용한다.
- Vercel/Edge 런타임이면 `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_PRIVATE_KEY_ID` 환경변수 방식이 필요하다.
- 프로젝트 env는 `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION=us-central1`부터 시작한다.

## 다음 구현 후보

- `src/lib/ai/model.ts`에 provider adapter를 만들어 Google API key 방식과 Vertex ADC 방식을 분리한다.
- `/api/saju/chat`, `/api/saju/suggestions`, `src/lib/saju/ai/analyzer.ts`, `scripts/qa-gemini-first-consultation.mjs`의 직접 `google(...)` 호출을 공통 모델 함수로 교체한다.
