# ADC Vertex Gemini 연동 구현

## 배경

- Google Agent Platform ADC 설정이 성공했다.
- 기존 앱은 `@ai-sdk/google`과 `GOOGLE_GENERATIVE_AI_API_KEY`를 직접 사용하고 있어서 Google Cloud 크레딧/ADC 경로를 타지 못했다.

## 변경

- `@ai-sdk/google-vertex@3.0.146`을 추가했다.
  - 처음 설치한 5.x는 현재 `ai` 패키지와 model specification version이 맞지 않아 3.x로 낮췄다.
- `src/lib/ai/model.ts`에 provider 선택 어댑터를 추가했다.
  - `AI_PROVIDER=vertex` 또는 `GOOGLE_VERTEX_PROJECT`가 있으면 Vertex provider를 사용한다.
  - 명시적으로 `AI_PROVIDER=google`이면 기존 Google API key provider를 사용할 수 있다.
- `/api/saju/chat`, `/api/saju/suggestions`, `src/lib/saju/ai/analyzer.ts`가 공통 모델 함수를 사용하게 했다.
- `scripts/qa-gemini-first-consultation.mjs`가 Vertex provider를 사용할 수 있게 했다.
- `scripts/check-env.js`가 Vertex ADC 모드에서는 `GOOGLE_GENERATIVE_AI_API_KEY` 대신 `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`을 요구하게 했다.
- `.env.example`과 `.env.local`에 Vertex ADC 설정을 추가했다.
- `pnpm-workspace.yaml`의 `allowBuilds` placeholder를 실제 boolean 승인값으로 바꿨다.
  - `@parcel/watcher`, `@swc/core`, `esbuild`, `sharp`, `unrs-resolver`의 postinstall이 허용되어 `pnpm build`가 install 검증 단계에서 멈추지 않는다.

## 검증

- `@ai-sdk/google-vertex@5.0.6` 실제 호출 실패:
  - 현재 `ai` 패키지와 provider specification version이 맞지 않았다.
- `@ai-sdk/google-vertex@3.0.146`으로 변경 후 실제 Vertex ADC 호출 성공:
  - `gemini-2.5-flash-lite` 응답: `연결 성공`
- `./node_modules/.bin/vitest run src/lib/ai/model.test.ts scripts/check-env.test.mjs src/lib/ai/chat-finished-message.test.ts src/lib/ai/chat-completion-guard.test.ts --pool=forks --maxWorkers=1` 통과.
- `./node_modules/.bin/eslint ...` 통과.
- `node scripts/check-env.js` 통과.
- `node scripts/qa-gemini-first-consultation.mjs` 성공 리포트 생성:
  - `docs/qa/gemini-first-consultation-qa-2026-07-02.md`
- `./node_modules/.bin/tsc --noEmit` 통과.
- `pnpm test` 통과: 36 files, 118 tests.
- `pnpm lint` 통과.
- `pnpm build` 통과.

## 남은 확인

- QA 리포트에서 일부 케이스는 `1~3문단` 또는 고민 키워드 자동평가가 `확인필요`로 표시됐다.
- 실제 제품 품질 기준으로 첫 상담 프롬프트를 더 짧고 직접적으로 다듬을 여지가 있다.
