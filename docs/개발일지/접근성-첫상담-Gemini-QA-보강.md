# 접근성 첫상담 Gemini QA 보강

작업 내용:

- 캐릭터 카드 로그인 모달에 `role="dialog"`, `aria-modal`, 제목/설명 연결, Google 로그인/닫기 버튼 접근성 이름을 추가.
- 모달 열림 시 내부 포커스 이동, Tab/Shift+Tab 포커스 트랩, Escape 닫기, 닫힌 뒤 트리거 포커스 복귀를 구현.
- `돈 냄새`, `놓치면 안 돼`, `꼭 기억하셔야 해요` 등 압박성 문구를 완화하고, 치환 중 생긴 한국어 오탈자를 회귀 테스트로 방지.
- `scripts/qa-gemini-first-consultation.mjs`를 추가해 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계` 5개 Gemini 첫 상담 QA를 실행하고 `docs/qa` 리포트를 남기게 함.
- Gemini QA 러너의 짧은 하대 표현 검사는 단순 포함 검사 대신 단어 경계 정규식으로 처리.
- Gemini API 할당량 초과나 키 누락 시에도 실패 리포트를 생성하도록 보강.

검증:

- TDD red 확인:
  - 접근성 포커스 트랩 보강 전 `login-modal-accessibility.test.ts` 실패 확인.
  - 캐릭터 오탈자 회귀 테스트 추가 후 실패 확인.
  - Gemini QA 실패 리포트 테스트 추가 후 실패 확인.
- Green 확인:
  - `./node_modules/.bin/vitest run src/lib/design/login-modal-accessibility.test.ts src/lib/saju/characters.test.ts src/lib/saju/gemini-first-consultation-qa-runner.test.ts` 통과.
- 최종 로컬 검증:
  - `./node_modules/.bin/vitest run` 통과: 31 files, 90 tests.
  - `./node_modules/.bin/tsc --noEmit` 통과.
  - `./node_modules/.bin/eslint` 통과.
  - `./node_modules/.bin/next build` 통과. 최초 샌드박스 실행은 Turbopack 포트 바인딩 제한으로 실패했고, 권한 승격 실행에서 통과.
  - `git diff --check` 통과.
- `pnpm test` 참고:
  - `pnpm` 명령은 실행 전 의존성 install 검증 단계에서 `pnpm approve-builds`가 필요한 상태라 테스트 러너까지 진입하지 못함.
  - 로컬 설치된 동일 바이너리로 전체 테스트, 타입, lint, build는 별도 통과 확인.
- 실제 Gemini QA:
  - `node scripts/qa-gemini-first-consultation.mjs` 실행.
  - Gemini `gemini-2.5-flash-lite` 무료 할당량 초과로 실제 응답 QA는 실패.
  - 실패 리포트 생성: `docs/qa/gemini-first-consultation-qa-2026-06-30-failed.md`.
