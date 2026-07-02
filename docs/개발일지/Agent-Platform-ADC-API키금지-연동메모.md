# Agent Platform ADC API키금지 연동메모

## 확인

- 사용자가 공유한 화면은 조직 정책상 API 키 사용이 막혀 있고 ADC 사용을 요구한다.
- 따라서 기존 `GOOGLE_GENERATIVE_AI_API_KEY` 기반 Google Generative AI provider는 이 정책에 맞지 않는다.
- AI SDK 공식 문서 기준 Google Vertex provider는 `@ai-sdk/google-vertex` 패키지를 사용한다.
- Node 런타임은 Google Cloud 인증 옵션/ADC를 사용할 수 있고, project/location은 `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION` 환경변수를 기본으로 본다.

## 구현 방향

- API 키 생성 시도 중단.
- Google Cloud 프로젝트에서 Vertex AI/Agent Platform API 활성화.
- 로컬은 `gcloud auth application-default login` 또는 화면의 `setup_adc.sh`로 ADC 구성.
- 앱 코드는 `google("gemini-2.5-flash-lite")` 대신 `vertex("gemini-2.5-flash-lite")`를 사용하도록 전환.

## 주의

- `GOOGLE_VERTEX_API_KEY`는 Express mode용 API 키라서 현재 조직 정책에는 맞지 않는다.
- Vercel 같은 배포 환경에서는 ADC 파일을 직접 올리는 방식보다 서비스 계정 env 또는 Workload Identity Federation을 검토해야 한다.
