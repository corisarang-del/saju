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

## 2026-07-10 수정후 실사용 QA 결과
- 최신 단위/회귀 테스트는 `pnpm test` 기준 49개 파일 / 182개 테스트 통과.
- `pnpm lint`, `pnpm test:env`, 권한 상승 환경의 `pnpm build` 통과.
- Gemini 첫 상담 라이브 QA는 6케이스 모두 통과했고 보고서는 `docs/qa/gemini-first-consultation-qa-2026-07-10.md`에 있다.
- 실제 API QA 스크립트 `scripts/qa-live-api-check.mjs`를 추가했다.
- 실제 API에서 `update-status paid` 클라이언트 전환 차단, 리포트 5별 차감, 월간 리포트 3별 차감과 중복 방지, 유료 첫 상담 동시 요청 200/409 처리는 통과했다.
- `/ko`는 200 OK, Google OAuth 시작은 Supabase authorize 307 리다이렉트, Playwright 렌더링은 정상이다.
- 무료 첫 상담 실제 API는 아직 QA 미통과다. 전체 실사용 QA에서는 Vertex/Gemini 429로 503, 무료 단독 재시도에서는 `Initial analysis failed quality gate`로 503이 재현됐다.
- 다음 개발 우선순위는 무료 첫 상담 `isFree: true` 경로에서 토큰 제한과 품질 게이트가 충돌하지 않게 조정하고, 3회 실패 시 사용자 경험/저장/차감 정책을 명확히 하는 것이다.
- 후속 수정 후 재검증에서는 테스트 수가 184개로 늘었고 `pnpm test`, `pnpm lint`, `pnpm test:env`, 권한 상승 `pnpm build`는 통과했다.
- 그러나 실제 첫 상담 API는 여전히 QA 미통과다. 무료 첫 상담은 반복 실행에서 `503`, `채팅 거래 로그 누락`, `오늘 할 구체 행동 없음 답변 저장`이 재현됐고, 유료 첫 상담 동시성 시나리오도 `503/409`로 실패했다.
- 내부 첫 상담 저장 전 게이트와 외부 Gemini QA 기준을 같은 판정 로직으로 맞추는 것이 다음 우선순위다.

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

## 2026-07-24 운영 배포 보안 재점검
- 대상 운영 URL은 `https://monthlysaju.vercel.app/`이다.
- `codex-security`는 제외하고 `security-review`, OWASP IDOR/API1 BOLA, Supabase RLS 공식 문서, Paddle webhook signature 공식 문서, MDN Observatory 기준으로 재점검했다.
- 공개 파일 `.env`, `.git/config`, `package.json`은 404이고 공개 HTML에서 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴은 발견하지 못했다.
- OAuth PKCE cookie는 `Secure`, `HttpOnly`, `Max-Age=600`, `SameSite=Lax`로 개선됐다.
- `x-powered-by`는 노출되지 않고, CSP에서 `unsafe-eval` 제거, `frame-ancestors 'self'`, COOP/CORP/HSTS 적용이 확인됐다.
- MDN Observatory는 `B+ / 80`, 실패 1개이며 잔여 실패는 CSP `unsafe-inline`이다.
- 운영 Supabase linked DB에서 대상 10개 테이블 RLS enabled를 확인했다.
- 민감 RPC는 `postgres`, `service_role`에만 EXECUTE가 있고 `anon`/`authenticated`에는 열려 있지 않다.
- 운영 URL 기준 `pnpm qa:live-api:free`와 `pnpm qa:live-api`는 통과했다.
- authenticated IDOR QA에서 `preview`, `analyze`, `deduct-stars`, `chat`, `pdf`는 타인 리딩 접근 시 404로 막혔다.
- `update-status`는 타인 리딩에 대해 200 no-op을 반환하지만 실제 owner row는 변경되지 않아 P3로 남겼다.
- Paddle signed webhook QA는 로컬 QA secret으로 서명한 정상 payload도 운영 endpoint에서 401이 나와 결제 재오픈 차단 이슈다.
- `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate`는 코드/테스트/빌드까지 통과했지만 `GOOGLE_VERTEX_RUNTIME_AUTH` production env 검사에서 실패했다.
- 개발자 전달 문서: `docs/pm/운영배포-보안재점검-Paddle-webhook-env-개발자전달-20260724.md`

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

## 2026-07-10 Gemini 첫 상담 QA 안정화
- 첫 상담 답변 품질 기준은 `사주 근거`, `오늘 구체 행동`, `1~3문단`, `질문형 마무리`, `금지 표현 없음`, `이모지 없음`, `가벼운 외래어 없음`, `영어 혼합 없음`, `캐릭터명 오호칭 없음`이다.
- 라이브 QA 스크립트는 6케이스를 검사하고, 품질 미달 항목이 있으면 최대 3회까지 피드백 기반 재생성을 시도한다.
- 최종 품질 미달이 남으면 QA 스크립트가 종료 코드 1로 실패해야 한다.
- 운영 첫 상담 프롬프트에는 복사 위험이 큰 금지 문구를 직접 길게 노출하지 않고, 저장 전 게이트와 QA 평가기 내부 목록에서 차단한다.
- 2026-07-10 최종 QA 리포트는 6케이스 모든 항목 통과 상태다.
- `/api/saju/chat` 첫 상담은 이제 `streamText`로 바로 노출하지 않는다. 서버에서 `generateText`로 먼저 생성하고 저장 전 품질 게이트를 통과한 답변만 UI 메시지 스트림으로 내려보낸다.
- 첫 상담 품질 미달 답변은 최대 3회 재작성하고, 끝까지 실패하면 사용자에게 실패 응답을 반환하며 별 차감과 저장을 하지 않는다.
- 첫 상담 QA 스크립트도 Vertex provider를 사용할 수 있게 바뀌었고, 성공 리포트는 `docs/qa/gemini-first-consultation-qa-2026-07-02.md`에 남았다.
- 최신 검증 기준 `pnpm test`, `pnpm lint`, `pnpm build`, `node scripts/check-env.js`, `tsc --noEmit`, `git diff --check`가 통과했다.

## 2026-07-23 가격코칭 재리뷰 후속수정
- 20대 여성 관점 재리뷰에서 남은 가격/문구/접근성 후속 과제를 코드로 반영했다.
- 랜딩 가격 패널에 `MONTHLY_MEMBERSHIP` 기반 월간 멤버십 안내를 직접 노출했다.
- 지안의 불안 유도형 재회 티저 문구, 서준/도윤의 `시기야` 단정형 문구를 더 차분하고 자연스러운 `흐름/방향/조건` 표현으로 바꿨다.
- 비로그인 사이드바 도움말에는 `aria-label`을 붙여 줄바꿈이 보조기술에서 붙어 읽히지 않게 했다.
- 검증 기준 `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test:env`, `pnpm audit --prod --audit-level high`는 통과했다.
- `REQUIRE_PADDLE_ENV=true pnpm test:env`는 Paddle 운영 환경변수 미등록으로 실패한다. 운영 배포 전 Vercel production env 등록이 필요하다.

## 2026-07-23 실사용 QA Supabase DNS 차단
- `scripts/qa-live-api-check.mjs` 실제 API QA는 `sfpwgywcmhgilrqearsz.supabase.co` DNS 해석 실패로 막혔다.
- `supabase.co` 기본 도메인은 응답하지만 프로젝트 호스트는 `ENOTFOUND`라 앱 채팅 로직까지 도달하지 못했다.
- 무료/유료 첫 상담, 별 차감, 거래 로그, 저장된 assistant 품질은 오늘 실제 DB 기준으로 완료 확인하지 못했다.
- QA 스크립트에 Supabase DNS preflight를 추가해 auth user 생성 전에 `Supabase DNS lookup failed`로 명확히 실패하게 했다.
- DNS가 정상인 네트워크에서 `QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`와 `node scripts/qa-live-api-check.mjs`를 다시 실행해야 한다.

## 2026-07-23 결제모듈 보존형 비활성화 배포
- Paddle 결제 모듈과 가격/상품/웹훅 정책은 삭제하지 않고 보존한다.
- production 초기 배포는 무료 상담형 베타로 보고 `PAYMENTS_ENABLED=false`, `NEXT_PUBLIC_PAYMENTS_ENABLED=false`를 기본 정책으로 둔다.
- 서버 route는 `PAYMENTS_ENABLED`, 브라우저 checkout/UI는 `NEXT_PUBLIC_PAYMENTS_ENABLED`를 본다.
- `/coin-shop`, Paddle checkout, 상단/사이드바 충전 링크, 채팅 paywall 충전 CTA, 월간 리포트 상세판 unlock, 종합 사주 백서 CTA, reading preview 결제 CTA를 flag off 상태에서 닫았다.
- `release:gate:code`는 비결제 베타의 코드/빌드/audit 게이트로 Paddle env 없이 통과한다.
- `release:gate`는 production 승인용으로 `release:gate:code` 이후 `qa:live-api:free`, `qa:live-api`를 실행한다.
- 현재 `pnpm release:gate:code`는 통과하지만 `pnpm release:gate`는 Supabase DNS `ENOTFOUND`로 실패한다. 따라서 production 배포 승인은 아직 불가다.
- `release:gate:payments`는 결제 재오픈용으로 `REQUIRE_PADDLE_ENV=true`를 요구하며, Paddle env 미등록 상태에서는 실패하는 것이 정상이다.

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

## 2026-07-07 수정후 실사용 QA
- `pnpm test` 통과: 41개 파일 / 142개 테스트.
- `pnpm lint`, `pnpm test:env`, `pnpm build` 통과.
- Gemini 첫 상담 6케이스 live QA 보고서 `docs/qa/gemini-first-consultation-qa-2026-07-07.md` 생성.
- 6케이스 모두 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음, 캐릭터명 호칭 없음 기준을 통과했다.
- `/api/saju/update-status`에 `paid` 직접 승격 요청을 보냈을 때 403으로 막혔고 reading status는 `pending` 유지됐다.
- `/api/saju/deduct-stars`는 실제 Supabase에서 `deduct_stars_for_report` RPC를 찾지 못해 500을 반환했다. direct RPC도 `PGRST202` schema cache 오류였다.
- `/api/saju/chat` 중복 요청은 첫 요청 200, 두 번째 요청 409로 막혔고 user/assistant 1쌍만 저장, 별 1개만 차감, `chat_used` 1 증가를 확인했다.
- 별 3개 무료 첫 상담 실제 API 응답은 2문단, 질문 종료, 이모지 없음, 외래어 없음, 커리어 고민 반영까지 통과했다.
- 별 5개 보유 상태 첫 상담은 paid prompt 경로에서 4문단 응답이 저장되어 첫 상담 2문단 기준을 실패했다.
- `/api/auth/google?next=/ko/reading`은 Supabase Google authorize URL로 307 redirect했고 localhost callback next 값을 포함했다.
- Playwright로 `/ko/reading` 입력 1/2 -> 고민 선택 2/2 전환, 비로그인 `로그인이 필요합니다.` 메시지 확인.
- 현재 상태는 자동 게이트와 주요 화면/채팅 보호는 통과, 리포트 별 차감 RPC 실제 적용과 paid prompt 첫 상담 분량 제어는 미통과다.

## 2026-07-07 수정후 실사용 QA 2차
- `pnpm test:env` 통과.
- Gemini 첫 상담 6케이스 live QA 보고서 `docs/qa/gemini-first-consultation-qa-2026-07-07.md` 생성.
- 6케이스 모두 고민 반영, 금지 표현 없음, 1~3문단, 질문 종료, 이모지 없음, 가벼운 외래어 없음, 캐릭터명 호칭 없음 기준을 통과했다.
- 전체 `pnpm test`는 `src/lib/auth/oauth.test.ts > uses_forwarded_host_when_origin_header_is_missing` 타임아웃으로 실패했다. 단독 실행은 통과했다.
- `pnpm lint`와 `pnpm build`는 장시간 무응답으로 완료 확인하지 못했다.
- `/api/saju/update-status`에 `paid` 직접 승격 요청을 보냈을 때 403으로 막혔고 reading status는 `pending` 유지됐다.
- `/api/saju/deduct-stars`는 실제 Supabase에서 status 200, 별 5개 차감, `saju_readings.status = paid`, `star_transactions` 저장까지 확인됐다.
- `/api/monthly-saju/deduct-monthly-report`는 첫 호출에서 3별 차감, 두 번째 호출에서 `alreadyUnlocked: true`와 amount 0을 반환했다.
- `/api/saju/chat` 중복 요청은 첫 요청 200, 두 번째 요청 409로 막혔고 user/assistant 1쌍만 저장, 별 1개만 차감, `chat_used` 1 증가를 확인했다.
- 별 3개 무료 첫 상담 실제 API 응답은 2문단, 질문 종료, 이모지 없음, 외래어 없음, 커리어 고민 반영까지 통과했다.
- 별 10개 보유 paid prompt 첫 상담은 5문단과 이모지 포함으로 첫 상담 품질 기준을 실패했다.
- `/api/auth/google?next=/ko/reading`은 Supabase Google authorize URL로 307 redirect했고 localhost callback next 값을 포함했다.
- `/ko` HTTP 200은 확인했지만 Playwright `/ko/reading` open은 장시간 무응답으로 화면 입력 흐름을 완료 확인하지 못했다.
- 현재 상태는 리포트 별 차감/월간 리포트/채팅 중복 방지는 통과, paid prompt 첫 상담 품질과 로컬 test/lint/build/Playwright 안정성은 미통과다.

## 2026-07-03 20대 여성 유저 접근성/첫상담 최종QA 후 재리뷰

## 2026-07-03 배포보안 릴리즈게이트 후속수정
- 리포트 결제 상태 승격은 더 이상 클라이언트 `/api/saju/update-status` 호출을 믿지 않는다.
- `/api/saju/deduct-stars`가 세션 사용자 기준으로 별을 차감하고, 새 Supabase migration `202607030010_report_payment_status_hardening.sql`에서 별 차감, 거래 기록, `saju_readings.status = 'paid'` 승격을 한 RPC 안에서 원자적으로 처리한다.
- `/api/saju/update-status`는 클라이언트가 `paid`, `generating`, `completed` 상태를 직접 만들 수 없게 막았다.
- `/api/saju/chat`은 AI 호출 전 사용자 단위 in-memory generation lock과 분당/일일 rate limit을 적용한다.
- 운영 배포 전 새 migration 적용 여부와 다중 인스턴스 환경용 분산 잠금 전환을 확인해야 한다.
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

## 2026-07-07 가격/코칭 MVP 개발자 전달 문서화
- 사용자는 코드 구현은 개발자가 할 것이므로 Codex는 전달 문서만 작성하고 코딩은 절대 하지 말라고 지시했다.
- 가격 정책은 스타터 `10별 3,900원`, 기존 `30별 9,900원`, `70별 19,900원`, `250별 39,900원`, `월 9,900원 멤버십/매월 40별`로 정리했다.
- 사용처별 차감은 채팅 1별, 월간 전략 리포트 상세판 3별, 종합 사주 백서 5별로 확정했다.
- 코칭 루프는 첫 상담 성공 후 `CoachingSnapshot`을 생성하고 오늘피드, 후속 질문, 월간 리포트, 기억 요약에 재사용하는 구조로 정리했다.
- 개발자 전달 문서: `docs/pm/가격-코칭-MVP-완성-개발자-전달.md`.

## 2026-07-07 가격/코칭 MVP 구현 반영
- 최신 요청에서는 개발자 전달 문서를 기준으로 실제 코드 반영을 진행했다.
- 가격 source of truth는 `src/lib/monthly-saju/pricing.ts`이며, 별 패키지 `10/30/70/250`, 월간 멤버십 `월 9,900원/40별`, 차감 정책 `채팅 1별/월간 리포트 3별/종합 백서 5별`을 담는다.
- Paddle config와 웹훅 지급은 실제 `items.price.id` 매칭을 유지하며 `stars10`, `monthlyMembership`을 포함한다.
- 첫 상담 assistant 저장 성공 후 `coaching_snapshots`가 생성되고, 오늘피드는 snapshot을 우선 사용한다.
- 월간 전략 리포트 상세판은 `deduct_stars_for_monthly_report` RPC로 3별 차감 후 열린다.
- 운영 적용 전 새 Supabase 마이그레이션 3개와 새 Paddle env 4개를 반드시 적용해야 한다.

## 2026-07-07 운영 Supabase 가격/코칭 마이그레이션 적용
- 운영 project ref `sfpwgywcmhgilrqearsz`에 새 가격/코칭 SQL 3개를 직접 적용했다.
- 적용 완료: `coaching_snapshots` 테이블/RLS, 종합 백서 5별 RPC, 월간 리포트 3별 RPC.
- 검증 완료: 새 테이블과 RPC 존재, 비용 상수 5/3, service_role grant, authenticated revoke.
- 주의: 원격 migration history는 비어 있다. `supabase db push --dry-run`이 새 3개가 아니라 기존 6개 포함 총 9개를 적용하려 해 직접 SQL 실행으로 범위를 제한했다.
- 운영 advisors에서 기존 `saju_readings`, `saju_chat_messages`, `saju_compatibilities` RLS disabled P0가 확인됐다. 별도 복구 필요.

## 2026-07-07 운영 Supabase RLS/RPC 보안 복구
- 운영 project ref `sfpwgywcmhgilrqearsz`에 RLS/RPC 복구 SQL을 직접 적용했다.
- 복구 완료: `saju_readings`, `saju_chat_messages`, `saju_compatibilities` RLS enable 및 owner 정책.
- 복구 완료: `decrement_star`, `credit_stars_for_paddle_purchase`, `deduct_stars_for_report`, `deduct_stars_for_monthly_report` service_role 전용 권한.
- 검증 쿼리에서 RLS/정책/RPC 권한 모두 true.
- `supabase db advisors --linked`에서 기존 P0 RLS disabled와 decrement_star public executable 경고가 사라졌다.
- 남은 경고는 Auth leaked password protection disabled와 일부 기존 RLS initplan 성능 WARN이다.

## 2026-07-07 Gemini 첫상담 QA 기준 강화
- `docs/qa/gemini-first-consultation-qa-2026-07-07.md`는 기존 전부 통과 판정을 재리뷰해 `보완필요`로 정정했다.
- 이유: 문단 수/질문 종료/이모지 없음 같은 형식은 통과했지만, 사주 근거와 구체 행동이 약하고 일부 표현이 상투적이었다.
- 첫 상담 지시문에 사주 근거, 구체 행동, 상투/단정 표현 금지 기준을 추가했다.
- QA 러너에 `hasSajuGroundedFlow`, `hasConcreteTodayAction` 평가와 요약 표 열을 추가했다.
- 다음 live QA는 강화된 러너로 다시 실행해야 한다.

## 2026-07-07 AI 응답 영어 혼합 방지
- 실사용 상담에서 자미두수/서양 점성술 설명이 `Children's Palace`, `Emperor Star`, `Western Astrology`, `Ascendant`, `Aries`처럼 영어와 섞이는 문제가 확인됐다.
- 원인은 고급 분석 컨텍스트의 영어 별자리/약어 병기와 채팅 시스템 지시문의 전역 한국어 전용 규칙 부족이었다.
- `src/lib/saju/advanced-analysis.ts`에서 영어 별자리 괄호 표기와 `ASC`, `MC` 병기를 제거했다.
- `src/app/api/saju/chat/route.ts`에는 모든 답변 한국어 전용, 영어 번역/영어 병기 금지, 영어 점성술/자미두수 번역 금지 규칙을 추가했다.
- 회귀 테스트: `src/lib/saju/advanced-analysis-language.test.ts`, `src/lib/saju/chat-stream-failure-regression.test.ts`.
- `scripts/qa-gemini-first-consultation.mjs`에도 `hasEnglishMixing`과 `영어 혼합 없음` 리포트 열을 추가해 다음 live QA에서 영어 혼입을 잡도록 했다.

## 2026-07-07 배포보안 OAuth/analyze 후속 처리
- 배포보안 문서 `docs/pm/배포보안-20260707-개발자-전달.md`의 P1 중 코드로 닫을 수 있는 두 항목을 반영했다.
- production OAuth redirect origin은 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL` 고정값을 요청 헤더보다 우선하게 했다.
- `/api/saju/analyze`는 catch에서 `req.clone().json()`을 다시 읽지 않고, 초기에 보관한 `readingId/userId`로 `generating -> failed` 복구를 수행한다.
- `paid -> generating` 전이는 `.eq('status', 'paid')` 조건부 update와 `409` 응답으로 중복 생성 요청을 막는다.
- 남은 배포 블로커: `REQUIRE_PADDLE_ENV=true pnpm test:env`는 Paddle production env 누락으로 실패한다.

## 2026-07-07 첫채팅 응답품질 저장전 게이트
- QA에서 유료 첫 채팅 5문단 저장, 이모지 포함, 무료 첫 채팅 질문 종료 누락, live QA 사주 근거/구체 행동 미흡이 보고됐다.
- `src/lib/ai/chat-completion-guard.ts`에 첫 상담 저장 전 품질 게이트를 추가했다.
- 첫 상담은 1~3문단, 이모지 없음, 마지막 질문 종료, 사주 근거 포함, 오늘 구체 행동 포함, 금지 표현 없음 조건을 통과해야 저장/차감된다.
- 캐릭터 원본 프롬프트의 한자 예시 이모지를 제거해 모델이 따라 쓰지 않게 했다.
- Gemini live QA 6케이스는 최신 실행에서 전부 통과했다.

## 2026-07-07 가격/코칭 MVP 구현 리뷰 후속 처리
- P0 월간 전략 리포트 정적 문구 문제를 보완했다.
- `createMonthlyStrategyReport` 도메인 빌더가 최신 reading, coaching snapshot, conversation memory, 최근 user 메시지 fallback을 받아 6개 섹션을 만든다.
- `/[locale]/reports`는 더 이상 정적 `monthlySections`를 쓰지 않고 `saju_readings`, `coaching_snapshots`, `saju_chat_messages`를 조회해 개인화 리포트를 만든다.
- 가격 source of truth는 `pricing.ts`의 `getPricingListItems`, `buildPricingFaqAnswer`, `buildProductJsonLd`로 확장했고 약관/JSON-LD가 이를 참조한다.
- 남은 후속 과제는 Paddle subscription 기반 멤버십 상태 저장, 관리자 운영 화면 확장, memory summary 고도화다.

## 2026-07-07 가격/코칭 MVP 구현 리뷰
- 개발자 구현 리뷰 결과, 가격/결제/차감과 코칭 스냅샷 뼈대는 들어갔지만 MVP 완료로 보긴 어렵다.
- 구현 확인: `pricing.ts`의 `10/30/70/250별`, 월간 멤버십 `월 9,900원/40별`, 채팅 1별, 월간 리포트 3별, 종합 백서 5별, Paddle price id 기준 지급, `coaching_snapshots`, 오늘피드 snapshot 우선 사용.
- 핵심 미완성: 월간 전략 리포트가 snapshot, 최근 대화 memory, 사주 요약을 쓰지 않고 정적 문구를 3별 차감 후 보여준다.
- 추가 미완성: 약관/layout JSON-LD 가격 하드코딩, 멤버십 상태 저장 부재, 관리자 화면의 멤버십/최근 차감/snapshot 표시 부재, memory summary와 후속 질문 연결 부족.
- 리뷰 문서: `docs/pm/가격-코칭-MVP-구현-리뷰-개발자-전달.md`.

## 2026-07-07 수정후 실사용 QA 3차
- 자동 게이트는 좋아졌다. `pnpm test` 45 files / 158 tests, `pnpm lint`, `pnpm build`, `pnpm test:env`가 통과했다.
- `/ko`는 HTTP 200이고 Playwright 실제 브라우저 스냅샷도 성공했다. OAuth 시작도 Supabase Google authorize URL로 307 리다이렉트됐다.
- 실제 API QA에서 결제 상태 직접 `paid` 전환은 403으로 막혔고, 종합 리포트 5별 차감과 월간 리포트 3별 차감/중복 방지는 통과했다.
- 채팅 동시 요청은 한 요청 200, 다른 요청 409로 막혔고 별도 1개만 차감됐다.
- 하지만 라이브 채팅 품질은 아직 실패다. 유료 첫 응답은 5문단과 이모지를 포함했고, 무료 첫 응답은 질문으로 끝나지 않았다.
- Gemini live QA도 6케이스 중 `썸/재회` 사주 근거, `번아웃` 구체 행동이 확인필요로 남았다.
- 개발일지: `docs/개발일지/수정후-실사용-QA-20260707-3.md`.

## 2026-07-07 멤버십 상태/Paddle 구독/관리자/memory 고도화
- Paddle subscription 웹훅은 `subscription.activated`, `subscription.updated`, `subscription.canceled`를 처리해 `user_memberships`에 상태를 저장한다.
- 멤버십 저장 기준은 `provider, subscription_id` unique upsert이며, `status`, `current_period_start`, `current_period_end`, `canceled_at`을 유지한다.
- 관리자 화면 `/[locale]/admin`은 별 잔액과 거래 로그 외에 멤버십, 최근 차감, 최근 코칭 스냅샷을 함께 보여준다.
- 채팅 별 차감 RPC는 `star_transactions`에 `chat_message` 차감 로그를 남겨 관리자 관찰성이 끊기지 않게 한다.
- 월간 리포트 memory summary는 최근 사용자 메시지 8개, assistant 상담 요약, follow-up seed를 포함한다.
- 운영 적용 전 새 마이그레이션 `202607070900_user_memberships_and_chat_transaction_log.sql`을 Supabase에 적용해야 한다.

## 2026-07-10 배포보안 관리자 별조정 감사로그 하드닝
- 배포보안 문서 `docs/pm/배포보안-20260707-개발자-전달.md`를 재점검해 코드로 닫을 수 있는 P2 관리자 하드닝을 반영했다.
- 새 마이그레이션 `202607100010_admin_star_adjustment_audit.sql`은 `admin_audit_logs`와 `admin_adjust_user_stars` RPC를 추가한다.
- 관리자 수동 별 충전/차감은 service role 전용 RPC에서 row lock, 잔액 변경, 별 거래 로그, 관리자 감사로그를 한 번에 처리한다.
- 관리자 화면에는 `조정 사유` 입력이 추가됐고, 서버 검증은 4자 이상 500자 이하로 고정했다.
- 감사로그는 actor id/email, target user id, action, amount, before/after balance, reason, IP, user-agent를 저장한다.
- `env REQUIRE_PADDLE_ENV=true pnpm test:env`는 여전히 로컬 Paddle production env 누락으로 실패한다. 운영 env 입력 후 재검증해야 한다.

## 2026-07-10 수정후 실사용 QA
- 자동 게이트는 통과했다. `pnpm test` 49 files / 178 tests, `pnpm lint`, 권한 올린 `pnpm build`, `pnpm test:env` 모두 통과했다.
- Gemini live QA 새 리포트 `docs/qa/gemini-first-consultation-qa-2026-07-10.md`는 6케이스 전부 통과했다.
- `/ko` HTTP 200, OAuth 시작 307, Playwright 브라우저 스냅샷도 성공했다.
- 실제 API QA에서 결제 상태 직접 `paid` 전환은 403으로 막혔고, 종합 리포트 5별 차감과 월간 리포트 3별 중복 방지는 통과했다.
- 채팅 동시 요청은 `[200, 409]`로 막혔고 별은 1개만 차감됐다.
- 무료 첫 채팅은 2문단, 질문 종료, 이모지 없음, 영어 혼합 없음으로 통과했다.
- 유료 첫 채팅은 아직 실패다. 실제 스트리밍/저장 assistant가 4문단이고, `MC` 영어 약어가 포함됐으며, 그래도 저장/별 차감/`chat_used` 증가가 발생했다.
- 개발일지: `docs/개발일지/수정후-실사용-QA-20260710.md`.

## 2026-07-10 Gemini QA 금지표현 변형 보강
- Gemini 첫 상담 QA 리포트 `docs/qa/gemini-first-consultation-qa-2026-07-10.md`는 자동 기준상 6케이스 전부 통과였지만 전문 재리뷰에서 보강점이 나왔다.
- `물이 조금씩 새는 주머니`는 기존 `물이 새는 주머니` 금지어의 변형이라 정확 일치 검사를 피했다.
- `[사주]` 대괄호 마커와 `걱정 마세요` 상투적 안심 문구도 첫 상담 신뢰 톤에서 막아야 한다.
- `chat-completion-guard`, Gemini QA 러너, 첫 상담 프롬프트, 실제 chat route 지시문에 해당 금지 기준을 추가했다.
- 검증: `pnpm test` 49 files / 179 tests, `pnpm lint`, `pnpm build`, `pnpm exec tsc --noEmit` 통과.

## 2026-07-10 수정후 실사용 QA 2차
- 자동 게이트는 통과했다. 관련 회귀 테스트 7 files / 40 tests, `pnpm test` 49 files / 179 tests, `pnpm lint`, 권한 올린 `pnpm build`, `pnpm test:env`가 통과했다.
- Gemini live QA 새 실행에서 6케이스 중 `이직/퇴사`가 질문으로 끝나지 않아 `확인필요`로 떨어졌다.
- `/ko` HTTP 200, OAuth 시작 307, Playwright 브라우저 스냅샷은 성공했다.
- 실제 API QA에서 결제 상태 직접 `paid` 전환은 403으로 막혔고, 종합 리포트 5별 차감과 월간 리포트 3별 중복 방지는 통과했다.
- 채팅 동시 요청은 `[200, 409]`로 막혔고 별은 1개만 차감됐다.
- 유료 첫 채팅은 2문단, 질문 종료, 이모지 없음, 영어 혼합 없음으로 통과했다.
- 무료 첫 채팅은 2문단, 이모지 없음, 영어 혼합 없음이지만 질문으로 끝나지 않았고, 그래도 저장/별 차감/`chat_used` 증가가 발생했다.
- 개발일지: `docs/개발일지/수정후-실사용-QA-20260710-2.md`.

## 2026-07-10 첫상담 품질게이트 정렬과 안전 fallback
- 실제 API QA에서 첫 상담이 3회 재생성 뒤 503으로 떨어지거나, 내부 게이트 통과 후 외부 QA에서 `오늘 할 구체 행동 없음`으로 실패했다.
- 첫 상담 저장 전 게이트는 정확히 2문단, 질문 종료, 사주 근거, 두 번째 문단의 오늘 행동, 이모지/영문자/가벼운 외래어 금지 기준으로 고정한다.
- 첫 상담 모델 응답이 3회 모두 품질 게이트를 통과하지 못하면 503 대신 캐릭터별 안전 fallback을 검수한 뒤 저장/전송한다.
- `qualityReport` 로그로 문단 수, 질문 종료, 사주 근거, 오늘 행동, 이모지, 영어, 금지 패턴 실패 원인을 구조화해 남긴다.
- 채팅 거래 로그 누락은 원격 DB의 `decrement_star`가 이전 버전이어서 발생했다. 원격 migration history가 비어 있어 전체 push 대신 `202607070900_user_memberships_and_chat_transaction_log.sql`만 `supabase db query --linked --file`로 적용했다.
- 적용 후 무료/유료 실사용 API QA에서 `chat_message:-1` 거래 로그가 모두 확인됐고 전체 QA가 통과했다.
- 최종 인수인계 문서는 `docs/개발일지/첫상담-품질게이트-최종인수인계-20260710.md`에 남겼고, 관련 결정은 `DEC-035`로 저장했다.

## 2026-07-21 배포 전 릴리즈게이트 작업지시
- Vercel `monthlysaju` production 배포 전 개발자가 닫아야 할 P0/P1 작업을 문서화했다.
- 문서 위치: `docs/pm/배포전-릴리즈게이트-개발자-작업지시-20260721.md`.
- P0 항목은 production env 등록, `REQUIRE_PADDLE_ENV=true`, Supabase 별 테이블 직접 조작 차단, 채팅 별 차감 원자성, 공유 저장소 rate limit, Paddle subscription price/product 검증, `pnpm audit --prod` 취약점 정리다.
- 모든 항목은 TDD로 실패 테스트를 먼저 만들고, 배포 전 `REQUIRE_PADDLE_ENV=true pnpm test:env`, `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, `pnpm audit --prod`를 통과해야 한다.

## 2026-07-23 배포보안 수정후 검증
- 개발자 수정 후 서버/보안 담당자 관점에서 재검증했다.
- 상세 개발자 전달 문서는 `docs/pm/배포보안-수정후-검증-개발자-전달-20260723.md`에 있다.
- 타깃 보안 회귀 테스트는 9개 파일 / 45개 테스트 통과.
- 전체 `pnpm test`는 50개 파일 / 197개 테스트 통과.
- `pnpm build`는 통과.
- 수정 확인: 별 직접 조작 RLS 제거 migration, `reserve_chat_star`/`refund_chat_star` 기반 채팅 별 예약/환불, Paddle 멤버십 price/product 검증, production rate limit fail-closed, release gate 강화.
- 배포 차단: Vercel `todocori/monthlysaju`에 환경변수가 하나도 없고, `REQUIRE_PADDLE_ENV=true pnpm test:env`가 Paddle 필수값 누락으로 실패하며, `pnpm audit --prod --audit-level high`가 `next@16.2.9` high 취약점 4개로 실패한다.
- production 배포 전 `next >=16.2.11` 업데이트, Vercel env 등록, `RATE_LIMIT_BACKEND=supabase`, `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL`, Paddle product/price/webhook env, Supabase `202607210010_release_gate_star_reservation_rate_limit.sql` 운영 적용 확인이 필요하다.

## 2026-07-23 배포보안 후속수정
- 개발자 전달 문서의 코드 수정 가능 항목을 반영했다.
- `next`는 `^16.2.11`, `eslint-config-next`는 `16.2.11`, `sharp`는 `^0.35.0`으로 업데이트했고 `pnpm-lock.yaml`과 로컬 의존성을 갱신했다.
- production OAuth origin은 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL`이 없으면 `PRODUCTION_APP_ORIGIN_REQUIRED`로 fail-closed 한다.
- 새 회귀 테스트: OAuth production origin 누락 방어, Next 패치 버전 릴리즈게이트.
- 재검증: OAuth/릴리즈게이트 타깃 2개 파일 / 17개 테스트 통과, `pnpm test` 50개 파일 / 199개 테스트 통과, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` 통과, `pnpm audit --prod --audit-level high` 통과.
- 남은 배포 차단은 Vercel env 없음, Paddle env gate 실패, Supabase production migration 적용 확인 미완료다.

## 2026-07-23 수정후 실사용 QA 재검증
- 타깃 회귀 테스트 6개 파일 / 41개 테스트 통과.
- 전체 `pnpm test`는 50개 파일 / 199개 테스트 통과.
- `pnpm lint`, `pnpm test:env`, `pnpm build` 통과.
- Gemini 첫 상담 라이브 QA 리포트 `docs/qa/gemini-first-consultation-qa-2026-07-23.md`는 6케이스 모두 통과했다.
- `/ko`는 HTTP 200, Google OAuth 시작은 Supabase authorize로 307 redirect, Playwright 렌더링은 정상이다.
- 실제 Supabase 임시 유저 기반 API QA는 미완료다. `sfpwgywcmhgilrqearsz.supabase.co` DNS가 `ENOTFOUND`로 실패해 auth user 생성 단계에서 차단됐다.
- 네트워크 정상 환경에서 무료 첫 상담 단독 QA와 전체 API QA를 다시 실행해야 한다.
- 후속 재검증에서 타깃 회귀 테스트는 6개 파일 / 42개 테스트, 전체 테스트는 50개 파일 / 202개 테스트로 통과했다.
- `scripts/qa-live-api-check.mjs`는 Supabase DNS 사전검사 실패를 구조화해서 보고하도록 개선됐다.
- 하지만 2026-07-23 22:17 KST 기준 Supabase DNS는 여전히 `ENOTFOUND`라 실제 API QA는 미완료 상태다.
- Playwright 스냅샷 기준 지안 카드 문구는 더 차분하게 개선됐다.

## 2026-07-23 20대 여성 유저 배포보안/가격코칭 수정후 재리뷰
- 소스코드는 수정하지 않고 `/ko`, `/ko/reading` Playwright 확인과 기존 개발일지/QA/메모리/관련 파일 읽기만으로 유저 관점 재리뷰를 진행했다.
- 배포 안정성까지 포함한 점수는 9.6/10, 로컬 제품 경험만 보면 9.7/10에 가깝다.
- 긍정 포인트: 랜딩 가치 문구가 실제 고민 상황 중심으로 정리됐고, `1별 = 메시지 1회`, 가입 후 3회 무료, 10별 3,900원 스타터 상품이 가격 진입 장벽을 크게 낮춘다.
- `/ko/reading`은 개인정보 안내, 태어난 시간 모름 허용, 2단계 입력 구조가 좋아 생년월일/성별 입력 불안을 줄인다.
- 첫 상담 품질 게이트와 안전 fallback, 오늘피드/월간 리포트의 대화 기억 활용, 별 예약/환불과 Paddle/rate limit 하드닝은 유저 신뢰를 높이는 개선으로 판단했다.
- 남은 유저 관점 이슈: 랜딩 가격 패널에서 월간 멤버십이 바로 보이지 않음, "커리어는 시기야"/"사업은 시기야" 문구가 살짝 어색함, `지안` 카드의 티저형 관계 문구가 조금 남음, 사이드바 접근성 텍스트가 "대화 기록을저장"처럼 붙어 읽힐 수 있음.
- 출시 전에는 Vercel production env, Paddle env gate, Supabase production migration 적용 확인이 최우선이다. 유저 관점으로는 실제 운영 결제/로그인/별 차감 신뢰 확인에 해당한다.
- 상세 문서: `docs/개발일지/20대-여성관점-배포보안-가격코칭-수정후-재리뷰-20260723.md`.

## 2026-07-23 테스터 피드백 실사용 QA DNS 차단 개발자전달
- 테스터 피드백 기준 redirect, Playwright 렌더링, 콘솔 에러 없음, Gemini QA는 정상이다.
- 실제 API QA 명령 `env QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`와 `node scripts/qa-live-api-check.mjs`는 모두 Supabase DNS lookup failed로 중단됐다.
- 원인은 `sfpwgywcmhgilrqearsz.supabase.co` `ENOTFOUND`라 실제 auth user 생성 단계까지 가지 못한 것이다.
- 따라서 무료/유료 첫 상담, 별 예약/차감/환불, 거래 로그, 저장된 assistant 품질은 실제 DB 기준으로 아직 미확인이다.
- QA 스크립트가 DNS 실패를 구조화해서 알려주는 개선은 확인됐다.
- 결제모듈 보존형 비활성화 배포에서도 Paddle QA는 제외 가능하지만 Supabase 무료 상담 API QA 미완료는 배포 blocker다.
- 개발자 전달 문서: `docs/pm/테스터피드백-실사용QA-DNS차단-개발자전달-20260723.md`.

## 2026-07-23 수정후 실사용 QA 결제비활성화 회귀 재검증
- 타깃 테스트는 결제 비활성화 회귀까지 포함해 7개 파일 / 47개 테스트 통과했다.
- 전체 vitest 직접 실행은 52개 파일 / 212개 테스트 통과했다.
- eslint 직접 실행, `pnpm test:env`, `pnpm build`, `git diff --check`는 통과했다.
- `pnpm test`와 `pnpm lint` 래퍼는 한때 `fetch failed`를 반환했지만, 같은 검사 도구를 `node_modules/.bin`에서 직접 실행하면 통과했다.
- Gemini 첫 상담 라이브 QA는 6케이스 모두 통과했고 리포트는 `docs/qa/gemini-first-consultation-qa-2026-07-23.md`에 갱신됐다.
- `/ko`는 HTTP 200, Google OAuth 시작은 Supabase authorize로 HTTP 307 redirect, Playwright 렌더링은 정상이고 콘솔 런타임 에러는 없었다.
- `POST /api/saju/chat` 무인증 요청은 HTTP 401로 막혔지만 본문이 JSON이 아니라 `Unauthorized` 텍스트라 클라이언트 오류 처리 일관성 검토가 필요하다.
- 무료/전체 실제 API QA는 Supabase DNS `ENOTFOUND`로 계속 실패한다. DNS 정상 환경에서 `env QA_SCENARIO=free-only node scripts/qa-live-api-check.mjs`와 `node scripts/qa-live-api-check.mjs`를 다시 실행해야 한다.
- 무료 베타 문구와 결제 가능 암시 문구가 일부 충돌한다. 랜딩, JSON-LD FAQ, 푸터, 채팅 disabled placeholder를 정리해야 한다.
- 상세 문서: `docs/개발일지/수정후-실사용-QA-결제비활성화회귀와-DNS차단-20260723.md`.

## 2026-07-23 테스터 피드백 무료베타 실사용 QA 잔여이슈
- 실제 무료/전체 API QA는 여전히 Supabase DNS `ENOTFOUND`로 미완료다.
- `sfpwgywcmhgilrqearsz.supabase.co`가 잡히지 않아 임시 인증 사용자 생성까지 가지 못했고, 무료 첫 상담, 별 지급/차감, 거래 로그, assistant 저장 품질은 실제 DB 기준 미확인이다.
- 새 이슈: 무인증 `/api/saju/chat` 401 응답 본문이 JSON이 아니라 `Unauthorized` 텍스트라 클라이언트 오류 처리 일관성 확인이 필요하다.
- 새 이슈: 무료 베타인데 랜딩/FAQ/푸터/paywall/placeholder/정책 문서에 결제 가능 암시 문구가 일부 남아 있다.
- 새 이슈: Playwright 스냅샷에서 사이드바 문구가 `기록을저장하고`처럼 붙어 보여 접근성/시각 텍스트 확인이 필요하다.
- 개발자 전달 문서: `docs/pm/테스터피드백-무료베타-실사용QA-잔여이슈-개발자전달-20260723.md`.

## 2026-07-23 20대 여성 유저 무료베타/결제비활성화 후속수정 재리뷰
- 소스코드는 수정하지 않고 `/ko`, `/ko/coin-shop`, `/ko/reading` Playwright 스냅샷과 최근 문서/QA/관련 파일 읽기만으로 유저 관점 재리뷰를 진행했다.
- 로컬 제품 경험은 9.7/10, production 배포 승인 관점은 9.4/10, 종합 점수는 9.5/10으로 판단했다.
- 좋아진 점: 랜딩 가격 패널에 월간 멤버십이 직접 노출됐고, 결제 off 상태에서는 `월간 멤버십 준비 중`으로 기대치를 낮춘다. 코인샵 직접 접근도 `무료 상담 베타`, `별 충전은 잠시 닫아뒀어` 안내로 막힌다.
- 캐릭터 문구는 지안의 불안 티저가 사라졌고, 서준/도윤도 `커리어는 시기야`/`사업은 시기야` 대신 `흐름`, `방향`, `조건` 중심으로 자연스러워졌다.
- `/ko/reading` 입력 화면의 개인정보 안내와 태어난 시간 모름 허용은 여전히 좋다. Gemini 첫 상담 QA 2026-07-23 리포트도 6케이스 모두 통과했다.
- 남은 유저 관점 이슈: Supabase DNS `ENOTFOUND`로 실제 무료 상담 API QA가 아직 미완료라 production 배포 승인은 보류가 맞다.
- 무료 베타 메시지와 일부 문구가 아직 어긋난다. 랜딩/코인샵은 결제 닫힘을 말하지만 푸터는 `결제는 Paddle의 안전한 결제 시스템을 통해 처리됩니다`, JSON-LD FAQ는 `이후에는 별을 충전하여 계속 상담할 수 있습니다`를 말한다.
- 사이드바는 코드상 `aria-label`이 추가됐지만 Playwright 스냅샷에서는 여전히 `대화 기록을저장하고`처럼 붙어 보여 실제 보조기술 읽힘 확인이 필요하다.
- 채팅 입력 disabled placeholder `별을 충전해주세요`는 결제 off 상태의 `추가 충전은 잠시 닫아뒀어` 안내와 충돌할 수 있다.
- 다음 우선순위: Supabase 정상 환경에서 `pnpm qa:live-api:free`, `pnpm qa:live-api` 재실행, 무료 베타 문구 일관화, 사이드바 접근성 재확인, Gemini QA 재시도 횟수/응답지연 관찰.
- 상세 문서: `docs/개발일지/20대-여성관점-무료베타-결제비활성화-후속수정-재리뷰-20260723.md`.

## 2026-07-23 20대 여성 피드백 무료베타 배포보류/문구일관성
- 최신 20대 여성 피드백 기준으로 무료 베타 배포 승인은 계속 보류가 맞다.
- 핵심 blocker는 Supabase DNS `ENOTFOUND`로 실제 무료 상담 API QA가 아직 임시 인증 사용자 생성 단계까지 가지 못한 점이다.
- 무료 첫 상담, 별 지급/차감, 거래 로그, assistant 저장 품질은 실제 DB 기준으로 아직 확인되지 않았다.
- Paddle 결제 기능은 이번 배포에서 제외/비활성화해도 되지만, 무료 베타 핵심 API QA는 제외하면 안 된다.
- 무료 베타 상태와 충돌하는 푸터/JSON-LD의 결제/별 충전 문구가 남아 있어 메시지 일관성 정리가 필요하다.
- 개발자 전달 문서: `docs/pm/20대여성피드백-무료베타-배포보류-문구일관성-개발자전달-20260723.md`.

## 2026-07-23 배포/서버보안 릴리즈게이트 차단상태
- 배포 및 서버보안 담당자 피드백 기준 production 배포 승인은 계속 보류다.
- `pnpm run release:gate:payments`는 Paddle 필수 env 누락으로 실패한다. `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, 별 상품/가격 ID, 월간멤버십 상품/가격 ID가 비어 있다.
- Vercel `todocori/monthlysaju` production env는 `pnpm dlx vercel env ls` 기준 `No Environment Variables found` 상태다.
- 기본 `pnpm run release:gate`도 `qa:live-api:free`에서 Supabase DNS `sfpwgywcmhgilrqearsz.supabase.co ENOTFOUND`로 실패한다.
- `release:gate:code`는 통과했지만 실제 무료 상담 API QA와 결제 env 검증을 대체하지 않는다.
- `pnpm audit --prod` 전체 기준 `@ai-sdk/provider-utils` uncontrolled resource consumption low 1건이 남아 있으며 high gate는 통과라 즉시 차단급은 아니지만 AI 비용/리소스 리스크로 추적해야 한다.
- 개발자 전달 문서: `docs/pm/배포서버보안-릴리즈게이트-차단상태-개발자전달-20260723.md`.

## 2026-07-23 무료베타 실사용 QA 잔여이슈 수정
- `/api/saju/chat` 무인증 401 응답을 plain text `Unauthorized`에서 JSON `{ error: "unauthorized", message: "로그인이 필요해." }`로 바꿨다.
- 무료 베타 결제 off 상태와 충돌하던 JSON-LD FAQ, 푸터, 채팅 disabled placeholder, paywall, Paddle checkout, 약관/개인정보 문구를 정리했다.
- 로그인 사이드바 안내 문구는 한 줄 텍스트로 유지해 Playwright 스냅샷에서 `기록을저장`처럼 붙어 보일 여지를 제거했다.
- `pnpm release:gate:code`는 통과했고 전체 vitest는 53개 파일 / 215개 테스트 통과했다.
- `pnpm qa:live-api:free`는 여전히 Supabase DNS `sfpwgywcmhgilrqearsz.supabase.co ENOTFOUND`로 실패한다. production 배포 승인은 계속 보류다.

## 2026-07-23 20대여성 피드백 무료베타 문구일관성 후속수정
- 문서 `docs/pm/20대여성피드백-무료베타-배포보류-문구일관성-개발자전달-20260723.md`의 P1 문구 일관성 항목을 후속 반영했다.
- 회귀 테스트가 JSON-LD, 푸터, 코인샵, 채팅, 월간 리포트, 종합 리포트 소스에서 `결제는 Paddle의 안전한 결제 시스템`, `별을 충전해주세요`, `별 충전하러 가기`, `별 충전하기` 같은 문제 예시 문구를 금지한다.
- 결제-on 조건부 문구도 `별 충전` 중심 대신 `상담권` 중심으로 낮췄다.
- `pnpm release:gate:code`는 통과했지만 `pnpm qa:live-api:free`는 Supabase DNS `ENOTFOUND`로 계속 실패한다.

## 2026-07-23 배포서버보안 릴리즈게이트 production env 차단보강
- `release:gate`가 `release:gate:code` 뒤에 `REQUIRE_PRODUCTION_ENV=true pnpm test:env`를 실행하도록 바뀌었다.
- production gate는 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL`, `RATE_LIMIT_BACKEND=supabase`, 결제 제외 무료 베타의 `PAYMENTS_ENABLED=false`/`NEXT_PUBLIC_PAYMENTS_ENABLED=false`를 강제한다.
- `release:gate:payments`는 `REQUIRE_PRODUCTION_ENV=true REQUIRE_PADDLE_ENV=true pnpm test:env`로 시작해 production env와 Paddle env를 같이 확인한다.
- 현재 `pnpm release:gate`는 코드 게이트 통과 후 `RATE_LIMIT_BACKEND=supabase` 누락으로 실패한다.
- `pnpm release:gate:payments`는 Paddle env와 `RATE_LIMIT_BACKEND=supabase` 누락으로 실패한다.
- `@ai-sdk/provider-utils` low advisory는 `@ai-sdk/google-vertex@3.0.146` 경유이며 patched version이 없어 rate limit/production gate로 방어하고 추적한다.

## 2026-07-24 운영 env/release gate 재실행 점검
- 로컬 `.env.local`에 `RATE_LIMIT_BACKEND=supabase`, `PAYMENTS_ENABLED=false`, `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, `REQUIRE_PADDLE_ENV=false`, `APP_ORIGIN`을 보강했다.
- `REQUIRE_PRODUCTION_ENV=true pnpm test:env`는 통과했다.
- Vercel project는 `todocori/monthlysaju`로 연결되어 있고 production env는 아직 비어 있다.
- Vercel env 업로드는 Supabase service role과 AI 자격증명을 외부 SaaS로 전송하는 민감 작업이라 사용자의 명시 승인이 필요해 자동 승인에서 차단됐다.
- Supabase project `sfpwgywcmhgilrqearsz`는 `status: INACTIVE`이며 `supabase link`도 `project is paused`로 실패했다.
- `sfpwgywcmhgilrqearsz.supabase.co` DNS `ENOTFOUND`의 근본 원인은 프로젝트 paused 상태다. Supabase Dashboard에서 unpause 후 live API QA를 다시 실행해야 한다.

## 2026-07-24 Supabase unpause 후 release gate 통과
- 사용자가 Supabase project `sfpwgywcmhgilrqearsz`를 unpause 했다.
- DNS가 회복됐고 Supabase project status는 `ACTIVE_HEALTHY`로 전환됐다.
- 첫 `qa:live-api:free`는 `user_stars` schema cache/table 누락으로 실패했다.
- 원격 migration history가 비어 있어 `supabase db push --linked --yes`로 13개 마이그레이션을 적용했고, 이후 local/remote migration history가 일치했다.
- `pnpm qa:live-api:free` 통과, `pnpm qa:live-api` 통과, `pnpm release:gate` 통과.
- 전체 release gate 기준 vitest 53개 파일 / 218개 테스트, 타입체크, lint, build, high audit, production env gate, 무료/전체 live API QA가 통과했다.
- Vercel production env는 아직 비어 있으며, 업로드에는 사용자 명시 승인이 필요하다.

## 2026-07-24 Vercel production env 업로드
- 사용자가 Vercel `monthlysaju` production env 업로드를 명시 승인했다.
- Vercel project `todocori/monthlysaju` production에 무료 베타 필수 env 15개를 업로드했다.
- Paddle 결제 env는 무료 베타 배포 범위가 아니라 업로드하지 않았다.
- `pnpm dlx vercel env ls production`에서 15개 env가 `Encrypted`, `Production`으로 등록된 것을 확인했다.
- 현재 production env의 `AI_PROVIDER=vertex`는 Vercel 런타임에서 별도 인증 확인이 필요할 수 있다.

## 2026-07-24 release gate 통과본 커밋/푸시 상태
- release gate 통과본은 `ef1d371 chore: harden free beta release gate and production env` 커밋으로 정리됐다.
- 이후 Vercel env 업로드/검증/푸시 요청 문서와 메모리를 별도 후속 커밋으로 남긴다.
- `.env.local`, `.vercel`, `supabase/.temp`는 커밋 대상에서 제외한다.
- 다음 배포 확인은 production 배포 후 smoke QA, 특히 Vertex 인증/첫 상담 응답/별 거래 로그를 중심으로 진행한다.

## 2026-07-24 수정후 실사용 QA Supabase live API 통과
- 개발자 수정 후 실제 QA를 재실행했다.
- Supabase host `sfpwgywcmhgilrqearsz.supabase.co`는 더 이상 `ENOTFOUND`가 아니고 gateway 응답이 확인된다.
- 전체 vitest 직접 실행은 53개 파일 / 218개 테스트 통과했다.
- eslint 직접 실행, `node scripts/check-env.js`, `./node_modules/.bin/next build`, `git diff --check`는 통과했다.
- `pnpm test`, `pnpm lint`, `pnpm test:env`는 이번에도 pnpm 래퍼에서 `fetch failed`로 실패했다. 같은 검증을 직접 실행하면 통과하므로 코드 실패로 보지는 않는다.
- Gemini 첫 상담 live QA는 6케이스 모두 통과했다. 리포트 파일명은 UTC 기준 `docs/qa/gemini-first-consultation-qa-2026-07-23.md`이며 KST 2026-07-24 실행분이다.
- 무료 live API QA는 통과했고 실제 거래 로그 `chat_message:-1:2`, 최종 별 2를 확인했다.
- 전체 live API QA는 통과했고 실제 거래 로그 `report:-5:10`, `monthly_report:-3:7`, `chat_message:-1:6`, `chat_message:-1:2`, 최종 별 2를 확인했다.
- `/ko`, `/ko/coin-shop`, `/ko/reading`은 HTTP 200, OAuth 시작은 307 redirect다.
- 무인증 `/api/saju/chat`은 JSON 401로 응답해 이전 plain text 오류 문제는 해결됐다.
- Playwright 스냅샷에서 랜딩 렌더링, 콘솔 무에러, 사이드바 띄어쓰기 수정이 확인됐다.
- 남은 관찰 포인트는 pnpm 래퍼 `fetch failed`, Gemini 재시도/응답 지연이다.
- 상세 문서: `docs/개발일지/수정후-실사용-QA-Supabase-live-api-통과-20260724.md`.

## 2026-07-24 production 상담 QA 문제점 개발자전달
- 사용자가 `https://monthlysaju.vercel.app/` 배포 완료 후 실제 상담 QA를 요청했고, 코드 수정 없이 배포 사이트를 점검했다.
- production에서 `/` -> `/ko` 307, `/ko`, `/ko/reading`, `/ko/coin-shop` 200, OAuth 시작 307, 무인증 채팅 401 JSON은 정상이다.
- 무료 live API QA는 통과했다. `chat_message:-1:2`, 최종 별 2를 확인했다.
- 전체 live API QA는 첫 실행에서 paid 동시 상담이 기대한 `200 + 409`가 아니라 `200 + 503 chat_generation_failed`로 실패했다. 재실행은 통과했으므로 간헐 이슈로 기록한다.
- Playwright console에서 `/api/analytics/track` 404가 확인됐다.
- 상담 응답은 자동 품질 기준을 통과하지만 `사주와 별자리 데이터`, 한자/전문용어 과다가 보여 20대 일반 사용자 말투로는 무겁다.
- `/ko/reading` 비로그인 분석 시작 후 `로그인이 필요합니다.`만 보여 로그인 CTA가 약하다.
- 개발자 전달 문서: `docs/pm/production-상담QA-문제점-개발자전달-20260724.md`.

## 2026-07-24 pnpm wrapper/Gemini 지연 관찰 보강
- Codex sandbox에서는 `pnpm test`, `pnpm lint`, `pnpm test:env`가 `fetch failed`로 실패하거나 멈출 수 있다.
- 같은 검증을 직접 실행하면 통과하고, 권한 있는 실제 실행 환경에서도 `pnpm test`, `pnpm lint`, `pnpm test:env`가 통과한다.
- 앱 코드 실패로 보지 말고 sandbox의 pnpm fetch 경로 제한으로 분리해서 해석한다.
- live API QA 스크립트는 `durationMs`, `freeChatDurationMs`, `paidChatDurationMs`, `paidConflictDurationMs`를 출력한다.
- Gemini 첫 상담 QA 리포트는 케이스별 `attemptDurationsMs`, `totalDurationMs`, `시도별 소요`, `전체 소요`를 기록한다.
- 상세 문서: `docs/개발일지/pnpm-wrapper-fetch-failed와-Gemini-지연-관찰보강-20260724.md`.

## 2026-07-24 Vercel production 첫 배포
- `monthlysaju.vercel.app`가 `404 DEPLOYMENT_NOT_FOUND`를 반환한 원인은 Vercel `todocori/monthlysaju`에 deployment가 하나도 없었기 때문이다.
- production env 15개는 등록되어 있었고, `pnpm build`는 통과했다.
- `pnpm dlx vercel --prod --yes`로 첫 production deployment를 생성했다.
- deployment id는 `dpl_2J9XPVLtPK4DucMCAc6fFxybCQJr`다.
- production deployment는 `https://monthlysaju-et2xuqhl4-todocori.vercel.app`, alias는 `https://monthlysaju.vercel.app`다.
- `https://monthlysaju.vercel.app`는 `/ko`로 307 redirect, `/ko`는 200을 반환한다.
- 다음 확인은 production URL 기준 `/ko` 렌더링, Google OAuth, 첫 상담 API, Vertex 인증 smoke QA다.

## 2026-07-24 Google OAuth production origin 수정
- 사용자가 Google 로그인 중 만료된 `equally-brochures-ratio-palestinian.trycloudflare.com`로 이동하는 문제를 제보했다.
- production `/api/auth/google` 확인 결과 실제 서버가 만들던 `redirect_to`는 `http://localhost:3000/auth/callback`이었다.
- Vercel production env의 `APP_ORIGIN`, `NEXT_PUBLIC_APP_URL`을 삭제 후 `https://monthlysaju.vercel.app`로 재등록했다.
- production 재배포 후 `redirect_to=https://monthlysaju.vercel.app/auth/callback?...`로 수정됐다.
- Supabase authorize는 production redirect를 받아 Google accounts URL로 302 redirect한다.
- 새 deployment id는 `dpl_2RQtu5AdMpL9VTBXBnREHUztucb1`다.

## 2026-07-24 Vercel Vertex WIF production 상담복구
- production 상담 6회 연속 실패의 근본 원인은 `AI_PROVIDER=vertex`인데 Vercel Function 런타임에 Vertex 인증이 없던 것이다.
- 로컬 ADC는 Vercel에서 사용할 수 없고, Google API key provider도 403으로 실패했다.
- 서비스 계정 키 생성은 조직 정책 `constraints/iam.disableServiceAccountKeyCreation` 때문에 불가했다.
- 해결은 Vercel OIDC `x-vercel-oidc-token` + Google Workload Identity Federation으로 진행했다.
- Google Cloud에 `vercel` workload identity pool/provider를 만들고 issuer `https://oidc.vercel.com/todocori`, subject `owner:todocori:project:monthlysaju:environment:production`으로 제한했다.
- 서비스 계정 `monthlysaju-vertex@project-3473cfe3-7869-4a96-855.iam.gserviceaccount.com`에 `roles/aiplatform.user`, `roles/iam.workloadIdentityUser`를 부여했다.
- Vercel production에는 `GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE`, `GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL`을 추가했다. 비밀키는 저장하지 않는다.
- deployment `dpl_3pQhZyoQg5fRF3EUBT4nUUmCuK9x` 이후 production 무료/전체 live API QA가 모두 통과했다.

## 2026-07-24 production 상담 실사용 정상확인
- 사용자가 Google 로그인 후 production 사주상담이 실제로 잘 된다고 확인했다.
- 현재 운영 상태는 Google 로그인 정상, Vertex WIF 인증 정상, 무료/유료 채팅 live API QA 정상, 사용자 실사용 상담 정상이다.
- `docs/개발일지/사주상담-production-실사용-정상확인-20260724.md`에 최종 확인 기록을 남겼다.

## 2026-07-24 배포 후 PC/폰 디자인 리뷰 Findings
- `https://monthlysaju.vercel.app/` production 화면 기준 릴리즈 차단급 디자인 깨짐은 없다.
- P1: PC 랜딩에서 캐릭터 캐러셀 첫 카드가 왼쪽 사이드바에 걸려 잘려 보인다. 첫 활성 카드 정렬 또는 edge fade/gutter 보강이 필요하다.
- P1: 모바일 390x844 첫 진입에서 쿠키 안내, H1, 큰 카드, 하단 탭 때문에 `대화하기` CTA가 첫 viewport 밖으로 밀린다.
- P2: PC H1 마지막 `줄게`가 외톨이 줄처럼 떨어져 타이포그래피 마감이 약해 보인다.
- P2: 모바일 `/ko/reading`의 placeholder/helper text 대비가 약해 실제 폰에서 흐릿하게 보인다.
- P2: production console에 `/api/analytics/track` 404가 남아 운영 완성도와 이벤트 수집 신뢰를 떨어뜨린다.
- 개발자 전달 문서: `docs/pm/배포후-PC-폰-디자인개선-개발자전달-20260724.md`.

## 2026-07-24 배포 후 디자인 개선 수정후 재리뷰 Findings
- 개발자 수정 후 production URL을 다시 봤지만 이전 디자인 개선점 중 일부가 계속 재현된다.
- PC 1280x720 `/ko`: 캐릭터 캐러셀 첫 카드가 사이드바 옆에서 잘려 보이고, H1 마지막 글자/단어가 외톨이 줄로 떨어진다.
- 모바일 390x844 `/ko`: 쿠키 미동의 첫 진입에서 `대화하기` CTA가 첫 viewport에 보이지 않는다.
- 모바일 390x844 `/ko/reading`: 입력폼 신뢰 문구는 좋지만 생년월일/시간 placeholder와 helper text 대비가 여전히 약하다.
- production console: `/api/analytics/track` 404가 `/ko`, `/ko/reading`에서 계속 보인다.
- 릴리즈 차단급 디자인 깨짐은 아니지만, production 배포 반영 여부와 남은 P1/P2 개선을 다시 확인해야 한다.
- 개발자 전달 문서: `docs/pm/배포후-PC-폰-디자인개선-수정후재리뷰-20260724.md`.

## 2026-07-24 배포 반영 후 PC/폰 디자인 재리뷰 Findings
- 이전 “주요 개선점 일부 미해결” 판단은 최신 수정본이 production에 아직 배포되지 않아서 생긴 것으로 정정한다.
- 최신 production 기준 릴리즈 차단급 디자인 이슈는 없다.
- 해결됨: `/api/analytics/track` 404가 사라졌고 production console은 `/ko`, `/ko/reading` 기준 errors 0/warnings 0이다.
- 해결됨: PC H1 외톨이 줄바꿈은 의미 단위 줄바꿈으로 개선됐다.
- 대부분 해결됨: 모바일 `/ko/reading` 생년월일 placeholder와 예시 텍스트 대비가 좋아졌고 하단 `다음` CTA도 안정적으로 보인다.
- 개선됨: 모바일 랜딩 첫 카드 CTA가 첫 viewport 하단까지 올라왔다.
- 남은 P2: 모바일 H1에서 `고르면`이 `고르/면`으로 단어 중간 줄바꿈된다.
- 남은 P2: 모바일 첫 CTA는 보이기 시작했지만 하단 탭과 너무 가까워 버튼 전체가 여유 있게 보이진 않는다.
- 남은 P2/P3: PC 캐러셀 왼쪽 peek는 의도는 읽히지만 1280폭에서는 아직 사이드바 옆 카드 조각이 조금 무겁다. 시간 선택 placeholder 대비도 미세 보강 여지가 있다.
- 개발자 전달 문서: `docs/pm/배포반영후-PC-폰-디자인개선-재리뷰-20260724.md`.

## 2026-07-24 배포 반영 후 PC/폰 디자인 재리뷰 수정 완료
- 모바일 랜딩 H1의 `캐릭터를 고르면`을 `inline-block`으로 묶어 390px 폭에서 `고르/면` 단어 중간 줄바꿈을 막았다.
- 모바일 캐릭터 카드는 `62vw`, `max-w-[236px]`, `aspect-[5/6]`로 조정하고 모바일 quote를 숨겨 첫 카드 CTA가 하단 탭 위에 더 안정적으로 보이게 했다.
- PC 캐러셀 edge fade를 `transparent_48px`, `black_88px`로 강화해 1280x720에서 사이드바 옆 이전 카드 조각의 존재감을 낮췄다.
- `/ko/reading` 시간 선택 placeholder는 `data-[placeholder]:text-[#667085]`로 대비를 보강했다.
- 검증: 디자인 회귀 테스트, 전체 vitest, tsc, eslint, Next build, Playwright 390x844/1280x720 스크린샷 확인 통과.

## 2026-07-24 운영 사이트 보안점검
- `https://monthlysaju.vercel.app/` production 배포 후 `codex-security` 없이 `security-review`, OWASP, MDN HTTP Observatory 기준으로 비파괴 외부 보안점검을 수행했다.
- 개발자 전달 문서: `docs/pm/운영사이트-보안점검-authenticated-QA-개발자전달-20260724.md`.
- MDN HTTP Observatory 결과는 `B`, 점수 `75`, 10개 중 8개 통과/2개 실패다.
- HTTPS redirect, HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy는 확인됐다.
- `.env`, `.git/config`, `package.json`은 공개되지 않았고, 공개 HTML에서 service role, Paddle secret, Google AI key, AWS key, DB URL 패턴은 발견하지 못했다.
- `/api/saju/chat`, `/api/saju/suggestions`, `/api/webhooks/paddle` 비인증 요청은 401로 막힌다.
- OAuth redirect는 악성 `origin`/`x-forwarded-host`를 넣어도 `https://monthlysaju.vercel.app/auth/callback`로 유지됐다.
- 남은 P1은 OAuth PKCE code verifier cookie의 `Secure`/`HttpOnly`/TTL 하드닝과 CSP의 `unsafe-inline`/`unsafe-eval`/넓은 `frame-ancestors` 축소다.
- 별도 authenticated QA 범위로 계정 데이터 IDOR, 운영 Supabase RLS/RPC 적용, Paddle 결제 성공/실패 webhook 정합성을 문서화했다.

## 2026-07-24 운영 사이트 보안점검 하드닝 반영
- `next.config.ts`에서 `poweredByHeader: false`, COOP/CORP 헤더, CSP `unsafe-eval` 제거, `frame-ancestors 'self'` 최소화를 반영했다.
- Supabase SSR PKCE code verifier cookie 전용 helper를 추가해 production `Secure`, `HttpOnly`, `maxAge: 600`, `SameSite=Lax`를 적용했다.
- 일반 Supabase auth cookie는 브라우저 클라이언트 호환을 위해 기존 읽기 가능 옵션을 유지한다.
- `NEXT_LOCALE` cookie는 next-intl routing에서 production `secure` 옵션을 사용한다.
- `deduct-stars`, `update-status`는 비인증 요청에 body/status 검증보다 먼저 401을 반환하도록 순서를 바꿨다.
- metadata/JSON-LD URL은 `NEXT_PUBLIC_APP_URL` 기반으로 통일했고 fallback은 `https://monthlysaju.vercel.app`다.
- authenticated IDOR, 운영 RLS/RPC, Paddle signed webhook 정합성은 실제 운영 계정/DB/provider payload가 필요한 별도 QA 범위로 남아 있다.

## 2026-07-24 배포 반영 후 PC/폰 디자인 최종재리뷰 수정
- 최신 production 기준 릴리즈 차단급 디자인 이슈는 없고, 남은 P2/P3 마감만 반영했다.
- `/ko/reading` 시간 선택 placeholder는 `data-[placeholder]:text-[#4E5968]`, `data-[placeholder]:font-medium`으로 날짜 입력 대비와 더 맞췄다.
- PC 홈 캐러셀 왼쪽 edge fade는 `transparent_64px`, `black_116px`로 넓혀 사이드바 옆 peek 존재감을 더 낮췄다.
- 검증: 디자인 회귀 테스트, 전체 vitest, tsc, eslint, Next build 통과.

## 2026-07-24 배포 반영 후 PC/폰 디자인 최종재리뷰 Findings
- 최신 production `https://monthlysaju.vercel.app/ko`, `/ko/reading` 기준 릴리즈 차단급 디자인 이슈는 없다.
- 해결됨: 모바일 홈 H1의 `고르면` 단어 중간 줄바꿈이 재현되지 않는다.
- 해결됨: 모바일 홈 첫 카드 `대화하기` CTA가 하단 탭 위에서 온전히 보인다.
- 해결됨: `/ko/reading` 하단 `다음` CTA가 하단 탭에 가려지지 않는다.
- 해결됨: PC 홈 H1은 의미 단위 줄바꿈으로 안정적이고, 캐러셀은 오류가 아닌 의도된 peek 패턴으로 읽힌다.
- 검증: PC 1280x720, 모바일 390x844 모두 가로 오버플로우 없음. `/ko`, `/ko/reading` production console error/warning 0건.
- 남은 P2: `/ko/reading` 시간 선택 placeholder 대비가 날짜 입력보다 살짝 약하므로 한 단계 보강하면 좋다.
- 남은 P3: PC 1280px 전후 캐러셀 왼쪽 peek/fade 존재감을 조금 더 낮추면 사이드바 옆 시선 걸림이 줄어든다.
- 개발자 전달 문서: `docs/pm/배포반영후-PC-폰-디자인개선-최종재리뷰-20260724.md`.

## 2026-07-24 현우 카드 이름클리핑 디자인 재리뷰 Findings
- 사용자 PC에서 `현우` 카드 이름이 짤려 보인다는 제보는 production에서 실제 재현됐다.
- 1280x720 `/ko` 첫 화면 기준 `현우` 이름 영역은 `y=709`, `height=28`, `bottom=737`이고 viewport height는 `720`이라 약 41%만 보인다.
- 1366x768에서는 같은 이름 영역이 viewport 안에 온전히 들어오므로, 핵심 원인은 낮은 PC 높이에서 상단 쿠키 배너/헤더/히어로/카드 높이가 누적되는 것이다.
- 이 문제는 `현우` 텍스트 자체의 카드 내부 clipping이 아니라 카드 이름 라인이 fold 아래로 밀리는 레이아웃 문제다.
- 모바일 홈 H1/CTA, `/ko/reading` 시간 placeholder/하단 CTA 개선은 유지 확인됐다. `/ko`, `/ko/reading` console error/warning은 0건이다.
- 개발자 전달 문서: `docs/pm/현우카드-이름클리핑-디자인재리뷰-20260724.md`.

## 2026-07-24 배포웹사이트 디자인개선 수정후리뷰 Findings
- 최신 production 기준 릴리즈 차단급 디자인 이슈는 없다.
- 해결됨: PC 1280x720 `/ko`에서 `현우` 카드 이름 클리핑이 재현되지 않는다. 가시 카드 이름 라인은 `y=509`, `bottom=537` 수준으로 올라와 viewport 안에 들어온다.
- 해결 유지: PC 1366x768 `/ko`에서도 캐릭터 이름 라인이 안정적으로 보이고 가로 오버플로우가 없다.
- 해결 유지: 모바일 390x844 `/ko`에서 H1 단어 중간 줄바꿈이 없고, 가시 카드와 `대화하기` CTA가 하단 탭 위에 보인다.
- 해결 유지: 모바일 390x844 `/ko/reading`에서 시간 선택 placeholder 대비가 개선됐고, 하단 `다음` CTA는 `y=752`, `bottom=812`로 안정적이다.
- `/ko`, `/ko/reading` production console error/warning은 0건이다.
- 남은 P3: PC 1280x720에서 카드 하단 액션 영역이 fold에 거의 맞닿아 명시적 `대화하기` 발견성은 조금 약하다.
- 남은 P3: 캐러셀 첫 진입/스냅 위치가 뷰포트나 상태에 따라 달라져 보일 수 있으므로 pagination active state와 시작 카드 일치성을 QA하면 좋다.
- 개발자 전달 문서: `docs/pm/배포웹사이트-디자인개선-수정후리뷰-20260724.md`.

## 2026-07-24 캐릭터 인영 변경과 말투 차별화
- PM 판단으로 `하은`은 `인영`으로 변경하는 방향이 좋다.
- 단, 내부 id `haeun`은 유지한다. 기존 채팅/리딩/analytics/URL 호환 때문에 표시명과 프롬프트 자기소개만 `인영`으로 바꾸는 게 안전하다.
- 상담사 말투는 공통 안전장치 때문에 평준화될 수 있으므로 캐릭터별 `답변 구조`, `선호 표현`, `금지 표현`, `마지막 질문 방식`을 분리해야 한다.
- 톤 방향: 현우는 차분한 직설, 하나는 감정 번역, 민준은 생활 돈관리, 인영은 시기/월운/준비 행동, 지안은 재회 조건과 경계선, 서준은 커리어 선택 기준, 도윤은 사업 조건/리스크 중심.
- 개발자 전달 문서: `docs/pm/캐릭터-하은-인영-변경-말투차별화-개발자전달-20260724.md`.

## 2026-07-24 운영배포 Paddle webhook/env 보안재점검 반영
- Paddle signed webhook 정합성은 코드만으로 닫지 않고 `qa:paddle-webhook:signed` live QA로 운영 Secret 일치, 성공/실패/중복/구독 상태 전이를 검증한다.
- 결제 포함 재오픈 게이트는 `release:gate:payments:live`를 기준으로 하며, 기존 코드/빌드/audit/env 검사 뒤 signed webhook QA까지 통과해야 한다.
- Vercel Vertex WIF/OIDC 운영 정책은 `GOOGLE_VERTEX_RUNTIME_AUTH=vercel-oidc`를 명시 허용값으로 둔다. 임의 문자열은 허용하지 않는다.
- `update-status`는 소유 row가 실제로 갱신되지 않으면 404를 반환해 타인 리소스 no-op 200을 없앤다.
- CSP는 우선 `object-src 'none'`를 추가했고, `unsafe-inline` 제거는 nonce/hash 전환 작업으로 분리한다.

## 2026-07-24 인영 리브랜딩 구현
- `haeun` 내부 id와 `/characters/haeun-premium.png` asset path는 유지하고 유저 노출명과 prompt 자기소개만 `인영`으로 변경했다.
- `인영`은 시간의 길잡이, 월운/시기/길일을 달 단위로 차분히 정리하는 상담사다.
- 캐릭터성은 `toneProfile` 구조로 관리한다. 답변 순서, 선호 표현, 피할 표현, 마지막 질문 방식을 캐릭터별로 분리해 공통 안전장치에 묻히지 않게 한다.
- QA runner의 번아웃 캐릭터도 `인영`으로 바꿨고, 기존 `haeun` 경로와 저장 데이터는 그대로 호환된다.

## 2026-07-24 현우 카드 이름 클리핑 보정
- PC 1280x720처럼 높이가 낮은 첫 화면에서 캐릭터 이름 라인이 fold 아래로 밀리는 문제를 height-aware CSS로 보정했다.
- `@media (min-width:1024px) and (max-height:760px)` 조건에서 홈 hero 여백/H1/문단 간격을 압축하고 캐릭터 카드 이미지를 `aspect-[3/4]`로 낮춘다.
- 모바일 카드 CTA 도달성, PC 캐러셀 edge fade, `/ko/reading` placeholder 보정은 유지한다.
- Playwright 1280x720 로컬 측정에서 `현우` 이름은 `top=563.25`, `bottom=591.25`, `viewportHeight=720`, `fullyVisible=true`였다.

## 2026-07-24 20대 여성 유저 production정상화/디자인보안 후속수정 재리뷰
- 소스코드는 수정하지 않고 최근 2026-07-24 개발일지/PM 문서/QA/메모리와 `/ko`, `/ko/reading` Playwright 스냅샷으로 유저 관점 재리뷰를 진행했다.
- 점수는 무료 상담형 베타 제품 경험 9.7/10, production 운영 신뢰 9.6/10, 결제 재오픈 포함 완성도 9.3/10, 종합 9.6/10으로 판단했다.
- 좋아진 점: production Google 로그인과 상담이 정상 확인됐고, 무료/전체 live API QA가 실제 user/reading/transaction 기준으로 통과했다. 이전 Supabase DNS/API 미완료 blocker는 해소됐다.
- 무료 베타 문구 충돌도 많이 정리됐다. 푸터는 `지금은 무료 상담 베타로 운영 중입니다.`, JSON-LD는 결제 가능 암시를 줄였고, 채팅 disabled placeholder는 `무료 베타 상담 횟수를 모두 사용했어`로 바뀌었다.
- 사이드바 `대화 기록을저장하고` 붙어 읽힘은 스냅샷 기준 `대화 기록을 저장하고`로 해결됐다.
- 디자인은 모바일 H1 단어 중간 줄바꿈, 첫 카드 CTA 가시성, `/ko/reading` 입력폼 대비, 하단 CTA 안정성이 개선됐고, production 콘솔 0건 문서가 있다.
- 보안은 OAuth origin, PKCE cookie, x-powered-by 제거, CSP `unsafe-eval` 제거, COOP/CORP, RLS/RPC, IDOR QA가 정리되어 무료 베타 공개 운영 기준 신뢰도가 높아졌다.
- 남은 유저/브랜드 이슈: `하은→인영`은 PM 방향만 문서화됐고 실제 화면/코드에는 아직 `하은`이 남아 있다. `src/lib/saju/characters.ts`, `src/services/analytics/actions.ts`도 하은 표기다.
- 캐릭터 말투 차별화도 아직 방향 문서 수준에 가깝다. 상담사별 답변 구조/선호 표현/마지막 질문 방식이 실제 프롬프트와 QA에 더 반영되어야 한다.
- 첫 상담 지연은 계속 관찰해야 한다. 문서상 무료 live API 약 55초, paid live API 약 110초 사례가 있어 20대 유저가 앱이 멈췄다고 느낄 수 있다.
- 결제 재오픈 전에는 Paddle signed webhook 운영 정합성, `release:gate:payments:live`, CSP `unsafe-inline` 후속 제거를 닫아야 한다. 무료 베타에서는 결제를 계속 닫는 판단이 맞다.
- 상세 문서: `docs/개발일지/20대-여성관점-production정상화-디자인보안-후속수정-재리뷰-20260724.md`.

## 2026-07-24 20대 여성 소비자 관점 분위기/유료사용의향 재리뷰
- 소스코드는 수정하지 않고, 최신 개발일지/메모리/구현 기록을 바탕으로 20대 여성 소비자 관점에서 분위기와 결제 의향을 다시 정리했다.
- 전체 분위기는 겁주는 운세앱보다 조용히 고민을 정리해주는 상담형 앱에 가까워졌고, 무료 베타 진입 장벽은 낮다.
- 무료 3회 상담은 바로 써볼 의향이 높다. 무료 베타 사용 의향은 9.5/10으로 판단했다.
- 첫 상담이 개인화되고 후속 질문에서 이전 맥락을 잘 기억하면 3,900원 정도의 1회성 스타터 결제 의향은 8.2/10까지 올라간다.
- 월 9,900원 구독은 지금 바로 결제하기보다 며칠 써본 뒤 판단할 가능성이 크다. 현재 월 구독 의향은 6.8/10이다.
- 월 구독 의향이 8점 이상으로 올라가려면 오늘피드, 월간 리포트, 이전 상담 기억, 반복 체크인처럼 매일/매주 다시 들어올 이유가 체감되어야 한다.
- 유료 전환을 막는 핵심 요소는 첫 응답 지연, 캐릭터별 실제 답변 차별화 부족 가능성, 결제 준비 중 가격표 노출의 애매함, Paddle live gate 미완료다.
- 개발자 우선순위는 첫 상담 로딩 단계 표시, 무료 3회 사용량 투명화, 캐릭터별 첫 문단/마지막 질문 차별화, 3,900원 스타터 우선 전환, 결제 재오픈 전 `qa:paddle-webhook:signed`와 `release:gate:payments:live` 통과다.
- 상세 문서: `docs/개발일지/20대-여성-소비자관점-분위기-유료사용의향-재리뷰-20260724.md`.

## 2026-07-24 가격정책 스타터 2,900원 / 월구독 50별
- PM 최종 정책으로 스타터는 `10별 2,900원`으로 낮춘다.
- 월간 멤버십은 `월 9,900원 / 매월 50별 지급`으로 조정한다.
- 가입 후 3회 무료, `1별 = 메시지 1회`, 30별 9,900원, 70별 19,900원, 250별 39,900원, 월간 리포트 3별, 종합 사주 백서 5별은 이번 지시에서는 유지한다.
- 스타터는 30별 패키지보다 별 단가가 낮아지므로 첫 결제 1회 한정 또는 첫 결제용 포지셔닝이 필요하다.
- 월 50별은 매일 1회 상담 30별 + 월간 리포트 3별 + 후속 질문 17별 구조로 설명하면 20대 여성 유저에게 월 9,900원 가치가 더 납득된다.
- 개발자 전달 문서: `docs/pm/가격정책-스타터2900-월구독50별-개발자전달-20260724.md`.

## 2026-07-24 가격정책 스타터 2,900원 / 월구독 50별 구현
- 가격 source of truth인 `src/lib/monthly-saju/pricing.ts`에서 `stars10`을 `10별 2,900원`으로 낮췄다.
- `MONTHLY_MEMBERSHIP.stars`는 `50`으로 조정했고 FAQ, JSON-LD, Paddle config mapping은 같은 상수에서 파생된다.
- 코인샵 기본 선택 상품은 `stars10`으로 바꿔 첫 결제용 스타터 상품이 먼저 보이게 했다.
- 검증: 가격/Paddle 타깃 테스트, 전체 vitest, tsc, eslint, Next production build 통과.
- 남은 운영 작업: Paddle Dashboard와 Vercel production env의 실제 price id를 `2,900원 스타터`, `9,900원/50별 멤버십` 상품으로 교체한 뒤 signed webhook live QA를 다시 돌린다.

## 2026-07-24 배포 현우카드 좌측 페이드 잘림 수정
- 배포 스크린샷에서 현우 카드 왼쪽이 덜 보인 원인은 첫 카드에도 데스크톱 왼쪽 edge fade mask가 적용된 것이다.
- `CharacterCards.tsx`에서 `activeIndex === 0`일 때는 mask를 `black_0`부터 시작하게 하고, `activeIndex > 0`일 때만 기존 `transparent_64px -> black_116px` 왼쪽 fade를 적용한다.
- 1280x720 Playwright 측정에서 첫 위치 `scrollLeft=0`, `sidebarRight=240`, `imageLeft=249`, `mask=black_0...`로 확인했다.
- 검증: 디자인 회귀 테스트, 전체 vitest, tsc, eslint, Next production build 통과.

## 2026-07-24 가격정책/현우카드 수정 커밋 묶음
- 이번 커밋 묶음은 가격 정책 변경과 배포 현우 카드 좌측 fade 수정, 관련 테스트/문서/메모리를 함께 포함한다.
- 검증 기준은 전체 vitest 253개, tsc, eslint, Next production build 통과다.
- 운영 반영 후에는 Vercel production에서 현우 카드 첫 상태와 Paddle price id 매핑을 다시 확인해야 한다.

## 2026-07-24 Vercel Paddle price env 업데이트 차단
- Vercel CLI 인증과 `monthlysaju` production env 조회는 가능하다.
- production env에는 Paddle 필수 env가 아직 없다. 특히 `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, product/price id가 빠져 있다.
- 로컬 `.env.local`의 `PADDLE_API_KEY`는 placeholder라 Paddle API로 실제 `2,900원 스타터`, `9,900원/50별 멤버십` price id를 조회할 수 없다.
- signed webhook QA는 `NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10`, `NEXT_PUBLIC_PADDLE_PRICE_STAR_10`, `NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP`, `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP` 누락으로 차단됐다.
- 다음 진행에는 실제 Paddle product/price id 네 개 또는 실제 Paddle API key가 필요하다.

## 2026-07-24 배포웹사이트 디자인개선 수정후리뷰 반영
- production 리뷰에서 릴리즈 차단급 디자인 이슈는 없지만 PC 1280x720 카드 하단 CTA 여유와 캐러셀 첫 진입 예측성이 P3로 남았다.
- `CharacterCards.tsx`에서 자동 캐러셀 이동을 제거하고 첫 진입 `scrollLeft=0`, active dot 1번으로 고정했다.
- 1024px 이상, 높이 760px 이하 PC에서는 카드 폭을 `252px`, 이미지 비율을 `4/5`로 줄이고 정보 영역 spacing을 압축해 CTA breathing room을 확보했다.
- Playwright 1280x720 로컬 측정에서 `대화하기` CTA bottom은 `686.09`, 하단 여유는 `33.91px`, 7초 후에도 `scrollLeft=0`과 active dot 1번이 유지됐다.
- 모바일 390x844에서는 CTA bottom `743.19`, 하단 여유 `100.81px`, 가로 오버플로우 0을 확인했다.
- 검증: 디자인 회귀 테스트, 전체 vitest 254개, tsc, eslint, Next production build 통과.

## 2026-07-24 20대 여성 유저 가격/현우카드 수정후 재리뷰
- 소스코드는 수정하지 않고 최신 개발일지, 메모리, 가격 정책 코드, 결제 QA 차단 기록을 읽고 20대 여성 소비자 관점으로 다시 리뷰했다.
- 이번 최신 수정의 핵심은 `10별 2,900원` 스타터, `월 9,900원 / 50별` 멤버십, 코인샵 스타터 우선 노출, 현우 카드 좌측 fade/첫 화면 잘림 보정이다.
- 무료 3회 상담 사용 의향은 9.6/10, 2,900원 스타터 결제 의향은 8.8/10, 월 9,900원/50별 구독 의향은 7.4/10으로 판단했다.
- 2,900원 스타터는 20대 여성 유저에게 `한 번만 더 물어볼까`를 만들기 좋은 가격이고, 이전 3,900원보다 첫 결제 심리 장벽이 낮다.
- 월 50별은 `매일 1회 상담 30별 + 월간 리포트 3별 + 후속 질문 17별`처럼 사용 예시로 설명하면 월 9,900원 가치가 더 납득된다.
- 현우 카드 첫 상태에서 왼쪽 fade가 빠져 대표 카드가 온전히 보이는 방향은 랜딩 첫인상 완성도와 신뢰를 올린다.
- 유료 오픈 준비도는 결제 운영 안정성까지 닫힌 뒤에는 8.4/10이지만, 현재 Paddle production env와 signed webhook QA가 막힌 상태까지 포함하면 7.1/10이다.
- 결제 오픈 전에는 Vercel production Paddle env 등록, 실제 Paddle Dashboard product/price id 검증, signed webhook live QA 통과가 필수다.
- 2,900원 스타터는 30별 9,900원보다 별 단가가 낮으므로 첫 결제 1회 한정 또는 첫 결제용 문구를 명확히 해야 한다.
- 상세 문서: `docs/개발일지/20대-여성-유저관점-가격현우카드-수정후-재리뷰-20260724.md`.

## 2026-07-24 운영사이트 공격형 보안점검
- 대상은 `https://monthlysaju.vercel.app/` production이다.
- 비파괴 공격형 payload로 비인증 음수 별 차감, status 권한상승, prompt-injection, XSS/prompt payload, 악성 CORS origin, OAuth host spoofing/open redirect, 공개 파일/secret/sourcemap, query reflected XSS, invalid JSON/body, Paddle webhook, authenticated IDOR를 확인했다.
- 무료 상담형 핵심 경로는 큰 구멍이 보이지 않았다. 비인증 민감 API payload는 대체로 401, CORS는 악성 origin에 열려 있지 않음, OAuth open redirect는 재현되지 않음, sourcemap은 403, 공개 secret 패턴 없음.
- authenticated IDOR는 개선됐다. `preview`, `analyze`, `deduct-stars`, `update-status`, `chat`, `pdf` 모두 타인 리딩 접근 시 404이고 owner row unchanged다. 이전 `update-status` no-op 200은 해결됐다.
- 운영 live API free/full QA는 통과했고, 운영 RLS 대상 10개 테이블은 enabled, 민감 RPC는 anon/authenticated에 열려 있지 않다.
- 남은 P1은 Paddle signed webhook 정상 서명 payload가 계속 401인 점과 `GOOGLE_VERTEX_RUNTIME_AUTH` production env gate 실패다.
- 새 P2는 `/api/saju/preview`, `/api/saju/analyze`, `/api/saju/compatibility`, `/api/saju/chat`이 invalid JSON/body에 500을 반환하는 것이다.
- CSP는 `object-src 'none'`까지 좋아졌지만 `unsafe-inline` 때문에 MDN Observatory B+ 80점, 실패 1개가 남아 있다.
- 개발자 전달 문서: `docs/pm/운영사이트-공격형-보안점검-개발자전달-20260724.md`.

## 2026-07-24 운영사이트 공격형 보안점검 수정 반영
- invalid JSON/body 500 이슈는 `src/lib/http/safe-json.ts` 공통 helper로 닫았다.
- `/api/saju/preview`, `/api/saju/analyze`, `/api/saju/compatibility`, `/api/saju/chat`은 더 이상 직접 `req.json()`을 호출하지 않고 parse 실패 시 400 구조화 JSON을 반환한다.
- `/api/saju/chat`은 invalid JSON 응답에 `requestId`를 포함한다.
- `/api/saju/compatibility`는 catch에서 `req.clone().json()`을 다시 호출하지 않고, 요청 초기에 확보한 id와 user id로 실패 복구한다.
- Vercel production env에 `GOOGLE_VERTEX_RUNTIME_AUTH=vercel-oidc`를 등록했다. 새 production 배포부터 반영된다.
- 검증: focused invalid JSON 테스트, 전체 vitest 257개, tsc, eslint, Next production build, direct env check, audit high gate 통과.
- `pnpm test:env` 래퍼는 기존 `fetch failed`로 실패하지만 `node scripts/check-env.js` 직접 실행은 통과했다.
- Paddle signed webhook QA는 product/price id 4개 누락으로 계속 차단됐다.
- 상세 문서: `docs/개발일지/운영사이트-공격형-보안점검-invalid-json-env-반영-20260724.md`.

## 2026-07-24 다른 디자인 스킬 기준 배포웹사이트 프리미엄마감 Findings
- 사용자가 `design-taste-frontend`를 제외하라고 해서 `high-end-visual-design`, `minimalist-ui`, `redesign-existing-projects` 기준으로 직전 디자인 문제를 정리했다.
- 최신 production 기준 릴리즈 차단급 디자인 이슈는 없고, 남은 항목은 프리미엄 마감/발견성 개선이다.
- P2: PC 1280x720에서 카드 이름 클리핑은 해결됐지만 카드 하단 `대화하기` CTA 발견성은 아직 약하다. 낮은 PC 높이에서 CTA bottom과 viewport 하단 사이 16px 이상 여유를 목표로 둔다.
- P2: 캐러셀 첫 진입 상태가 뷰포트/스냅/이전 상태에 따라 다르게 느껴질 수 있어 시작 카드와 pagination active state를 더 결정적으로 맞춰야 한다.
- P3: 보라색 accent가 버튼, 배지, 진행바, 하단 탭까지 넓게 반복돼 흔한 SaaS 톤으로 보일 수 있다. CTA/active state 중심으로 강도를 재배치한다.
- P3: 캐릭터 카드 표면이 이미지 카드+흰 하단 영역으로 약간 평평해 보인다. outer/inner radius 계층, 약한 tinted shadow, inner highlight로 물성을 보강하면 더 프리미엄해진다.
- 개발자 전달 문서: `docs/pm/다른디자인스킬-배포웹사이트-프리미엄마감-개발자전달-20260724.md`.
