# 월간사주 코딩 컨벤션

## 원칙
- pnpm만 사용한다.
- TDD로 구현한다.
- 테스트는 동작을 검증한다.
- 내부 협력 객체는 mock하지 않는다.
- DB, AI, 결제, 네트워크, 시간만 시스템 경계로 fake 처리한다.

## TypeScript
- `any` 사용을 피하고 `unknown`과 타입 가드를 사용한다.
- 상태는 discriminated union으로 표현한다.
- 외부 입력은 zod 또는 명시적 검증 함수를 통과시킨다.

## React
- 서버 컴포넌트를 기본으로 사용한다.
- 인터랙션이 필요한 leaf만 client component로 분리한다.
- 모바일 레이아웃 안정성을 우선한다.

