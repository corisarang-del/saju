# pnpm run dev packages field missing 재발

사용자가 로컬에서 `pnpm run dev` 실행 시 다음 오류가 난다고 전달했다.

```text
ERROR packages field missing or empty
For help, run: pnpm help run
```

처리 방향:

- `pnpm-workspace.yaml`의 workspace 선언을 확인한다.
- `packages` 필드가 없으면 root package를 명시해 `pnpm run dev`가 scripts를 정상 해석하게 한다.
- 회귀 테스트를 추가해 workspace 설정이 다시 빠지지 않게 한다.
