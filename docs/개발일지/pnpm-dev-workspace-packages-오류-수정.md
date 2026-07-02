# pnpm dev workspace packages 오류 수정

## 문제
- `pnpm run dev` 실행 시 `ERROR packages field missing or empty`가 발생했다.

## 원인
- 루트에 추적되지 않은 `pnpm-workspace.yaml`이 생겨 있었다.
- 파일 내용에 `packages`가 없고 `allowBuilds`만 있어 pnpm이 workspace 설정을 잘못된 상태로 읽었다.
- 이 프로젝트는 현재 단일 Next.js 앱이라 workspace 파일이 필요하지 않다.

## 조치
- 문제 원인인 `pnpm-workspace.yaml`을 삭제했다.
- `package.json`의 `scripts.dev`는 정상적으로 `next dev`를 가리키고 있어 건드리지 않았다.

## 검증
- 삭제 후 `packages field missing or empty` 오류는 재현되지 않았다.
- 현재 Codex 실행 환경에서는 이후 pnpm이 registry fetch/install을 시도하다 `[ERR_PNPM_META_FETCH_FAIL]`와 `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY]`로 실패했다.
- 로컬에는 `node_modules`와 `node_modules/.bin/next`가 존재한다.

## 다음 확인
- 사용자 터미널에서 다시 `pnpm run dev`를 실행한다.
- 같은 fetch/install 오류가 뜨면 `pnpm install`을 먼저 실행하거나 pnpm의 dependency status check/confirm purge 설정을 별도로 확인한다.
