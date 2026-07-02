# 쿠키 배너 가림 및 랜딩 LCP 개선

- 일시: 2026-07-01 00:28:08 KST

## 작업 내용

- `design-taste-frontend` 기준을 읽고 디자이너 전달 문서의 P0/P1/P2를 회귀 테스트로 먼저 고정했다.
- 모바일 쿠키 배너를 하단 fixed 위치에서 상단 compact toast 위치로 옮겨 `/ko/reading`의 양력/음력 선택과 다음 버튼, 랜딩 캐릭터 카드 CTA와 겹치지 않게 했다.
- 데스크톱에서는 기존처럼 우하단 배너로 보이도록 `sm:top-auto sm:bottom-6`을 유지했다.
- 쿠키 배너 개인정보처리방침 링크를 `next/link`에서 프로젝트 i18n `Link`로 교체해 `/ko/privacy-policy` 흐름을 유지하게 했다.
- 랜딩 캐릭터 카드에 `index`를 전달하고 첫 번째 카드 이미지만 `priority`, `loading="eager"`, `fetchPriority="high"`를 적용했다. 나머지 카드는 lazy 로딩을 유지한다.

## TDD 기록

- 먼저 실패 확인:
  - `./node_modules/.bin/vitest run src/lib/design/design-audit-regression.test.ts`
  - 쿠키 배너 상단 배치, locale-aware 링크, 첫 이미지 priority 기준에서 실패 확인.
- 구현 후 통과:
  - 같은 타깃 테스트 1개 파일 13개 테스트 통과.

## 수정 파일

- `src/lib/design/design-audit-regression.test.ts`
- `src/components/ui/cookie-consent.tsx`
- `src/components/saju/landing/CharacterCards.tsx`

## 최종 검증

- `./node_modules/.bin/vitest run src/lib/design/design-audit-regression.test.ts`: 1개 파일, 13개 테스트 통과.
- `pnpm test`: 21개 파일, 60개 테스트 통과. 최초 sandbox 실행은 `fetch failed`였고, 네트워크 권한으로 재실행해 통과 확인.
- `./node_modules/.bin/tsc --noEmit`: 통과.
- `pnpm lint`: 통과. 최초 sandbox 실행은 `fetch failed`였고, 네트워크 권한으로 재실행해 통과 확인.
- `pnpm build`: 통과.
- `git diff --check`: 통과.
