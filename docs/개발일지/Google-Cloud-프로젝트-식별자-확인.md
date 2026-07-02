# Google Cloud 프로젝트 식별자 확인

## 입력

- 프로젝트 번호: `282867567918`
- 프로젝트 아이디: `project-3473cfe3-7869-4a96-855`

## 확인

- `.env.local`의 `GOOGLE_VERTEX_PROJECT`는 이미 `project-3473cfe3-7869-4a96-855`로 설정돼 있다.
- `.env.local`의 `AI_PROVIDER=vertex`, `AI_MODEL=gemini-2.5-flash-lite`, `GOOGLE_VERTEX_LOCATION=us-central1` 설정도 유지돼 있다.

## 메모

- Vertex AI SDK/ADC 호출에는 프로젝트 번호가 아니라 프로젝트 아이디를 쓰는 구성이 현재 코드와 맞다.
- 프로젝트 번호는 Google Cloud 콘솔, IAM, 결제, 로그 추적에서 참조할 수 있게 기록만 남긴다.
