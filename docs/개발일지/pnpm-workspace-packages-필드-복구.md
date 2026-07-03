# pnpm workspace packages 필드 복구

## 문제

- 사용자가 `pnpm run dev` 실행 시 `packages field missing or empty` 오류를 전달했다.
- `pnpm-workspace.yaml`에 `allowBuilds`만 있고 `packages` 필드가 없었다.
- pnpm 버전/실행 경로에 따라 workspace 파일에 `packages`가 없으면 `pnpm run` 자체가 실패할 수 있다.

## 처리

- root package를 workspace package로 명시하는 회귀 테스트를 먼저 추가한다.
- `pnpm-workspace.yaml`에 `packages: ['.']`를 추가한다.
- 기존 `allowBuilds` 승인은 유지한다.

## 검증

- 회귀 테스트 실패 확인:
  - `pnpm exec vitest run src/lib/next/pnpm-workspace-config.test.ts --pool=forks --maxWorkers=1`
  - `packages:`가 없어 의도대로 실패했다.
- `pnpm-workspace.yaml` 수정 후 같은 테스트 통과.
- `pnpm run dev`는 더 이상 `packages field missing or empty`를 내지 않고 `next dev`까지 진입했다.
- 샌드박스에서는 포트 바인딩 권한 때문에 `listen EPERM 0.0.0.0:3000`이 발생했다.
- 권한 상승 환경에서 `pnpm run dev` 실행 시 `http://localhost:3000`으로 정상 Ready 확인 후 서버를 종료했다.
- `pnpm test` 통과: 37 files, 122 tests.
- `pnpm lint` 통과.
- `git diff --check` 통과.
