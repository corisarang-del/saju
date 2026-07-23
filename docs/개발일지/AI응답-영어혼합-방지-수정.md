# AI 응답 영어 혼합 방지 수정

## 날짜
2026-07-07

## 문제
실사용 상담 답변에서 자미두수와 서양 점성술 설명이 영어로 번역되어 섞이는 현상이 있었다. 특히 `Children's Palace`, `Emperor Star`, `Western Astrology`, `Ascendant`, `Midheaven`, `Aries` 같은 표현이 한국어 문장 안에 그대로 들어왔다.

## 원인
- `src/lib/saju/advanced-analysis.ts`의 서양 점성술 컨텍스트가 `물고기자리 (Pisces)`, `상승궁(ASC)`, `중천(MC)`처럼 영어 약어와 별자리 원문을 포함했다.
- `src/app/api/saju/chat/route.ts`의 채팅 시스템 지시문은 첫 상담 외래어 금지는 있었지만, 모든 후속 상담에 대해 한국어 전용 답변과 영어 병기 금지를 강하게 요구하지 않았다.

## 수정
- `src/lib/saju/advanced-analysis.ts`
  - 태양/달 별자리의 영어 괄호 표기를 제거했다.
  - `상승궁(ASC)`, `중천(MC)`을 `상승궁`, `중천`으로 바꿨다.
  - `주요 애스펙트`, `스퀘어`, `트라인`을 더 자연스러운 한국어 표현으로 정리했다.
- `src/app/api/saju/chat/route.ts`
  - 모든 답변을 한국어로만 작성하라는 전역 규칙을 추가했다.
  - 원문 데이터나 이전 답변에 영어가 있어도 영어 번역/영어 병기를 넣지 말라고 명시했다.
  - `Western Astrology`, `Ascendant`, `Midheaven`, `Children's Palace`, `Emperor Star`, `supportive star` 같은 영어 설명을 금지하고 한국어로 풀어 말하게 했다.

## 회귀 테스트
- `src/lib/saju/advanced-analysis-language.test.ts`를 추가해 고급 분석 컨텍스트에 영어 별자리 괄호 표기가 남지 않도록 막았다.
- `src/lib/saju/chat-stream-failure-regression.test.ts`에 채팅 지시문 한국어 전용 규칙 검사를 추가했다.

## 검증
```bash
pnpm test src/lib/saju/advanced-analysis-language.test.ts src/lib/saju/chat-stream-failure-regression.test.ts
```

결과: 2 files / 9 tests 통과.
