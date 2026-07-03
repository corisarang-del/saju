# Project Memory

## 기본 정보
- 프로젝트명: 월간사주
- 설명: 먼저 챙겨주는 사주친구이자 대화형 인생운 코치
- 주요 고객: 20대 여성 고객
- 현재 날짜: 2026-06-30

## 기술 스택
- Next.js App Router
- React 19
- TypeScript
- Supabase Auth + PostgreSQL
- Vercel AI SDK + Google Gemini
- Paddle 결제
- Tailwind CSS
- Vitest
- pnpm

## 핵심 제품 흐름
- 랜딩에서 캐릭터와 무료 맛보기 결과 확인
- Google 로그인
- 가입 후 별 3개 무료 지급
- 캐릭터별 사주 채팅
- 별 1개당 메시지 1회 사용
- 추가 별 충전 후 계속 사용
- 오늘피드, 리포트, 마이 영역으로 확장

## 가격 정책
- 1별 = 메시지 1회
- 가입 후 3회 무료
- 30별: 9,900원
- 70별: 19,900원
- 250별: 39,900원
- 문의/환불 이메일: corisarang@gmail.com

## 주요 문서
- PM 인수인계: `docs/pm/현재-프로젝트-pm-인수인계.md`
- 검증 이슈 인수인계: `docs/pm/개발자-에이전트-검증-이슈-인수인계.md`
- PRD: `docs/planning/01-prd.md`
- TRD: `docs/planning/02-trd.md`
- 화면 구성: `docs/planning/06-screens.md`

## 현재 제품 방향
- 가입 전 신뢰 형성이 중요하다.
- 랜딩에 결과 샘플과 가격 기준을 바로 보여준다.
- 캐릭터 말투는 개성은 유지하되 20대 여성 고객에게 무례하게 들리지 않아야 한다.
- 고민 선택지는 사주 용어보다 생활 언어를 우선한다.
- 현재 고객 평가는 “광고 같은 사주앱”에서 “내 고민을 차분히 정리해주는 상담형 앱” 쪽으로 개선됐다.
- 다음 9점대 개선 포인트는 쿠키 배너, 성별 입력 안내, 현우 톤, 가격표 접근성, 로그인 사이드바 우선순위다.

## 최신 고객 피드백
- 쿠키 배너는 `더 나은 서비스를 위해 쿠키를 사용합니다`보다 `서비스 이용에 필요한 쿠키만 사용해` 쪽이 더 신뢰감을 준다.
- 성별 입력에는 `사주 계산 기준에 필요해`라는 한 줄 안내가 필요하다.
- 현우 캐릭터의 `위험 경고`, `미리 알아야 해`는 일부 유저에게 겁주는 느낌을 줄 수 있다.
- 가격표의 배지는 `별 70개인기`처럼 붙어 읽히지 않게 접근성을 보강해야 한다.
- 데스크톱 첫 화면에서 로그인 요구가 서비스 가치보다 먼저 보이지 않도록 점검해야 한다.

## 2026-07-01 추가 고객 피드백
- 캐릭터 카드의 `가입시 3별 무료 지급`은 다른 영역의 `3회 무료`와 표현이 달라 덜 직관적이다.
- 가격표는 접근성 개선 후에도 화면상 `별 70개인기`, `별 250개최고 가성비`처럼 붙어 보일 여지가 있다.
- 태어난 시간 입력은 `선택`만 보이고 `몰라도 분석 가능해`가 바로 보이지 않아 부담이 남는다.
- 랜딩에서 캐릭터 카드가 무료 맛보기/가격보다 먼저 보여 일부 유저는 가격 확인 전 로그인 모달을 볼 수 있다. 큰 문제는 아니지만 인지 순서 점검이 필요하다.
- 전체 컬러는 괜찮지만 장기 사용감을 위해 일부 따뜻한 중립색을 섞으면 덜 피곤할 수 있다.

## 2026-07-01 20대 여성 유저 재리뷰
- 소스코드 수정 없이 현재 랜딩과 사주 입력 흐름을 유저 관점으로 다시 확인했다.
- 종합 평가는 `9.1/10`이다.
- `3별` 중심 표현이 `3회 무료`, `3회 무료 상담`으로 정리되어 무료 체험 가치가 더 직관적으로 보인다.
- 현우 캐릭터의 `위험 경고`, `미리 알아야 해` 톤이 `주의 포인트`, `미리 알면 덜 흔들려`로 완화되어 겁주는 느낌이 줄었다.
- 입력폼에는 개인정보 안내, 생년월일 세부 라벨, 성별 사용 목적 안내, 태어난 시간 미입력 가능 안내가 들어가 정보 입력 불안이 크게 줄었다.
- 쿠키 배너는 필요한 쿠키만 쓴다는 문구와 CTA를 덜 가리는 위치로 개선되어 신뢰감과 사용성이 좋아졌다.
- 가격표는 접근성 라벨과 배지 분리 구조가 들어가 스크린리더 기준 `별 70개, 인기 상품, 19,900원`처럼 이해될 수 있게 보강됐다.
- 후기 영역은 과장된 적중 사례보다 차분한 고민 정리 경험을 보여줘 20대 여성 고객에게 더 자연스럽다.
- 남은 점검 포인트는 캐릭터 카드가 무료 맛보기/가격보다 먼저 보이는 인지 순서, 모바일 실제 시각 레이아웃에서 가격 배지 줄바꿈, 로그인 이후 첫 상담 응답 품질이다.

## 2026-07-01 디자이너 리뷰 Findings
- P0: `cookie-consent.tsx` fixed 배너가 `/ko/reading` 390x844에서 `BirthDateForm.tsx`의 양력/음력 선택 영역을 가린다.
- P0: 랜딩에서도 캐릭터 카드 하단 `대화하기` CTA가 쿠키 배너/하단 탭에 가려 첫 화면 행동성이 약하다.
- P1: 쿠키 배너 개인정보 링크가 `/privacy-policy`로 이동해 locale을 잃는다. 한국어 흐름에서는 `/ko/privacy-policy`가 자연스럽다.
- P2: `CharacterCards.tsx` 첫 캐릭터 이미지가 LCP로 잡히는데 priority/eager 로딩이 없어 Next 경고가 발생한다.
- 디자인 수정 우선순위는 쿠키 배너/하단 탭이 CTA를 가리지 않게 하는 것, 브랜드 색상 체계를 통합하는 것, 사주 정보 입력 UI를 통일하는 것이다.
- 다크 퍼플, 베이지/티얼, 토스 블루가 섞여 있으므로 primary CTA와 별 과금 단위는 하나의 시각 언어로 정리해야 한다.

## 2026-07-01 디자인 개선 재리뷰 Findings
- 하단 쿠키 배너가 입력/CTA를 차단하던 P0는 해결됐다.
- 개인정보 링크 locale 유지, 첫 캐릭터 이미지 LCP 경고, 접근성 라벨, `3회 무료` 문구는 개선됐다.
- 남은 P1은 상단 fixed 쿠키 배너가 모바일 `/ko` H1과 `/ko/reading` 제목을 덮는 것이다.
- 모바일 쿠키 안내는 fixed overlay보다 inline notice 또는 공간 예약형 배너가 더 안정적이다.
- 디자인 회귀 테스트는 390x844 실제 시각 겹침 검증까지 포함해야 한다.
- 개선 확인: 달력 선택/다음 버튼 차단은 해소됐고, `/ko/privacy-policy` locale 링크 유지도 정상으로 보인다.
- 개선 확인: `CharacterCards.tsx:135`의 `priority`/`eager`/`fetchPriority` 적용으로 첫 캐릭터 이미지 LCP 경고는 사라진 것으로 보인다.
- 개선 확인: 가격 배지 분리, 접근성 라벨, 후기 톤도 20대 여성 고객 관점에서 좋아졌다.

## 2026-07-01 디자인 개선 최종재리뷰 Findings
- 개발자 후속 수정으로 쿠키 안내가 fixed overlay에서 문서 흐름 안의 `region` notice로 바뀌었다.
- `/ko` 390x844에서 쿠키 안내, 내비게이션, H1, 캐릭터 카드가 겹치지 않는다.
- `/ko/reading` 390x844에서 쿠키 안내가 제목과 입력폼을 밀어내고, 하단 `다음` CTA도 가리지 않는다.
- 쿠키 개인정보 링크는 `/ko/privacy-policy`로 locale을 유지한다.
- `CharacterCards.tsx:135`의 첫 이미지 `priority`/`eager`/`fetchPriority`는 유지되고, Playwright warning 기준 LCP 경고는 재현되지 않았다.
- 현재 디자인 재리뷰 기준 릴리즈 차단급 P0/P1 이슈는 없다.
- 남은 과제는 Playwright bounding box 기반 시각 겹침 자동화와 pnpm 실행 경로의 `[ERROR] fetch failed` 환경 이슈 분리다.

## 2026-07-01 보안 리뷰 Findings
- P0: 핵심 사주 테이블 RLS가 꺼져 있고 `readingId`/`compatibilityId` 조회에 `user_id` 소유자 검증이 부족해 개인정보 IDOR 위험이 있다.
- P0: `/api/saju/deduct-stars`가 클라이언트 `amount`를 신뢰해 음수 amount로 별 잔액이 늘어날 수 있고, 동시 요청 race condition에도 약하다.
- P0: Paddle 웹훅이 실제 결제 `items.price.id`가 아니라 브라우저 customData의 `productType`으로 지급량을 정해 결제 검증 우회와 중복 지급 위험이 있다.
- P1: Gemini 등 비용 발생 API에 rate limit/daily quota가 부족하고, `suggestions`는 인증 없이 호출 가능하다.
- P1: `chat-actions.ts`의 Server Action들이 `readingId`만 받고 소유자 검증을 하지 않아 RLS 비활성 상태에서 IDOR 경로가 된다.
- P2: 관리자 권한은 이메일 allowlist 중심이라 별 수동 조정 같은 민감 작업에 감사 로그, IP 제한, 추가 인증이 부족하다.
- P2: OAuth callback URL 생성에서 `Origin` 헤더를 우선 신뢰해 운영 환경에서는 고정 origin 우선 전략이 필요하다.
- 공개 출시 전 릴리즈 게이트는 RLS 복구, 모든 reading/compatibility 소유자 검증, 별 차감 원자화, Paddle 실제 결제 상품 기준 지급과 idempotency 보장이다.

## 2026-07-01 첫 상담 품질 피드백
- 랜딩 화면 설득은 꽤 올라왔고, 다음 핵심은 로그인 후 첫 상담 답변 품질이다.
- 캐릭터 카드가 무료 맛보기/가격보다 먼저 나오면 가격 확인 전 로그인 모달을 볼 수 있어 전환 흐름에 작은 마찰이 남는다.
- 모바일 실제 화면에서 가격 배지 줄바꿈과 시각 분리감은 한 번 더 확인해야 한다.
- 첫 상담 답변은 20대 여성 고객이 “내 고민을 차분히 정리해준다”고 느끼는지가 핵심이다.
- 대표 고민 5개인 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계` 기준으로 첫 답변 품질을 검증해야 한다.

## 2026-07-01 실사용 QA 빈 AI 응답 Findings
- Gemini quota exceeded 상태에서 `/api/saju/chat`이 `200 OK`를 반환하지만 response body가 빈 문자열인 문제가 발견됐다.
- DB에는 사용자 메시지와 AI 메시지가 저장되지 않았고, 서버 로그에는 `[saju/chat] stream error {}`만 남았다.
- 사용자 입장에서는 “성공한 줄 알았는데 답변이 안 나오는” 상태가 될 수 있어 첫 상담 품질 이전의 응답 안정성 문제다.
- 개발자 전달 문서는 `docs/pm/실사용-qa-빈-ai응답-개발자-전달.md`에 정리돼 있다.
- 공개 전 Gemini 실패, quota exceeded, network failure에서 명확한 실패 UI와 구조화된 로그가 필요하다.
- 빈 `200 OK` 응답 재발은 릴리즈 차단으로 본다.

## 2026-07-01 실사용 AI 응답 수정후 QA
- 개발자 수정 후 `pnpm test`, `pnpm lint`, `pnpm test:env`, `pnpm build`가 모두 통과했다.
- 임시 Supabase 인증 유저로 `/api/saju/chat`에 실제 커리어 고민을 보냈고 `text/event-stream` 정상 응답을 받았다.
- AI 응답은 빈 문자열이 아니었고 이직/커리어 고민을 반영했다.
- `saju_chat_messages`에 user/assistant 메시지 저장이 확인됐고, `user_stars.balance`는 3에서 2로 차감됐다.
- 이전 P1인 빈 `200 OK` 응답은 정상 응답 케이스 기준 해결 확인했다.
- QA 후 임시 Supabase 유저, reading, 채팅 메시지, 별 데이터와 `/tmp/saju-qa-session.json`을 삭제했다.

## 2026-07-02 채팅 응답 안정화 현황
- 초기 분석 미노출, 부분 답변 저장, 후속 질문 무응답, 연속 빈 응답 안내 이슈를 순차적으로 수정했다.
- `ChatBubble`은 이제 text part뿐 아니라 stream error part와 빈 assistant fallback도 사용자에게 보이는 문구로 처리한다.
- `/api/saju/chat`은 `finishReason === "error"`, 빈 assistant, 너무 짧은 초기 분석을 성공으로 저장/차감하지 않는다.
- 성공한 assistant 답변 뒤 `saju_readings.chat_used`를 증가시켜 후속 질문이 계속 첫 상담 규칙으로 처리되지 않게 했다.
- `ChatRoom`은 AI SDK `onFinish.message`만 믿지 않고, 최종 `messages` 배열의 마지막 assistant 메시지를 fallback으로 읽는다.
- 관련 유틸은 `src/lib/ai/ui-message-display.ts`, `chat-completion-guard.ts`, `chat-finished-message.ts`에 분리했다.
- 최근 검증 기준 `vitest`, `eslint`, `tsc --noEmit`, `next build`, `git diff --check`가 통과했다.

## 2026-07-02 실사용 QA Gemini quota 현황
- 로컬 바이너리 기준 `vitest`는 35개 파일 / 110개 테스트 통과, `eslint` 통과, env 검사 통과, `next build`는 권한 상승 환경에서 통과했다.
- `pnpm test`는 pnpm 11 `allowBuilds` 설정 미확정으로 install 검사 단계에서 실패해 코드 실패와 분리했다.
- `/ko`와 `/ko/reading` Playwright 스모크는 정상이고, 입력 1/2에서 2/2 고민 선택으로 전환되며 비로그인 분석 시작 시 `로그인이 필요합니다.`가 보인다.
- 실제 Supabase 임시 유저로 `/api/saju/chat`을 호출했을 때 Gemini quota 초과 메시지가 사용자용 스트림 에러로 내려왔다.
- 실패 상태에서 `saju_chat_messages` 저장 0건, 별 잔액 3 유지, `chat_used` 0 유지가 확인됐다.
- 현재 환경에서는 실제 상담 답변 생성은 Gemini free tier quota 초과로 실패한다.
- 관련 실패 보고서: `docs/qa/gemini-first-consultation-qa-2026-07-02-failed.md`.

## 2026-07-03 Vertex ADC Gemini 전환
- Google Agent Platform ADC 인증이 성공했고, 로컬 ADC 파일은 `/Users/apple/.config/gcloud/application_default_credentials.json`에 있다.
- Google Cloud 프로젝트 아이디는 `project-3473cfe3-7869-4a96-855`, 프로젝트 번호는 `282867567918`이다.
- 앱 실행 환경은 `AI_PROVIDER=vertex`, `AI_MODEL=gemini-2.5-flash-lite`, `GOOGLE_VERTEX_PROJECT=project-3473cfe3-7869-4a96-855`, `GOOGLE_VERTEX_LOCATION=us-central1` 조합을 기준으로 한다.
- 기존 `@ai-sdk/google` API key 경로는 유지하되, Vertex/ADC 모드에서는 `@ai-sdk/google-vertex@3.0.146`을 사용한다.
- 실제 Vertex ADC 호출에서 `gemini-2.5-flash-lite`가 `연결 성공`으로 응답했다.
- 첫 상담 QA 스크립트도 Vertex provider를 사용할 수 있게 바뀌었고, 성공 리포트는 `docs/qa/gemini-first-consultation-qa-2026-07-02.md`에 남았다.
- 최신 검증 기준 `pnpm test`, `pnpm lint`, `pnpm build`, `node scripts/check-env.js`, `tsc --noEmit`, `git diff --check`가 통과했다.

## 2026-07-03 실사용 상담응답 QA
- `pnpm test` 통과: 36개 파일 / 118개 테스트.
- `pnpm lint`, `pnpm test:env` 통과.
- `pnpm build`는 샌드박스 Turbopack 포트 바인딩 문제를 권한 상승 환경에서 분리했고, 실제 빌드는 통과했다.
- `/ko`, `/ko/reading` Playwright 스모크와 입력 1/2 -> 고민 선택 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지 확인.
- 실제 Supabase 임시 유저로 `/api/saju/chat` 호출 결과 `text/event-stream` 응답 body length 1456, assistant length 691, user/assistant 저장, 별 3 -> 2 차감, `chat_used` 1 증가, 제목 `이직운세` 생성 확인.
- Vertex 전환 후 quota 메시지 없이 실제 상담이 생성된다.
- 남은 P1은 답변 품질이다. 5케이스 live QA에서 3개 답변은 4문단이라 1~3문단 기준을 넘었고, 1개 답변은 너무 짧고 다음 질문이 없었다.
- 실제 API 응답에도 불필요한 이모지와 외래어가 섞일 수 있어 첫 상담 톤 제한이 더 필요하다.

## 2026-07-03 첫 상담 품질 보완 완료
- 첫 상담 규칙을 정확히 2문단 중심으로 좁히고, 마지막 문장은 물음표로 끝나게 했다.
- 첫 상담에서는 이모지/이모티콘과 가벼운 외래어(OK, 체크, 리셋, 플랜, 솔루션, 타이밍)를 금지한다.
- 첫 상담 생성 토큰 상한은 550 tokens, live QA 스크립트 상한은 500 tokens로 낮췄다.
- Gemini 5케이스 live QA 재실행 결과, 모든 케이스가 고민 반영, 금지 표현 없음, 1~3문단, 질문으로 끝남, 이모지 없음, 가벼운 외래어 없음 기준을 통과했다.
- 최신 품질 게이트는 `pnpm test` 36 files / 121 tests, `pnpm lint`, `pnpm test:env`, `pnpm build` 통과다.

## 2026-07-03 첫 상담 품질 수정후 재검증
- `pnpm test` 통과: 37개 파일 / 122개 테스트.
- `pnpm lint`, `pnpm test:env` 통과.
- `pnpm build`는 샌드박스 Turbopack 포트 바인딩 문제를 권한 상승 환경에서 분리했고, 실제 빌드는 통과했다.
- `/ko`, `/ko/reading` Playwright 스모크와 입력 1/2 -> 고민 선택 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지 확인.
- 실제 Supabase 임시 유저로 `/api/saju/chat` 호출 결과 `text/event-stream` 응답 body length 1408, assistant length 649, user/assistant 저장, 별 3 -> 2 차감, `chat_used` 1 증가, 제목 `이직운, 올해 괜찮을까` 생성 확인.
- 실제 API 응답은 2문단, 이모지 없음, 가벼운 외래어 없음까지 개선됐지만 마지막 문장이 질문으로 끝나지 않았다.
- 5케이스 live QA는 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음 기준은 모두 통과했다.
- 5케이스 중 `썸/재회` 답변에 `시기(타이밍)`이 남아 가벼운 외래어 없음 기준 1건 확인 필요가 남았다.
- 현재 상태는 기능 정상, 품질 P1 일부 잔여다.

## 2026-07-03 첫 상담 품질 잔여 QA 보완
- 괄호 외래어 병기 금지 규칙을 첫 상담 프롬프트와 `/api/saju/chat` 시스템 규칙에 추가했다.
- live QA 스크립트는 `parenthesizedForeignWordPattern`으로 `시기(타이밍)` 같은 표현을 검출한다.
- 첫 상담 마지막 문장은 실제 질문 1문장이어야 하며, 설명문이나 조언문으로 끝내지 않는 규칙을 추가했다.
- 최신 Gemini 5케이스 live QA는 모든 케이스가 고민 반영, 금지 표현 없음, 1~3문단, 질문으로 끝남, 이모지 없음, 가벼운 외래어 없음 기준을 통과했다.
- 최신 검증은 `pnpm test` 37 files / 122 tests, `pnpm lint`, `pnpm build` 통과다.

## 2026-07-03 첫 상담 품질 재수정후 실사용 QA
- `pnpm test` 통과: 37개 파일 / 122개 테스트.
- `pnpm lint`, `pnpm test:env` 통과.
- `pnpm build`는 샌드박스 Turbopack 포트 바인딩 문제를 권한 상승 환경에서 분리했고, 실제 빌드는 통과했다.
- `/ko`, `/ko/reading` Playwright 스모크와 입력 1/2 -> 고민 선택 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지 확인.
- 실제 Supabase 임시 유저로 `/api/saju/chat` 호출 결과 `text/event-stream` 응답 body length 1226, assistant length 516, user/assistant 저장, 별 3 -> 2 차감, `chat_used` 1 증가, 제목 `이직운세` 생성 확인.
- 실제 API 응답은 2문단, 마지막 질문 종료, 이모지 없음, 가벼운 외래어 없음, 커리어 고민 반영까지 통과했다.
- 5케이스 live QA는 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음 기준은 모두 통과했다.
- 5케이스 중 `친구/가족관계` 답변에 `체크`가 남아 가벼운 외래어 없음 기준 1건 확인 필요가 남았다.
- 현재 상태는 기능 정상, 실제 API 단건 품질 정상, 대표 5케이스 품질 P1 일부 잔여다.

## 2026-07-03 첫 상담 품질 최종재수정후 live QA
- `pnpm test` 통과: 37개 파일 / 122개 테스트.
- `pnpm lint`, `pnpm test:env`, `pnpm build` 통과.
- Gemini 5케이스 live QA 보고서 `docs/qa/gemini-first-consultation-qa-2026-07-03.md` 생성.
- 5케이스 모두 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음 기준을 통과했다.
- 실제 Supabase 임시 유저로 `/api/saju/chat` 호출 결과 `text/event-stream` 응답 body length 1267, assistant length 557, user/assistant 저장, 별 3 -> 2 차감, `chat_used` 1 증가, 제목 `이직운세` 생성 확인.
- 실제 API 응답은 2문단, 마지막 질문 종료, 이모지 없음, 가벼운 외래어 없음, 커리어 고민 반영까지 통과했다.
- Playwright로 `/ko/reading` 입력 1/2 -> 고민 선택 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지 확인.
- 현재 상태는 기능 정상, 실제 API 단건 품질 정상, 대표 5케이스 품질 정상이다.

## 2026-07-03 20대 여성 유저 접근성/첫상담 최종QA 후 재리뷰
- 소스코드 수정 없이 개발자 수정분을 읽기 전용으로 확인했다.
- 로컬 `localhost:3000` 서버가 꺼져 있어 이번 라운드에서는 Playwright 실제 화면 스냅샷은 확인하지 못했다.
- 종합 평가는 `9.7/10`이다.
- 로그인 모달은 `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, Google 로그인/닫기 버튼 접근성 이름, Escape 닫기, Tab 포커스 트랩, 포커스 복귀까지 보강됐다.
- `돈 냄새`, `놓치면 안 돼`, `꼭 기억하셔야 해요` 같은 압박형 문구는 캐릭터 원문과 최종 캐릭터 목록 모두에서 회귀 테스트로 막는다.
- 2026-07-03 Gemini 5케이스 live QA는 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계` 모두 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음 기준을 통과했다.
- 첫 상담 프롬프트는 정확히 2문단, 마지막 실제 질문 1문장, 물음표 종료, 외래어/이모지/괄호 외래어 병기 금지로 좁혀졌다.
- 실제 API 단건 QA도 2문단, 마지막 질문 종료, 커리어 고민 반영, 별 차감, 메시지 저장, `chat_used` 증가까지 정상으로 기록돼 있다.
- 남은 유저 관점 확인점은 대표 5케이스를 QA 스크립트가 아니라 실제 앱 API 전체 경로로 모두 돌려보는 것, `도윤` 사업/창업 첫 상담의 외래어/압박감 확인, 로컬 서버를 띄운 뒤 모바일 실제 모달 포커스와 화면 흐름을 재검증하는 것이다.

## 2026-07-01 20대 여성 유저 추가 재리뷰
- 소스코드 수정 없이 `/ko`, `/ko/reading` 화면을 다시 확인했다.
- 종합 평가는 `9.3/10`이다.
- 캐릭터 카드와 로그인 모달에 `가입하면 3회 무료`, `3회 무료 상담`, `1별 = 메시지 1회`가 반영되어 무료 체험과 과금 단위가 직관적이다.
- 가격표 배지는 별 개수와 시각적으로 분리되고 접근성 라벨도 `별 70개, 인기 상품, 19,900원`처럼 읽히는 구조로 보강됐다.
- 현우 캐릭터는 경고성 문구보다 `차분한 직설`, `주의 포인트`, `미리 알면 덜 흔들리는 흐름` 쪽으로 완화됐다.
- 입력폼은 개인정보 사용 목적, 생년월일 세부 라벨, 태어난 시간 미입력 가능 안내, 성별 사용 목적이 잘 보인다.
- 쿠키 배너는 하단 CTA/입력폼 차단 문제에서 벗어나 상단 안내로 바뀌었고, 필요한 쿠키만 쓴다는 문구가 더 신뢰감을 준다.
- 남은 유저 관점 이슈는 상단 쿠키 배너가 모바일 첫 화면 상단을 잠깐 가릴 수 있다는 점, 캐릭터 카드가 무료 맛보기/가격보다 먼저라 일부 유저가 가격 전체를 보기 전 로그인 모달을 볼 수 있다는 점이다.
- 이제 가장 큰 릴리즈 전 리스크는 랜딩 UI보다 로그인 후 첫 상담 답변 품질과 빈 `200 OK` 응답 재발 여부다.
- 다음 QA는 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계` 대표 고민 5개와 Gemini 실패 케이스를 우선 확인한다.

## 2026-07-01 20대 여성 유저 채팅오류 복구후 재리뷰
- 소스코드 수정 없이 `/ko`, `/ko/reading` 화면과 관련 구현을 읽기 전용으로 확인했다.
- 종합 평가는 `9.5/10`이다.
- 쿠키 안내가 fixed overlay가 아니라 문서 흐름 안의 상단 `쿠키 안내` 영역으로 바뀌어 `/ko`, `/ko/reading`에서 CTA와 입력폼을 덮지 않는다.
- 개인정보처리방침 링크는 `/ko/privacy-policy`로 유지되어 locale 흐름이 끊기지 않는다.
- 랜딩과 로그인 모달 모두 `3회 무료`, `1별 = 메시지 1회`, 가입 후 가격 확인 가능성을 반복해서 알려 가격 투명성이 높다.
- 채팅 실패 시 빈 성공 응답 대신 유저 메시지와 `다시 분석하기`를 보여주는 구조가 생겼고, 빈 assistant 응답은 저장과 별 차감을 건너뛰도록 보강됐다.
- 첫 상담 품질 규칙은 고민을 첫 문장에 받아주기, 1~3문단, 다음 질문 1개, 태어난 시간 모를 때 안심, 겁주는 표현 금지를 포함한다.
- 남은 이슈는 로그인 모달의 `role="dialog"`/`aria-modal`/포커스 트랩 같은 접근성 보강, 일부 캐릭터 문구의 압박감 완화, 실제 Gemini API 기반 첫 상담 라이브 QA다.
- 다음 QA는 대표 고민 5개인 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계`의 실제 첫 답변 캡처가 우선이다.

## 2026-07-01 접근성 및 실제 Gemini 첫상담 QA 피드백
- 남은 이슈는 작아졌고, 주요 과제는 로그인 모달 접근성, 일부 압박감 있는 캐릭터 문구, 실제 Gemini 첫 상담 톤 확인이다.
- 로그인 모달은 `role="dialog"`, `aria-modal`, 포커스 트랩, 포커스 복귀를 보강해야 한다.
- `돈 냄새`, `놓치면 안 돼`, `꼭 기억하셔야 해요` 같은 문구는 아직 살짝 압박감이 있어 부드러운 상담형 표현으로 바꿔야 한다.
- 다음 QA는 실제 Gemini 연결 상태에서 `썸/재회`, `이직/퇴사`, `돈 모으기`, `번아웃`, `친구/가족관계` 첫 상담을 각각 캡처해 톤을 확인한다.

## 2026-07-01 보안 핫픽스 수정후 재리뷰
- 해결 확인: 핵심 사주 RLS enable, 주요 reading/compatibility API와 Server Action의 `user_id` 소유자 필터, 별 차감의 클라이언트 amount 제거, Paddle 지급 기준의 실제 `items.price.id` 사용, 웹훅 idempotency 추가.
- 남은 P0: `credit_stars_for_paddle_purchase`가 `security definer`이고 `authenticated`에 grant되어 결제 없이 직접 별 충전 RPC 호출이 가능하다.
- 남은 P0: `deduct_stars_for_report`와 기존 `decrement_star`도 authenticated 공개 상태라 직접 호출 권한과 내부 `auth.uid()` 검증을 재검토해야 한다.
- 남은 P0: `/api/saju/update-status`가 클라이언트 `status`를 그대로 저장해 `paid` 전이와 유료 분석 우회가 가능하다.
- 남은 P1: `/api/saju/suggestions`는 인증/rate limit/daily quota 없이 Gemini를 호출한다.
- 검증: `pnpm audit --prod`는 PostCSS moderate 1건으로 실패했고, `pnpm test`와 보안 관련 테스트 단독 실행은 `[ERROR] fetch failed`로 실패했다.
- 문서: `docs/개발일지/보안리뷰-핫픽스-수정후-재리뷰.md`.

## 2026-07-01 서버/보안담당자 잔여 피드백
- 기존 `decrement_star` grant와 새 `deduct_stars_for_report` grant가 `authenticated`에 열려 있어 RPC 직접 호출 위험이 남았다.
- 최소한 함수 내부에서 `auth.uid() = p_user_id`를 강제하고, reading/report 소유권을 확인해야 한다.
- 클라이언트 직접 호출이 필요 없는 별/결제/차감 RPC는 `service_role` 전용으로 두는 편이 안전하다.
- `/api/saju/suggestions`는 인증/rate limit/daily quota 없이 Gemini를 호출해 공개 API 비용 폭탄 경로가 남아 있다.
- 개발자 전달 문서: `docs/pm/서버보안-RPC-suggestions-잔여이슈-개발자-전달.md`.

## 2026-06-30 검증 상태
- 로컬 Vitest 직접 실행 기준 테스트는 통과했다: 12 files / 30 tests.
- TypeScript 타입체크는 `./node_modules/.bin/tsc --noEmit` 기준 통과했다.
- `pnpm test`, `pnpm lint`, `pnpm --version`은 현재 환경에서 `[ERROR] fetch failed` 또는 응답 없음으로 실패했다.
- 전체 ESLint는 43 problems, 14 errors, 29 warnings로 실패한다.
- Next 빌드는 Google Fonts `Noto Sans KR` fetch 실패로 중단된다.
- `package.json`의 `test:env`는 존재하지 않는 `scripts/check-env.js`를 가리킨다.
- 개발자 인수인계 문서: `docs/pm/개발자-에이전트-검증-이슈-인수인계.md`.

## 2026-07-03 가격/코칭 MVP 갭 판단
- 현재 가격은 공개되어 있지만 가격 조절 가능한 상품 정책으로는 아직 덜 닫혔다.
- 현재 기준은 `1별 = 메시지 1회`, 가입 후 `3회 무료`, `30별 9,900원`, `70별 19,900원`, `250별 39,900원`이다.
- PRD에는 무료 할당량 이후 단품 결제와 구독 선택지를 모두 제안한다고 되어 있지만, 현재 구현/문서 흐름은 별 패키지 중심이다.
- 첫 상담 답변 품질은 많이 올라왔지만, 원래 계획한 `오늘피드`, 행동카드 3개, 아침/점심/저녁 타임라인, 월간 전략 리포트, 대화 요약 리포트까지 이어지는 코칭 루프는 아직 약하다.
- 다음 제품 보강은 가격 정책 확정과 코칭 결과 구조화다.
- PM 판단 문서: `docs/pm/가격-코칭-MVP-갭-판단.md`.

## 2026-07-03 배포보안 릴리즈게이트 점검
- `pnpm test`, `pnpm lint`, `pnpm build`, 기본 `pnpm test:env`는 통과했다.
- `pnpm-workspace.yaml`의 `packages` 누락 문제는 해결된 상태다.
- `REQUIRE_PADDLE_ENV=true pnpm test:env`는 현재 로컬 환경 기준 Paddle 필수 환경변수 누락으로 실패했다.
- `pnpm audit --prod`는 `postcss < 8.5.10` moderate, `@ai-sdk/provider-utils <= 3.0.97` low 취약점으로 실패했다.
- 이전 보안 P0였던 RLS/IDOR, 클라이언트 amount 신뢰, Paddle price 검증, suggestions 비용 방어는 상당 부분 개선됐다.
- 남은 P0는 `/api/saju/update-status`가 클라이언트 status를 그대로 저장해 자기 reading을 `paid`로 바꿀 수 있는 결제 상태 우회다.
- 남은 P1은 운영 Supabase에 `202607010020_rpc_suggestions_security.sql` 마이그레이션 선적용 확인, `/api/saju/chat` 동시 요청 별 차감 레이스, Paddle production 환경변수 검증이다.
- 결제 포함 공개 배포는 P0 해결과 운영 DB/env 검증 전까지 보류해야 한다.
- 개발자 수정 가이드는 `docs/pm/배포보안-릴리즈게이트-개발자-수정가이드.md`에 정리했다.

## 2026-07-03 20대 여성관점 접근성 첫상담 최종 QA 후속 처리
- Gemini 첫 상담 live QA는 기존 5케이스에 도윤 `사업/창업`을 추가해 6케이스로 확장했다.
- QA 표에 `캐릭터명 호칭 없음`을 추가해 `도윤님`, `민준님`처럼 캐릭터명을 사용자 이름처럼 부르는 문제를 잡는다.
- 최신 `docs/qa/gemini-first-consultation-qa-2026-07-03.md`는 6케이스 전부 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음, 캐릭터명 호칭 없음 기준을 통과했다.
- 랜딩/캐릭터 문구의 `타이밍`은 `시기`로 바꿨고, `시기이야`, `시기을`, `체크할 조건` 같은 어색한 치환 결과는 회귀 테스트로 막는다.
- `/ko/reading` 390x844 모바일 QA에서 쿠키 안내, 개인정보/태어난 시간/성별 안내, 입력 1/2 -> 고민 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지를 확인했다.
- `/ko` 랜딩 로그인 모달은 `dialog`로 잡히고 Google 로그인/닫기 버튼 이름, Escape 닫기, 포커스 복귀가 확인됐다.

## 2026-07-03 현재 커밋 전 상태
- 첫상담 품질은 6케이스 live QA, 전체 테스트, lint, build, 모바일 Playwright 스모크 기준 통과 상태다.
- `pnpm-workspace.yaml`은 `packages: ['.']` 형태로 복구되어 `pnpm dev`가 다시 동작한다.
- 가격/코칭 MVP 갭 문서와 배포보안 릴리즈게이트 문서가 추가됐다.
- 결제 포함 공개 배포 전에는 `/api/saju/update-status` 상태 우회, 별 차감 동시성, 운영 Supabase 마이그레이션 적용, Paddle production env 검증을 닫아야 한다.
