# 월간사주 TRD

## 기술 스택
- Frontend: Next.js App Router, React 19, TypeScript
- Backend: Next.js Route Handler, Server Actions
- Data: Supabase
- AI: Vercel AI SDK 기반 관리자 선택형 provider adapter
- Styling: Tailwind CSS
- Test: Vitest
- Package manager: pnpm

## 아키텍처
- 원본 구조를 계승한다.
- 사주 계산, 오늘피드, 기억 요약, 결제 정책, 모델 선택은 순수 도메인 모듈로 분리한다.
- Route Handler와 Server Action은 외부 경계 역할만 맡는다.

## 확장 포인트
- AI provider registry
- 장기기억 검색 저장소
- 푸시/이메일/카카오 알림 스케줄러
- 관계 단계와 캐릭터 톤 정책

## 품질 기준
- 새 도메인 로직은 테스트를 먼저 작성한다.
- 외부 API, DB, 결제, 시간은 경계에서만 fake 처리한다.
- `pnpm test`, `pnpm build`, 필요 시 `pnpm lint`로 검증한다.

