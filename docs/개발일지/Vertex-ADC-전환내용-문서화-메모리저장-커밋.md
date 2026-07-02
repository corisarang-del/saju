# Vertex ADC 전환내용 문서화 메모리저장 커밋

## 정리한 내용

- Google Agent Platform ADC 인증 성공 후 월간사주 AI provider를 Vertex ADC 경로로 전환했다.
- 로컬 실행 기준 프로젝트 아이디는 `project-3473cfe3-7869-4a96-855`, 프로젝트 번호는 `282867567918`이다.
- 앱 환경변수는 `AI_PROVIDER=vertex`, `AI_MODEL=gemini-2.5-flash-lite`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION` 조합을 기준으로 한다.
- `@ai-sdk/google-vertex@5.0.6`은 현재 `ai` 패키지와 spec version이 맞지 않아 실패했고, `@ai-sdk/google-vertex@3.0.146`으로 실제 호출 성공을 확인했다.
- `pnpm-workspace.yaml`의 `allowBuilds` placeholder를 boolean 승인값으로 바꿔 `pnpm build`가 install 검증 단계에서 멈추지 않게 했다.

## 메모리 저장

- `.codex/memory/project.md`에 Vertex ADC 전환 현황, 프로젝트 식별자, 검증 결과를 추가했다.
- `.codex/memory/learnings.md`에 AI SDK provider 버전 호환성, pnpm `allowBuilds` placeholder 문제, Playwright CLI 로그 ignore 교훈을 추가했다.

## 검증 기록

- `gemini-2.5-flash-lite` Vertex ADC 실제 호출 성공: `연결 성공`
- `pnpm test` 통과: 36 files, 118 tests
- `pnpm lint` 통과
- `pnpm build` 통과
- `node scripts/check-env.js` 통과
- `./node_modules/.bin/tsc --noEmit` 통과
- `git diff --check` 통과

## 커밋 주의

- `.env.local`은 ignore 대상이라 커밋하지 않는다.
- `.playwright-cli/`는 검증 로그 폴더라 `.gitignore`에 추가하고 커밋 대상에서 제외한다.
